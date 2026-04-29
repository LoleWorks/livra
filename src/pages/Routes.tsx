import { Helmet } from 'react-helmet-async'
import { useState, useRef, Fragment, useEffect } from 'react'
import { MapContainer, Polyline, Marker, Tooltip } from 'react-leaflet'
import { YandexMapLayer, YandexTrafficLayer } from '../components/YandexLayer'
import MoldovaBorder from '../components/MoldovaBorder'
import L from 'leaflet'
import {
  Wand2, Trash2, MapPin, Clock,
  ChevronRight, CheckCircle2, X, Check, Radio,
  Package, UtensilsCrossed, Fuel, AlertTriangle, Ban, Inbox, ClipboardList, Truck, User, Upload,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getUser } from '../lib/auth'

// ── Types ────────────────────────────────────────────────────────────────────

type Delivery = { id: string; customer: string; phone: string; address: string; notes: string; package_description?: string; time_window_start?: string; time_window_end?: string; delivery_date?: string; status?: 'upcoming' | 'dispatched' | 'delivered' | 'failed'; order_items?: string; order_items_json?: { sku?: string | null; name?: string | null; qty?: number | null }[] | null; order_value?: number; shipping_cost?: number; assigned_to?: string; service_time_min?: number; source_warehouse_id?: string | null }
type RouteStop = { order: number; delivery_id: string; customer: string; address: string; phone: string; lat: number; lng: number; type: string; break_duration_min: number; package_description?: string; arrival_time?: string }
type DriverRoute = { driver_id: string; driver_name: string; color: string; stops: RouteStop[]; total_distance_km: number; total_duration_min: number; path?: [number, number][]; start_lat: number; start_lng: number }
type DeferredDelivery = { delivery_id: string; customer: string; address: string; reason: string }
type FinishedStop = {
  id: string
  customer: string
  address: string
  status: 'completed' | 'failed'
  completed_at: string | null
  fail_reason: string | null
  date: string                 // route's date
  driver_id: string
  driver_name: string
  package_description: string | null
}
type OptimizeResult = { routes: DriverRoute[]; savings_pct: number; total_stops: number; deferred: DeferredDelivery[] }
type DriverConfig = { id: string; name: string; enabled: boolean }

// ── Constants ────────────────────────────────────────────────────────────────

const DRIVER_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']


// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchRoadPath(waypoints: [number, number][]): Promise<[number, number][] | null> {
  if (waypoints.length < 2) return null
  try {
    const coords = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';')
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full`)
    const data = await res.json()
    if (data.code !== 'Ok' || !data.routes?.[0]) return null
    return data.routes[0].geometry.coordinates.map(([lng, lat]: number[]) => [lat, lng] as [number, number])
  } catch { return null }
}

function stopIcon(num: number, color: string) {
  return L.divIcon({
    html: `<div style="width:20px;height:20px;background:${color};color:white;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,0.2)">${num}</div>`,
    iconSize: [20, 20], iconAnchor: [10, 10], className: '',
  })
}

function breakIcon(kind: 'lunch_break' | 'fuel_break') {
  const svg = kind === 'lunch_break'
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="15" y2="22"/><line x1="4" y1="9" x2="14" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>`
  return L.divIcon({
    html: `<div style="width:24px;height:24px;background:#f59e0b;color:white;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,0.25)">${svg}</div>`,
    iconSize: [24, 24], iconAnchor: [12, 12], className: '',
  })
}

function fmtDuration(mins: number) {
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

// ── Date helpers ──────────────────────────────────────────────────────────────

const ROMANIAN_DAYS  = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă']
const ROMANIAN_MONTHS = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
                          'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function addDaysISO(iso: string, n: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d + n)
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
}
function fmtDateRO(iso: string) {
  if (!iso) return 'Fără dată'
  const today = todayISO()
  if (iso === today)               return `Astăzi · ${prettyDate(iso)}`
  if (iso === addDaysISO(today, 1)) return `Mâine · ${prettyDate(iso)}`
  if (iso === addDaysISO(today,-1)) return `Ieri · ${prettyDate(iso)}`
  return prettyDate(iso)
}
function prettyDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return `${ROMANIAN_DAYS[dt.getDay()]}, ${d} ${ROMANIAN_MONTHS[m-1]} ${y}`
}
function isPastISO(iso?: string) {
  if (!iso) return false
  return iso < todayISO()
}

// ── Capacity helpers ──────────────────────────────────────────────────────────

const STOPS_PER_DRIVER_DAY    = 30   // ~16 min/stop × 8h shift
// ~25 min including travel between same-area stops

function dayCapacity(numDrivers: number) {
  return Math.max(1, numDrivers) * STOPS_PER_DRIVER_DAY
}
function capacityState(used: number, cap: number): 'ok' | 'warn' | 'full' {
  if (used >= cap) return 'full'
  if (used >= cap * 0.8) return 'warn'
  return 'ok'
}

// ── Sub-components ────────────────────────────────────────────────────────────


// 24h time picker | guaranteed no AM/PM regardless of OS locale.
// Click the field to open a dropdown with two scrollable columns: hours (00-23)
// and minutes (5-minute steps). Selected value populates the input as HH:MM.
function TimeInput24({ value, onChange, placeholder, className }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const hourColRef = useRef<HTMLDivElement>(null)
  const minColRef  = useRef<HTMLDivElement>(null)

  const [h, m] = (value && value.includes(':')) ? value.split(':') : ['', '']

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  // Auto-scroll columns to the currently selected value when opened
  useEffect(() => {
    if (!open) return
    const scrollTo = (col: HTMLDivElement | null, val: string) => {
      if (!col) return
      const el = col.querySelector(`[data-v="${val}"]`) as HTMLElement | null
      if (el) col.scrollTop = el.offsetTop - col.clientHeight / 2 + el.clientHeight / 2
    }
    setTimeout(() => {
      scrollTo(hourColRef.current, h || '09')
      scrollTo(minColRef.current,  m || '00')
    }, 0)
  }, [open, h, m])

  function setHour(hh: string)   { onChange(`${hh}:${m || '00'}`) }
  function setMinute(mm: string) { onChange(`${h || '09'}:${mm}`); setOpen(false) }

  const hours   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const minutes = ['00','05','10','15','20','25','30','35','40','45','50','55']

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        readOnly
        onClick={() => setOpen(o => !o)}
        value={value || ''}
        placeholder={placeholder ?? 'HH:MM'}
        className={`${className} cursor-pointer`}
      />
      {open && (
        <div className="absolute z-[100] top-full mt-1 left-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl flex overflow-hidden">
          <div ref={hourColRef} className="max-h-44 overflow-y-auto py-1 border-r border-zinc-100 dark:border-zinc-800">
            {hours.map(hh => (
              <button
                key={hh} type="button" data-v={hh}
                onClick={() => setHour(hh)}
                className={`block w-12 px-3 py-1 text-[12px] text-center font-mono transition-colors ${
                  hh === h ? 'bg-brand-orange text-white' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {hh}
              </button>
            ))}
          </div>
          <div ref={minColRef} className="max-h-44 overflow-y-auto py-1">
            {minutes.map(mm => (
              <button
                key={mm} type="button" data-v={mm}
                onClick={() => setMinute(mm)}
                className={`block w-12 px-3 py-1 text-[12px] text-center font-mono transition-colors ${
                  mm === m ? 'bg-brand-orange text-white' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {mm}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[3000] flex items-center gap-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-[13px] font-medium px-4 py-2.5 rounded-xl shadow-xl animate-fade-in"
      onAnimationEnd={onDone}
    >
      <CheckCircle2 size={15} className="text-emerald-400 dark:text-emerald-600" />
      {msg}
    </div>
  )
}

// ── Optimize loading screen ───────────────────────────────────────────────────

const FUNNY_MSGS = [
  'Se trezește șoferul… mai are nevoie de o cafea ☕',
  'Se calculează cel mai scurt drum prin toate gropile din Chișinău 🕳️',
  'Se negociază cu semafoarele… unele sunt mai încăpățânate 🚦',
  'GPS-ul zice stânga, șoferul zice dreapta. GPS-ul a câștigat.',
  'Se evită strada cu lucrările de 3 ani care nu se termină niciodată 🚧',
  'Se optimizează ruta pentru a evita vaca de pe DN1 🐄',
  'Algoritmul încearcă să priceapă sistemul de adrese din Moldova 🤔',
  'Se solicită permisiunea de la băbuțele din piață să trecem prin față 👵',
  'Se adaugă 15 minute pentru traficul de pe Calea Ieșilor la ora 17:00',
]

const LOAD_STEPS = [
  'Se geocodifică adresele…',
  'Se calculează matricea de distanțe…',
  'Se grupează livrările pe regiuni…',
  'Se alocă șoferii pe clustere…',
  'Se ordonează stopurile…',
  'Se finalizează rutele…',
]

// Nodes: depot centre + scatter of stops (Moldova-ish layout)
const NODES = [
  { x: 160, y: 110 }, // depot / centre | Chișinău
  { x: 88,  y: 52  }, // north-west
  { x: 200, y: 38  }, // north-east
  { x: 58,  y: 130 }, // west
  { x: 248, y: 95  }, // east
  { x: 120, y: 158 }, // south-west
  { x: 222, y: 162 }, // south-east
  { x: 148, y: 68  }, // north-centre
]

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']

// Pre-defined route groups radiating from depot
const ROUTE_GROUPS = [
  [0, 1, 7, 2],
  [0, 3, 5],
  [0, 4, 6],
]

function polylineLen(pts: { x: number; y: number }[]) {
  let d = 0
  for (let i = 1; i < pts.length; i++) {
    d += Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y)
  }
  return d
}

function OptimizeLoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [, setStepIdx]   = useState(0)
  const [msgIdx, setMsgIdx]     = useState(0)
  const [fade, setFade]         = useState(true)
  const [drawn, setDrawn]       = useState<number[]>([0, 0, 0]) // dashoffset per route

  // Progress bar | logarithmic, caps at ~92
  useEffect(() => {
    const t0 = Date.now()
    const iv = setInterval(() => {
      const s = (Date.now() - t0) / 1000
      setProgress(Math.min(92, Math.log1p(s * 1.2) * 36))
    }, 80)
    return () => clearInterval(iv)
  }, [])

  // Step label cycles every ~2.5 s
  useEffect(() => {
    const iv = setInterval(() => {
      setStepIdx(i => Math.min(i + 1, LOAD_STEPS.length - 1))
    }, 2600)
    return () => clearInterval(iv)
  }, [])

  // Funny message cycles every ~4 s with fade
  useEffect(() => {
    const iv = setInterval(() => {
      setFade(false)
      setTimeout(() => { setMsgIdx(i => (i + 1) % FUNNY_MSGS.length); setFade(true) }, 350)
    }, 4000)
    return () => clearInterval(iv)
  }, [])

  // Animate route lines drawing in one by one, then loop
  useEffect(() => {
    const lengths = ROUTE_GROUPS.map(g => polylineLen(g.map(i => NODES[i])))
    const DRAW_MS = 900   // time to draw one route
    const HOLD_MS = 600   // pause after all routes drawn before reset
    const STAGGER = 1100  // delay between each route starting
    const CYCLE   = STAGGER * ROUTE_GROUPS.length + DRAW_MS + HOLD_MS

    let alive = true
    const timers: ReturnType<typeof setTimeout>[] = []

    function runCycle() {
      if (!alive) return
      // Reset all lines to hidden
      setDrawn(lengths.slice())

      ROUTE_GROUPS.forEach((_, ri) => {
        const len = lengths[ri]
        const t = setTimeout(() => {
          if (!alive) return
          const t0 = Date.now()
          const iv = setInterval(() => {
            const frac = Math.min(1, (Date.now() - t0) / DRAW_MS)
            setDrawn(d => { const n = [...d]; n[ri] = len * (1 - frac); return n })
            if (frac >= 1) clearInterval(iv)
          }, 16)
        }, ri * STAGGER)
        timers.push(t)
      })

      const loop = setTimeout(() => { if (alive) runCycle() }, CYCLE)
      timers.push(loop)
    }

    runCycle()
    return () => { alive = false; timers.forEach(clearTimeout) }
  }, [])

  const svgW = 320, svgH = 210

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Se optimizează rutele</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-zinc-50 dark:bg-zinc-950 select-none px-8">

        {/* Map canvas */}
        <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
            {/* Subtle grid */}
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.4" className="text-zinc-200 dark:text-zinc-800" />
              </pattern>
            </defs>
            <rect width={svgW} height={svgH} fill="url(#grid)" />

            {/* Route polylines | drawn via stroke-dashoffset */}
            {ROUTE_GROUPS.map((group, ri) => {
              const pts = group.map(i => NODES[i])
              const d = pts.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
              const len = polylineLen(pts)
              return (
                <path
                  key={ri}
                  d={d}
                  fill="none"
                  stroke={COLORS[ri]}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={len}
                  strokeDashoffset={drawn[ri]}
                  opacity="0.85"
                />
              )
            })}

            {/* Stop nodes */}
            {NODES.map((n, i) => {
              const isDepot = i === 0
              const routeColor = ROUTE_GROUPS.findIndex(g => g.includes(i))
              const color = isDepot ? '#6366f1' : (COLORS[routeColor] ?? '#94a3b8')
              return (
                <g key={i}>
                  {isDepot ? (
                    <>
                      <circle cx={n.x} cy={n.y} r={9} fill="#6366f1" opacity="0.15" />
                      <circle cx={n.x} cy={n.y} r={5} fill="#6366f1" />
                      <circle cx={n.x} cy={n.y} r={2} fill="white" />
                    </>
                  ) : (
                    <>
                      <circle cx={n.x} cy={n.y} r={4} fill={color} opacity="0.2" />
                      <circle cx={n.x} cy={n.y} r={2.5} fill={color} />
                    </>
                  )}
                </g>
              )
            })}

            {/* Driver labels */}
            {ROUTE_GROUPS.map((group, ri) => {
              const last = NODES[group[group.length - 1]]
              return (
                <text key={ri} x={last.x + 6} y={last.y + 4}
                  fontSize="9" fill={COLORS[ri]} fontWeight="600" opacity="0.9"
                  fontFamily="ui-sans-serif,system-ui,sans-serif">
                  Șofer {ri + 1}
                </text>
              )
            })}
          </svg>
        </div>

        {/* Funny message */}
        <p
          className="text-[13px] text-zinc-600 dark:text-zinc-300 text-center max-w-xs transition-opacity duration-300"
          style={{ opacity: fade ? 1 : 0 }}
        >
          {FUNNY_MSGS[msgIdx]}
        </p>

        {/* Progress bar */}
        <div className="w-72">
          <div className="flex justify-between text-[11px] text-zinc-400 mb-1.5">
            <span>Optimizare în curs</span>
            <span className="tabular-nums">{Math.round(progress)}%</span>
          </div>
          <div className="h-[3px] bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
              }}
            />
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export default function RoutesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [drivers, setDrivers]       = useState<DriverConfig[]>([])
  const [shiftStart, setShiftStart] = useState('09:00')
  const [serviceTimeMin, setServiceTimeMin] = useState(5)
  const [allowOvertime, setAllowOvertime] = useState(false)
  const [managers, setManagers]     = useState<{ id: string; name: string }[]>([])
  const [lastInvUpload, setLastInvUpload] = useState<{ uploaded_at: string; row_count: number } | null>(null)
  const [showInvGate, setShowInvGate] = useState(false)

  const [step, setStep]         = useState<'input' | 'loading' | 'results'>('input')
  const [, setLoadingMsg] = useState('')
  const [result, setResult]     = useState<OptimizeResult | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [toast, setToast]           = useState<string | null>(null)
  const [dispatched, setDispatched] = useState(false)
  const [traffic, setTraffic]       = useState(false)
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab]           = useState<'new' | 'scheduled' | 'finished'>('new')
  // Date the dispatcher is optimizing for. Defaults to today; manager can pick
  // tomorrow (or any future date) the evening before to plan ahead.
  const [optimizeDate, setOptimizeDate]     = useState<string>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  })
  const [finishedStops, setFinishedStops]   = useState<FinishedStop[]>([])
  const [resultsTab, setResultsTab]         = useState<'map' | 'routes'>('map')

  const adminId = getUser()?.id

  useEffect(() => {
    const mapDelivery = (r: any) => ({
      id: r.id,
      customer: r.customer,
      phone: r.phone ?? '',
      address: r.address,
      notes: r.notes ?? '',
      package_description: r.package_description ?? '',
      time_window_start: r.time_window_start ?? undefined,
      time_window_end:   r.time_window_end   ?? undefined,
      delivery_date:     r.delivery_date     ?? undefined,
      status:            r.status            ?? 'upcoming',
      order_items:         r.order_items         ?? undefined,
      order_items_json:    r.order_items_json    ?? undefined,
      order_value:         r.order_value         ?? undefined,
      shipping_cost:       r.shipping_cost       ?? undefined,
      assigned_to:         r.assigned_to         ?? undefined,
      source_warehouse_id: r.source_warehouse_id ?? undefined,
    })

    supabase
      .from('livra_deliveries')
      .select('*')
      .eq('company_id', adminId)
      .in('status', ['upcoming', 'dispatched'])
      .order('created_at')
      .then(({ data }) => {
        if (data) setDeliveries(data.map(mapDelivery))
      })

    const channel = supabase
      .channel('livra_deliveries_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'livra_deliveries' }, payload => {
        if (payload.eventType === 'INSERT') {
          const r = payload.new
          if (r.company_id === adminId && ['upcoming', 'dispatched'].includes(r.status)) {
            setDeliveries(prev => [...prev, mapDelivery(r)])
          }
        } else if (payload.eventType === 'UPDATE') {
          const r = payload.new
          if (r.company_id === adminId && ['upcoming', 'dispatched'].includes(r.status)) {
            setDeliveries(prev => prev.map(d => d.id === r.id ? mapDelivery(r) : d))
          } else {
            setDeliveries(prev => prev.filter(d => d.id !== r.id))
          }
        } else if (payload.eventType === 'DELETE') {
          setDeliveries(prev => prev.filter(d => d.id !== payload.old.id))
        }
      })
      .subscribe()

    supabase
      .from('livra_drivers')
      .select('id, name, status')
      .eq('admin_id', adminId)
      .order('created_at')
      .then(({ data }) => {
        if (data) setDrivers(data.map(r => ({
          id: r.id,
          name: r.name,
          enabled: r.status !== 'offline',
        })))
      })

    // Finished deliveries (delivered + failed) | loaded for the "Livrate" tab.
    // Last 30 days only so the list doesn't grow unbounded.
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10)
    supabase.from('livra_route_stops')
      .select('id, client_name, address, status, completed_at, fail_reason, package_description, livra_routes!inner(date, driver_id, admin_id, livra_drivers!inner(name))')
      .in('status', ['completed', 'failed'])
      .eq('type', 'delivery')
      .eq('livra_routes.admin_id', adminId)
      .gte('livra_routes.date', thirtyDaysAgo)
      .order('completed_at', { ascending: false })
      .then(({ data }) => {
        if (!data) return
        const rows: FinishedStop[] = data.map((r: any) => ({
          id: r.id,
          customer: r.client_name,
          address: r.address,
          status: r.status,
          completed_at: r.completed_at,
          fail_reason: r.fail_reason,
          package_description: r.package_description,
          date: r.livra_routes?.date,
          driver_id: r.livra_routes?.driver_id,
          driver_name: r.livra_routes?.livra_drivers?.name ?? '—',
        }))
        setFinishedStops(rows)
      })

    supabase
      .from('livra_sales_managers')
      .select('id, name')
      .eq('admin_id', adminId)
      .then(({ data }) => { if (data) setManagers(data) })

    if (adminId) {
      supabase
        .from('livra_inventory_uploads')
        .select('uploaded_at, row_count')
        .eq('company_id', adminId)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .then(({ data }) => { if (data?.[0]) setLastInvUpload(data[0] as { uploaded_at: string; row_count: number }) })
    }

    return () => { supabase.removeChannel(channel) }
  }, [])

  const activeDrivers = drivers.filter(d => d.enabled)

  // Scheduled deliveries with SKUs that couldn't be resolved to a warehouse
  const unmatchedOrders = deliveries.filter(d => {
    const skus = (d.order_items_json ?? []).map(i => i.sku).filter(Boolean)
    return skus.length > 0 && !d.source_warehouse_id && !!d.delivery_date
  })

  // ── Optimize ────────────────────────────────────────────────────────────────

  function startOptimize() {
    const todayDeliveries = deliveries.filter(d => d.delivery_date === optimizeDate)
    if (!todayDeliveries.length) {
      setToast(`Nicio livrare programată pentru ${fmtDateRO(optimizeDate)}`)
      return
    }
    if (!activeDrivers.length) return

    // Mandatory inventory gate — block if never uploaded; warn if older than today.
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const uploadedToday = lastInvUpload && new Date(lastInvUpload.uploaded_at).getTime() >= todayStart.getTime()
    if (!lastInvUpload || !uploadedToday) {
      setShowInvGate(true)
      return
    }
    handleOptimize()
  }

  async function handleOptimize() {
    setShowInvGate(false)
    const todayDeliveries = deliveries.filter(d => d.delivery_date === optimizeDate)
    if (!todayDeliveries.length || !activeDrivers.length) return
    setStep('loading')
    setDispatched(false)
    setLoadingMsg('Se rezolvă depozitele pe SKU…')
    try {
      const adminIdForWh = getUser()?.id
      // Drivers always start the day from their assigned home warehouse —
      // packages are loaded there. Live GPS is for tracking only, not planning.
      const [{ data: dbDrivers }, { data: warehouses }, { data: inventoryRows }] = await Promise.all([
        supabase.from('livra_drivers')
          .select('id, home_warehouse_id')
          .in('id', activeDrivers.map(d => d.id)),
        supabase.from('livra_warehouses')
          .select('id, lat, lng, address, is_default')
          .eq('company_id', adminIdForWh ?? ''),
        supabase.from('livra_inventory')
          .select('sku, warehouse_id, quantity')
          .eq('company_id', adminIdForWh ?? '')
          .gt('quantity', 0),
      ])
      const defaultWh = warehouses?.find(w => w.is_default) ?? warehouses?.[0]

      // Build inventory index: sku → [{ warehouseId, quantity }]
      const invBySku = new Map<string, { warehouseId: string; quantity: number }[]>()
      for (const r of (inventoryRows ?? []) as { sku: string; warehouse_id: string; quantity: number }[]) {
        const list = invBySku.get(r.sku) ?? []
        list.push({ warehouseId: r.warehouse_id, quantity: r.quantity })
        invBySku.set(r.sku, list)
      }

      // Resolve source_warehouse_id from order SKUs.
      // Returns 'matched' | 'unmatched' (some SKU not in any warehouse) | 'no_skus' (legacy / free-text).
      type ResolveOutcome = { warehouseId: string | null; reason: 'matched' | 'unmatched' | 'no_skus' }
      function resolveWarehouse(items: { sku?: string | null }[] | null): ResolveOutcome {
        const skus = (items ?? []).map(i => (i.sku ?? '').trim()).filter(Boolean)
        if (!skus.length) return { warehouseId: defaultWh?.id ?? null, reason: 'no_skus' }
        // Find warehouses that have ALL requested SKUs in stock
        let candidates: Set<string> | null = null
        for (const sku of skus) {
          const here = invBySku.get(sku)
          if (!here || here.length === 0) return { warehouseId: null, reason: 'unmatched' }
          const ids = new Set(here.map(h => h.warehouseId))
          candidates = candidates ? new Set<string>(Array.from<string>(candidates).filter(id => ids.has(id))) : ids
          if (!candidates.size) return { warehouseId: null, reason: 'unmatched' }
        }
        if (!candidates || !candidates.size) return { warehouseId: null, reason: 'unmatched' }
        // Pick the warehouse with the most total stock for these SKUs (tiebreak: default)
        const ranked = [...candidates].map(wid => {
          const total = skus.reduce((sum, sku) => {
            const m = invBySku.get(sku)?.find(h => h.warehouseId === wid)
            return sum + (m?.quantity ?? 0)
          }, 0)
          return { wid, total, isDefault: wid === defaultWh?.id }
        }).sort((a, b) => (b.total - a.total) || (Number(b.isDefault) - Number(a.isDefault)))
        return { warehouseId: ranked[0].wid, reason: 'matched' }
      }

      // Run resolver for each delivery, persist matches, collect unmatched separately.
      const matched: { delivery: typeof todayDeliveries[number]; sourceWarehouseId: string | null }[] = []
      const unmatched: { delivery: typeof todayDeliveries[number]; reason: 'unmatched' }[] = []
      const updatesNeeded: { id: string; source_warehouse_id: string | null }[] = []
      for (const d of todayDeliveries) {
        const itemsJson = (d as Delivery & { order_items_json?: { sku?: string | null }[] | null }).order_items_json
        const existing = (d as Delivery & { source_warehouse_id?: string | null }).source_warehouse_id
        if (existing) {
          // Already resolved — trust it
          matched.push({ delivery: d, sourceWarehouseId: existing })
          continue
        }
        const out = resolveWarehouse(itemsJson ?? null)
        if (out.reason === 'unmatched') {
          unmatched.push({ delivery: d, reason: 'unmatched' })
          continue
        }
        matched.push({ delivery: d, sourceWarehouseId: out.warehouseId })
        if (out.warehouseId) updatesNeeded.push({ id: d.id, source_warehouse_id: out.warehouseId })
      }

      // Persist newly resolved warehouse IDs (best-effort, parallel)
      if (updatesNeeded.length) {
        await Promise.all(updatesNeeded.map(u =>
          supabase.from('livra_deliveries').update({ source_warehouse_id: u.source_warehouse_id }).eq('id', u.id)
        ))
      }

      const driverStartPositions = activeDrivers.map(d => {
        const driverRow = dbDrivers?.find(x => x.id === d.id)
        const wh = warehouses?.find(w => w.id === driverRow?.home_warehouse_id) ?? defaultWh
        return {
          id: d.id,
          name: d.name,
          start_lat: wh?.lat ?? null,
          start_lng: wh?.lng ?? null,
          home_warehouse_id: wh?.id ?? null,
        }
      })

      if (!matched.length) {
        setStep('input')
        setToast(`Toate ${unmatched.length} comenzi au SKU-uri care nu sunt în niciun depozit. Verifică inventarul.`)
        return
      }

      setLoadingMsg(`Se geocodifică ${matched.length} adrese… (${matched.length}s estimat)`)
      const { data, error: fnErr } = await supabase.functions.invoke('optimize-routes', {
        body: {
          deliveries: matched.map(({ delivery: d, sourceWarehouseId }) => ({
            id: d.id, address: d.address, customer: d.customer,
            phone: d.phone, notes: d.notes,
            package_description: d.package_description ?? '',
            time_window_start: d.time_window_start || null,
            time_window_end:   d.time_window_end   || null,
            service_time_min:  (d as Delivery & { service_time_min?: number }).service_time_min ?? null,
            source_warehouse_id: sourceWarehouseId,
          })),
          drivers: driverStartPositions,
          skip_breaks: false,
          shift_start_time: shiftStart,
          default_service_time_min: serviceTimeMin,
          allow_overtime: allowOvertime,
          max_workday_hours: 8,
          overtime_max_hours: 10,
        },
      })
      if (fnErr) throw new Error(fnErr.message)
      const result = data as OptimizeResult
      if ((result as any)?.error) throw new Error((result as any).error)
      if (!result.routes?.length) {
        setStep('input')
        setToast('Nicio rută generată. Verificați adresele sau serverul.')
        return
      }
      setLoadingMsg('Se calculează traseele pe șosea…')
      const routesWithPaths = await Promise.all(
        result.routes.map(async (route, idx) => {
          const startLat = route.start_lat ?? 47.0245
          const startLng = route.start_lng ?? 28.8322
          const waypoints: [number, number][] = [
            [startLat, startLng],
            ...route.stops.map(s => [s.lat, s.lng] as [number, number]),
          ]
          const path = await fetchRoadPath(waypoints)
          return { ...route, start_lat: startLat, start_lng: startLng, path: path ?? undefined, color: DRIVER_COLORS[idx % DRIVER_COLORS.length] }
        })
      )
      setResult({ ...result, routes: routesWithPaths })
      setSelectedId(routesWithPaths[0]?.driver_id ?? null)
      setStep('results')
      console.log('[optimize-routes] response:', result)
      const allDeferred = [
        ...(result.deferred ?? []),
        ...unmatched.map(u => ({
          delivery_id: u.delivery.id,
          customer: u.delivery.customer,
          address: u.delivery.address,
          reason: 'unmatched_inventory',
        })),
      ]
      if (allDeferred.length) {
        const labels = allDeferred.map(d => {
          const reason = (d.reason === 'geocode_failed' || d.reason === 'geocode failed') ? 'adresă negăsită'
                       : (d.reason === 'no_capacity'   || d.reason === 'no capacity')   ? 'fără capacitate'
                       : d.reason === 'unmatched_inventory'                              ? 'SKU lipsă din inventar'
                       : d.reason === 'no_driver_for_warehouse'                          ? 'niciun șofer pentru depozit'
                       : d.reason || 'amânat'
          return `${d.address} (${reason})`
        }).join(' · ')
        setToast(`${allDeferred.length} ${allDeferred.length === 1 ? 'livrare nealocată' : 'livrări nealocate'}: ${labels}`)
      }
    } catch (e) {
      setStep('input')
      setToast(`Eroare: ${(e as Error).message || 'serverul nu răspunde'}`)
      console.error(e)
    }
  }

  // ── Dispatch ────────────────────────────────────────────────────────────────

  async function handleDispatch() {
    if (!result) return
    setDispatched(true)
    try {
      // Save the route with the date the manager optimized for. The driver
      // app loads only today's routes, so tomorrow-routes are invisible to
      // drivers until the day arrives | exactly what we want.
      const dispatchedDriverIds: string[] = []
      for (const route of result.routes) {
        const { data: routeRow, error } = await supabase
          .from('livra_routes')
          .insert({
            driver_id: route.driver_id,
            date: optimizeDate,
            status: 'pending',
            total_distance_km: route.total_distance_km,
            total_duration_min: route.total_duration_min,
            admin_id: adminId,
          })
          .select('id')
          .single()
        if (error || !routeRow) continue
        dispatchedDriverIds.push(route.driver_id)

        await supabase.from('livra_route_stops').insert(
          // Send all stops (deliveries AND breaks) so the driver sees their
          // lunch/fuel stops in the route. Breaks are info-only rows on the
          // driver's side | no Done/Failed actions, just a heads-up.
          route.stops.map(s => {
            // For deliveries, look up the original Delivery row to copy package
            // info, time window, and notes (denormalised so the driver doesn't
            // need a second query).
            const orig = s.type === 'delivery'
              ? deliveries.find(d => d.id === s.delivery_id)
              : null
            return {
              route_id: routeRow.id,
              delivery_id: s.type === 'delivery' ? s.delivery_id : null,
              stop_order: s.order,
              status: 'pending',
              type: s.type,                            // 'delivery' | 'lunch_break' | 'fuel_break'
              break_duration_min: s.break_duration_min || null,
              client_name: s.customer,
              client_phone: s.phone || null,
              address: s.address,
              lat: s.lat,
              lng: s.lng,
              package_description: orig?.package_description || null,
              time_window_start:   orig?.time_window_start   || null,
              time_window_end:     orig?.time_window_end     || null,
              delivery_notes:      orig?.notes               || null,
            }
          })
        )
      }
      // Mark deliveries as dispatched
      const deliveryIds = result.routes.flatMap(r => r.stops.filter(s => s.type === 'delivery').map(s => s.delivery_id))
      await supabase.from('livra_deliveries').update({ status: 'dispatched' }).in('id', deliveryIds)

      // ── Credit deduction: 1 credit per dispatched delivery ──────────────────
      const stopCount = deliveryIds.length
      if (stopCount > 0) {
        // Fetch current balance
        const { data: credRow } = await supabase
          .from('livra_credits')
          .select('id, balance')
          .eq('company_id', adminId)
          .single()

        if (credRow) {
          const newBalance = credRow.balance - stopCount
          await supabase.from('livra_credits').update({ balance: newBalance }).eq('id', credRow.id)
          await supabase.from('livra_transactions').insert({
            type: 'deduct',
            description: `Expediere ${optimizeDate} · ${stopCount} livrări`,
            amount: -stopCount,
            company_id: adminId,
          })
          if (newBalance < 0) {
            setToast(`Rute trimise — atenție: sold negativ (${newBalance} credite). Reîncarcă din pagina Credite.`)
          } else if (newBalance < 20) {
            setToast(`Rute trimise la ${result.routes.length} șoferi · ${newBalance} credite rămase`)
          } else {
            setToast(`Rute trimise la ${result.routes.length} șoferi · -${stopCount} credite`)
          }
        } else {
          setToast(`Rute trimise la ${result.routes.length} șoferi`)
        }
      } else {
        setToast(`Rute trimise la ${result.routes.length} șoferi`)
      }
      // ────────────────────────────────────────────────────────────────────────

      // Push notifications: fire one Supabase RPC per dispatched driver. The
      // RPC runs server-side via pg_net so we bypass the browser CORS block on
      // exp.host. Each call queues an HTTP POST to Expo Push API and returns
      // immediately with a request id.
      for (const driverId of dispatchedDriverIds) {
        const r = result.routes.find(x => x.driver_id === driverId)
        const stopCount = r?.stops.filter(s => s.type === 'delivery').length ?? 0
        supabase.rpc('send_route_push', {
          p_driver_id: driverId,
          p_stop_count: stopCount,
        }).then(({ data, error }) => {
          if (error) console.warn('[push] rpc failed:', error)
          else       console.log('[push] queued via supabase rpc:', data)
        })
      }
    } catch {
      setToast('Eroare la trimiterea rutelor')
      setDispatched(false)
    }
  }

  // ── Loading state ────────────────────────────────────────────────────────────

  if (step === 'loading') {
    return <OptimizeLoadingScreen />
  }

  // ── Results state ────────────────────────────────────────────────────────────

  if (step === 'results' && result) {
    return (
      <>
        {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-3 md:px-5 h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button onClick={() => setStep('input')} className="text-[12px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors flex-shrink-0">
                ← Înapoi
              </button>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate hidden sm:block">Rezultate</span>
              {result.savings_pct > 0 && (
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full hidden sm:block">
                  -{result.savings_pct}% distanță
                </span>
              )}
            </div>
            {/* Mobile tab switcher */}
            <div className="flex md:hidden items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 gap-0.5 flex-shrink-0">
              <button onClick={() => setResultsTab('map')} className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors ${resultsTab === 'map' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}>Hartă</button>
              <button onClick={() => setResultsTab('routes')} className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors ${resultsTab === 'routes' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}>Rute</button>
            </div>
            <button
              onClick={handleDispatch}
              disabled={dispatched}
              className={`flex items-center gap-1.5 text-white text-[12px] font-semibold px-3 py-2 rounded-lg transition-colors flex-shrink-0 ${
                dispatched ? 'bg-emerald-700 opacity-70 cursor-default' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              <CheckCircle2 size={13} />
              <span className="hidden sm:inline">{dispatched ? 'Trimis' : 'Trimite la șoferi'}</span>
              <span className="sm:hidden">{dispatched ? 'Trimis' : 'Trimite'}</span>
              {!dispatched && <ChevronRight size={12} />}
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className={`${resultsTab === 'map' ? 'flex-1' : 'hidden'} md:flex-1 relative`}>
              <MapContainer center={[47.0245, 28.8322]} zoom={12} crs={L.CRS.EPSG3395} style={{ height: '100%', width: '100%' }}>
                <YandexMapLayer />
                <MoldovaBorder />
                {traffic && <YandexTrafficLayer opacity={0.85} />}
                {result.routes.map(route => (
                  <Fragment key={route.driver_id}>
                    {route.path && (
                      <Polyline
                        positions={route.path}
                        pathOptions={{ color: route.color, weight: route.driver_id === selectedId ? 5 : 2.5, opacity: route.driver_id === selectedId ? 0.9 : 0.3 }}
                      />
                    )}
                    {/* Driver start position */}
                    <Marker
                      position={[route.start_lat, route.start_lng]}
                      icon={L.divIcon({
                        html: `<div style="width:12px;height:12px;background:${route.color};border:2.5px solid white;border-radius:50%;box-shadow:0 0 0 3px ${route.color}44"></div>`,
                        iconSize: [12, 12], iconAnchor: [6, 6], className: '',
                      })}
                    >
                      <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                        <span style={{ fontSize: 11 }}>{route.driver_name} | start</span>
                      </Tooltip>
                    </Marker>
                    {route.stops.map(stop => {
                      if (stop.type === 'lunch_break' || stop.type === 'fuel_break') {
                        return (
                          <Marker
                            key={stop.delivery_id}
                            position={[stop.lat, stop.lng]}
                            icon={breakIcon(stop.type as 'lunch_break' | 'fuel_break')}
                          >
                            <Tooltip direction="top" offset={[0, -14]} opacity={1}>
                              <span style={{ fontSize: 11 }}>
                                {stop.customer}{stop.arrival_time ? ` · ${stop.arrival_time}` : ''} | {stop.address}
                              </span>
                            </Tooltip>
                          </Marker>
                        )
                      }
                      return (
                        <Marker key={stop.delivery_id} position={[stop.lat, stop.lng]} icon={stopIcon(stop.order, route.color)}>
                          <Tooltip direction="top" offset={[0, -13]} opacity={1}>
                            <span style={{ fontSize: 11 }}>{stop.customer} | {stop.address}</span>
                          </Tooltip>
                        </Marker>
                      )
                    })}
                  </Fragment>
                ))}
              </MapContainer>

              {/* Traffic toggle */}
              <div className="absolute top-4 right-4 z-[1000]">
                <button
                  onClick={() => setTraffic(t => !t)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium border shadow-sm transition-colors ${
                    traffic
                      ? 'bg-amber-500 border-amber-400 text-white'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <Radio size={12} /> Trafic live
                </button>
              </div>

              <div className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 flex flex-col gap-1.5 shadow-sm">
                {result.routes.map(r => (
                  <button key={r.driver_id} onClick={() => setSelectedId(r.driver_id)}
                    className={`flex items-center gap-2 text-left px-2 py-1 rounded-lg transition-colors ${r.driver_id === selectedId ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.color }} />
                    <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">{r.driver_name.split(' ')[0]}</span>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{r.stops.length} opriri · {r.total_distance_km} km</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`${resultsTab === 'routes' ? 'flex w-full' : 'hidden'} md:flex md:w-72 flex-shrink-0 flex-col border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto`}>
              {result.deferred?.length > 0 && (() => {
                const geocodeFails   = result.deferred.filter(d => d.reason === 'geocode_failed' || d.reason === 'geocode failed')
                const noCapacity     = result.deferred.filter(d => d.reason === 'no_capacity' || d.reason === 'no capacity')
                const noDriver       = result.deferred.filter(d => d.reason === 'no_driver_for_warehouse')
                const noSku          = result.deferred.filter(d => d.reason === 'unmatched_inventory')
                return (
                  <div className="px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50 space-y-2">
                    {geocodeFails.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle size={12} className="text-red-600 dark:text-red-400 flex-shrink-0" />
                          <span className="text-[12px] font-semibold text-red-600 dark:text-red-400">
                            {geocodeFails.length} {geocodeFails.length === 1 ? 'adresă negăsită' : 'adrese negăsite'}
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-700/80 dark:text-amber-500/80 mb-1">
                          Verifică ortografia adresei sau editează-o manual.
                        </div>
                        <div className="space-y-0.5 max-h-24 overflow-y-auto">
                          {geocodeFails.map(d => (
                            <div key={d.delivery_id} className="text-[11px] text-zinc-700 dark:text-zinc-300 truncate">
                              • {d.customer} | <span className="text-red-600 dark:text-red-400">{d.address}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {noCapacity.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle size={12} className="text-amber-700 dark:text-amber-400 flex-shrink-0" />
                          <span className="text-[12px] font-semibold text-amber-700 dark:text-amber-400">
                            {noCapacity.length} {noCapacity.length === 1 ? 'livrare amânată' : 'livrări amânate'} pentru mâine
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-600/70 dark:text-amber-500/70 mb-1">
                          Nu încap în 8h cu șoferii activi. Adaugă un șofer sau acceptă amânarea.
                        </div>
                        <div className="space-y-0.5 max-h-24 overflow-y-auto">
                          {noCapacity.map(d => (
                            <div key={d.delivery_id} className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
                              • {d.customer} | {d.address}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {noDriver.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle size={12} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                          <span className="text-[12px] font-semibold text-purple-700 dark:text-purple-400">
                            {noDriver.length} {noDriver.length === 1 ? 'comandă' : 'comenzi'} fără șofer la depozitul corect
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-600/70 dark:text-amber-500/70 mb-1">
                          Niciun șofer activ nu este asignat depozitului acestor produse.
                        </div>
                        <div className="space-y-0.5 max-h-24 overflow-y-auto">
                          {noDriver.map(d => (
                            <div key={d.delivery_id} className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
                              • {d.customer} | {d.address}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {noSku.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle size={12} className="text-amber-700 dark:text-amber-400 flex-shrink-0" />
                          <span className="text-[12px] font-semibold text-amber-700 dark:text-amber-400">
                            {noSku.length} {noSku.length === 1 ? 'comandă' : 'comenzi'} cu SKU lipsă din inventar
                          </span>
                        </div>
                        <div className="space-y-0.5 max-h-24 overflow-y-auto">
                          {noSku.map(d => (
                            <div key={d.delivery_id} className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
                              • {d.customer} | {d.address}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
              {result.routes.map(route => (
                <div key={route.driver_id}>
                  <button onClick={() => setSelectedId(route.driver_id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 border-b-2 text-left transition-colors ${route.driver_id === selectedId ? 'bg-zinc-50 dark:bg-zinc-800/40' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/20'}`}
                    style={{ borderBottomColor: route.color }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1" style={{ background: route.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-50">{route.driver_name}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 flex items-center gap-2">
                        <span>{route.stops.length} opriri</span><span>·</span>
                        <span>{route.total_distance_km} km</span><span>·</span>
                        <span className="flex items-center gap-1"><Clock size={9} />{fmtDuration(route.total_duration_min)}</span>
                      </div>
                    </div>
                  </button>
                  {route.driver_id === selectedId && route.stops.map(stop => {
                    if (stop.type === 'lunch_break' || stop.type === 'fuel_break') {
                      const isLunch = stop.type === 'lunch_break'
                      return (
                        <div key={stop.delivery_id} className="flex items-start gap-3 px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800/50 bg-amber-50/60 dark:bg-amber-950/20">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                            {isLunch ? <UtensilsCrossed size={11} /> : <Fuel size={11} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[12px] font-semibold text-amber-700 dark:text-amber-400">{stop.customer}</span>
                              {stop.arrival_time && <span className="text-[10px] text-amber-600 dark:text-amber-500 font-mono">{stop.arrival_time}</span>}
                              <span className="text-[10px] text-amber-500 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-full">{stop.break_duration_min} min</span>
                            </div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{stop.address}</div>
                          </div>
                        </div>
                      )
                    }
                    return (
                      <div key={stop.delivery_id} className="flex items-start gap-3 px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800/50">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-0.5" style={{ background: route.color }}>
                          {stop.order}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-medium text-zinc-800 dark:text-zinc-200 truncate">{stop.customer}</span>
                            {stop.arrival_time && <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">{stop.arrival_time}</span>}
                          </div>
                          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{stop.address}</div>
                          {stop.package_description && <div className="flex items-center gap-1 text-[11px] text-brand-orange dark:text-orange-400 truncate mt-0.5"><Package size={9} className="flex-shrink-0" /><span className="truncate">{stop.package_description}</span></div>}
                          {stop.phone && <div className="text-[11px] text-zinc-400 dark:text-zinc-500">{stop.phone}</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── Input state ──────────────────────────────────────────────────────────────

  return (
    <>
      <Helmet>
        <title>Rute | Livra</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      <div className="flex flex-col h-full">
        <div className="flex items-center px-4 md:px-5 h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Rute</span>
        </div>

        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Delivery list */}
          <div className="flex-1 min-h-0 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              {(() => {
                const newOrders   = deliveries.filter(d => !d.delivery_date)
                const scheduled   = deliveries.filter(d =>  d.delivery_date)
                return (
                  <div className="flex items-center px-2 pt-2 pb-0 border-b border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => setActiveTab('new')}
                      className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-t-lg transition-colors ${
                        activeTab === 'new'
                          ? 'text-brand-orange dark:text-orange-400 border-b-2 border-brand-orange -mb-px'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                      }`}
                    >
                      Comenzi noi
                      {newOrders.length > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          activeTab === 'new'
                            ? 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300'
                            : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                        }`}>
                          {newOrders.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('scheduled')}
                      className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-t-lg transition-colors ${
                        activeTab === 'scheduled'
                          ? 'text-brand-orange dark:text-orange-400 border-b-2 border-brand-orange -mb-px'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                      }`}
                    >
                      Livrări programate
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                        {scheduled.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab('finished')}
                      className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-t-lg transition-colors ${
                        activeTab === 'finished'
                          ? 'text-brand-orange dark:text-orange-400 border-b-2 border-brand-orange -mb-px'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                      }`}
                    >
                      Livrate
                      {finishedStops.length > 0 && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                          {finishedStops.length}
                        </span>
                      )}
                    </button>
                  </div>
                )
              })()}

              {/* "Comenzi noi" tab: flat list of orders without a delivery_date */}
              {activeTab === 'new' && (() => {
                const newOrders = deliveries.filter(d => !d.delivery_date)
                if (!newOrders.length) {
                  return (
                    <div className="px-6 py-12 text-center">
                      <Inbox size={32} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                      <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                        Nicio comandă nouă de procesat
                      </p>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                        Comenzile importate prin webhook sau CSV apar aici
                      </p>
                    </div>
                  )
                }
                return (
                  <>
                    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <User size={11} className="flex-shrink-0" />
                      <span>Comenzile sunt procesate de agentul de vânzări asignat. Programarea se face din aplicația lor.</span>
                    </div>
                    {newOrders.map((d, i) => {
                      const manager = managers.find(m => d.assigned_to === m.id)
                      return (
                        <div
                          key={d.id}
                          className="flex items-start gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 group"
                        >
                          <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-mono flex-shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">{d.customer}</div>
                            <div className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                              <MapPin size={9} />{d.address}
                            </div>
                            {d.order_items && <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{d.order_items}</div>}
                            {d.notes && <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 italic">{d.notes}</div>}
                            {(d.order_value != null || d.shipping_cost != null) && (
                              <div className="flex items-center gap-2 mt-0.5">
                                {d.order_value != null && <span className="text-[10px] text-zinc-400">Valoare: <span className="font-medium text-zinc-600 dark:text-zinc-300">{d.order_value} lei</span></span>}
                                {d.shipping_cost != null && <span className="text-[10px] text-zinc-400">Livrare: <span className="font-medium text-zinc-600 dark:text-zinc-300">{d.shipping_cost} lei</span></span>}
                              </div>
                            )}
                            {manager && (
                              <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                                <User size={9} />
                                <span>{manager.name}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 flex-shrink-0">{d.phone}</span>
                          <button
                            onClick={async () => {
                              await supabase.from('livra_deliveries').delete().eq('id', d.id)
                              setDeliveries(prev => prev.filter(x => x.id !== d.id))
                            }}
                            className="text-zinc-200 dark:text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )
                    })}
                  </>
                )
              })()}

              {/* "Livrări programate" tab: date-grouped view */}
              {activeTab === 'scheduled' && (() => {
                // Group by delivery_date (only orders WITH a date land here)
                const groups = new Map<string, Delivery[]>()
                for (const d of deliveries) {
                  if (!d.delivery_date) continue
                  const k = d.delivery_date
                  if (!groups.has(k)) groups.set(k, [])
                  groups.get(k)!.push(d)
                }
                // Sort: dated groups ascending, "Fără dată" last
                const dateKeys = Array.from(groups.keys()).filter(k => k !== '').sort()
                if (groups.has('')) dateKeys.push('')

                const numDrivers = activeDrivers.length || 1
                const cap = dayCapacity(numDrivers)

                return (
                  <>
                    {unmatchedOrders.length > 0 && (
                      <div className="px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50">
                        <div className="flex items-start gap-2">
                          <AlertTriangle size={13} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-semibold text-amber-700 dark:text-amber-400">
                              {unmatchedOrders.length} {unmatchedOrders.length === 1 ? 'comandă' : 'comenzi'} cu SKU lipsă din inventar
                            </div>
                            <div className="text-[11px] text-amber-600/80 dark:text-amber-500/80 mt-0.5">
                              Vor fi excluse din optimizare. Urcă inventarul în pagina Depozite.
                            </div>
                            <div className="mt-1.5 space-y-0.5">
                              {unmatchedOrders.map(d => (
                                <div key={d.id} className="text-[11px] text-amber-700 dark:text-amber-400 truncate">
                                  • {d.customer} — {(d.order_items_json ?? []).map(i => i.sku).filter(Boolean).join(', ')}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {dateKeys.map(dateKey => {
                  const rows = groups.get(dateKey)!
                  const isPast = isPastISO(dateKey)
                  const collapsed = collapsedDates.has(dateKey) || isPast
                  const state = dateKey ? capacityState(rows.length, cap) : 'ok'
                  return (
                    <Fragment key={dateKey || 'no-date'}>
                      <button
                        onClick={() => setCollapsedDates(s => {
                          const n = new Set(s)
                          if (n.has(dateKey)) n.delete(dateKey)
                          else                n.add(dateKey)
                          return n
                        })}
                        className={`w-full flex items-center gap-2 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 text-left transition-colors ${
                          isPast ? 'bg-zinc-50/50 dark:bg-zinc-800/20 opacity-60' : 'bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <ChevronRight size={12} className={`text-zinc-400 transition-transform ${collapsed ? '' : 'rotate-90'}`} />
                        <span className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 flex-1">
                          {dateKey ? fmtDateRO(dateKey) : 'Fără dată'}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {rows.length} {rows.length === 1 ? 'livrare' : 'livrări'}
                        </span>
                        {dateKey && state === 'full' && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400">
                            <Ban size={9} /> plin {rows.length}/{cap}
                          </span>
                        )}
                        {dateKey && state === 'warn' && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                            <AlertTriangle size={9} /> {rows.length}/{cap}
                          </span>
                        )}
                      </button>
                      {!collapsed && rows.map((d, i) => (
                <div
                  key={d.id}
                  className="flex items-start gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 group"
                >
                  <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center text-[10px] font-mono flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">{d.customer}</span>
                      {d.status === 'dispatched' && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                          <Truck size={9} /> În drum
                        </span>
                      )}
                      {(d.time_window_start && d.time_window_end) && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-brand-orange dark:text-orange-400">
                          {d.time_window_start}–{d.time_window_end}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                      <MapPin size={9} />{d.address}
                    </div>
                    {d.package_description && <div className="flex items-center gap-1 text-[11px] text-brand-orange dark:text-orange-400 mt-0.5"><Package size={9} className="flex-shrink-0" /><span className="truncate">{d.package_description}</span></div>}
                    {d.notes && <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 italic">{d.notes}</div>}
                  </div>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 flex-shrink-0">{d.phone}</span>
                  <button
                    onClick={async () => {
                      await supabase.from('livra_deliveries').delete().eq('id', d.id)
                      setDeliveries(prev => prev.filter(x => x.id !== d.id))
                    }}
                    className="text-zinc-200 dark:text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
                    </Fragment>
                  )
                })}
                  </>
                )
              })()}

              {/* "Livrate" tab | completed + failed deliveries from the last 30 days */}
              {activeTab === 'finished' && (() => {
                if (finishedStops.length === 0) {
                  return (
                    <div className="px-6 py-12 text-center">
                      <ClipboardList size={32} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                      <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                        Încă nicio livrare finalizată
                      </p>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                        Comenzile livrate sau eșuate apar aici după ce șoferii le marchează în aplicație
                      </p>
                    </div>
                  )
                }
                // Group by date, then sub-group by status (delivered first, then failed)
                const byDate = new Map<string, FinishedStop[]>()
                for (const s of finishedStops) {
                  const key = s.date || 'fără dată'
                  if (!byDate.has(key)) byDate.set(key, [])
                  byDate.get(key)!.push(s)
                }
                const sortedDates = Array.from(byDate.keys()).sort().reverse()
                return (
                  <>
                    {sortedDates.map(date => {
                      const rows = byDate.get(date)!
                      const delivered = rows.filter(r => r.status === 'completed')
                      const failed    = rows.filter(r => r.status === 'failed')
                      return (
                        <Fragment key={date}>
                          <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                            <span className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-300">
                              {date === 'fără dată' ? 'Fără dată' : fmtDateRO(date)}
                            </span>
                            {delivered.length > 0 && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                                {delivered.length} livrate
                              </span>
                            )}
                            {failed.length > 0 && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400">
                                {failed.length} eșuate
                              </span>
                            )}
                          </div>
                          {[...delivered, ...failed].map(s => {
                            const isDone = s.status === 'completed'
                            return (
                              <div
                                key={s.id}
                                className={`flex items-start gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/60 ${isDone ? '' : 'bg-red-50/30 dark:bg-red-950/10'}`}
                              >
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5 ${isDone ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                  {isDone ? <Check size={11} /> : <X size={11} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[12px] font-medium text-zinc-800 dark:text-zinc-200">{s.customer}</span>
                                    {s.completed_at && (
                                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                                        {new Date(s.completed_at).toTimeString().slice(0, 5)}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">· {s.driver_name}</span>
                                  </div>
                                  <div className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{s.address}</div>
                                  {s.package_description && <div className="flex items-center gap-1 text-[11px] text-brand-orange dark:text-orange-400 truncate mt-0.5"><Package size={9} className="flex-shrink-0" /><span className="truncate">{s.package_description}</span></div>}
                                  {!isDone && s.fail_reason && (
                                    <div className="text-[11px] text-red-600 dark:text-red-400 mt-0.5 italic">
                                      Motiv: {s.fail_reason}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </Fragment>
                      )
                    })}
                  </>
                )
              })()}
            </div>
          </div>

          {/* Config sidebar */}
          <div className="md:w-64 md:flex-shrink-0 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-5 overflow-y-auto">
            <div>
              <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5">Șoferi activi</p>
              <div className="space-y-2">
                {drivers.map((d, i) => (
                  <label key={d.id} className="flex items-center gap-2.5 cursor-pointer" onClick={() => setDrivers(prev => prev.map(x => x.id === d.id ? { ...x, enabled: !x.enabled } : x))}>
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors"
                      style={d.enabled ? { background: DRIVER_COLORS[i % DRIVER_COLORS.length], borderColor: DRIVER_COLORS[i % DRIVER_COLORS.length] } : { background: 'transparent', borderColor: '#d4d4d8' }}
                    >
                      {d.enabled && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <span className={`text-[12px] font-medium ${d.enabled ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-600'}`}>{d.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5">Setări</p>
              <div className="space-y-2.5">
                <label className="flex items-center justify-between gap-2.5">
                  <span className="text-[12px] text-zinc-600 dark:text-zinc-400 underline decoration-dotted decoration-zinc-400 underline-offset-2 cursor-help" title="Ora la care șoferii pleacă din depozit. Optimizatorul calculează pauza de masă și ferestrele de timp pornind de la acest moment.">
                    Începutul turei
                  </span>
                  <TimeInput24
                    value={shiftStart}
                    onChange={setShiftStart}
                    className="w-20 text-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[12px] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between gap-2.5">
                  <span className="text-[12px] text-zinc-600 dark:text-zinc-400 underline decoration-dotted decoration-zinc-400 underline-offset-2 cursor-help" title="Cât durează un colet livrat unui client (predare + semnătură). Implicit 5 min. Mai puțin = mai multe livrări încap într-o zi, dar șoferii pot fi grăbiți.">
                    Timp / livrare (min)
                  </span>
                  <input
                    type="number" min={1} max={60}
                    value={serviceTimeMin}
                    onChange={e => setServiceTimeMin(Math.max(1, Math.min(60, Number(e.target.value) || 5)))}
                    className="w-20 text-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[12px] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between gap-2.5 cursor-pointer">
                  <span className="text-[12px] text-zinc-600 dark:text-zinc-400 underline decoration-dotted decoration-zinc-400 underline-offset-2 cursor-help" title="Permite extinderea zilei de lucru de la 8h la 10h pentru zilele aglomerate. Folosește cu moderație — implică ore suplimentare plătite șoferilor.">
                    Permite ore suplimentare (până la 10h)
                  </span>
                  <button
                    type="button"
                    onClick={() => setAllowOvertime(v => !v)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${allowOvertime ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                  >
                    <span className={`absolute top-0.5 ${allowOvertime ? 'left-[18px]' : 'left-0.5'} w-4 h-4 bg-white rounded-full transition-all`} />
                  </button>
                </label>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5 underline decoration-dotted decoration-zinc-400 underline-offset-2 cursor-help inline-block" title="Data pentru care se generează rutele. Selectează ziua de mâine seara pentru a pregăti programul în avans — șoferii văd ruta abia când începe ziua respectivă.">Optimizează pentru</p>
              <input
                type="date"
                value={optimizeDate}
                onChange={e => setOptimizeDate(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[12px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5">
                {optimizeDate === todayISO() ? 'Astăzi' : fmtDateRO(optimizeDate)}
              </p>
            </div>

            {(() => {
              const dateCount = deliveries.filter(d => d.delivery_date === optimizeDate).length
              return (
                <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 space-y-1.5">
                  {[
                    [`Livrări ${optimizeDate === todayISO() ? 'astăzi' : 'în acea zi'}`, dateCount],
                    ['Total programate', deliveries.length],
                    ['Șoferi activi', activeDrivers.length],
                    ['~Opriri / șofer', Math.ceil(dateCount / Math.max(1, activeDrivers.length))],
                  ].map(([label, val]) => (
                    <div key={label as string} className="flex justify-between text-[11px]">
                      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{val}</span>
                    </div>
                  ))}
                </div>
              )
            })()}

            <button
              onClick={startOptimize}
              disabled={!deliveries.filter(d => d.delivery_date === optimizeDate).length || !activeDrivers.length}
              className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold py-2.5 rounded-lg transition-colors"
            >
              <Wand2 size={13} /> Optimizează
            </button>
          </div>
        </div>
      </div>

      {showInvGate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowInvGate(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Brand accent bar */}
            <div className="h-1 bg-gradient-to-r from-brand-orange via-orange-500 to-orange-300" />

            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <Package size={20} className="text-brand-orange" />
                </div>
                <div className="flex-1 pt-0.5">
                  <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">Verifică inventarul</h2>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Optimizatorul folosește stocul pe depozite pentru a atribui corect fiecare comandă.
                  </p>
                </div>
              </div>

              {lastInvUpload ? (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-3.5">
                  <div className="flex items-start gap-2.5">
                    <Clock size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-[12px] text-amber-900 dark:text-amber-200 leading-relaxed">
                      Ultima încărcare:{' '}
                      <span className="font-semibold">
                        {new Date(lastInvUpload.uploaded_at).toLocaleString('ro-MD', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>{' '}
                      <span className="text-amber-700/80 dark:text-amber-300/80">({lastInvUpload.row_count} rânduri)</span>
                      <p className="text-amber-800/90 dark:text-amber-200/90 mt-1.5">
                        Dacă stocurile s-au schimbat între depozite, încarcă varianta de azi. Altfel, poți continua cu cea existentă.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-3.5">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle size={14} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[12px] text-red-900 dark:text-red-200 leading-relaxed">
                      Nu ai încărcat încă inventarul pe depozite. Fără el, optimizatorul nu știe de unde pleacă fiecare comandă.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 mt-5">
                <a
                  href="/warehouses"
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-orange hover:bg-orange-500 text-white text-[13px] font-medium rounded-lg transition-colors"
                >
                  <Upload size={14} />
                  {lastInvUpload ? 'Încarcă inventar nou' : 'Mergi la depozite'}
                </a>
                {lastInvUpload && (
                  <button
                    onClick={() => handleOptimize()}
                    className="w-full px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[13px] font-medium rounded-lg transition-colors"
                  >
                    Folosește inventarul existent
                  </button>
                )}
                <button
                  onClick={() => setShowInvGate(false)}
                  className="w-full text-[12px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 py-1 transition-colors"
                >
                  Anulează
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
