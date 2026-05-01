import { Helmet } from 'react-helmet-async'
import { useState, useEffect, useRef } from 'react'
import { MapContainer, Tooltip, Polyline, Marker, useMap } from 'react-leaflet'
import { YandexMapLayer, YandexSatLayer, YandexTrafficLayer } from '../components/YandexLayer'
import MoldovaBorder from '../components/MoldovaBorder'
import L from 'leaflet'
import { Package, CheckCircle, XCircle, Clock, MoreHorizontal, Layers, Radio, ArrowLeft, MapPin, AlertTriangle, Phone, RotateCcw, Ban, Check } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'

const CHISINAU: [number, number] = [47.0245, 28.8322]

type DriverStatusForIcon = 'active' | 'done' | 'offline' | 'lunch_break' | 'fuel_break'

function driverIcon(initials: string, status: DriverStatusForIcon, isSelected = false) {
  // active = green, on break = amber, done = blue, offline = gray.
  // Three colors per state: body (c), darker accent (cd), light glass (cl).
  const palette: Record<DriverStatusForIcon, [string, string, string]> = {
    active:      ['#10b981', '#059669', '#a7f3d0'],
    lunch_break: ['#f59e0b', '#b45309', '#fde68a'],
    fuel_break:  ['#f59e0b', '#b45309', '#fde68a'],
    done:        ['#3b82f6', '#1d4ed8', '#bfdbfe'],
    offline:     ['#9ca3af', '#4b5563', '#e5e7eb'],
  }
  const [c, cd, cl] = palette[status] ?? palette.offline
  const scale = isSelected ? 1.2 : 1
  const w = Math.round(64 * scale)
  const h = Math.round(38 * scale)
  const ds = isSelected
    ? 'filter:drop-shadow(0 4px 12px rgba(0,0,0,0.45));'
    : 'filter:drop-shadow(0 2px 6px rgba(0,0,0,0.32));'

  // Side-profile delivery van
  const van = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 38" width="${w}" height="${h}" style="${ds}">
    <!-- cargo body -->
    <rect x="1" y="3" width="36" height="26" rx="3.5" fill="${c}"/>
    <!-- cab body -->
    <path d="M37 3 L49 3 Q58 3 60 13 L60 29 L37 29 Z" fill="${cd}"/>
    <!-- windshield glass -->
    <path d="M39 6 L46 6 Q53 6 55 14 L55 25 L39 25 Z" fill="${cl}" opacity="0.75"/>
    <!-- cargo side window -->
    <rect x="4" y="6" width="29" height="15" rx="2" fill="${cl}" opacity="0.45"/>
    <!-- front bumper -->
    <rect x="59" y="22" width="4" height="7" rx="2" fill="${cd}"/>
    <!-- headlight -->
    <ellipse cx="59" cy="18" rx="2" ry="2.5" fill="#fef08a"/>
    <!-- rear light -->
    <rect x="1" y="14" width="2.5" height="7" rx="1.25" fill="#fca5a5"/>
    <!-- chassis -->
    <rect x="4" y="28" width="54" height="4" rx="2" fill="${cd}" opacity="0.35"/>
    <!-- left wheel -->
    <circle cx="14" cy="32" r="6" fill="#1e293b"/>
    <circle cx="14" cy="32" r="3.5" fill="#475569"/>
    <circle cx="14" cy="32" r="1.5" fill="#94a3b8"/>
    <!-- right wheel -->
    <circle cx="47" cy="32" r="6" fill="#1e293b"/>
    <circle cx="47" cy="32" r="3.5" fill="#475569"/>
    <circle cx="47" cy="32" r="1.5" fill="#94a3b8"/>
  </svg>`

  return L.divIcon({
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
        ${van}
        <div style="
          background:white;
          border-radius:5px;
          padding:1px 7px;
          font-size:10px;
          font-weight:700;
          color:#111827;
          box-shadow:0 1px 4px rgba(0,0,0,0.18);
          line-height:1.5;
          white-space:nowrap;
          font-family:system-ui,sans-serif;
        ">${initials}</div>
      </div>
    `,
    iconSize: [w, h + 22],
    iconAnchor: [w / 2, h],
    className: '',
  })
}

function formatEta(seconds: number): string {
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

async function fetchRoadRoute(waypoints: [number, number][]): Promise<{ path: [number, number][]; duration: number } | null> {
  if (waypoints.length < 2) return null
  try {
    const coords = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';')
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full`
    )
    const data = await res.json()
    if (data.code !== 'Ok' || !data.routes?.[0]) return null
    const path = data.routes[0].geometry.coordinates.map(
      ([lng, lat]: number[]) => [lat, lng] as [number, number]
    )
    return { path, duration: data.routes[0].duration }
  } catch {
    return null
  }
}


type Stop = {
  pos: [number, number]
  address: string
  customer?: string
  status: 'done' | 'next' | 'upcoming' | 'failed'
  failNote?: string
  completedAt?: string | null
  stopId?: string
}

type Driver = {
  id: string
  name: string
  initials: string
  stops: number
  done: number
  pos: [number, number]
  active: boolean
  status: DriverStatusForIcon
  route: Stop[]
  eta: string
}

type AttentionStatus = 'returned' | 'contacted' | 'rescheduled' | 'cancelled'
type FailReason = 'unreachable' | 'wrong_address'

type AttentionItem = {
  id: string
  customer: string
  phone: string
  address: string
  driverName: string
  failReason: FailReason
  status: AttentionStatus
  failedAt: string
}


const FAIL_REASON_LABEL: Record<FailReason, string> = {
  unreachable:   'Client inaccesibil',
  wrong_address: 'Adresă incorectă',
}

const badge: Record<string, { cls: string; label: string }> = {
  delivered:   { cls: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50', label: 'Livrat' },
  in_progress: { cls: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',       label: 'În drum' },
  failed:      { cls: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50',               label: 'Eșuat' },
}

function stopIcon(num: number, status: Stop['status']) {
  const cfg = ({
    done:     { bg: '#d4d4d8', text: '#a1a1aa', border: '#e4e4e7' },
    next:     { bg: '#2563eb', text: '#ffffff', border: '#1d4ed8' },
    upcoming: { bg: '#ffffff', text: '#71717a', border: '#e4e4e7' },
    failed:   { bg: '#ef4444', text: '#ffffff', border: '#dc2626' },
  } as Record<string, { bg: string; text: string; border: string }>)[status] ?? { bg: '#d4d4d8', text: '#a1a1aa', border: '#e4e4e7' }
  return L.divIcon({
    html: `<div style="
      width:22px;height:22px;
      background:${cfg.bg};color:${cfg.text};
      border:2px solid ${cfg.border};
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:9px;font-weight:700;
      box-shadow:0 1px 4px rgba(0,0,0,0.15);
    ">${num}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    className: '',
  })
}

function filterMarkerIcon(status: Stop['status']) {
  const cfg: Record<string, { bg: string; border: string; symbol: string }> = {
    done:     { bg: '#10b981', border: '#059669', symbol: '✓' },
    failed:   { bg: '#ef4444', border: '#dc2626', symbol: '✕' },
    next:     { bg: '#f59e0b', border: '#d97706', symbol: '→' },
    upcoming: { bg: '#f59e0b', border: '#d97706', symbol: '→' },
  }
  const c = cfg[status] ?? cfg.done
  return L.divIcon({
    html: `<div style="
      width:26px;height:26px;
      background:${c.bg};color:#fff;
      border:2.5px solid ${c.border};
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:700;
      box-shadow:0 2px 8px rgba(0,0,0,0.22);
    ">${c.symbol}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    className: '',
  })
}

type MapLayer = 'streets' | 'satellite'

function MapController({ target, zoom }: { target: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(target, zoom, { duration: 1.2, easeLinearity: 0.25 })
  }, [target[0], target[1], zoom])
  return null
}

async function loadDrivers(): Promise<Driver[]> {
  const today = new Date().toISOString().slice(0, 10)
  const { data: dbDrivers } = await supabase.from('livra_drivers').select('*').order('created_at')
  const { data: dbRoutes }  = await supabase.from('livra_routes').select('*').eq('date', today).in('status', ['pending', 'active', 'completed'])
  const { data: dbLocs }    = await supabase.from('livra_driver_locations').select('*')

  // Load all stops for today's routes upfront so filter cards have data
  const routeIds = (dbRoutes ?? []).map(r => r.id)
  const { data: dbStops } = routeIds.length
    ? await supabase.from('livra_route_stops').select('*').in('route_id', routeIds).eq('type', 'delivery').order('stop_order')
    : { data: [] }

  return (dbDrivers ?? []).map(d => {
    const myRoute = (dbRoutes ?? []).find(r => r.driver_id === d.id)
    const loc = (dbLocs ?? []).find(l => l.driver_id === d.id)
    const pos: [number, number] = loc
      ? [Number(loc.lat), Number(loc.lng)]
      : [Number(d.pos_lat) || 47.0245, Number(d.pos_lng) || 28.8322]

    const route: Stop[] = myRoute
      ? (dbStops ?? [])
          .filter(s => s.route_id === myRoute.id)
          .map((s, i) => ({
            pos: [Number(s.lat), Number(s.lng)] as [number, number],
            address: s.address,
            customer: s.client_name,
            failNote: s.fail_reason ?? s.notes ?? undefined,
            completedAt: s.completed_at ?? null,
            stopId: s.id,
            status: s.status === 'completed' ? 'done'
              : s.status === 'failed' ? 'failed'
              : i === (dbStops ?? []).filter(x => x.route_id === myRoute.id).findIndex(x => x.status === 'pending') ? 'next'
              : 'upcoming',
          }))
      : []

    const doneCount = route.filter(s => s.status === 'done').length

    return {
      id: d.id,
      name: d.name,
      initials: d.initials ?? d.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
      stops: route.length,
      done: doneCount,
      pos,
      active: d.status === 'active',
      status: (['active', 'done', 'offline', 'lunch_break', 'fuel_break'].includes(d.status) ? d.status : 'offline') as DriverStatusForIcon,
      eta: d.eta ?? '—',
      route,
    }
  })
}

export default function Dashboard() {
  useTheme()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [filterCard, setFilterCard] = useState<'total' | 'in_drum' | 'livrate' | 'esuate' | null>(null)
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([])
  const [kpis, setKpis] = useState({ total: 0, in_drum: 0, livrate: 0, esuate: 0 })
  const [layer, setLayer] = useState<MapLayer>('streets')
  const [traffic, setTraffic] = useState(false)
  const [routePaths, setRoutePaths] = useState<{ completed: [number,number][] | null; upcoming: [number,number][] | null }>({ completed: null, upcoming: null })
  const [eta, setEta] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map')
  const fetchRef = useRef(0)

  const selected = selectedIdx !== null ? (drivers[selectedIdx] ?? null) : null

  // Load drivers + subscribe to live location updates
  useEffect(() => {
    loadDrivers().then(setDrivers)

    const locSub = supabase
      .channel('driver-locations-dash')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'livra_driver_locations' }, payload => {
        const row = payload.new as { driver_id: string; lat: number; lng: number }
        setDrivers(prev => prev.map(d =>
          d.id === row.driver_id ? { ...d, pos: [Number(row.lat), Number(row.lng)] } : d
        ))
      })
      .subscribe()

    const driverSub = supabase
      .channel('drivers-dash')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'livra_drivers' }, () => {
        loadDrivers().then(setDrivers)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(locSub)
      supabase.removeChannel(driverSub)
    }
  }, [])

  useEffect(() => {
    if (!selected) {
      setRoutePaths({ completed: null, upcoming: null })
      setEta(null)
      return
    }
    const id = ++fetchRef.current
    setRoutePaths({ completed: null, upcoming: null })
    setEta(null)

    // Load stops from Supabase for selected driver
    const today = new Date().toISOString().slice(0, 10)
    supabase.from('livra_routes').select('id').eq('driver_id', selected.id).eq('date', today).limit(1)
      .then(async ({ data: routes }) => {
        if (!routes?.length) return
        const { data: stops } = await supabase
          .from('livra_route_stops').select('*').eq('route_id', routes[0].id).order('stop_order')
        if (!stops) return

        const mappedStops: Stop[] = stops.map((s, i) => ({
          pos: [Number(s.lat), Number(s.lng)] as [number, number],
          address: s.address,
          customer: s.client_name,
          failNote: s.notes ?? undefined,
          status: s.status === 'completed' ? 'done'
            : s.status === 'failed' ? 'failed'
            : i === stops.findIndex(x => x.status === 'pending') ? 'next'
            : 'upcoming',
        }))

        setDrivers(prev => prev.map(d => d.id === selected.id
          ? { ...d, route: mappedStops, stops: stops.length, done: stops.filter(s => s.status === 'completed').length }
          : d
        ))

        const fetchId = id
        const doneWaypoints = [...mappedStops.filter(s => s.status === 'done').map(s => s.pos), selected.pos]
        const upcomingWaypoints = [selected.pos, ...mappedStops.filter(s => s.status === 'next' || s.status === 'upcoming').map(s => s.pos)]
        Promise.all([fetchRoadRoute(doneWaypoints), fetchRoadRoute(upcomingWaypoints)])
          .then(([completed, upcoming]) => {
            if (fetchRef.current !== fetchId) return
            setRoutePaths({ completed: completed?.path ?? null, upcoming: upcoming?.path ?? null })
            setEta(upcoming?.duration != null ? formatEta(upcoming.duration) : null)
          })
      })
  }, [selectedIdx])

  // Load attention items + today's KPI counts. Both refresh on each route_stop
  // change via the realtime channel further below.
  useEffect(() => {
    const loadAttention = () => {
      supabase
        .from('livra_attention_items')
        .select('*')
        .not('status', 'in', '("rescheduled","cancelled")')
        .order('failed_at', { ascending: false })
        .then(({ data }) => {
          if (data) setAttentionItems(data.map(r => ({
            id: r.id,
            customer: r.customer,
            phone: r.phone ?? '',
            address: r.address ?? '',
            driverName: r.driver_name ?? '',
            failReason: r.fail_reason as FailReason,
            status: r.status as AttentionStatus,
            failedAt: new Date(r.failed_at).toLocaleTimeString('ro', { hour: '2-digit', minute: '2-digit' }),
          })))
        })
    }

    const loadKpis = async () => {
      const today = new Date().toISOString().slice(0, 10)
      // Today's stops via routes scheduled for today; status enumerates outcome
      const { data } = await supabase
        .from('livra_route_stops')
        .select('status, livra_routes!inner(date)')
        .eq('type', 'delivery')
        .eq('livra_routes.date', today)
      const rows = (data ?? []) as Array<{ status: string }>
      const counts = { total: rows.length, in_drum: 0, livrate: 0, esuate: 0 }
      for (const r of rows) {
        if (r.status === 'completed') counts.livrate++
        else if (r.status === 'failed') counts.esuate++
        else counts.in_drum++   // pending while route is active
      }
      setKpis(counts)
    }

    loadAttention()
    loadKpis()

    // Refresh KPIs every minute and on any route_stop change
    const tick = setInterval(loadKpis, 60_000)
    const ch = supabase
      .channel('dashboard-kpis')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'livra_route_stops' }, () => {
        loadKpis()
        loadAttention()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'livra_attention_items' }, loadAttention)
      .subscribe()

    return () => {
      clearInterval(tick)
      supabase.removeChannel(ch)
    }
  }, [])

  function advanceAttention(id: string, next: AttentionStatus) {
    setAttentionItems(prev => prev.map(a => a.id === id ? { ...a, status: next } : a))
    supabase.from('livra_attention_items').update({ status: next }).eq('id', id)
  }
  function dismissAttention(id: string) {
    setAttentionItems(prev => prev.filter(a => a.id !== id))
    supabase.from('livra_attention_items').delete().eq('id', id)
  }

  const activeAttention = attentionItems.filter(a => a.status !== 'rescheduled' && a.status !== 'cancelled')

  const allStops = drivers.flatMap(d => d.route.map(s => ({ ...s, driverName: d.name })))
  const filteredStops = filterCard === null ? [] :
    filterCard === 'total'    ? allStops :
    filterCard === 'livrate'  ? allStops.filter(s => s.status === 'done') :
    filterCard === 'esuate'   ? allStops.filter(s => s.status === 'failed') :
    allStops.filter(s => s.status === 'next' || s.status === 'upcoming')

  const matchStatus = (status: Stop['status']) =>
    filterCard === null || filterCard === 'total' ? true :
    filterCard === 'livrate' ? status === 'done' :
    filterCard === 'esuate'  ? status === 'failed' :
    status === 'next' || status === 'upcoming'

  const sidebarDrivers = filterCard === null || filterCard === 'total'
    ? drivers
    : drivers.filter(d => d.route.some(s => matchStatus(s.status)))

  const sidebarRecent = allStops
    .filter(s =>
      filterCard === 'livrate'  ? s.status === 'done' :
      filterCard === 'esuate'   ? s.status === 'failed' :
      filterCard === 'in_drum'  ? (s.status === 'next' || s.status === 'upcoming') :
      s.status === 'done' || s.status === 'failed'
    )
    .sort((a, b) => {
      const ta = a.completedAt ? new Date(a.completedAt).getTime() : 0
      const tb = b.completedAt ? new Date(b.completedAt).getTime() : 0
      return tb - ta
    })
    .slice(0, 30)
    .map(s => ({
      id: s.stopId ?? '',
      customer: s.customer ?? s.address,
      address: s.address,
      time: s.completedAt
        ? new Date(s.completedAt).toLocaleTimeString('ro-MD', { hour: '2-digit', minute: '2-digit' })
        : '—',
      status: s.status === 'done' ? 'delivered' : 'failed',
      failNote: s.failNote ?? '',
    }))


  const mapTarget: [number, number] = selected ? selected.pos : CHISINAU
  const mapZoom = selected ? 15 : 13

  return (
    <div className="flex flex-col h-full">
      <Helmet>
        <title>Dashboard | Livra</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</span>
        <div className="flex items-center gap-2">
          <span className="hidden md:block text-[12px] text-zinc-400 dark:text-zinc-500">
            {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <div className="flex md:hidden items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 gap-0.5">
            <button onClick={() => setMobileTab('map')} className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors ${mobileTab === 'map' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}>Hartă</button>
            <button onClick={() => setMobileTab('list')} className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors ${mobileTab === 'list' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}>Șoferi</button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className={`${mobileTab === 'list' ? 'flex' : 'hidden'} md:flex w-full md:w-72 flex-shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto`}>

          {selected ? (
            /* Driver detail view */
            <>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => setSelectedIdx(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                >
                  <ArrowLeft size={14} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-50">{selected.name}</div>
                  <div className="text-[11px] text-zinc-400 dark:text-zinc-500">{selected.done}/{selected.stops} opriri · {eta ? `ETA ${eta}` : 'Se calculează…'}</div>
                </div>
                <div className={`w-2 h-2 rounded-full ${selected.active ? 'bg-emerald-500' : 'bg-orange-500'}`} />
              </div>

              {/* Progress bar */}
              <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500 mb-1.5">
                  <span>Progres rută</span>
                  <span>{Math.round((selected.done / selected.stops) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${(selected.done / selected.stops) * 100}%` }}
                  />
                </div>
              </div>

              {/* Stop list */}
              <div className="flex-1">
                {selected.route.map((stop, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800/50 ${
                      stop.status === 'next' ? 'bg-orange-50 dark:bg-orange-950/20' : ''
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5 ${
                      stop.status === 'done' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500' :
                      stop.status === 'next' ? 'bg-brand-orange text-white' :
                      'border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500'
                    }`}>
                      {stop.status === 'done' ? <Check size={9} /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[12px] font-medium truncate ${
                        stop.status === 'done' ? 'text-zinc-400 dark:text-zinc-500 line-through' :
                        stop.status === 'next' ? 'text-orange-700 dark:text-orange-300' :
                        'text-zinc-700 dark:text-zinc-300'
                      }`}>{stop.address}</div>
                      {stop.status === 'next' && (
                        <div className="text-[10px] text-brand-orange dark:text-orange-400 mt-0.5 flex items-center gap-1">
                          <Clock size={9} /> Următoarea · {eta ?? '…'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Default: stats + driver list + recent */
            <>
              <div className="grid grid-cols-2 gap-px border-b border-zinc-200 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-800">
                {[
                  { label: 'Total',   key: 'total' as const,   value: String(kpis.total),   icon: Package,     color: 'text-blue-500',    ring: 'ring-blue-400'    },
                  { label: 'În drum', key: 'in_drum' as const, value: String(kpis.in_drum), icon: Clock,        color: 'text-amber-500',   ring: 'ring-amber-400'   },
                  { label: 'Livrate', key: 'livrate' as const, value: String(kpis.livrate), icon: CheckCircle,  color: 'text-emerald-500', ring: 'ring-emerald-400' },
                  { label: 'Eșuate', key: 'esuate' as const,  value: String(kpis.esuate),  icon: XCircle,      color: 'text-red-500',     ring: 'ring-red-400'     },
                ].map(s => {
                  const active = filterCard === s.key
                  return (
                    <button
                      key={s.label}
                      onClick={() => {
                        setFilterCard(active ? null : s.key)
                        setSelectedIdx(null)
                      }}
                      className={`bg-white dark:bg-zinc-900 px-4 py-3 text-left transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${active ? `ring-2 ring-inset ${s.ring}` : ''}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <s.icon size={12} className={s.color} />
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{s.label}</span>
                      </div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{s.value}</div>
                    </button>
                  )
                })}
              </div>

              {/* Necesită atenție */}
              {activeAttention.length > 0 && (
                <div className="border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle size={11} className="text-amber-500" />
                      <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Necesită atenție</span>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full">{activeAttention.length}</span>
                  </div>

                  {activeAttention.map(item => (
                    <div key={item.id} className="mx-3 mb-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 space-y-2.5">
                      {/* Header */}
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200">{item.customer}</span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{item.failedAt}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{item.address}</div>
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">{FAIL_REASON_LABEL[item.failReason]}</div>
                      </div>

                      {/* Timeline */}
                      <div className="flex items-center gap-0">
                        {(['returned', 'contacted', 'resolved'] as const).map((step, i) => {
                          const stepDone =
                            step === 'returned'  ? true :
                            step === 'contacted' ? (item.status === 'contacted') :
                            false
                          const isCurrent =
                            step === 'returned'  && item.status === 'returned' ||
                            step === 'contacted' && item.status === 'contacted'
                          const label = step === 'returned' ? 'Returnat' : step === 'contacted' ? 'Contactat' : 'Rezolvat'
                          return (
                            <div key={step} className="flex items-center flex-1">
                              <div className="flex flex-col items-center">
                                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                  isCurrent ? 'border-amber-500 bg-amber-500' :
                                  stepDone   ? 'border-emerald-500 bg-emerald-500' :
                                  'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                                }`}>
                                  {stepDone && !isCurrent && <CheckCircle size={8} className="text-white" />}
                                </div>
                                <span className={`text-[9px] mt-0.5 font-medium ${isCurrent ? 'text-amber-600 dark:text-amber-400' : stepDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-600'}`}>{label}</span>
                              </div>
                              {i < 2 && <div className={`flex-1 h-px mb-3 mx-0.5 ${stepDone ? 'bg-emerald-400' : 'bg-zinc-200 dark:bg-zinc-700'}`} />}
                            </div>
                          )
                        })}
                      </div>

                      {/* Phone */}
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <Phone size={10} />
                        <span>{item.phone}</span>
                        <span className="text-zinc-300 dark:text-zinc-600">·</span>
                        <span className="text-zinc-400 dark:text-zinc-500">{item.driverName}</span>
                      </div>

                      {/* Actions */}
                      {item.status === 'returned' && (
                        <button
                          onClick={() => advanceAttention(item.id, 'contacted')}
                          className="w-full flex items-center justify-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-orange-400 dark:hover:border-brand-orange text-zinc-700 dark:text-zinc-300 hover:text-brand-orange dark:hover:text-orange-400 text-[11px] font-medium py-1.5 rounded-lg transition-colors"
                        >
                          <Phone size={10} /> Am contactat clientul
                        </button>
                      )}

                      {item.status === 'contacted' && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => { advanceAttention(item.id, 'rescheduled'); setTimeout(() => dismissAttention(item.id), 1500) }}
                            className="flex-1 flex items-center justify-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium py-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                          >
                            <RotateCcw size={10} /> Reprogramează
                          </button>
                          <button
                            onClick={() => { advanceAttention(item.id, 'cancelled'); setTimeout(() => dismissAttention(item.id), 1500) }}
                            className="flex-1 flex items-center justify-center gap-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-[11px] font-medium py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          >
                            <Ban size={10} /> No-show
                          </button>
                        </div>
                      )}

                      {(item.status === 'rescheduled' || item.status === 'cancelled') && (
                        <div className={`text-center text-[11px] font-semibold py-1 rounded-lg ${item.status === 'rescheduled' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30'}`}>
                          {item.status === 'rescheduled' ? <span className="flex items-center justify-center gap-1"><Check size={11} /> Reprogramat</span> : 'Anulat'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {filterCard && (
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Filtrezi după: <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {{ total: 'Total', in_drum: 'În drum', livrate: 'Livrate', esuate: 'Eșuate' }[filterCard]}
                    </span>
                  </span>
                  <button onClick={() => setFilterCard(null)} className="text-[11px] text-brand-orange dark:text-orange-400 hover:underline">
                    Resetează
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Șoferi</span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  {filterCard ? `${sidebarDrivers.length} rezultate` : `${drivers.filter(d => d.active).length} activi`}
                </span>
              </div>

              {sidebarDrivers.length === 0 && (
                <div className="px-4 py-4 text-[12px] text-zinc-400 dark:text-zinc-600 text-center">Niciun șofer</div>
              )}

              {sidebarDrivers.map((d) => {
                const i = drivers.indexOf(d)
                const pct = Math.round((d.done / d.stops) * 100)
                const matchCount = filterCard && filterCard !== 'total'
                  ? d.route.filter(s => matchStatus(s.status)).length
                  : null
                const filterColor: Record<string, string> = {
                  in_drum: 'text-amber-600 dark:text-amber-400',
                  livrate: 'text-emerald-600 dark:text-emerald-400',
                  esuate:  'text-red-600 dark:text-red-400',
                }
                return (
                  <button
                    key={d.name}
                    onClick={() => { setSelectedIdx(i); setFilterCard(null) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors text-left"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                        {d.initials}
                      </div>
                      <div className={`absolute -bottom-px -right-px w-2 h-2 rounded-full border border-white dark:border-zinc-900 ${d.active ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">{d.name}</div>
                      {matchCount !== null ? (
                        <div className={`text-[11px] mt-0.5 font-medium ${filterCard ? filterColor[filterCard] ?? 'text-zinc-400' : 'text-zinc-400'}`}>
                          {matchCount} {filterCard === 'esuate' ? 'eșuate' : filterCard === 'livrate' ? 'livrate' : 'în drum'}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${pct === 100 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums">{d.done}/{d.stops}</span>
                        </div>
                      )}
                    </div>
                    <MoreHorizontal size={13} className="text-zinc-300 dark:text-zinc-600 flex-shrink-0" />
                  </button>
                )
              })}

              <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  {{ livrate: 'Livrate', esuate: 'Eșuate', in_drum: 'În drum', total: 'Recente' }[filterCard ?? ''] ?? 'Recente'}
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{sidebarRecent.length} rezultate</span>
              </div>

              {sidebarRecent.length === 0 && (
                <div className="px-4 py-4 text-[12px] text-zinc-400 dark:text-zinc-600 text-center">Nicio livrare</div>
              )}

              {sidebarRecent.map(d => (
                <div key={d.id} className="flex flex-col gap-1.5 px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-zinc-800 dark:text-zinc-200 truncate">{d.customer}</div>
                      <div className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{d.address} · {d.time}</div>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md flex-shrink-0 ${badge[d.status].cls}`}>
                      {badge[d.status].label}
                    </span>
                  </div>
                  {d.status === 'failed' && d.failNote && (
                    <div className="text-[11px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-lg px-2.5 py-1.5 leading-relaxed">
                      {d.failNote}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Map */}
        <div className={`${mobileTab === 'map' ? 'flex-1' : 'hidden'} md:flex-1 relative`}>
          <MapContainer
            center={CHISINAU}
            zoom={13}
            crs={L.CRS.EPSG3395}
            style={{ height: '100%', width: '100%' }}
          >
            <MapController target={mapTarget} zoom={mapZoom} />

            {/* Base layer */}
            {layer === 'satellite' ? <YandexSatLayer key="sat" /> : <YandexMapLayer key="map" />}
            <MoldovaBorder />

            {traffic && <YandexTrafficLayer opacity={0.85} />}

            {/* All driver icons (when no filter and no driver selected) */}
            {selectedIdx === null && filterCard === null && drivers.map(d => (
              <Marker
                key={d.name}
                position={d.pos}
                icon={driverIcon(d.initials, d.status)}
                eventHandlers={{ click: () => { setSelectedIdx(drivers.indexOf(d)); setFilterCard(null) } }}
              />
            ))}

            {/* Filtered stop markers */}
            {filterCard !== null && selectedIdx === null && filteredStops.map((stop, i) => (
              <Marker key={i} position={stop.pos} icon={filterMarkerIcon(stop.status)}>
                <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                  <div style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    background: '#ffffff',
                    border: '1px solid #e4e4e7',
                    borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.08)',
                    padding: '10px 14px',
                    minWidth: 200,
                    maxWidth: 260,
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 3 }}>
                      {stop.customer || stop.address}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: stop.failNote ? 8 : 6 }}>
                      {stop.address}
                    </div>
                    {stop.failNote && (
                      <div style={{
                        padding: '7px 10px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: 8,
                        color: '#dc2626',
                        fontSize: 12,
                        lineHeight: 1.5,
                        marginBottom: 8,
                      }}>
                        {stop.failNote}
                      </div>
                    )}
                    <div style={{
                      fontSize: 11,
                      color: '#9ca3af',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      borderTop: '1px solid #f4f4f5',
                      paddingTop: 6,
                    }}>
                      <span style={{ fontWeight: 600 }}>{stop.driverName}</span>
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            ))}

            {/* Selected driver: route + stops */}
            {selected && (() => {
              return (
                <>
                  {/* Completed route | road-following gray line */}
                  {routePaths.completed && routePaths.completed.length >= 2 && (
                    <Polyline
                      positions={routePaths.completed}
                      pathOptions={{ color: '#a1a1aa', weight: 4, opacity: 0.6 }}
                    />
                  )}
                  {/* Upcoming route | road-following blue dashed */}
                  {routePaths.upcoming && routePaths.upcoming.length >= 2 && (
                    <Polyline
                      positions={routePaths.upcoming}
                      pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.85, dashArray: '8 5' }}
                    />
                  )}

                  {/* Stop markers */}
                  {selected.route.map((stop, i) => (
                    <Marker key={i} position={stop.pos} icon={stopIcon(i + 1, stop.status)} />
                  ))}

                  {/* Live driver icon */}
                  <Marker
                    position={selected.pos}
                    icon={driverIcon(selected.initials, selected.status, true)}
                  >
                    <Tooltip permanent direction="top" offset={[0, -52]} opacity={1}>
                      <span style={{
                        display: 'inline-block',
                        background: '#2563eb',
                        border: '1px solid #1d4ed8',
                        borderRadius: 6,
                        padding: '2px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#ffffff',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      }}>
                        {selected.initials} · {eta ?? '…'}
                      </span>
                    </Tooltip>
                  </Marker>
                </>
              )
            })()}
          </MapContainer>

          {/* Map controls | top right */}
          <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
            {/* Layer toggle */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => setLayer('streets')}
                className={`flex items-center gap-2 w-full px-3 py-2 text-[12px] font-medium transition-colors border-b border-zinc-100 dark:border-zinc-800 ${
                  layer === 'streets'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <Layers size={12} /> Stradal
              </button>
              <button
                onClick={() => setLayer('satellite')}
                className={`flex items-center gap-2 w-full px-3 py-2 text-[12px] font-medium transition-colors ${
                  layer === 'satellite'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <MapPin size={12} /> Satelit
              </button>
            </div>

            {/* Traffic toggle */}
            <button
              onClick={() => setTraffic(t => !t)}
              title="Trafic live (necesită cheie TomTom)"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium border shadow-sm transition-colors ${
                traffic
                  ? 'bg-amber-500 border-amber-400 text-white'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Radio size={12} /> Trafic
            </button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 z-[1000] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 flex items-center gap-4 shadow-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Activ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Finalizat</span>
            </div>
            {selectedIdx !== null && (
              <>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-px bg-zinc-400" style={{ borderTop: '2px solid #a1a1aa' }} />
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Efectuat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-px" style={{ borderTop: '2px dashed #2563eb' }} />
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Următor</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
