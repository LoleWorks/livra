import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { Package, Phone, Search, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

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
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  upcoming:   { label: 'Nou',      dot: 'bg-orange-500',    badge: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300' },
  dispatched: { label: 'Expediat', dot: 'bg-amber-500',   badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' },
  delivered:  { label: 'Livrat',   dot: 'bg-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' },
  failed:     { label: 'Eșuat',    dot: 'bg-red-500',     badge: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300' },
}

const ALL_STATUSES = ['toate', 'upcoming', 'dispatched', 'delivered', 'failed']
const STATUS_LABELS_FILTER: Record<string, string> = {
  toate: 'Toate', upcoming: 'Noi', dispatched: 'Expediate', delivered: 'Livrate', failed: 'Eșuate',
}

const MOCK: Delivery[] = [
  { id: '1', customer: 'Maria Ionescu',   phone: '069 123 456', address: 'str. Ismail 12, Chișinău',          notes: 'Interfon 3',      package_description: '2x colete mici',  status: 'upcoming',   delivery_date: new Date().toISOString().slice(0,10), time_window_start: '10:00', time_window_end: '12:00', created_at: new Date().toISOString() },
  { id: '2', customer: 'Ion Moraru',      phone: '078 234 567', address: 'bd. Ștefan cel Mare 45, Chișinău',  notes: null,              package_description: '1x colet mare',   status: 'upcoming',   delivery_date: new Date().toISOString().slice(0,10), time_window_start: '14:00', time_window_end: '16:00', created_at: new Date(Date.now()-3600000).toISOString() },
  { id: '3', customer: 'Ana Popescu',     phone: '079 345 678', address: 'str. Columna 7, Chișinău',          notes: 'Etaj 2, ap. 14', package_description: null,              status: 'dispatched', delivery_date: new Date().toISOString().slice(0,10), time_window_start: '09:00', time_window_end: '11:00', created_at: new Date(Date.now()-7200000).toISOString() },
  { id: '4', customer: 'Dumitru Luca',   phone: '060 456 789', address: 'str. Albișoara 33, Chișinău',       notes: null,              package_description: '3x colete mici',  status: 'delivered',  delivery_date: new Date().toISOString().slice(0,10), time_window_start: null,    time_window_end: null,    created_at: new Date(Date.now()-10800000).toISOString() },
  { id: '5', customer: 'Elena Vrabie',   phone: '068 567 890', address: 'str. Mihai Eminescu 8, Chișinău',   notes: null,              package_description: '1x plic',         status: 'failed',     delivery_date: new Date(Date.now()-86400000).toISOString().slice(0,10), time_window_start: '13:00', time_window_end: '15:00', created_at: new Date(Date.now()-90000000).toISOString() },
  { id: '6', customer: 'Vasile Popa',    phone: '079 678 901', address: 'bd. Moscova 12, Chișinău',          notes: 'Sună înainte',   package_description: '2x cutii',        status: 'failed',     delivery_date: new Date(Date.now()-172800000).toISOString().slice(0,10), time_window_start: null,    time_window_end: null,    created_at: new Date(Date.now()-180000000).toISOString() },
]

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: '2-digit' })
}

function fmtWindow(start: string | null, end: string | null) {
  if (!start) return '—'
  return `${start.slice(0, 5)}–${(end ?? '').slice(0, 5)}`
}

export default function SalesOrders() {
  const [orders, setOrders] = useState<Delivery[]>(MOCK)
  const [filter, setFilter] = useState('toate')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('livra_deliveries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (data && data.length > 0) setOrders(data as Delivery[])
      setLoading(false)
    }
    load()
  }, [])

  const visible = orders.filter(o => {
    const matchStatus = filter === 'toate' || o.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || o.customer.toLowerCase().includes(q) || o.address.toLowerCase().includes(q) || o.phone.includes(q)
    return matchStatus && matchSearch
  })

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <Helmet>
        <title>Comenzi — Livra Sales</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-zinc-900 dark:text-zinc-50">Comenzi</h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">{orders.length} comenzi total</p>
        </div>
        <Link
          to="/sales/nou"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-medium rounded-lg transition-colors"
        >
          <Plus size={14} />
          Comandă nouă
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Caută după nume, adresă, telefon..."
            className="w-full pl-8 pr-3 py-2 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
          />
        </div>
        <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                filter === s
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {STATUS_LABELS_FILTER[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
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
              return (
                <tr key={o.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-800 dark:text-zinc-200">{o.customer}</div>
                    {o.notes && <div className="text-[11px] text-zinc-400 mt-0.5 truncate max-w-[160px]">{o.notes}</div>}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 max-w-[200px]">
                    <div className="truncate">{o.address}</div>
                    {o.package_description && <div className="text-[11px] text-zinc-400 mt-0.5">{o.package_description}</div>}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{fmtDate(o.delivery_date)}</td>
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
                      className="inline-flex items-center gap-1 text-[12px] text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors px-2 py-1 rounded-md hover:bg-violet-50 dark:hover:bg-violet-950/40"
                    >
                      <Phone size={12} />
                      {o.phone}
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
