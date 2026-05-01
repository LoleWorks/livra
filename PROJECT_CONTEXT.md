# Livra — Full Project Context

Last updated: 2026-05-01

---

## What Is This

Livra is a last-mile delivery SaaS built for Moldovan companies (e-commerce, retail). It solves the problem of not knowing what is happening during deliveries. Romanian UI throughout. The product is being built to sell to real Moldovan customers, so every feature should map to a real dispatcher or driver pain point.

**Live URL:** `livra.loleworks.com`  
**GitHub:** `https://github.com/LoleWorks/livra` (production branch: `master`)  
**Supabase project:** `sjzrenseksedyubcyxhz` (region: eu-west-1)  
**Supabase URL:** `https://sjzrenseksedyubcyxhz.supabase.co`

---

## Repository & Deployment

- Git repo: `https://github.com/LoleWorks/livra`
- Local working directory: `C:\Users\Lole Works\Downloads\livra-master`
- Two branches in sync: `main` (default local) and `master` (Cloudflare production branch)
- Always push to both: `git push origin main && git push origin main:master`
- Cloudflare Pages auto-deploys on push to `master`
- Build command: `npm run build` (tsc + vite)

---

## Repository Structure

```
livra-master/
  src/                        Web admin panel (React + Vite)
  Livra Driver/               Driver mobile app (React Native / Expo)
  livra-app/                  Customer mobile app (React Native / Expo)
  livra-api/                  Route optimization backend (Python FastAPI)
  livra-woocommerce/          WooCommerce PHP plugin
  livra-opencart/             OpenCart 3.x extension
  CLAUDE.md                   Short dev notes (stack, commands)
  PROJECT_CONTEXT.md          This file
```

---

## 1. Web Admin Panel (`src/`)

**Stack:** React 19 + TypeScript + Vite (port 3003) + Tailwind CSS (`darkMode: 'class'`)

### Running
```
npm run dev    # starts on http://localhost:3003
```

### Env vars needed
```
VITE_SUPABASE_URL=https://sjzrenseksedyubcyxhz.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key from Supabase dashboard>
```

### Routes (`src/App.tsx`)
| Path | Component | Notes |
|---|---|---|
| `/` | `Landing` | Public marketing page |
| `/login` | `Login` | Admin + sales manager login |
| `/change-password` | `ChangePassword` | Force-change after first login |
| `/app` | `AppDownload` | Driver app download page |
| `/t/:token` | `Track` | Customer delivery tracking (token = stop UUID) |
| `/urmarire/:token` | `Track` | Same as above, Romanian URL alias |
| `/industrii/:slug` | `IndustryPage` | SEO industry landing pages |
| `/cazuri/:slug` | `UseCasePage` | SEO use-case landing pages |
| `/sales` | `SalesDashboard` | Sales agent portal |
| `/sales/comenzi` | `SalesOrders` | |
| `/sales/nou` | `SalesNewOrder` | |
| `/sales/retururi` | `SalesReturns` | |
| `/dashboard` | `Dashboard` | Live driver map + KPIs |
| `/routes` | `RoutesPage` | Delivery management + route optimizer |
| `/drivers` | `Drivers` | Driver + sales manager management |
| `/warehouses` | `Warehouses` | Warehouse list |
| `/warehouses/:id` | `WarehouseDetail` | Warehouse inventory |
| `/activity` | `Activity` | Driver event log |
| `/integrations` | `Integrations` | WooCommerce/OpenCart setup |
| `/credits` | `Credits` | Credit system (placeholder) |

### Auth (`src/lib/auth.ts`)
- Custom auth — NOT Supabase Auth exclusively
- Admins: stored in `livra_admins` table (have Supabase auth + `livra_admins` row)
- Sales managers: stored in `livra_sales_managers` table
- `signIn()` calls `supabase.auth.signInWithPassword()` then looks up admin or sales manager row
- Session stored in `localStorage` as `livra_user` (JSON of `AppUser`)
- `getUser()` reads from localStorage — called everywhere to gate pages
- `role: 'admin' | 'sales'` — sales managers see only the `/sales/*` portal
- `must_change_password: true` redirects to `/change-password` on login
- `company_id` on admin = their own `id`; on sales manager = `admin_id` (the admin they belong to)

### Key Pages

**Dashboard (`src/pages/Dashboard.tsx`)**
- Live map: Yandex tiles (`YandexMapLayer`), driver van SVG icons via `L.divIcon`
- Van icon colors: active=emerald, lunch/fuel break=amber, done=blue, offline=gray
- Map CRS: standard Leaflet (Yandex tiles work with default EPSG3857 in this implementation)
- KPIs shown: total stops, in progress, delivered, failed
- Attention items panel: failed deliveries needing follow-up (from `livra_attention_items`)
- Realtime Supabase channel on `livra_driver_locations` for live position updates
- Sidebar recent items: placeholder, not yet wired to real data

**Routes (`src/pages/Routes.tsx`)**
- Tab 1 "Comenzi": list of deliveries from `livra_deliveries` (queried by company via `livra_admins`)
- Tab 2 "Rute": optimizer UI — select deliveries + drivers, call Python API, show result on map
- Tab 3 "Finalizate": completed stops history
- Route optimizer flow:
  1. User selects deliveries + drivers
  2. POST to `livra-api` `/optimize` endpoint
  3. Response shows routes on Leaflet map with OSRM road paths
  4. "Trimite la soferi" dispatches: inserts `livra_routes` + `livra_route_stops` to Supabase
  5. Each stop gets `estimated_arrival: s.arrival_time || null` from the optimizer output
  6. Notification to customers triggered by Postgres trigger (not browser-side)
- Route stop insert payload includes: `stop_order, delivery_id, client_name, client_phone, address, lat, lng, status: 'pending', type, package_description, delivery_notes, estimated_arrival`

**Track (`src/pages/Track.tsx`)**
- Customer-facing page, no auth required
- URL pattern: `/t/<stop-uuid>` or `/urmarire/<stop-uuid>`
- Token = `livra_route_stops.id` (UUID of the specific stop)
- Load logic: queries `livra_route_stops` by `id` first; falls back to `livra_deliveries.tracking_token` for legacy links
- Status values: `pending` = in transit, `completed` = delivered, `failed` = failed
- **When status is `pending`:** shows full-screen live map with driver location, progress bar, estimated arrival, 10s polling
- **When status is `completed` or `failed`:** renders a static confirmation page — no map, no driver location, polling stops. Shows a checkmark/X icon, customer name, address, and app download CTA. Driver cannot be tracked after delivery.
- Brand colors: orange `#ff5c2c` (not purple), dark `#161513`
- App download CTA: links to App Store (iOS), Google Play (Android), or `/app` (desktop)
- App Store URL placeholder: `https://apps.apple.com/app/livra/id000000000` — update when published
- Play Store URL placeholder: `https://play.google.com/store/apps/details?id=md.livra.app` — update when published

**Drivers (`src/pages/Drivers.tsx`)**
- Manages `livra_drivers` table rows
- Also manages `livra_sales_managers` from the same page
- Shows device info (brand, model, OS, app version, last login) from fields updated by the driver app on startup

### Map Setup
- Library: `react-leaflet` v5 + `leaflet`
- Tile layer: Yandex maps via custom `YandexMapLayer` component (`src/components/YandexLayer.tsx`)
- Satellite: `YandexSatLayer` toggle in Dashboard and Routes
- Traffic layer: `YandexTrafficLayer` (button exists, real data needs TomTom API key)
- Moldova border overlay: `MoldovaBorder` component using GeoJSON
- OSRM routing for road paths between stops: `https://router.project-osrm.org/route/v1/driving/...`
- Tooltip fix in `index.css`: `white-space: normal !important` on Leaflet tooltips
- Driver van SVG marker: side-profile delivery van drawn inline as SVG string in `L.divIcon`

### Notifications (`src/lib/notifications.ts`)
- Browser push + audio ding for new sales orders
- Sound synthesized via Web Audio API (no audio file needed)
- `unlockAudio()` must be called from a user gesture before `playDing()` works

---

## 2. Driver Mobile App (`Livra Driver/`)

**Stack:** React Native + Expo  
**Env vars:** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Navigation Stack (`Livra Driver/App.tsx`)
```
Login -> Home -> DeliveryDetail -> AfterNavigation -> FailureReason
                               -> FailureReason
       -> Profile
```

### Auth
- PIN-only (no email). Driver enters 4-digit PIN.
- `driver_id` stored in AsyncStorage under `@livra_driver_id`
- `loadDriverId()` / `saveDriverId()` / `clearDriverId()` in `src/lib/storage.ts`
- On app start: if `driver_id` in storage and still in `livra_drivers`, skip Login and go to Home

### Location Tracking (`Livra Driver/src/lib/tracking.ts`)

All tracking logic is in `src/lib/tracking.ts` — do not duplicate it elsewhere.

```
startTracking(driverId)   — sets status=active, requests permissions, starts background GPS task
stopTracking(driverId)    — stops GPS task + sets status=offline (use on LOGOUT only)
stopLocationTask()        — stops GPS task only, does NOT change driver status (use on ROUTE COMPLETE)
```

**GPS lifecycle:**
| Event | Call | Driver status |
|---|---|---|
| Login (PIN screen) | `startTracking()` | `active` |
| App cold start with saved session | `startTracking()` | `active` |
| Route completed (all stops done) | `stopLocationTask()` | stays `done` |
| Logout | `stopTracking()` | `offline` |

**Background task** (`src/lib/locationTask.ts`):
- Registered with `expo-task-manager`, task name `livra-location-task`
- Updates every 10 seconds or 15 meters, whichever comes first
- Upserts into `livra_driver_locations` with `{ driver_id, lat, lng, heading, updated_at }`
- Conflict key: `driver_id` (one row per driver, always overwritten)
- Runs in a separate JS context — uses its own minimal Supabase client
- Background service notification: orange `#FF5C2C`, "Transmitere locatie GPS activa"

### Screens

**LoginScreen** — PIN pad, queries `livra_drivers` by PIN, saves `driver_id` to storage, calls `startTracking()` on success

**HomeScreen** — Today's route card (distance, stops count, duration), list of stops with status badges, pull-to-refresh, realtime subscription on route stops

**DeliveryDetailScreen** — Shows stop details (client name, address, notes, package info). Buttons: "Navigheaza cu Google Maps" / "Waze" — calls `openGoogleMaps()` or `openWaze()` from `src/lib/nav.ts` then navigates to AfterNavigation

**AfterNavigationScreen** — Shown after driver returns from nav app. Buttons: "Am ajuns" (success) or "Nereusit" (goes to FailureReasonScreen). When last stop is completed here, calls `stopLocationTask()` before navigating to Home.

**FailureReasonScreen** (`src/screens/FailureReasonScreen.tsx`) — Failure reason picker:
- Reasons: Adresa incorecta, Client absent, Refuz primire, Parcel deteriorat, Usa inchisa cu clanta de siguranta, Doar coletul de pe usa, Altul
- On confirm: updates stop status=failed, inserts to `livra_attention_items`, logs event
- When last stop fails here, calls `stopLocationTask()` before navigating to Home

**ProfileScreen** — Driver profile, logout button. Logout calls `stopTracking(driverId)` (stops GPS + sets offline) then `clearDriverId()`.

### Completing a Stop (success flow)
1. `AfterNavigationScreen` -> tap "Livrata"
2. `StopSheet` component (`src/components/StopSheet.tsx`) opens
3. Driver optionally captures signature via `SignaturePad` (`src/components/SignaturePad.tsx`)
4. On confirm: updates `livra_route_stops` status=completed, uploads signature to Supabase Storage
5. Logs `stop_completed` event
6. Navigates to next pending stop; if none left, calls `stopLocationTask()` then navigates to Home

### Events Logging (`src/lib/events.ts`)
All driver actions are logged to `livra_driver_events`:
- `login`, `logout`, `route_opened`, `route_completed`
- `stop_completed`, `stop_failed`
- `break_started`, `break_ended`
- `geofence_bypass_used`, `nav_app_opened`
- Always includes `driver_id`, `route_id`, GPS coordinates (from last known position if not provided), and `metadata`

### Push Notifications (`src/lib/notifications.ts`)
- Expo push notifications
- `registerPushToken(driverId)` called on app start — saves Expo push token to `livra_drivers.push_token`
- Channel `deliveries` for delivery notifications

---

## 3. Customer Mobile App (`livra-app/`)

**Stack:** React Native + Expo (Expo Router file-based routing)  
**Env vars:** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Auth Flow
- Phone OTP via Supabase Auth (`app/auth/phone.tsx` + `app/auth/otp.tsx`)
- User enters 8-digit Moldovan number (without country code) — app prepends `+373`
- Supabase sends 6-digit OTP via SMS
- On verify: checks `livra_customers` table for existing profile
  - If exists: go to `/(tabs)/home`
  - If new: go to `/onboarding/name` (create profile)
- Auth state managed by `src/context/AuthContext.tsx`

### Orders Flow
- `src/context/OrdersContext.tsx` calls `supabase.rpc('get_stops_for_customer', { p_phone: user.phone })` using the verified phone from Supabase Auth
- Supabase Auth stores phone in E.164 format (`+37369XXXXXX`) — this is passed to the RPC
- The RPC normalizes both sides so it matches regardless of how the dispatcher entered the phone (e.g. `069163838` matches `+37369163838`)
- Realtime subscription on `livra_route_stops` keeps orders live
- `activeStops` = status `pending`; `allStops` = all statuses (pending + completed + failed)

### Screens
- `app/(tabs)/home.tsx` — dashboard
- `app/(tabs)/orders.tsx` — order list with Active/Livrate/Toate filters
- `app/order/[stopId]/index.tsx` — delivery detail
- `app/track/[stopId].tsx` — live map tracking
- `app/(tabs)/pins.tsx` — saved delivery locations
- `app/(tabs)/profile.tsx` — profile + sign out
- `app/auth/phone.tsx` + `app/auth/otp.tsx` — auth
- `app/onboarding/` — name, PIN preference, time window setup

### Context
- `AuthContext` (`src/context/AuthContext.tsx`) — Supabase session, customer profile, push token registration
- `OrdersContext` (`src/context/OrdersContext.tsx`) — all stops for authenticated customer's phone

---

## 4. Python FastAPI Backend (`livra-api/main.py`)

**Port:** 8000  
**Run:** `cd livra-api && py -m uvicorn main:app --reload --port 8000`

### Env vars needed
```
VROOM_URL=https://api.openrouteservice.org/optimization   # or self-hosted
ORS_API_KEY=<key>                                          # if using ORS public
SUPABASE_URL=https://sjzrenseksedyubcyxhz.supabase.co
SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

### Endpoints
- `POST /optimize` — VRP route optimization
- `POST /webhook/woocommerce` — receive WooCommerce orders
- `POST /webhook/opencart` — receive OpenCart orders

### Optimization Logic
- VRP solver: VROOM via ORS public API (free, dev) or self-hosted VROOM
- Geocoding: Photon (komoot) primary -> Nominatim fallback, Moldova bbox filter
- Moldova bounding box: `26.6,45.4,30.2,48.5`
- Service time: 10 min per delivery stop
- Max shift: 8 hours
- Mandatory lunch break: 30 min, scheduled 4.5-5h into shift
- Shift start time configurable (default 09:00)
- Returns per-stop `arrival_time: "HH:MM"` — this is what goes into `estimated_arrival` in `livra_route_stops`
- Deferred deliveries: stops that couldn't be fit (capacity, time window, geocode failure)
- After optimization, the FastAPI also directly writes routes + stops to Supabase (service role key)

---

## 5. Supabase Database Tables

### `livra_admins`
Company accounts. Columns include: `id, name, email, phone, initials, color, status, must_change_password`

### `livra_sales_managers`
Sales agent accounts. Columns: `id, admin_id (FK to livra_admins), name, email, phone, initials, color, status, must_change_password`

### `livra_drivers`
Driver profiles. Columns: `id, name, pin, color, phone, status ('active'|'lunch_break'|'fuel_break'|'done'|'offline'), push_token, device_name, device_model, device_os, device_os_version, device_app_version, last_login`

### `livra_driver_locations`
One row per driver, continuously upserted by background location task.
Columns: `driver_id, lat, lng, heading, updated_at`  
Conflict key: `driver_id`

**Triggers on this table:**
- `on_driver_location_updated` (AFTER UPDATE) -> calls `check_driver_eta()` function

### `livra_driver_events`
Activity log. Columns: `driver_id, route_id, event_type, lat, lng, metadata (jsonb), created_at`

### `livra_routes`
One per driver per day. Columns: `id, driver_id, date, status ('pending'|'active'|'completed'), total_distance_km, total_duration_min, created_at`

**Triggers on this table:**
- `on_route_inserted` (AFTER INSERT) -> calls `notify_route_dispatch()` -> calls `notify-route-dispatch` edge function

### `livra_route_stops`
Individual stops per route. Columns:
`id, route_id, delivery_id, stop_order, status ('pending'|'completed'|'failed'), type ('delivery'|'lunch_break'|'fuel_break'), client_name, client_phone, address, lat, lng, package_description, delivery_notes, fail_reason, notes, break_duration_min, time_window_start, time_window_end, estimated_arrival (text), eta_notified_at (timestamptz), completed_at, signature_url`

Key notes:
- `estimated_arrival` = "HH:MM" string from route optimizer, used in SMS and tracking page
- `eta_notified_at` = set when the 10-min ETA notification fires (prevents duplicate notifications)
- `status` values are `pending`/`completed`/`failed` — NOT `dispatched`/`delivered`

### `livra_deliveries`
Incoming delivery orders. Columns: `id, customer, phone, address, notes, package_description, time_window_start, time_window_end, delivery_date, status, order_items, order_items_json, order_value, shipping_cost, assigned_to, service_time_min, source_warehouse_id, tracking_token`

### `livra_attention_items`
Failed deliveries needing dispatcher follow-up. Columns: `id, stop_id, delivery_id, customer, phone, address, driver_name, fail_reason, status ('open'|'rescheduled'|'cancelled'), failed_at, created_at`

### `livra_warehouses`
Columns: `id, name, address, lat, lng, admin_id`

### `livra_inventory`
SKUs per warehouse. Columns: `id, warehouse_id, sku, name, quantity`

### `livra_customers`
End customers with the Livra customer app. Columns: `id (= Supabase Auth user UUID), phone, name, push_token, preferred_time_window_start, preferred_time_window_end, created_at`
- `id` matches Supabase Auth user UUID
- Used to look up Expo push tokens when sending ETA notifications
- Created during onboarding after first OTP verification

---

## 6. Supabase Edge Functions

All deployed to project `sjzrenseksedyubcyxhz`.

### `notify-route-dispatch` (v8)
- Triggered by Postgres trigger `on_route_inserted` on `livra_routes` via `pg_net`
- Sends SMS to each customer in the route via Twilio
- SMS body: "Livra: Buna ziua, [name]! Comanda dvs. este in drum si va fi livrata in jurul orei [HH:MM]. Urmariti live: [tracking-url]"
- Tracking URL format: `https://livra.md/urmarire/<stop-id>`
- `verify_jwt: false` (called from Postgres trigger, not browser)
- Phone normalization: `toE164()` converts Moldovan numbers to `+373XXXXXXXX` format

### `notify-eta` (v2)
- Triggered by Postgres trigger `on_driver_location_updated` on `livra_driver_locations` via `pg_net`
- Fires when driver is within 2km AND actively approaching (new distance < old distance)
- Checks `livra_customers` for Expo push token first; if found sends push notification, otherwise SMS
- Push title: "Soferul este aproape!"
- Push body: "[name], livrarea ta soseste in aproximativ 10 minute. Fii pregatit/a!"
- SMS: "Livra: [name], soferul dvs. este la aproximativ 10 minute distanta! Fiti pregatit/a pentru livrare. Urmariti live: [url]"
- `verify_jwt: false`

### Environment variables required on edge functions
Set in Supabase Dashboard -> Edge Functions -> Secrets:
```
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_FROM_NUMBER    # must be a real Twilio number, NOT alphanumeric (trial restriction)
TRACKING_BASE_URL     # default: https://livra.md/urmarire
```

---

## 7. Postgres Triggers & Functions

### `notify_route_dispatch()` + `on_route_inserted`
```sql
-- Fires AFTER INSERT on livra_routes
-- Calls notify-route-dispatch edge function with { route_id }
-- Uses pg_net: net.http_post(url, body jsonb, headers jsonb)
-- Body must be jsonb, NOT ::text cast
```

### `check_driver_eta()` + `on_driver_location_updated`
```sql
-- Fires AFTER UPDATE on livra_driver_locations
-- For each pending delivery stop on the driver's active route:
--   Calculates Haversine distance from OLD position to stop (v_old_dist_m)
--   Calculates Haversine distance from NEW position to stop (v_new_dist_m)
--   IF v_new_dist_m <= 2000 AND v_new_dist_m < v_old_dist_m:
--     (driver is within 2km AND getting closer)
--     Sets eta_notified_at = now() on the stop
--     Calls notify-eta edge function with { stop_id }
-- eta_notified_at prevents duplicate notifications
```

### `get_stops_for_customer(p_phone text)`
```sql
-- SECURITY DEFINER — bypasses RLS, validates access by phone ownership
-- Called by the customer app: supabase.rpc('get_stops_for_customer', { p_phone })
-- Normalizes input phone to E.164 (+373XXXXXXXX) then matches against:
--   client_phone exact match OR E.164 match OR digits-only match
-- Returns all livra_route_stops of type='delivery' for that phone
-- Handles dispatcher entering 069163838 matching customer auth phone +37369163838
```

---

## 8. Notification Flow (End-to-End)

### Route dispatch SMS (fires when dispatcher hits "Trimite la soferi")
1. `Routes.tsx` dispatches: inserts `livra_routes` row to Supabase
2. Postgres trigger `on_route_inserted` fires on `livra_routes`
3. Trigger calls `net.http_post` to `notify-route-dispatch` edge function
4. Edge function queries stops from `livra_route_stops` for that route
5. For each stop with a phone number: sends Twilio SMS with estimated arrival time
6. SMS contains link: `https://livra.md/urmarire/<stop-id>`

### ETA notification (fires when driver is ~10 minutes away)
1. Driver app background task upserts `livra_driver_locations` every 10s/15m
2. Postgres trigger `on_driver_location_updated` fires on UPDATE
3. Trigger runs Haversine distance check for all pending stops on active route
4. If driver within 2km AND approaching (new dist < old dist) AND `eta_notified_at` is null:
5. Sets `eta_notified_at` on stop to prevent repeat
6. Calls `notify-eta` edge function
7. Edge function: if customer has push token in `livra_customers` -> Expo push; else -> Twilio SMS

---

## 9. Customer App Order Linking Flow

When a customer receives a delivery SMS and later installs the Livra customer app:

1. Customer opens the app, enters their phone number (same one SMS was sent to)
2. Supabase sends OTP, they verify it — Supabase Auth session created with their phone
3. If new user: onboarding creates a row in `livra_customers` (id = Supabase Auth UUID)
4. `OrdersContext` calls `get_stops_for_customer(user.phone)` automatically
5. All orders where `livra_route_stops.client_phone` matches their phone appear immediately
6. Active orders (status=`pending`) and past orders (status=`completed`/`failed`) both show
7. Realtime subscription keeps the order list live while the app is open

The phone matching is fuzzy — `+37369163838`, `069163838`, `69163838` all resolve to the same customer.

---

## 10. Twilio Setup

- Account: trial (currently exhausted, needs upgrade to paid)
- `TWILIO_FROM_NUMBER` must be a real Twilio phone number (e.g. `+15017122661`), NOT alphanumeric (alphanumeric sender IDs blocked on trial)
- Moldova numbers get normalized to `+37369XXXXXX` format
- Moldova SMS verification via SMS/voice blocked on trial accounts (needs paid account)

---

## 11. E-commerce Integrations

### WooCommerce Plugin (`livra-woocommerce/`)
- PHP plugin installed on the merchant's WooCommerce site
- Sends `POST` to `/webhook/woocommerce` on order creation
- Configurable webhook URL + secret in WooCommerce settings

### OpenCart Extension (`livra-opencart/`)
- OpenCart 3.x module
- Same pattern: sends to `/webhook/opencart`
- Secret validation in FastAPI

---

## 12. Brand & Design Tokens

- **Primary orange:** `#ff5c2c` (used everywhere — CTAs, active state, progress bars, driver van accent)
- **Dark background:** `#161513`
- **Tailwind custom color:** `brand-orange` = `#ff5c2c`
- Driver status colors: active=`#10b981` (emerald), break=`#f59e0b` (amber), done=`#3b82f6` (blue), offline=`#9ca3af` (gray)
- Route colors (6, cycling): `#10b981, #3b82f6, #f59e0b, #8b5cf6, #ef4444, #06b6d4`
- Font: system default; mono font used for labels/codes in mobile app (`T.font.mono`)
- Mobile design tokens: `Livra Driver/src/lib/tokens.ts` exports `T.color`, `T.font`, `T.radius`
- Customer app tokens: `livra-app/src/theme/tokens.ts`

---

## 13. Known Pending Items

- App Store / Play Store URLs in `Track.tsx` are placeholders — update when app is published
- `livra.loleworks.com` frontend rebuilds automatically on push to `master` via Cloudflare Pages
- Traffic layer button exists in Dashboard but real traffic data requires TomTom API key
- `sidebarRecent` in Dashboard is always empty — not wired to real data
- Credits page is a placeholder — billing system not implemented
- Twilio trial exhausted — upgrade to paid to resume SMS testing
- Backend in `livra-api/` needs `ORS_API_KEY` for production (currently using free ORS tier)

---

## 14. Important Coding Rules

- **No em dashes** (`—`) in any code strings, log messages, or UI text. Use a plain hyphen (`-`) instead.
- All UI text is in Romanian.
- Do not use `::text` cast when passing body to `net.http_post` — it must be `jsonb`.
- Customer notifications always go through Postgres triggers + edge functions, never through browser-side `supabase.functions.invoke()` (CORS issues).
- `livra_driver_locations` has one row per driver (upsert on conflict `driver_id`).
- `livra_route_stops.status` values are `pending` / `completed` / `failed` — never `dispatched` or `delivered`.
- GPS tracking logic lives exclusively in `Livra Driver/src/lib/tracking.ts` — do not inline it in screens.
- Always push to both branches: `git push origin main && git push origin main:master`
