import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, RotateCcw, CheckCircle, Clock, Plus, ArrowRight, Phone, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type Delivery = {
  id: string
  customer: string
  phone: string
  address: string
  status: string
  delivery_date: string | null
  time_window_start: string | null
  time_window_end: string | null
  notes: string | null
  created_at: string
}

type AttentionItem = {
  id: string
  delivery_id: string
  customer: string
  address: string
  phone: string
  fail_reason: string
  status: string
  created_at: string
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })
}

function fmtTime(t: string | null) {
  if (!t) return null
  return t.slice(0, 5)
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  upcoming:   { label: 'Nou',         cls: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300' },
  dispatched: { label: 'Expediat',    cls: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' },
  delivered:  { label: 'Livrat',      cls: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' },
  failed:     { label: 'Eșuat',       cls: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300' },
}

export default function SalesDashboard() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [attention, setAttention] = useState<AttentionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().slice(0, 10)
      const { data: del } = await supabase
        .from('livra_deliveries')
        .select('*')
        .gte('delivery_date', today)
        .order('created_at', { ascending: false })
        .limit(20)
      if (del) setDeliveries(del as Delivery[])

      const { data: att } = await supabase
        .from('livra_attention_items')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
      if (att) setAttention(att as AttentionItem[])

      setLoading(false)
    }
    load()
  }, [])

  const pending   = deliveries.filter(d => d.status === 'upcoming').length
  const dispatched = deliveries.filter(d => d.status === 'dispatched').length
  const delivered = deliveries.filter(d => d.status === 'delivered').length
  const returns   = attention.filter(a => a.status === 'open').length

  const recent = deliveries.slice(0, 5)

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      <Helmet>
        <title>Prezentare | Livra Sales</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-zinc-900 dark:text-zinc-50">Prezentare generală</h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link
          to="/sales/nou"
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-medium rounded-lg transition-colors"
        >
          <Plus size={14} />
          Comandă nouă
        </Link>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'De livrat azi', value: pending,    icon: Package,      color: 'text-brand-orange dark:text-orange-400',    bg: 'bg-orange-50 dark:bg-orange-950/40' },
          { label: 'În curs',       value: dispatched, icon: Clock,        color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-950/40' },
          { label: 'Livrate azi',   value: delivered,  icon: CheckCircle,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
          { label: 'Retururi',      value: returns,    icon: RotateCcw,    color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-950/40' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] text-zinc-500 dark:text-zinc-400">{label}</span>
              <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon size={14} className={color} />
              </div>
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        {/* Recent orders */}
        <div className="md:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">Comenzi recente</span>
            <Link to="/sales/comenzi" className="text-[12px] text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
              Vezi toate <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {loading ? (
              <div className="p-8 text-center text-[13px] text-zinc-400">Se încarcă...</div>
            ) : recent.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-zinc-400">Nicio comandă astăzi</div>
            ) : recent.map(d => {
              const s = STATUS_LABELS[d.status] ?? STATUS_LABELS.upcoming
              return (
                <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 truncate">{d.customer}</span>
                      <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                    </div>
                    <div className="text-[12px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{d.address}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {d.delivery_date && (
                      <div className="text-[12px] text-zinc-500 dark:text-zinc-400">{fmtDate(d.delivery_date)}</div>
                    )}
                    {d.time_window_start && (
                      <div className="text-[11px] text-zinc-400 dark:text-zinc-500">{fmtTime(d.time_window_start)}–{fmtTime(d.time_window_end)}</div>
                    )}
                  </div>
                  <a href={`tel:${d.phone}`} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors flex-shrink-0">
                    <Phone size={13} />
                  </a>
                </div>
              )
            })}
          </div>
        </div>

        {/* Returns / attention */}
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">Retururi active</span>
            <Link to="/sales/retururi" className="text-[12px] text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
              Toate <ArrowRight size={11} />
            </Link>
          </div>
          <div className="p-3 space-y-2">
            {loading ? (
              <div className="p-4 text-center text-[13px] text-zinc-400">Se încarcă...</div>
            ) : attention.length === 0 ? (
              <div className="p-4 text-center">
                <CheckCircle size={24} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-[13px] text-zinc-400">Nicio livrare eșuată</p>
              </div>
            ) : attention.map(a => (
              <div key={a.id} className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 truncate">{a.customer}</div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{a.fail_reason}</div>
                  </div>
                  <a href={`tel:${a.phone}`} className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-violet-600 hover:bg-white dark:hover:bg-zinc-800 transition-colors flex-shrink-0">
                    <Phone size={12} />
                  </a>
                </div>
                <Link
                  to="/sales/retururi"
                  className="mt-2 block text-center text-[11px] font-medium text-violet-600 dark:text-violet-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md py-1 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
                >
                  Reprogramează
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  )
}
