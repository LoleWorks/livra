import { Helmet } from 'react-helmet-async'
import { useState, useEffect, useRef, Fragment } from 'react'
import { Package, Phone, Search, Plus, Check, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getUser } from '../../lib/auth'

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

export default function SalesOrders() {
  const [orders, setOrders] = useState<Delivery[]>([])
  const [filter, setFilter] = useState('toate')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState({ delivery_date: '', time_window_start: '', time_window_end: '', package_description: '' })
  const [saving, setSaving] = useState(false)

  const managerId = getUser()?.id

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
      })

    const channel = supabase
      .channel('sales_orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'livra_deliveries' }, payload => {
        if (payload.eventType === 'INSERT') {
          const r = payload.new as Delivery
          if (r.assigned_to === managerId) setOrders(prev => [r, ...prev])
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

  function startEdit(o: Delivery) {
    setEditingId(o.id)
    setEditDraft({
      delivery_date: o.delivery_date ?? '',
      time_window_start: o.time_window_start ?? '',
      time_window_end: o.time_window_end ?? '',
      package_description: o.package_description ?? '',
    })
  }

  async function saveSchedule() {
    if (!editingId || !editDraft.delivery_date) return
    setSaving(true)
    await supabase.from('livra_deliveries').update({
      delivery_date: editDraft.delivery_date,
      time_window_start: editDraft.time_window_start || null,
      time_window_end: editDraft.time_window_end || null,
      package_description: editDraft.package_description || null,
    }).eq('id', editingId)
    setOrders(prev => prev.map(o => o.id === editingId ? {
      ...o,
      delivery_date: editDraft.delivery_date,
      time_window_start: editDraft.time_window_start || null,
      time_window_end: editDraft.time_window_end || null,
      package_description: editDraft.package_description || null,
    } : o))
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
        <Link
          to="/sales/nou"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-orange hover:bg-orange-500 text-white text-[13px] font-medium rounded-lg transition-colors"
        >
          <Plus size={14} />
          Comandă nouă
        </Link>
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
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Adresă</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Data</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Interval</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-zinc-400">Se încarcă...</td></tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
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
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-800 dark:text-zinc-200">{o.customer}</div>
                      {o.notes && <div className="text-[11px] text-zinc-400 mt-0.5 truncate max-w-[160px]">{o.notes}</div>}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 max-w-[200px]">
                      <div className="truncate">{o.address}</div>
                      {o.package_description && <div className="text-[11px] text-zinc-400 mt-0.5">{o.package_description}</div>}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {o.delivery_date
                        ? fmtDate(o.delivery_date)
                        : canSchedule
                          ? <span className="flex items-center gap-1 text-orange-500 text-[11px] font-medium"><CalendarDays size={11} />Programează</span>
                          : '—'
                      }
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{fmtWindow(o.time_window_start, o.time_window_end)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
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
                  {isEditing && (
                    <tr>
                      <td colSpan={6} className="px-4 py-3 border-b border-orange-100 dark:border-orange-900/40 bg-orange-50/40 dark:bg-orange-950/20" onClick={e => e.stopPropagation()}>
                        <div className="space-y-2 max-w-md">
                          <div>
                            <label className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5 block">Data livrării *</label>
                            <input
                              type="date"
                              value={editDraft.delivery_date}
                              onChange={e => setEditDraft(p => ({ ...p, delivery_date: e.target.value }))}
                              className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[12px] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5 block">Disponibil de la</label>
                              <TimeInput24
                                value={editDraft.time_window_start}
                                onChange={v => setEditDraft(p => ({ ...p, time_window_start: v }))}
                                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[12px] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5 block">Disponibil până la</label>
                              <TimeInput24
                                value={editDraft.time_window_end}
                                onChange={v => setEditDraft(p => ({ ...p, time_window_end: v }))}
                                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[12px] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
                              />
                            </div>
                          </div>
                          <input
                            value={editDraft.package_description}
                            onChange={e => setEditDraft(p => ({ ...p, package_description: e.target.value }))}
                            placeholder="Descriere pachet (opțional)"
                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[12px] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400 placeholder:text-zinc-400"
                          />
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={saveSchedule}
                              disabled={!editDraft.delivery_date || saving}
                              className="flex items-center gap-1.5 bg-brand-orange hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[12px] font-semibold px-3 py-1 rounded-lg transition-colors"
                            >
                              <Check size={11} /> Programează
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-[11px] text-zinc-400 hover:text-zinc-600 px-2 py-1">
                              Închide
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
