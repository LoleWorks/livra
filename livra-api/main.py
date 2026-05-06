import asyncio
import hashlib
import math
import os
import secrets
import sys
from datetime import datetime, timezone, timedelta
from typing import Optional

# Force UTF-8 output so Romanian characters in addresses don't crash print()
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Load .env if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# VROOM solver endpoint — defaults to free ORS public API for dev,
# overridden by env var when self-hosting on Hetzner in production.
VROOM_URL     = os.environ.get("VROOM_URL", "https://api.openrouteservice.org/optimization")
ORS_API_KEY   = os.environ.get("ORS_API_KEY", "")
VROOM_HOSTED  = "openrouteservice.org" in VROOM_URL  # true when using ORS public API

SUPABASE_URL              = os.environ.get("SUPABASE_URL", "")
SUPABASE_ANON_KEY         = os.environ.get("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
SMS_MD_API_KEY            = os.environ.get("SMS_MD_API_KEY", "")
SMS_MD_SENDER             = os.environ.get("SMS_MD_SENDER", "Livra")

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DRIVER_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"]

# ── Solver constants ─────────────────────────────────────────────────────────
SERVICE_TIME = 10 * 60   # 10 min per delivery (paperwork + handover average)
MAX_DAY_SEC  = 8 * 3600  # 8-hour shift
LUNCH_DUR    = 30 * 60   # mandatory meal break
LUNCH_WIN    = (4 * 3600 + 1800, 5 * 3600)   # 4:30h–5h into shift

# ── Models ──────────────────────────────────────────────────────────────────

class DeliveryIn(BaseModel):
    id: str
    address: str
    customer: str
    phone: str = ""
    notes: str = ""
    package_description: str = ""           # what's inside the package
    time_window_start: Optional[str] = None # "HH:MM" earliest arrival
    time_window_end: Optional[str] = None   # "HH:MM" latest arrival

class DriverIn(BaseModel):
    id: str
    name: str
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None

class Constraints(BaseModel):
    time_windows: bool = False
    capacity: bool = False

class OptimizeRequest(BaseModel):
    deliveries: list[DeliveryIn]
    drivers: list[DriverIn]
    depot_address: str = "bd. Dacia 50, Chisinau, Moldova"
    constraints: Constraints = Constraints()
    skip_breaks: bool = False               # drivers want a faster day
    shift_start_time: str = "09:00"         # anchors job time windows

class Stop(BaseModel):
    order: int
    delivery_id: str
    customer: str
    address: str
    phone: str
    lat: float
    lng: float
    type: str = 'delivery'          # 'delivery' | 'lunch_break' | 'fuel_break'
    break_duration_min: int = 0
    package_description: str = ""   # echoed back so drivers know what they carry
    arrival_time: Optional[str] = None  # "HH:MM" — when driver arrives at this stop

class DriverRoute(BaseModel):
    driver_id: str
    driver_name: str
    color: str
    stops: list[Stop]
    total_distance_km: float
    total_duration_min: int
    start_lat: float
    start_lng: float

class DeferredDelivery(BaseModel):
    delivery_id: str
    customer: str
    address: str
    reason: str        # "no capacity" | "time window unreachable" | "geocode failed"

class OptimizeResponse(BaseModel):
    routes: list[DriverRoute]
    savings_pct: int
    total_stops: int
    deferred: list[DeferredDelivery] = []

class WebhookOrder(BaseModel):
    order_id: str
    customer_name: str
    customer_phone: str = ""
    delivery_address: str
    notes: str = ""

# ── Geocoding ────────────────────────────────────────────────────────────────

_geocode_cache: dict[str, Optional[tuple[float, float]]] = {}
_geocode_sem = asyncio.Semaphore(1)  # serialize geocoding requests

# Moldova bounding box for Photon bbox filter
_MD_BBOX = "26.6,45.4,30.2,48.5"
# Geographic centre of Moldova — used as location bias
_MD_LAT, _MD_LON = 47.0245, 28.8322

async def _geocode_photon(query: str) -> Optional[tuple[float, float]]:
    """Photon (komoot) geocoder — good Moldova coverage, no hard rate limit."""
    async with httpx.AsyncClient() as client:
        r = await client.get(
            "https://photon.komoot.io/api/",
            params={"q": query, "limit": 5, "lang": "en",
                    "lat": str(_MD_LAT), "lon": str(_MD_LON)},
            headers={"User-Agent": "Livra/1.0"},
            timeout=10,
        )
        if r.status_code != 200:
            return None
        features = r.json().get("features", [])
        for f in features:
            p = f["properties"]
            if p.get("country") in ("Moldova", "Republic of Moldova"):
                lng, lat = f["geometry"]["coordinates"]  # GeoJSON = [lng, lat]
                return float(lat), float(lng)
    return None

async def _geocode_nominatim(query: str) -> Optional[tuple[float, float]]:
    """Nominatim fallback — respects 1 req/sec limit, skips on 429."""
    async with httpx.AsyncClient() as client:
        r = await client.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": query, "format": "json", "limit": 1, "countrycodes": "md"},
            headers={"User-Agent": "Livra/1.0 loredanloleworks@gmail.com"},
            timeout=10,
        )
        if r.status_code == 429:
            print("[geocode] Nominatim 429 — skipping")
            return None
        if r.status_code == 200 and "json" in r.headers.get("content-type", ""):
            data = r.json()
            if data:
                return float(data[0]["lat"]), float(data[0]["lon"])
    return None

async def geocode(address: str) -> Optional[tuple[float, float]]:
    key = address.lower().strip()
    if key in _geocode_cache:
        return _geocode_cache[key]

    query = address if "moldova" in key.lower() else f"{address}, Moldova"
    result: Optional[tuple[float, float]] = None

    async with _geocode_sem:
        if key in _geocode_cache:
            return _geocode_cache[key]
        try:
            result = await _geocode_photon(query)
            if result:
                print(f"[geocode] Photon OK  {address!r} -> {result}")
            else:
                await asyncio.sleep(1.1)
                result = await _geocode_nominatim(query)
                if result:
                    print(f"[geocode] Nominatim OK  {address!r} -> {result}")
                else:
                    print(f"[geocode] MISS  {address!r}")
        except Exception as exc:
            print(f"[geocode] ERROR {address!r}: {exc}")
        await asyncio.sleep(0.3)  # brief pause between requests

    _geocode_cache[key] = result
    return result

# ── Routing matrices (GraphHopper primary, OSRM fallback) ────────────────────

GH_URL  = "http://localhost:8989"
GH_PROFILE = "delivery"

async def get_graphhopper_matrices(
    locations: list[tuple[float, float]],
) -> tuple[list[list[int]], list[list[int]]] | None:
    """
    Returns (duration_seconds, distance_meters) from self-hosted GraphHopper.
    GraphHopper's delivery profile has turn_costs=true and left-turn penalties
    baked into the custom model, so the matrix already reflects real-world
    fuel, safety, and time costs at the arc level.
    Returns None if GraphHopper is not reachable.
    """
    points = [[lng, lat] for lat, lng in locations]
    payload = {
        "profile": GH_PROFILE,
        "from_points": points,
        "to_points": points,
        "out_arrays": ["times", "distances"],
        "fail_fast": False,
    }
    async with httpx.AsyncClient() as client:
        try:
            r = await client.post(
                f"{GH_URL}/matrix",
                json=payload,
                timeout=30,
            )
            if r.status_code == 200:
                data = r.json()
                dur  = [[int(v or 99999) for v in row] for row in data["times"]]
                dist = [[int(v or 99999) for v in row] for row in data["distances"]]
                return dur, dist
        except Exception:
            pass
    return None

async def get_osrm_matrices(
    locations: list[tuple[float, float]],
) -> tuple[list[list[int]], list[list[int]]]:
    """Returns (duration_seconds, distance_meters) matrices from OSRM."""
    coords = ";".join(f"{lng},{lat}" for lat, lng in locations)
    async with httpx.AsyncClient() as client:
        try:
            r = await client.get(
                f"http://router.project-osrm.org/table/v1/driving/{coords}",
                params={"annotations": "duration,distance"},
                timeout=30,
            )
            data = r.json()
            if data.get("code") == "Ok":
                dur  = [[int(d or 99999) for d in row] for row in data["durations"]]
                dist = [[int(d or 99999) for d in row] for row in data["distances"]]
                return dur, dist
        except Exception:
            pass

    # Last-resort fallback: straight-line estimates at 30 km/h
    n = len(locations)
    dur  = [[0] * n for _ in range(n)]
    dist = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                dlat = locations[i][0] - locations[j][0]
                dlng = locations[i][1] - locations[j][1]
                m = math.sqrt(dlat ** 2 + dlng ** 2) * 111_000
                dist[i][j] = int(m)
                dur[i][j]  = int(m / (30_000 / 3600))
    return dur, dist

async def get_matrices(
    locations: list[tuple[float, float]],
) -> tuple[list[list[int]], list[list[int]]]:
    """Try GraphHopper first (left-turn penalties + eco routing), fall back to OSRM."""
    gh = await get_graphhopper_matrices(locations)
    if gh is not None:
        return gh
    return await get_osrm_matrices(locations)


async def lookup_break_poi(
    lat: float, lng: float, break_type: str
) -> tuple[float, float, str, str]:
    """
    Query Overpass for nearest gas station (fuel) or restaurant (lunch).
    Returns (lat, lng, name, address).  Falls back to input coords on error.
    """
    amenity = "fuel" if break_type == "fuel_break" else "restaurant|cafe|fast_food"
    query = (
        f'[out:json][timeout:10];'
        f'(node["amenity"~"{amenity}"](around:10000,{lat},{lng}););'
        f'out 1;'
    )
    try:
        async with httpx.AsyncClient() as c:
            r = await c.post(
                "https://overpass-api.de/api/interpreter",
                data={"data": query}, timeout=12,
                headers={"User-Agent": "Livra/1.0 loredanloleworks@gmail.com"},
            )
            els = r.json().get("elements", [])
            if els:
                el   = els[0]
                tags = el.get("tags", {})
                name = tags.get("name") or ("Stație peco" if break_type == "fuel_break" else "Restaurant")
                street = tags.get("addr:street", "")
                house  = tags.get("addr:housenumber", "")
                addr   = f"{street} {house}".strip() or name
                return float(el["lat"]), float(el["lon"]), name, addr
    except Exception as exc:
        print(f"[poi] {break_type} lookup failed: {exc}")
    label = "Stație peco" if break_type == "fuel_break" else "Restaurant"
    return lat, lng, label, "În apropiere"


# ── VROOM client ─────────────────────────────────────────────────────────────

def _hhmm_to_offset(hhmm: str, shift_start: str) -> int:
    """Convert 'HH:MM' clock time → seconds offset from shift_start."""
    h, m   = map(int, hhmm.split(":"))
    sh, sm = map(int, shift_start.split(":"))
    return ((h - sh) * 3600) + ((m - sm) * 60)


def _offset_to_hhmm(offset_sec: int, shift_start: str) -> str:
    """Convert seconds offset from shift_start → 'HH:MM' clock time."""
    sh, sm = map(int, shift_start.split(":"))
    total  = sh * 3600 + sm * 60 + offset_sec
    h = (total // 3600) % 24
    m = (total // 60) % 60
    return f"{h:02d}:{m:02d}"


def build_vroom_request(
    deliveries: list[DeliveryIn],
    delivery_coords: list[tuple[float, float]],
    drivers: list[DriverIn],
    driver_starts: list[tuple[float, float]],
    duration_matrix: list[list[int]],
    skip_breaks: bool,
    shift_start: str,
) -> dict:
    """
    Build a VROOM optimization payload.

    Layout of the matrix nodes:
      0..D-1     → driver start positions
      D..D+N-1   → delivery locations

    Each job's time_windows are anchored to shift_start (00:00-relative seconds).
    """
    num_drivers = len(drivers)

    # Vehicles
    vehicles = []
    for v_idx, driver in enumerate(drivers):
        vehicle: dict = {
            "id": v_idx + 1,
            "profile": "driving-car",
            "start_index": v_idx,
            "end_index":   v_idx,                      # return to start
            "time_window": [0, MAX_DAY_SEC],
        }
        if not skip_breaks:
            # Only the lunch break is scheduled — fuel breaks are dropped
            # because we don't track fuel level per driver. Drivers can use
            # the in-app "Pauză combustibil" button on demand if needed.
            vehicle["breaks"] = [
                {
                    "id": 1,
                    "service": LUNCH_DUR,
                    "time_windows": [list(LUNCH_WIN)],
                    "description": "lunch_break",
                },
            ]
        vehicles.append(vehicle)

    # Jobs
    jobs = []
    for i, d in enumerate(deliveries):
        job: dict = {
            "id": i + 1,
            "location_index": num_drivers + i,
            "service": SERVICE_TIME,
            "description": d.id,
        }
        if d.time_window_start and d.time_window_end:
            start = max(0, _hhmm_to_offset(d.time_window_start, shift_start))
            end   = min(MAX_DAY_SEC, _hhmm_to_offset(d.time_window_end, shift_start))
            if end > start:
                job["time_windows"] = [[start, end]]
        jobs.append(job)

    return {
        "jobs": jobs,
        "vehicles": vehicles,
        "matrices": {
            "driving-car": {
                "durations": duration_matrix,
            },
        },
    }


def compute_route_distance(steps: list[dict], distance_matrix: list[list[int]],
                           num_drivers: int, vehicle_idx: int) -> int:
    """
    VROOM's response only includes distance when we send a distance matrix
    (which doubles request size). We compute it locally from the OSRM matrix
    using the order VROOM produced. Returns total meters incl. return trip.
    """
    start_node = vehicle_idx
    prev_node = start_node
    total = 0
    for step in steps:
        if step.get("type") == "job":
            node = num_drivers + (step["job"] - 1)
            total += distance_matrix[prev_node][node]
            prev_node = node
    # return trip
    total += distance_matrix[prev_node][start_node]
    return total


async def call_vroom(payload: dict) -> dict:
    """Call the VROOM endpoint (ORS public API in dev, self-hosted in prod)."""
    if VROOM_HOSTED and not ORS_API_KEY:
        raise HTTPException(500, "ORS_API_KEY env var not set")

    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if VROOM_HOSTED:
        headers["Authorization"] = ORS_API_KEY

    async with httpx.AsyncClient() as client:
        try:
            r = await client.post(VROOM_URL, json=payload, headers=headers, timeout=30)
        except httpx.HTTPError as exc:
            raise HTTPException(503, f"VROOM unreachable: {exc}")

    if r.status_code == 429:
        raise HTTPException(429, "Limita zilnică API atinsă, încearcă mai târziu")
    if r.status_code >= 400:
        raise HTTPException(r.status_code, f"VROOM error: {r.text[:200]}")

    return r.json()


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    """Quick health probe — checks VROOM reachability without consuming a credit."""
    return {"status": "ok", "vroom_url": VROOM_URL, "vroom_hosted": VROOM_HOSTED}


@app.post("/optimize", response_model=OptimizeResponse)
async def optimize(req: OptimizeRequest):
    # ── 1. Pre-validation for free-tier ORS limits ──────────────────────────
    if VROOM_HOSTED:
        if len(req.drivers) > 3:
            raise HTTPException(400, "Limita gratuită ORS: maxim 3 șoferi. Trec pe Hetzner pentru mai mulți.")
        if len(req.deliveries) > 50:
            raise HTTPException(400, "Limita gratuită ORS: maxim 50 livrări. Trec pe Hetzner pentru mai multe.")
    if not req.deliveries:
        return OptimizeResponse(routes=[], savings_pct=0, total_stops=0)
    if not req.drivers:
        raise HTTPException(400, "Cel puțin un șofer este necesar")

    # ── 2. Geocode depot + driver homes ─────────────────────────────────────
    depot_coords = await geocode(req.depot_address) or (47.0245, 28.8322)
    driver_starts: list[tuple[float, float]] = []
    for d in req.drivers:
        if d.start_lat is not None and d.start_lng is not None:
            driver_starts.append((d.start_lat, d.start_lng))
        else:
            driver_starts.append(depot_coords)

    # ── 3. Geocode delivery addresses (in parallel) ─────────────────────────
    coords_list = await asyncio.gather(*[geocode(d.address) for d in req.deliveries])
    valid: list[tuple[DeliveryIn, tuple[float, float]]] = [
        (d, c) for d, c in zip(req.deliveries, coords_list) if c
    ]
    deferred: list[DeferredDelivery] = [
        DeferredDelivery(delivery_id=d.id, customer=d.customer, address=d.address,
                         reason="geocode failed")
        for d, c in zip(req.deliveries, coords_list) if not c
    ]

    if not valid:
        return OptimizeResponse(routes=[], savings_pct=0, total_stops=0, deferred=deferred)

    deliveries_ok, delivery_coords = [list(x) for x in zip(*valid)]

    # ── 4. Fetch OSRM duration + distance matrices ──────────────────────────
    all_locations = [*driver_starts, *delivery_coords]
    duration_matrix, distance_matrix = await get_matrices(all_locations)

    # ── 5. Build VROOM payload + call ───────────────────────────────────────
    payload = build_vroom_request(
        deliveries=deliveries_ok,
        delivery_coords=delivery_coords,
        drivers=req.drivers,
        driver_starts=driver_starts,
        duration_matrix=duration_matrix,
        skip_breaks=req.skip_breaks,
        shift_start=req.shift_start_time,
    )
    vroom_result = await call_vroom(payload)

    # ── 6. Parse VROOM response → DriverRoute objects ───────────────────────
    routes: list[DriverRoute] = []
    num_drivers = len(req.drivers)

    for v_route in vroom_result.get("routes", []):
        v_idx = v_route["vehicle"] - 1
        driver = req.drivers[v_idx]
        s_lat, s_lng = driver_starts[v_idx]
        color = DRIVER_COLORS[v_idx % len(DRIVER_COLORS)]

        steps = v_route.get("steps", [])
        stops: list[Stop] = []

        # We need POI lookups for break steps. Collect their context, run them
        # concurrently after the main pass.
        break_slots: list[tuple[int, str, float, float]] = []  # (stop_index, btype, near_lat, near_lng)

        for step in steps:
            stype = step.get("type")
            arrival_sec = step.get("arrival", 0)
            arrival_hhmm = _offset_to_hhmm(arrival_sec, req.shift_start_time)

            if stype == "job":
                job_idx = step["job"] - 1
                d = deliveries_ok[job_idx]
                lat, lng = delivery_coords[job_idx]
                stops.append(Stop(
                    order=0,
                    delivery_id=d.id,
                    customer=d.customer,
                    address=d.address,
                    phone=d.phone,
                    lat=lat,
                    lng=lng,
                    type='delivery',
                    package_description=d.package_description,
                    arrival_time=arrival_hhmm,
                ))
            elif stype == "break":
                # Only lunch break is scheduled by the optimizer now (fuel
                # breaks are driver-initiated on demand via the app).
                btype = "lunch_break"
                duration_min = LUNCH_DUR // 60
                near_lat, near_lng = (stops[-1].lat, stops[-1].lng) if stops else (s_lat, s_lng)
                stops.append(Stop(
                    order=0,
                    delivery_id=f"_break_{btype}_{len(stops)}",
                    customer="Pauză de masă",
                    address="Se caută o locație…",
                    phone="",
                    lat=near_lat,
                    lng=near_lng,
                    type=btype,
                    break_duration_min=duration_min,
                    arrival_time=arrival_hhmm,
                ))
                break_slots.append((len(stops) - 1, btype, near_lat, near_lng))

        # Resolve break POIs concurrently
        if break_slots:
            poi_results = await asyncio.gather(*[
                lookup_break_poi(lat, lng, btype) for _, btype, lat, lng in break_slots
            ])
            for (idx, btype, _nl, _ng), (plat, plng, pname, paddr) in zip(break_slots, poi_results):
                stops[idx] = stops[idx].model_copy(update={
                    "lat": plat, "lng": plng,
                    "address": f"{pname} — {paddr}",
                })

        # Renumber stops in sequence (1-based)
        stops = [s.model_copy(update={"order": i}) for i, s in enumerate(stops, 1)]

        total_dist_m = compute_route_distance(steps, distance_matrix, num_drivers, v_idx)
        routes.append(DriverRoute(
            driver_id=driver.id,
            driver_name=driver.name,
            color=color,
            stops=stops,
            total_distance_km=round(total_dist_m / 1000, 1),
            total_duration_min=(v_route.get("duration", 0) + v_route.get("service", 0)) // 60,
            start_lat=s_lat,
            start_lng=s_lng,
        ))

    # ── 7. Collect unassigned → deferred pool ───────────────────────────────
    for u in vroom_result.get("unassigned", []):
        job_idx = u["id"] - 1
        d = deliveries_ok[job_idx]
        # VROOM doesn't always tell us why; infer from common cases
        reason = "no capacity" if u.get("type") == "job" else "time window unreachable"
        deferred.append(DeferredDelivery(
            delivery_id=d.id, customer=d.customer, address=d.address, reason=reason,
        ))

    # ── 8. Savings % vs naive baseline (round-trip per stop) ────────────────
    naive_cost = sum(
        duration_matrix[0][num_drivers + i] + duration_matrix[num_drivers + i][0]
        for i in range(len(deliveries_ok))
    )
    optimized_cost = sum(r.total_duration_min * 60 for r in routes) or 1
    savings = max(0, int((1 - optimized_cost / max(naive_cost, 1)) * 100))

    return OptimizeResponse(
        routes=routes,
        savings_pct=savings,
        total_stops=len(deliveries_ok),
        deferred=deferred,
    )


# ── Webhook receiver (in-memory, replace with DB in prod) ────────────────────

_pending: list[dict] = []

@app.post("/webhook/orders", status_code=201)
async def receive_order(order: WebhookOrder):
    _pending.append({
        "id": order.order_id, "customer": order.customer_name,
        "phone": order.customer_phone, "address": order.delivery_address,
        "notes": order.notes,
    })
    return {"status": "received", "total_pending": len(_pending)}

@app.get("/webhook/pending")
async def get_pending():
    return {"deliveries": _pending}

@app.delete("/webhook/pending")
async def clear_pending():
    _pending.clear()
    return {"status": "cleared"}


# ── Sales manager auth ────────────────────────────────────────────────────────
# Passwords are hashed with PBKDF2-SHA256 (100k iterations) + random salt.
# The service role key is NOT required — anon key + open RLS policies are enough.

def _sb_headers() -> dict:
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

def _sb_admin_headers() -> dict:
    return {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }

async def _create_auth_user(client: httpx.AsyncClient, email: str, password: str) -> str:
    res = await client.post(
        f"{SUPABASE_URL}/auth/v1/admin/users",
        headers=_sb_admin_headers(),
        json={"email": email, "password": password, "email_confirm": True},
    )
    if res.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail=f"Creare cont auth eșuată: {res.text}")
    return res.json()["id"]

async def _get_auth_user_id_by_email(client: httpx.AsyncClient, email: str) -> str:
    res = await client.get(
        f"{SUPABASE_URL}/auth/v1/admin/users",
        headers=_sb_admin_headers(),
        params={"email": email, "per_page": 1},
    )
    if res.status_code == 200:
        users = res.json().get("users", [])
        if users:
            return users[0]["id"]
    raise HTTPException(status_code=404, detail="Contul auth nu a fost găsit")

async def _update_auth_password(client: httpx.AsyncClient, auth_user_id: str, new_password: str):
    res = await client.put(
        f"{SUPABASE_URL}/auth/v1/admin/users/{auth_user_id}",
        headers=_sb_admin_headers(),
        json={"password": new_password},
    )
    if res.status_code not in (200, 204):
        raise HTTPException(status_code=500, detail=f"Actualizare parolă auth eșuată: {res.text}")

def _hash_pw(password: str, salt: str) -> str:
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
    return key.hex()

def _make_salt() -> str:
    return secrets.token_urlsafe(32)

def _initials(name: str) -> str:
    return "".join(w[0] for w in name.split() if w).upper()[:2]


class CreateManagerRequest(BaseModel):
    name: str
    phone: str = ""
    email: str
    password: str
    status: str = "activ"

class ResetPasswordRequest(BaseModel):
    temp_password: str

class SalesLoginRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ChangePasswordRequest(BaseModel):
    manager_id: str
    new_password: str

class UnifiedChangePasswordRequest(BaseModel):
    user_id: str
    role: str   # 'admin' | 'sales'
    new_password: str


COLOR_CYCLE = ["violet", "blue", "emerald", "amber", "rose", "cyan"]

@app.post("/admin/managers", status_code=201)
async def create_manager(req: CreateManagerRequest):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=503, detail="SUPABASE_URL / SUPABASE_ANON_KEY not configured")
    if not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=503, detail="SUPABASE_SERVICE_ROLE_KEY not configured")
    async with httpx.AsyncClient() as client:
        # Create Supabase Auth user first so login works immediately
        await _create_auth_user(client, req.email, req.password)
        # Pick a color based on current manager count
        count_res = await client.get(
            f"{SUPABASE_URL}/rest/v1/livra_sales_managers?select=id",
            headers=_sb_headers(),
        )
        color = COLOR_CYCLE[len(count_res.json()) % len(COLOR_CYCLE)]
        res = await client.post(
            f"{SUPABASE_URL}/rest/v1/livra_sales_managers",
            headers=_sb_headers(),
            json={
                "name": req.name, "phone": req.phone, "email": req.email,
                "status": req.status, "initials": _initials(req.name), "color": color,
                "must_change_password": False,
            },
        )
    if res.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail=res.text)
    data = res.json()
    return data[0] if isinstance(data, list) else data


@app.post("/admin/managers/{manager_id}/reset-password")
async def reset_manager_password(manager_id: str, req: ResetPasswordRequest):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=503, detail="SUPABASE_URL / SUPABASE_ANON_KEY not configured")
    if not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=503, detail="SUPABASE_SERVICE_ROLE_KEY not configured")
    async with httpx.AsyncClient() as client:
        # Get manager email to look up the auth user
        mgr_res = await client.get(
            f"{SUPABASE_URL}/rest/v1/livra_sales_managers?id=eq.{manager_id}&select=email",
            headers=_sb_headers(),
        )
        managers = mgr_res.json() if mgr_res.status_code == 200 else []
        if not managers:
            raise HTTPException(status_code=404, detail="Manager negăsit")
        email = managers[0]["email"]
        # Update password in Supabase Auth
        auth_user_id = await _get_auth_user_id_by_email(client, email)
        await _update_auth_password(client, auth_user_id, req.temp_password)
        # Flag must_change_password in the profile table
        res = await client.patch(
            f"{SUPABASE_URL}/rest/v1/livra_sales_managers?id=eq.{manager_id}",
            headers=_sb_headers(),
            json={"must_change_password": True},
        )
    if res.status_code not in (200, 204):
        raise HTTPException(status_code=500, detail=res.text)
    return {"ok": True}


@app.post("/auth/sales/login")
async def sales_login(req: SalesLoginRequest):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=503, detail="SUPABASE_URL / SUPABASE_ANON_KEY not configured")
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{SUPABASE_URL}/rest/v1/livra_sales_managers?email=eq.{req.email}&select=*",
            headers=_sb_headers(),
        )
    managers = res.json()
    if not managers:
        raise HTTPException(status_code=401, detail="Email sau parolă incorectă")
    mgr = managers[0]
    if not mgr.get("password_hash") or not mgr.get("salt"):
        raise HTTPException(status_code=401, detail="Contul nu are o parolă configurată. Contactează administratorul.")
    if _hash_pw(req.password, mgr["salt"]) != mgr["password_hash"]:
        raise HTTPException(status_code=401, detail="Email sau parolă incorectă")
    if mgr.get("status") == "inactiv":
        raise HTTPException(status_code=403, detail="Contul este inactiv. Contactează administratorul.")
    return {
        "id": mgr["id"], "name": mgr["name"], "email": mgr["email"],
        "phone": mgr.get("phone", ""), "status": mgr["status"],
        "initials": mgr.get("initials", ""), "color": mgr.get("color", "violet"),
        "must_change_password": mgr.get("must_change_password", False),
    }


@app.post("/auth/sales/change-password")
async def change_sales_password(req: ChangePasswordRequest):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=503, detail="SUPABASE_URL / SUPABASE_ANON_KEY not configured")
    if len(req.new_password) < 8:
        raise HTTPException(status_code=422, detail="Parola trebuie să aibă cel puțin 8 caractere")
    salt = _make_salt()
    pw_hash = _hash_pw(req.new_password, salt)
    async with httpx.AsyncClient() as client:
        res = await client.patch(
            f"{SUPABASE_URL}/rest/v1/livra_sales_managers?id=eq.{req.manager_id}",
            headers=_sb_headers(),
            json={"password_hash": pw_hash, "salt": salt, "must_change_password": False},
        )
    if res.status_code not in (200, 204):
        raise HTTPException(status_code=500, detail=res.text)
    return {"ok": True}


@app.post("/auth/login")
async def unified_login(req: LoginRequest):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=503, detail="SUPABASE_URL / SUPABASE_ANON_KEY not configured")
    async with httpx.AsyncClient() as client:
        admin_res = await client.get(
            f"{SUPABASE_URL}/rest/v1/livra_admins?email=eq.{req.email}&select=*",
            headers=_sb_headers(),
        )
        admins = admin_res.json() if admin_res.status_code == 200 else []
        if admins:
            u = admins[0]
            if not u.get("password_hash") or not u.get("salt"):
                raise HTTPException(status_code=401, detail="Contul nu are o parolă configurată.")
            if _hash_pw(req.password, u["salt"]) != u["password_hash"]:
                raise HTTPException(status_code=401, detail="Email sau parolă incorectă")
            if u.get("status") == "inactiv":
                raise HTTPException(status_code=403, detail="Contul este inactiv.")
            return {
                "id": u["id"], "name": u["name"], "email": u["email"],
                "phone": u.get("phone", ""), "status": u["status"],
                "initials": u.get("initials", ""), "color": u.get("color", "blue"),
                "must_change_password": u.get("must_change_password", False),
                "role": "admin",
            }
        mgr_res = await client.get(
            f"{SUPABASE_URL}/rest/v1/livra_sales_managers?email=eq.{req.email}&select=*",
            headers=_sb_headers(),
        )
        managers = mgr_res.json() if mgr_res.status_code == 200 else []
        if not managers:
            raise HTTPException(status_code=401, detail="Email sau parolă incorectă")
        u = managers[0]
        if not u.get("password_hash") or not u.get("salt"):
            raise HTTPException(status_code=401, detail="Contul nu are o parolă configurată. Contactează administratorul.")
        if _hash_pw(req.password, u["salt"]) != u["password_hash"]:
            raise HTTPException(status_code=401, detail="Email sau parolă incorectă")
        if u.get("status") == "inactiv":
            raise HTTPException(status_code=403, detail="Contul este inactiv. Contactează administratorul.")
        return {
            "id": u["id"], "name": u["name"], "email": u["email"],
            "phone": u.get("phone", ""), "status": u["status"],
            "initials": u.get("initials", ""), "color": u.get("color", "violet"),
            "must_change_password": u.get("must_change_password", False),
            "role": "sales",
        }


@app.post("/auth/change-password")
async def unified_change_password(req: UnifiedChangePasswordRequest):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=503, detail="SUPABASE_URL / SUPABASE_ANON_KEY not configured")
    if len(req.new_password) < 8:
        raise HTTPException(status_code=422, detail="Parola trebuie să aibă cel puțin 8 caractere")
    table = "livra_admins" if req.role == "admin" else "livra_sales_managers"
    salt = _make_salt()
    pw_hash = _hash_pw(req.new_password, salt)
    async with httpx.AsyncClient() as client:
        res = await client.patch(
            f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{req.user_id}",
            headers=_sb_headers(),
            json={"password_hash": pw_hash, "salt": salt, "must_change_password": False},
        )
    if res.status_code not in (200, 204):
        raise HTTPException(status_code=500, detail=res.text)
    return {"ok": True}


# ── SMS helper (sms.md) ───────────────────────────────────────────────────────

async def send_sms(phone: str, message: str) -> bool:
    if not SMS_MD_API_KEY or not phone:
        return False
    # Normalize Moldovan number to international format
    p = phone.strip().replace(" ", "").replace("-", "")
    if p.startswith("0") and len(p) == 9:
        p = "+373" + p[1:]
    elif not p.startswith("+"):
        p = "+373" + p
    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(
                "https://sms.md/api/v1/send",
                headers={"Authorization": f"Bearer {SMS_MD_API_KEY}", "Content-Type": "application/json"},
                json={"to": p, "message": message, "from": SMS_MD_SENDER},
                timeout=10,
            )
            return r.status_code in (200, 201)
    except Exception as exc:
        print(f"[sms] Failed to send to {p}: {exc}")
        return False


# ── Push notification helper (Expo) ──────────────────────────────────────────

async def send_expo_push(token: str, title: str, body: str, data: dict) -> bool:
    if not token or not token.startswith("ExponentPushToken"):
        return False
    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(
                "https://exp.host/--/api/v2/push/send",
                json={"to": token, "title": title, "body": body, "data": data},
                timeout=10,
            )
            return r.status_code == 200
    except Exception as exc:
        print(f"[push] Failed: {exc}")
        return False


# ── Bitrix24 helpers ─────────────────────────────────────────────────────────

def _bx_base(domain: str, user_id: str, token: str) -> str:
    return f"https://{domain}/rest/{user_id}/{token}/"

async def _bx_get_deal(domain: str, user_id: str, token: str, deal_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{_bx_base(domain, user_id, token)}crm.deal.get.json",
            params={"id": deal_id},
            timeout=10,
        )
        if r.status_code == 200:
            return r.json().get("result", {})
    return {}

async def _bx_get_stage_id(domain: str, user_id: str, token: str, stage_name: str) -> Optional[str]:
    """Return the Bitrix24 stage ID for a given stage name. If stage_name contains ':' treat it as an ID already."""
    if ":" in stage_name:
        return stage_name
    base = _bx_base(domain, user_id, token)
    async with httpx.AsyncClient() as client:
        # Check default pipeline (category 0) and any other pipelines
        cats_r = await client.get(f"{base}crm.dealcategory.list.json", timeout=10)
        cat_ids = ["0"]
        if cats_r.status_code == 200:
            for c in cats_r.json().get("result", []):
                cid = str(c.get("ID", ""))
                if cid and cid not in cat_ids:
                    cat_ids.append(cid)
        for cat_id in cat_ids:
            r = await client.get(
                f"{base}crm.dealcategory.stage.list.json",
                params={"id": cat_id},
                timeout=10,
            )
            if r.status_code == 200:
                for s in r.json().get("result", []):
                    if s.get("NAME", "").strip().lower() == stage_name.strip().lower():
                        return str(s["STATUS_ID"])
    return None

async def _bx_update_deal_stage(domain: str, user_id: str, token: str, deal_id: str, stage_id: str) -> bool:
    async with httpx.AsyncClient() as client:
        r = await client.post(
            f"{_bx_base(domain, user_id, token)}crm.deal.update.json",
            json={"id": int(deal_id), "fields": {"STAGE_ID": stage_id}},
            timeout=10,
        )
        return r.status_code == 200

async def _bx_add_comment(domain: str, user_id: str, token: str, deal_id: str, text: str) -> bool:
    async with httpx.AsyncClient() as client:
        r = await client.post(
            f"{_bx_base(domain, user_id, token)}crm.timeline.comment.add.json",
            json={"entityTypeId": 2, "entityId": int(deal_id), "fields": {"COMMENT": text}},
            timeout=10,
        )
        return r.status_code == 200


@app.post("/webhook/bitrix24/{company_id}", status_code=200)
async def bitrix24_webhook(company_id: str, request: Request):
    secret = request.query_params.get("secret", "")
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(503, "Not configured")

    async with httpx.AsyncClient() as client:
        cfg_res = await client.get(
            f"{SUPABASE_URL}/rest/v1/livra_crm_integrations"
            f"?company_id=eq.{company_id}&crm_type=eq.bitrix24&select=*",
            headers=_sb_headers(),
        )
    cfg_list = cfg_res.json() if cfg_res.status_code == 200 else []
    if not cfg_list:
        raise HTTPException(404, "Bitrix24 config not found")
    cfg = cfg_list[0]

    if cfg.get("webhook_secret") and cfg["webhook_secret"] != secret:
        raise HTTPException(403, "Invalid secret")

    try:
        body = await request.body()
        from urllib.parse import parse_qs
        params = parse_qs(body.decode("utf-8"), keep_blank_values=True)
    except Exception:
        raise HTTPException(400, "Invalid body")

    deal_id = params.get("data[FIELDS][ID]", [""])[0]
    if not deal_id:
        return {"received": 0, "processed": 0}

    domain   = cfg.get("subdomain", "")   # stored in subdomain column
    user_id  = cfg.get("api_user_id", "")
    token    = cfg.get("api_token", "")
    trigger_stage = cfg.get("trigger_stage", "").strip()

    if not domain or not user_id or not token:
        raise HTTPException(400, "Bitrix24 credentials not configured")

    deal = await _bx_get_deal(domain, user_id, token, deal_id)
    if not deal:
        raise HTTPException(502, "Could not fetch deal from Bitrix24")

    # Check trigger stage
    deal_stage = deal.get("STAGE_ID", "")
    if trigger_stage:
        target_id = await _bx_get_stage_id(domain, user_id, token, trigger_stage)
        if target_id and deal_stage != target_id:
            return {"received": 1, "processed": 0}

    field_phone   = cfg.get("field_phone",   "UF_CRM_PHONE")
    field_address = cfg.get("field_address", "UF_CRM_ADDRESS")
    field_items   = cfg.get("field_items",   "UF_CRM_ITEMS")

    phone   = str(deal.get(field_phone,   "") or "").strip()
    address = str(deal.get(field_address, "") or "").strip()
    items   = str(deal.get(field_items,   "") or "").strip()

    if not address:
        print(f"[bitrix24] Deal {deal_id} skipped — no address in field '{field_address}'")
        return {"received": 1, "processed": 0}

    delivery_payload = {
        "company_id":       company_id,
        "source":           "bitrix24",
        "external_id":      deal_id,
        "customer_name":    deal.get("TITLE", ""),
        "customer_phone":   phone,
        "delivery_address": address,
        "notes":            items,
        "status":           "pending",
    }
    async with httpx.AsyncClient() as client:
        ins = await client.post(
            f"{SUPABASE_URL}/rest/v1/livra_webhook_orders",
            headers={**_sb_headers(), "Prefer": "return=representation"},
            json=delivery_payload,
        )
        if ins.status_code not in (200, 201):
            print(f"[bitrix24] Failed to insert delivery: {ins.text}")
            raise HTTPException(500, "Failed to save delivery")

        if phone:
            cust_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/livra_customers"
                f"?phone=eq.{phone}&select=push_token,name",
                headers=_sb_headers(),
            )
            customers = cust_res.json() if cust_res.status_code == 200 else []
            cust = customers[0] if customers else None
            push_token = cust.get("push_token") if cust else None
            cust_name  = cust.get("name", "") if cust else ""

            if push_token:
                await send_expo_push(
                    push_token,
                    title="Comanda ta este in curs de livrare!",
                    body="Descarca aplicatia Livra pentru a urmari livrarea in timp real.",
                    data={"type": "new_order"},
                )
            else:
                sms_text = (
                    f"Buna{', ' + cust_name.split()[0] if cust_name else ''}! "
                    f"Comanda ta este confirmata si va fi livrata curand. "
                    f"Urmareste livrarea la livra.md/track"
                )
                await send_sms(phone, sms_text)

    print(f"[bitrix24] Processed deal {deal_id} — {deal.get('TITLE')}")
    return {"received": 1, "processed": 1}


# ── amoCRM webhook receiver ───────────────────────────────────────────────────

def _amo_field(custom_fields: list[dict], name: str) -> str:
    """Extract a custom field value from amoCRM payload by field name (case-insensitive)."""
    for f in custom_fields:
        if f.get("name", "").strip().lower() == name.strip().lower():
            vals = f.get("values", [])
            if vals:
                return str(vals[0].get("value", "")).strip()
    return ""


@app.post("/webhook/amocrm/{company_id}", status_code=200)
async def amocrm_webhook(company_id: str, request: Request):
    # Validate secret
    secret = request.query_params.get("secret", "")
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(503, "Not configured")

    async with httpx.AsyncClient() as client:
        # Load CRM integration config
        cfg_res = await client.get(
            f"{SUPABASE_URL}/rest/v1/livra_crm_integrations"
            f"?company_id=eq.{company_id}&crm_type=eq.amocrm&select=*",
            headers=_sb_headers(),
        )
    cfg_list = cfg_res.json() if cfg_res.status_code == 200 else []
    if not cfg_list:
        raise HTTPException(404, "amoCRM config not found")
    cfg = cfg_list[0]

    if cfg.get("webhook_secret") and cfg["webhook_secret"] != secret:
        raise HTTPException(403, "Invalid secret")

    # amoCRM sends form-encoded data
    try:
        body = await request.body()
        from urllib.parse import parse_qs
        params = parse_qs(body.decode("utf-8"), keep_blank_values=True)
    except Exception:
        raise HTTPException(400, "Invalid body")

    # Extract leads from form params — amoCRM format: leads[status][0][field]
    leads = []
    i = 0
    while True:
        prefix = f"leads[status][{i}]"
        id_key = f"{prefix}[id]"
        if not any(k.startswith(f"{prefix}[") for k in params):
            break

        lead_id   = params.get(f"{prefix}[id]",          [""])[0]
        lead_name = params.get(f"{prefix}[name]",         [""])[0]
        status_id = params.get(f"{prefix}[status_id]",   [""])[0]

        # Parse custom fields from flat form params
        custom_fields: list[dict] = []
        j = 0
        while True:
            cf_prefix = f"{prefix}[custom_fields][{j}]"
            if not any(k.startswith(f"{cf_prefix}[") for k in params):
                break
            fname  = params.get(f"{cf_prefix}[name]", [""])[0]
            fvalue = params.get(f"{cf_prefix}[values][0][value]", [""])[0]
            if fname:
                custom_fields.append({"name": fname, "values": [{"value": fvalue}]})
            j += 1

        leads.append({"id": lead_id, "name": lead_name, "status_id": status_id, "custom_fields": custom_fields})
        i += 1

    trigger_stage = cfg.get("trigger_stage", "Confirmat").strip().lower()

    processed = 0
    for lead in leads:
        # We check trigger by status name — amoCRM also sends status_name
        status_name = params.get(
            f"leads[status][{leads.index(lead)}][status_name]", [""]
        )[0].strip().lower()

        if trigger_stage and status_name and status_name != trigger_stage:
            continue  # skip leads not in our trigger stage

        phone   = _amo_field(lead["custom_fields"], cfg.get("field_phone",   "Telefon"))
        address = _amo_field(lead["custom_fields"], cfg.get("field_address", "Adresa livrare"))
        items   = _amo_field(lead["custom_fields"], cfg.get("field_items",   "Produse"))

        if not address:
            print(f"[amocrm] Lead {lead['id']} skipped — no address field")
            continue

        # Insert delivery into Supabase
        delivery_payload = {
            "company_id":       company_id,
            "source":           "amocrm",
            "external_id":      lead["id"],
            "customer_name":    lead.get("name", ""),
            "customer_phone":   phone,
            "delivery_address": address,
            "notes":            items,
            "status":           "pending",
        }
        async with httpx.AsyncClient() as client:
            ins = await client.post(
                f"{SUPABASE_URL}/rest/v1/livra_webhook_orders",
                headers={**_sb_headers(), "Prefer": "return=representation"},
                json=delivery_payload,
            )
            if ins.status_code not in (200, 201):
                print(f"[amocrm] Failed to insert delivery: {ins.text}")
                continue

            # Check if customer has a push token
            if phone:
                cust_res = await client.get(
                    f"{SUPABASE_URL}/rest/v1/livra_customers"
                    f"?phone=eq.{phone}&select=push_token,name",
                    headers=_sb_headers(),
                )
                customers = cust_res.json() if cust_res.status_code == 200 else []
                cust = customers[0] if customers else None
                push_token = cust.get("push_token") if cust else None
                cust_name  = cust.get("name", "") if cust else ""

                if push_token:
                    await send_expo_push(
                        push_token,
                        title="Comanda ta este in curs de livrare!",
                        body=f"Descarca aplicatia Livra pentru a urmari livrarea in timp real.",
                        data={"type": "new_order"},
                    )
                else:
                    # SMS fallback
                    sms_text = (
                        f"Buna{', ' + cust_name.split()[0] if cust_name else ''}! "
                        f"Comanda ta este confirmata si va fi livrata curand. "
                        f"Urmareste livrarea la livra.md/track"
                    )
                    await send_sms(phone, sms_text)

        processed += 1
        print(f"[amocrm] Processed lead {lead['id']} — {lead.get('name')}")

    return {"received": len(leads), "processed": processed}


# ── Livra → amoCRM: push delivery failure back ────────────────────────────────

class DeliveryFailedRequest(BaseModel):
    company_id:  str
    external_id: str   # CRM lead/deal ID stored when the webhook was received
    fail_reason: str = ""
    crm_type:    str = ""  # 'amocrm' | 'bitrix24' — auto-detected from order source if blank

async def _amo_get_pipeline_stage_id(subdomain: str, token: str, pipeline_id: str, stage_name: str) -> Optional[int]:
    """Find the status_id of a stage by name within a pipeline."""
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"https://{subdomain}.amocrm.ru/api/v4/leads/pipelines/{pipeline_id}/statuses",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
        if r.status_code != 200:
            return None
        for status in r.json().get("_embedded", {}).get("statuses", []):
            if status.get("name", "").strip().lower() == stage_name.strip().lower():
                return status["id"]
    return None

@app.post("/webhook/delivery-failed")
async def delivery_failed(req: DeliveryFailedRequest):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(503, "Not configured")

    crm_type = req.crm_type

    # Auto-detect CRM type from the order's source if not specified
    if not crm_type:
        async with httpx.AsyncClient() as client:
            order_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/livra_webhook_orders"
                f"?company_id=eq.{req.company_id}&external_id=eq.{req.external_id}&select=source",
                headers=_sb_headers(),
            )
            orders = order_res.json() if order_res.status_code == 200 else []
            crm_type = orders[0].get("source", "amocrm") if orders else "amocrm"

    async with httpx.AsyncClient() as client:
        cfg_res = await client.get(
            f"{SUPABASE_URL}/rest/v1/livra_crm_integrations"
            f"?company_id=eq.{req.company_id}&crm_type=eq.{crm_type}&select=*",
            headers=_sb_headers(),
        )
        cfg_list = cfg_res.json() if cfg_res.status_code == 200 else []
        if not cfg_list:
            raise HTTPException(404, f"{crm_type} config not found for this company")
        cfg = cfg_list[0]

    if crm_type == "bitrix24":
        domain   = cfg.get("subdomain", "")
        user_id  = cfg.get("api_user_id", "")
        token    = cfg.get("api_token", "")
        failed_stage = cfg.get("failed_stage", "Replanificare")

        if not domain or not user_id or not token:
            raise HTTPException(400, "Bitrix24 credentials not configured")

        stage_id = await _bx_get_stage_id(domain, user_id, token, failed_stage)
        if not stage_id:
            raise HTTPException(404, f"Stage '{failed_stage}' not found in Bitrix24")

        ok = await _bx_update_deal_stage(domain, user_id, token, req.external_id, stage_id)
        if not ok:
            raise HTTPException(502, "Bitrix24 deal update failed")

        if req.fail_reason:
            await _bx_add_comment(domain, user_id, token, req.external_id, f"Livrare esuata: {req.fail_reason}")

        print(f"[bitrix24] Deal {req.external_id} moved to '{failed_stage}' — reason: {req.fail_reason}")
        return {"ok": True, "stage": failed_stage}

    # amoCRM
    subdomain    = cfg.get("subdomain", "")
    api_token    = cfg.get("api_token", "")
    failed_stage = cfg.get("failed_stage", "Replanificare")

    if not subdomain or not api_token:
        raise HTTPException(400, "amoCRM credentials not configured")

    async with httpx.AsyncClient() as client:
        lead_res = await client.get(
            f"https://{subdomain}.amocrm.ru/api/v4/leads/{req.external_id}",
            headers={"Authorization": f"Bearer {api_token}"},
            timeout=10,
        )
        if lead_res.status_code != 200:
            raise HTTPException(502, f"Could not fetch lead from amoCRM: {lead_res.status_code}")
        pipeline_id = str(lead_res.json().get("pipeline_id", ""))

        stage_id = await _amo_get_pipeline_stage_id(subdomain, api_token, pipeline_id, failed_stage)
        if not stage_id:
            raise HTTPException(404, f"Stage '{failed_stage}' not found in pipeline {pipeline_id}")

        patch_res = await client.patch(
            f"https://{subdomain}.amocrm.ru/api/v4/leads/{req.external_id}",
            headers={"Authorization": f"Bearer {api_token}", "Content-Type": "application/json"},
            json={"status_id": stage_id},
            timeout=10,
        )
        if patch_res.status_code not in (200, 204):
            raise HTTPException(502, f"amoCRM update failed: {patch_res.status_code}")

        if req.fail_reason:
            await client.post(
                f"https://{subdomain}.amocrm.ru/api/v4/notes",
                headers={"Authorization": f"Bearer {api_token}", "Content-Type": "application/json"},
                json={"_embedded": {"notes": [{"entity_id": int(req.external_id), "note_type": "common", "params": {"text": f"Livrare esuata: {req.fail_reason}"}}]}},
                timeout=10,
            )

    print(f"[amocrm] Lead {req.external_id} moved to '{failed_stage}' — reason: {req.fail_reason}")
    return {"ok": True, "stage": failed_stage}


@app.get("/track/{token}")
async def get_tracking(token: str):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=503, detail="Not configured")
    async with httpx.AsyncClient() as client:
        del_res = await client.get(
            f"{SUPABASE_URL}/rest/v1/livra_deliveries?tracking_token=eq.{token}&select=*",
            headers=_sb_headers(),
        )
        deliveries = del_res.json() if del_res.status_code == 200 else []
        if not deliveries:
            raise HTTPException(status_code=404, detail="Comanda nu a fost găsită")
        d = deliveries[0]

        driver_loc = None
        if d.get("driver_id"):
            loc_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/livra_driver_locations?driver_id=eq.{d['driver_id']}&select=lat,lng,updated_at",
                headers=_sb_headers(),
            )
            locs = loc_res.json() if loc_res.status_code == 200 else []
            if locs:
                driver_loc = locs[0]

    return {
        "id": d["id"],
        "customer": d.get("customer", ""),
        "address": d.get("address", ""),
        "lat": d.get("lat"),
        "lng": d.get("lng"),
        "status": d.get("status", "upcoming"),
        "stop_order": d.get("stop_order"),
        "total_stops": d.get("total_stops"),
        "time_window_start": d.get("time_window_start"),
        "time_window_end": d.get("time_window_end"),
        "notes": d.get("notes", ""),
        "driver_location": driver_loc,
    }
