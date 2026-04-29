import { Helmet } from 'react-helmet-async'
import { useState, useEffect, useRef, Fragment } from 'react'
import { Package, Phone, Search, Plus, Check, CalendarDays, Banknote, Truck, AlertTriangle, Ban, Bell, BellOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getUser } from '../../lib/auth'
import {
  unlockAudio, playDing, requestNotificationPermission, showNotification,
  getNotificationsEnabled, setNotificationsEnabled,
} from '../../lib/notifications'

type Delivery = {
  id: string
  customer: string
  phone: string
  address: string
  notes: string | null
  package_description: string | null
  status: string
  delivery_date: string | null
  time_window_start: string | null
  time_window_end: string | null
  created_at: string
  assigned_to: string | null
  order_items: string | null
  order_value: number | null
  shipping_cost: number | null
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  upcoming:   { label: 'Nou',      dot: 'bg-orange-500',  badge: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300' },
  dispatched: { label: 'Expediat', dot: 'bg-amber-500',   badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' },
  delivered:  { label: 'Livrat',   dot: 'bg-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' },
  failed:     { label: 'Eșuat',    dot: 'bg-red-500',     badge: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300' },
}

const ALL_STATUSES = ['toate', 'upcoming', 'dispatched', 'delivered', 'failed']
const STATUS_LABELS_FILTER: Record<string, string> = {
  toate: 'Toate', upcoming: 'Noi', dispatched: 'Expediate', delivered: 'Livrate', failed: 'Eșuate',
}

// ── Capacity helpers ──────────────────────────────────────────────────────────

const MINS_PER_STOP = 25   // avg minutes per stop including short travel

function windowCap(numDrivers: number, start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) return 1
  return Math.max(1, numDrivers) * Math.max(1, Math.floor(mins / MINS_PER_STOP))
}

function dayCap(numDrivers: number): number {
  return Math.max(1, numDrivers) * 30
}

type CapState = 'ok' | 'warn' | 'full'
function capState(used: number, cap: number): CapState {
  if (used >= cap) return 'full'
  if (used >= cap * 0.8) return 'warn'
  return 'ok'
}

// ──────────────────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: '2-digit' })
}

function fmtWindow(start: string | null, end: string | null) {
  if (!start) return '—'
  return `${start.slice(0, 5)}–${(end ?? '').slice(0, 5)}`
}

function TimeInput24({ value, onChange, className }: {
  value: string; onChange: (v: string) => void; className?: string;
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const hourColRef = useRef<HTMLDivElement>(null)
  const minColRef = useRef<HTMLDivElement>(null)
  const [h, m] = (value && value.includes(':')) ? value.split(':') : ['', '']

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (!open) return
    const scrollTo = (col: HTMLDivElement | null, val: string) => {
      if (!col) return
      const el = col.querySelector(`[data-v="${val}"]`) as HTMLElement | null
      if (el) col.scrollTop = el.offsetTop - col.clientHeight / 2 + el.clientHeight / 2
    }
    setTimeout(() => {
      scrollTo(hourColRef.current, h || '09')
      scrollTo(minColRef.current, m || '00')
    }, 0)
  }, [open, h, m])

  function setHour(hh: string) { onChange(`${hh}:${m || '00'}`) }
  function setMinute(mm: string) { onChange(`${h || '09'}:${mm}`); setOpen(false) }

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text" readOnly onClick={() => setOpen(o => !o)} value={value || ''}
        placeholder="HH:MM"
        className={`${className} cursor-pointer`}
      />
      {open && (
        <div className="absolute z-[100] top-full mt-1 left-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl flex overflow-hidden">
          <div ref={hourColRef} className="max-h-44 overflow-y-auto py-1 border-r border-zinc-100 dark:border-zinc-800">
            {hours.map(hh => (
              <button key={hh} type="button" data-v={hh} onClick={() => setHour(hh)}
                className={`block w-12 px-3 py-1 text-[12px] text-center font-mono transition-colors ${hh === h ? 'bg-brand-orange text-white' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                {hh}
              </button>
            ))}
          </div>
          <div ref={minColRef} className="max-h-44 overflow-y-auto py-1">
            {minutes.map(mm => (
              <button key={mm} type="button" data-v={mm} onClick={() => setMinute(mm)}
                className={`block w-12 px-3 py-1 text-[12px] text-center font-mono transition-colors ${mm === m ? 'bg-brand-orange text-white' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                {mm}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

type ScheduledSlot = { id: string; delivery_date: string | null; time_window_start: string | null; time_window_end: string | null }

export default function SalesOrders() {
  const [orders, setOrders] = useState<Delivery[]>([])
  const [filter, setFilter] = useState('toate')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState({ delivery_date: '', time_window_start: '', time_window_end: '', package_description: '', order_items: '', order_value: '', shipping_cost: '' })
  const [saving, setSaving] = useState(false)
  const [capacityError, setCapacityError] = useState<string | null>(null)

  // Company-wide capacity data
  const [companyId, setCompanyId]           = useState<string | null>(null)
  const [driverCount, setDriverCount]       = useState(1)
  const [companySlots, setCompanySlots]     = useState<ScheduledSlot[]>([])

  const managerId = getUser()?.id

  // Notification state — persists across reloads. The toggle handles
  // permission request + audio unlock on first enable.
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [notifSupported, setNotifSupported] = useState(true)
  const initialLoadDone = useRef(false)

  useEffect(() => {
    setNotifSupported('Notification' in window)
    if (getNotificationsEnabled() && (typeof Notification === 'undefined' || Notification.permission === 'granted')) {
      setNotifEnabled(true)
      unlockAudio()
    }
  }, [])

  async function toggleNotifications() {
    if (notifEnabled) {
      setNotifEnabled(false)
      setNotificationsEnabled(false)
      return
    }
    unlockAudio()
    const perm = await requestNotificationPermission()
    if (perm !== 'granted') {
      alert('Permite notificările din browser pentru a primi alerte sonore la comenzi noi.')
      return
    }
    setNotifEnabled(true)
    setNotificationsEnabled(true)
    playDing()
  }

  useEffect(() => {
    if (!managerId) { setLoading(false); return }

    supabase
      .from('livra_deliveries')
      .select('*')
      .eq('assigned_to', managerId)
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        if (data) setOrders(data as Delivery[])
        setLoading(false)
        initialLoadDone.current = true
      })

    // Load company info + active driver count for capacity checks
    supabase
      .from('livra_sales_managers')
      .select('admin_id')
      .eq('id', managerId)
      .single()
      .then(({ data: mgr }) => {
        if (!mgr?.admin_id) return
        setCompanyId(mgr.admin_id)
        supabase
          .from('livra_drivers')
          .select('id', { count: 'exact', head: true })
          .eq('admin_id', mgr.admin_id)
          .neq('status', 'offline')
          .then(({ count }) => setDriverCount(count ?? 1))
      })

    const channel = supabase
      .channel('sales_orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'livra_deliveries' }, payload => {
        if (payload.eventType === 'INSERT') {
          const r = payload.new as Delivery
          if (r.assigned_to === managerId) {
            setOrders(prev => [r, ...prev])
            // Skip notifications during the initial backfill to avoid a burst of dings on page load.
            if (initialLoadDone.current && getNotificationsEnabled()) {
              playDing()
              const total = (r.order_value ?? 0) + (r.shipping_cost ?? 0)
              const body = total > 0
                ? `${r.customer} — ${total.toFixed(2)} lei · ${r.address}`
                : `${r.customer} — ${r.address}`
              showNotification('Comandă nouă', body)
            }
          }
        } else if (payload.eventType === 'UPDATE') {
          const r = payload.new as Delivery
          if (r.assigned_to === managerId) {
            setOrders(prev => prev.map(o => o.id === r.id ? r : o))
          } else {
            setOrders(prev => prev.filter(o => o.id !== r.id))
          }
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [managerId])

  async function startEdit(o: Delivery) {
    setEditingId(o.id)
    setCapacityError(null)
    setEditDraft({
      delivery_date: o.delivery_date ?? '',
      time_window_start: o.time_window_start ?? '',
      time_window_end: o.time_window_end ?? '',
      package_description: o.package_description ?? '',
      order_items: o.order_items ?? '',
      order_value: o.order_value != null ? String(o.order_value) : '',
      shipping_cost: o.shipping_cost != null ? String(o.shipping_cost) : '',
    })
    // Fetch fresh company-wide slots for accurate capacity check
    if (companyId) {
      const { data } = await supabase
        .from('livra_deliveries')
        .select('id, delivery_date, time_window_start, time_window_end')
        .eq('company_id', companyId)
        .in('status', ['upcoming', 'dispatched'])
        .not('delivery_date', 'is', null)
      if (data) setCompanySlots(data)
    }
  }

  async function saveSchedule() {
    if (!editingId || !editDraft.delivery_date) return

    // ── Capacity guard ──────────────────────────────────────────────────────
    const { delivery_date: edd, time_window_start: ews, time_window_end: ewe } = editDraft
    const otherSlots = companySlots.filter(d => d.id !== editingId)

    if (ews && ewe) {
      const cap  = windowCap(driverCount, ews, ewe)
      const used = otherSlots.filter(d => d.delivery_date === edd && d.time_window_start === ews && d.time_window_end === ewe).length
      if (used >= cap) {
        const mins = (() => { const [sh,sm]=ews.split(':').map(Number); const [eh,em]=ewe.split(':').map(Number); return (eh*60+em)-(sh*60+sm) })()
        setCapacityError(
          `Fereastra ${ews}–${ewe} (${mins} min) este plină: ${used}/${cap} livrări cu ${driverCount} șofer${driverCount !== 1 ? 'i' : ''}. ` +
          `Alege o fereastră mai largă sau altă dată.`
        )
        return
      }
    } else {
      const cap  = dayCap(driverCount)
      const used = otherSlots.filter(d => d.delivery_date === edd).length
      if (used >= cap) {
        setCapacityError(
          `Ziua ${edd} este plină: ${used}/${cap} livrări cu ${driverCount} șofer${driverCount !== 1 ? 'i' : ''}. ` +
          `Alege altă dată sau adaugă o fereastră orară.`
        )
        return
      }
    }
    setCapacityError(null)
    // ───────────────────────────────────────────────────────────────────────

    setSaving(true)
    await supabase.from('livra_deliveries').update({
      delivery_date:    editDraft.delivery_date,
      time_window_start: editDraft.time_window_start || null,
      time_window_end:   editDraft.time_window_end   || null,
      package_description: editDraft.package_description || null,
      order_items:   editDraft.order_items   || null,
      order_value:   editDraft.order_value   ? parseFloat(editDraft.order_value)   : null,
      shipping_cost: editDraft.shipping_cost ? parseFloat(editDraft.shipping_cost) : null,
    }).eq('id', editingId)
    setOrders(prev => prev.map(o => o.id === editingId ? {
      ...o,
      delivery_date:    editDraft.delivery_date,
      time_window_start: editDraft.time_window_start || null,
      time_window_end:   editDraft.time_window_end   || null,
      package_description: editDraft.package_description || null,
      order_items:   editDraft.order_items   || null,
      order_value:   editDraft.order_value   ? parseFloat(editDraft.order_value)   : null,
      shipping_cost: editDraft.shipping_cost ? parseFloat(editDraft.shipping_cost) : null,
    } : o))
    // Keep companySlots in sync so subsequent edits in the same session are accurate
    setCompanySlots(prev => {
      const without = prev.filter(d => d.id !== editingId)
      return [...without, { id: editingId, delivery_date: editDraft.delivery_date, time_window_start: editDraft.time_window_start || null, time_window_end: editDraft.time_window_end || null }]
    })
    setEditingId(null)
    setSaving(false)
  }

  const visible = orders.filter(o => {
    const matchStatus = filter === 'toate' || o.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || o.customer.toLowerCase().includes(q) || o.address.toLowerCase().includes(q) || o.phone.includes(q)
    return matchStatus && matchSearch
  })

  const unscheduled = orders.filter(o => !o.delivery_date && o.status === 'upcoming').length

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <Helmet>
        <title>Comenzi | Livra Sales</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-zinc-900 dark:text-zinc-50">Comenzi</h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            {orders.length} comenzi asignate
            {unscheduled > 0 && <span className="ml-2 text-orange-500 font-medium">{unscheduled} neprogramate</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notifSupported && (
            <button
              type="button"
              onClick={toggleNotifications}
              title={notifEnabled ? 'Dezactivează alerta sonoră la comenzi noi' : 'Activează alerta sonoră la comenzi noi'}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg border transition-colors ${
                notifEnabled
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/50'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              {notifEnabled ? <Bell size={14} /> : <BellOff size={14} />}
              <span className="hidden sm:inline">{notifEnabled ? 'Alerte pornite' : 'Alerte oprite'}</span>
            </button>
          )}
          <Link
            to="/sales/nou"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-orange hover:bg-orange-500 text-white text-[13px] font-medium rounded-lg transition-colors"
          >
            <Plus size={14} />
            Comandă nouă
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Caută după nume, adresă, telefon..."
            className="w-full pl-8 pr-3 py-2 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
          />
        </div>
        <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                filter === s ? 'bg-brand-orange text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {STATUS_LABELS_FILTER[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Client</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Produse</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Adresă</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Data</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Valoare</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-zinc-400">Se încarcă...</td></tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <Package size={24} className="text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-400 text-[13px]">Nicio comandă găsită</p>
                </td>
              </tr>
            ) : visible.map(o => {
              const cfg = STATUS_CONFIG[o.status] ?? STATUS_CONFIG.upcoming
              const isEditing = editingId === o.id
              const canSchedule = o.status === 'upcoming'
              return (
                <Fragment key={o.id}>
                  <tr
                    onClick={() => canSchedule ? (isEditing ? setEditingId(null) : startEdit(o)) : undefined}
                    className={`transition-colors ${canSchedule ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50' : ''} ${isEditing ? 'bg-orange-50/40 dark:bg-orange-950/20' : ''}`}
                  >
                    {/* Client */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-800 dark:text-zinc-200">{o.customer}</div>
                      {o.notes && <div className="text-[11px] text-zinc-400 mt-0.5 italic truncate max-w-[140px]">{o.notes}</div>}
                    </td>
                    {/* Produse */}
                    <td className="px-4 py-3 max-w-[180px]">
                      {o.order_items
                        ? <div className="text-[12px] text-zinc-700 dark:text-zinc-300 leading-snug">{o.order_items}</div>
                        : <span className="text-[11px] text-zinc-300 dark:text-zinc-600">—</span>
                      }
                      {o.package_description && <div className="text-[11px] text-zinc-400 mt-0.5">{o.package_description}</div>}
                    </td>
                    {/* Adresă */}
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 max-w-[180px]">
                      <div className="truncate">{o.address}</div>
                    </td>
                    {/* Data */}
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {o.delivery_date
                        ? <><div>{fmtDate(o.delivery_date)}</div><div className="text-[11px] text-zinc-400">{fmtWindow(o.time_window_start, o.time_window_end)}</div></>
                        : canSchedule
                          ? <span className="flex items-center gap-1 text-orange-500 text-[11px] font-medium"><CalendarDays size={11} />Programează</span>
                          : '—'
                      }
                    </td>
                    {/* Valoare */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {o.order_value != null || o.shipping_cost != null ? (
                        <div className="space-y-0.5">
                          {o.order_value != null && (
                            <div className="flex items-center gap-1 text-[12px] text-zinc-700 dark:text-zinc-300 font-medium">
                              <Banknote size={11} className="text-zinc-400" />{o.order_value} lei
                            </div>
                          )}
                          {o.shipping_cost != null && (
                            <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                              <Truck size={10} />{o.shipping_cost} lei livrare
                            </div>
                          )}
                        </div>
                      ) : <span className="text-[11px] text-zinc-300 dark:text-zinc-600">—</span>}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    {/* Phone */}
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`tel:${o.phone}`}
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[12px] text-zinc-400 hover:text-brand-orange dark:hover:text-orange-400 transition-colors px-2 py-1 rounded-md hover:bg-orange-50 dark:hover:bg-orange-950/40"
                      >
                        <Phone size={12} />
                        {o.phone}
                      </a>
                    </td>
                  </tr>
                  {isEditing && (() => {
                    // Live capacity indicator
                    const { delivery_date: edd, time_window_start: ews, time_window_end: ewe } = editDraft
                    const otherSlots = companySlots.filter(d => d.id !== editingId)

                    let capUsed = 0, capMax = Infinity, capLabel = ''
                    if (edd && ews && ewe) {
                      capMax  = windowCap(driverCount, ews, ewe)
                      capUsed = otherSlots.filter(d => d.delivery_date === edd && d.time_window_start === ews && d.time_window_end === ewe).length
                      capLabel = `fereastră ${ews}–${ewe}`
                    } else if (edd) {
                      capMax  = dayCap(driverCount)
                      capUsed = otherSlots.filter(d => d.delivery_date === edd).length
                      capLabel = `ziua ${edd}`
                    }
                    const cs = isFinite(capMax) ? capState(capUsed, capMax) : 'ok'

                    return (
                    <tr>
                      <td colSpan={7} className="px-4 py-3 border-b border-orange-100 dark:border-orange-900/40 bg-orange-50/40 dark:bg-orange-950/20" onClick={e => e.stopPropagation()}>
                        <div className="space-y-2 max-w-md">
                          <div>
                            <label className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5 block">Data livrării *</label>
                            <input
                              type="date"
                              value={editDraft.delivery_date}
                              onChange={e => { setEditDraft(p => ({ ...p, delivery_date: e.target.value })); setCapacityError(null) }}
                              className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[12px] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5 block">Disponibil de la</label>
                              <TimeInput24
                                value={editDraft.time_window_start}
                                onChange={v => { setEditDraft(p => ({ ...p, time_window_start: v })); setCapacityError(null) }}
                                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[12px] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5 block">Disponibil până la</label>
                              <TimeInput24
                                value={editDraft.time_window_end}
                                onChange={v => { setEditDraft(p => ({ ...p, time_window_end: v })); setCapacityError(null) }}
                                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[12px] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
                              />
                            </div>
                          </div>
                          {/* Live capacity badge */}
                          {isFinite(capMax) && cs !== 'ok' && (
                            <div className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg ${
                              cs === 'full'
                                ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                            }`}>
                              {cs === 'full' ? <Ban size={11} /> : <AlertTriangle size={11} />}
                              <span>
                                {capUsed}/{capMax} livrări pentru {capLabel}
                                {cs === 'full' ? ' — fereastră plină' : ' — aproape plin'}
                              </span>
                            </div>
                          )}
                          <textarea
                            value={editDraft.order_items}
                            onChange={e => setEditDraft(p => ({ ...p, order_items: e.target.value }))}
                            placeholder="Produse comandate (ex. 2x Tricou alb M)"
                            rows={2}
                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[12px] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400 placeholder:text-zinc-400 resize-none"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5 flex items-center gap-1 block"><Banknote size={9} />Valoare comandă (lei)</label>
                              <input type="number" min="0" step="0.01"
                                value={editDraft.order_value}
                                onChange={e => setEditDraft(p => ({ ...p, order_value: e.target.value }))}
                                placeholder="ex. 450.00"
                                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[12px] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400 placeholder:text-zinc-400"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5 flex items-center gap-1 block"><Truck size={9} />Cost livrare (lei)</label>
                              <input type="number" min="0" step="0.01"
                                value={editDraft.shipping_cost}
                                onChange={e => setEditDraft(p => ({ ...p, shipping_cost: e.target.value }))}
                                placeholder="ex. 35.00"
                                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[12px] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400 placeholder:text-zinc-400"
                              />
                            </div>
                          </div>
                          <input
                            value={editDraft.package_description}
                            onChange={e => setEditDraft(p => ({ ...p, package_description: e.target.value }))}
                            placeholder="Descriere pachet (opțional)"
                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[12px] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400 placeholder:text-zinc-400"
                          />
                          {/* Capacity error from last save attempt */}
                          {capacityError && (
                            <div className="flex items-start gap-1.5 text-[11px] font-medium px-2.5 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400">
                              <Ban size={11} className="mt-0.5 flex-shrink-0" />
                              <span>{capacityError}</span>
                            </div>
                          )}
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={saveSchedule}
                              disabled={!editDraft.delivery_date || saving || cs === 'full'}
                              className="flex items-center gap-1.5 bg-brand-orange hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[12px] font-semibold px-3 py-1 rounded-lg transition-colors"
                            >
                              <Check size={11} /> Programează
                            </button>
                            <button onClick={() => { setEditingId(null); setCapacityError(null) }} className="text-[11px] text-zinc-400 hover:text-zinc-600 px-2 py-1">
                              Închide
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                    )
                  })()}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
