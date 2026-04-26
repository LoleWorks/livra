import { useEffect, useMemo, useState } from 'react'
import {
  Activity as ActivityIcon,
  LogIn, LogOut, Play, Flag, CheckCircle, XCircle,
  Coffee, Pause, Navigation, MapPin, Unlock,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

// ── Types ────────────────────────────────────────────────────────────────────

type EventType =
  | 'login' | 'logout'
  | 'route_opened' | 'route_completed'
  | 'stop_completed' | 'stop_failed'
  | 'break_started' | 'break_ended'
  | 'idle_started'  | 'idle_ended'
  | 'geofence_bypass_used' | 'nav_app_opened'

interface DriverEvent {
  id: string
  driver_id: string
  route_id: string | null
  event_type: EventType
  occurred_at: string
  lat: number | null
  lng: number | null
  metadata: Record<string, unknown>
}

interface Driver {
  id: string
  name: string
  initials: string
}

// ── Visual config per event type ─────────────────────────────────────────────
// Each entry: icon component, label in Romanian, accent color (Tailwind)

type EvVisual = { icon: typeof LogIn; label: string; ring: string; bg: string; text: string }

const EV: Record<EventType, EvVisual> = {
  login:                { icon: LogIn,       label: 'S-a autentificat',   ring: 'ring-emerald-200', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400' },
  logout:               { icon: LogOut,      label: 'S-a deconectat',     ring: 'ring-zinc-200',    bg: 'bg-zinc-50 dark:bg-zinc-800/50',       text: 'text-zinc-600 dark:text-zinc-400' },
  route_opened:         { icon: Play,        label: 'A pornit ruta',      ring: 'ring-blue-200',    bg: 'bg-blue-50 dark:bg-blue-950/40',       text: 'text-blue-700 dark:text-blue-400' },
  route_completed:      { icon: Flag,        label: 'A terminat ruta',    ring: 'ring-blue-200',    bg: 'bg-blue-50 dark:bg-blue-950/40',       text: 'text-blue-700 dark:text-blue-400' },
  stop_completed:       { icon: CheckCircle, label: 'Livrare reușită',    ring: 'ring-emerald-200', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400' },
  stop_failed:          { icon: XCircle,     label: 'Livrare eșuată',     ring: 'ring-red-200',     bg: 'bg-red-50 dark:bg-red-950/40',         text: 'text-red-700 dark:text-red-400' },
  break_started:        { icon: Coffee,      label: 'Pauză începută',     ring: 'ring-amber-200',   bg: 'bg-amber-50 dark:bg-amber-950/40',     text: 'text-amber-700 dark:text-amber-400' },
  break_ended:          { icon: Coffee,      label: 'Pauză terminată',    ring: 'ring-amber-200',   bg: 'bg-amber-50 dark:bg-amber-950/40',     text: 'text-amber-700 dark:text-amber-400' },
  idle_started:         { icon: Pause,       label: 'Staționar',          ring: 'ring-zinc-200',    bg: 'bg-zinc-100 dark:bg-zinc-800/60',      text: 'text-zinc-600 dark:text-zinc-400' },
  idle_ended:           { icon: Pause,       label: 'A pornit din nou',   ring: 'ring-zinc-200',    bg: 'bg-zinc-50 dark:bg-zinc-800/40',       text: 'text-zinc-500 dark:text-zinc-400' },
  geofence_bypass_used: { icon: Unlock,      label: 'Bypass locație',     ring: 'ring-amber-200',   bg: 'bg-amber-50 dark:bg-amber-950/40',     text: 'text-amber-700 dark:text-amber-400' },
  nav_app_opened:       { icon: Navigation,  label: 'A deschis navigarea',ring: 'ring-blue-200',    bg: 'bg-blue-50 dark:bg-blue-950/40',       text: 'text-blue-700 dark:text-blue-400' },
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })

const fmtDuration = (sec: number) => {
  if (sec < 60) return `${sec}s`
  if (sec < 3600) return `${Math.round(sec / 60)} min`
  const h = Math.floor(sec / 3600)
  const m = Math.round((sec % 3600) / 60)
  return m > 0 ? `${h}h ${m} min` : `${h}h`
}

const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Activity() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [events, setEvents] = useState<DriverEvent[]>([])
  const [selectedDriverId, setSelectedDriverId] = useState<string | 'all'>('all')
  const [date, setDate] = useState<string>(todayISO())
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all')
  const [loading, setLoading] = useState(true)

  // Load drivers once
  useEffect(() => {
    supabase
      .from('livra_drivers')
      .select('id, name, initials')
      .order('name')
      .then(({ data }) => {
        if (data) setDrivers(data.map(d => ({
          id: d.id, name: d.name,
          initials: d.initials ?? d.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        })))
      })
  }, [])

  // Load events for the selected date + subscribe to live changes
  useEffect(() => {
    setLoading(true)
    const start = `${date}T00:00:00.000Z`
    const end   = `${date}T23:59:59.999Z`

    let q = supabase.from('livra_driver_events')
      .select('*')
      .gte('occurred_at', start)
      .lte('occurred_at', end)
      .order('occurred_at', { ascending: false })
    if (selectedDriverId !== 'all') q = q.eq('driver_id', selectedDriverId)

    q.then(({ data }) => {
      setEvents((data ?? []) as DriverEvent[])
      setLoading(false)
    })

    // Realtime: any new event for this date appears immediately
    const ch = supabase
      .channel(`activity-${date}-${selectedDriverId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'livra_driver_events',
      }, (payload) => {
        const ev = payload.new as DriverEvent
        // Match the current filters
        if (selectedDriverId !== 'all' && ev.driver_id !== selectedDriverId) return
        const day = ev.occurred_at.slice(0, 10)
        if (day !== date) return
        setEvents(prev => [ev, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [selectedDriverId, date])

  // Apply the type filter client-side (cheap, the dataset is small)
  const visibleEvents = useMemo(() => {
    if (typeFilter === 'all') return events
    return events.filter(e => e.event_type === typeFilter)
  }, [events, typeFilter])

  const driverNameById = useMemo(() => {
    const m: Record<string, string> = {}
    for (const d of drivers) m[d.id] = d.name
    return m
  }, [drivers])

  const eventBody = (ev: DriverEvent): string => {
    const md = ev.metadata ?? {}
    switch (ev.event_type) {
      case 'stop_completed': {
        const dist = md.distance_to_address_m as number | undefined
        const distStr = dist !== undefined && dist >= 0 ? ` (la ${dist} m)` : ''
        return `${md.customer ?? ''} — ${md.address ?? ''}${distStr}`
      }
      case 'stop_failed':
        return `${md.customer ?? ''} · ${md.fail_reason ?? '—'}`
      case 'route_opened':
        return `${md.stop_count ?? '?'} opriri`
      case 'route_completed':
        return `${md.completed ?? 0} reușite, ${md.failed ?? 0} eșuate / ${md.total ?? 0}`
      case 'break_started':
        return md.break_type === 'lunch_break' ? 'Pauză de masă' : 'Pauză combustibil'
      case 'break_ended':
        return `Durată: ${fmtDuration((md.duration_sec as number) ?? 0)}`
      case 'idle_ended':
        return `Durată: ${fmtDuration((md.duration_sec as number) ?? 0)}`
      case 'idle_started':
        return 'Vehiculul nu se mișcă'
      case 'geofence_bypass_used':
        return `Distanță față de adresă: ${md.distance_m ?? '?'} m`
      case 'nav_app_opened':
        return `${md.customer ?? ''}`
      default: return ''
    }
  }

  // Compact group counts for the type filter chips
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: events.length }
    for (const e of events) c[e.event_type] = (c[e.event_type] ?? 0) + 1
    return c
  }, [events])

  const filterChips: Array<{ key: EventType | 'all'; label: string }> = [
    { key: 'all',                  label: 'Toate' },
    { key: 'stop_completed',       label: 'Livrate' },
    { key: 'stop_failed',          label: 'Eșuate' },
    { key: 'idle_started',         label: 'Staționar' },
    { key: 'break_started',        label: 'Pauze' },
    { key: 'geofence_bypass_used', label: 'Bypass locație' },
    { key: 'nav_app_opened',       label: 'Navigare' },
    { key: 'login',                label: 'Login/Logout' },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ActivityIcon size={14} className="text-zinc-500" />
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Activitate șoferi</span>
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[12px] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: driver picker */}
        <div className="w-56 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto py-3">
          <button
            onClick={() => setSelectedDriverId('all')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
              selectedDriverId === 'all'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-l-2 border-blue-500'
                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border-l-2 border-transparent'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-semibold text-zinc-500">
              ALL
            </div>
            <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">Toți șoferii</span>
          </button>
          {drivers.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDriverId(d.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                selectedDriverId === d.id
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-l-2 border-blue-500'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border-l-2 border-transparent'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center text-[11px] font-bold">
                {d.initials}
              </div>
              <span className="text-[13px] text-zinc-800 dark:text-zinc-200 truncate">{d.name}</span>
            </button>
          ))}
        </div>

        {/* Right: timeline */}
        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
          {/* Filter chips */}
          <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
            {filterChips.map(f => (
              <button
                key={f.key}
                onClick={() => setTypeFilter(f.key)}
                className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-colors ${
                  typeFilter === f.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {f.label}
                {f.key === 'all' && counts.all > 0 && ` · ${counts.all}`}
                {f.key !== 'all' && counts[f.key] > 0 && ` · ${counts[f.key]}`}
              </button>
            ))}
          </div>

          <div className="p-5">
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-3 font-medium">{fmtDate(date)}</div>

            {loading ? (
              <div className="text-center text-[13px] text-zinc-400 py-12">Se încarcă…</div>
            ) : visibleEvents.length === 0 ? (
              <div className="text-center text-[13px] text-zinc-400 py-12">
                Nicio activitate înregistrată pentru această zi.
              </div>
            ) : (
              <div className="relative">
                {/* Timeline rail */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800" />
                <div className="space-y-2">
                  {visibleEvents.map(ev => {
                    const v = EV[ev.event_type] ?? EV.login
                    const Icon = v.icon
                    return (
                      <div key={ev.id} className="relative flex items-start gap-4 pl-0">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-white dark:ring-zinc-950 ${v.bg}`}>
                          <Icon size={14} className={v.text} />
                        </div>
                        <div className="flex-1 min-w-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[12px] font-semibold ${v.text}`}>{v.label}</span>
                                {selectedDriverId === 'all' && (
                                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500">· {driverNameById[ev.driver_id] ?? 'Necunoscut'}</span>
                                )}
                              </div>
                              {eventBody(ev) && (
                                <div className="text-[12px] text-zinc-700 dark:text-zinc-300 mt-1 truncate">
                                  {eventBody(ev)}
                                </div>
                              )}
                              {ev.lat && ev.lng && (
                                <a
                                  href={`https://www.google.com/maps?q=${ev.lat},${ev.lng}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 hover:text-blue-500 mt-1 transition-colors"
                                >
                                  <MapPin size={9} />
                                  {ev.lat.toFixed(5)}, {ev.lng.toFixed(5)}
                                </a>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono flex-shrink-0">
                              {fmtTime(ev.occurred_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
