import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { Phone, Calendar, Clock, CheckCircle, RotateCcw, Ban, AlertTriangle, Loader2, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type Return = {
  id: string
  delivery_id: string
  customer: string
  address: string
  phone: string
  fail_reason: string
  status: 'open' | 'rescheduled' | 'cancelled'
  created_at: string
  new_date?: string
  new_window_start?: string
  new_window_end?: string
}

const TIME_WINDOWS = [
  { label: '08:00 – 10:00', start: '08:00', end: '10:00' },
  { label: '10:00 – 12:00', start: '10:00', end: '12:00' },
  { label: '12:00 – 14:00', start: '12:00', end: '14:00' },
  { label: '14:00 – 16:00', start: '14:00', end: '16:00' },
  { label: '16:00 – 18:00', start: '16:00', end: '18:00' },
  { label: '18:00 – 20:00', start: '18:00', end: '20:00' },
]

const MOCK: Return[] = [
  { id: 'a1', delivery_id: 'd5', customer: 'Olga Rusu',       address: 'str. Mihai Eminescu 8, Chișinău', phone: '068 567 890', fail_reason: 'Clientul nu a răspuns la ușă',  status: 'open', created_at: new Date(Date.now()-3600000).toISOString() },
  { id: 'a2', delivery_id: 'd6', customer: 'Vasile Popa',     address: 'bd. Moscova 12, Chișinău',        phone: '079 678 901', fail_reason: 'Adresă incorectă',               status: 'open', created_at: new Date(Date.now()-86400000).toISOString() },
  { id: 'a3', delivery_id: 'd7', customer: 'Rodica Ciobanu', address: 'str. Columna 7, Chișinău',         phone: '060 789 012', fail_reason: 'Clientul a refuzat coletul',     status: 'open', created_at: new Date(Date.now()-172800000).toISOString() },
]

function fmtAgo(iso: string) {
  const sec = (Date.now() - new Date(iso).getTime()) / 1000
  if (sec < 3600)  return `acum ${Math.round(sec / 60)} min`
  if (sec < 86400) return `acum ${Math.round(sec / 3600)} h`
  return `acum ${Math.round(sec / 86400)} zile`
}

type RescheduleState = { date: string; start: string; end: string }

export default function SalesReturns() {
  const [items, setItems] = useState<Return[]>(MOCK)
  const [loading, setLoading] = useState(true)
  const [rescheduleOpen, setRescheduleOpen] = useState<string | null>(null)
  const [reschedule, setReschedule] = useState<RescheduleState>({ date: new Date(Date.now()+86400000).toISOString().slice(0,10), start: '', end: '' })
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'open' | 'all'>('open')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('livra_attention_items')
        .select('*')
        .order('created_at', { ascending: false })
      if (data && data.length > 0) setItems(data as Return[])
      setLoading(false)
    }
    load()
  }, [])

  async function doReschedule(item: Return) {
    if (!reschedule.date) return
    setSaving(true)

    await supabase
      .from('livra_attention_items')
      .update({ status: 'rescheduled', new_date: reschedule.date, new_window_start: reschedule.start || null, new_window_end: reschedule.end || null })
      .eq('id', item.id)

    await supabase
      .from('livra_deliveries')
      .update({ status: 'upcoming', delivery_date: reschedule.date, time_window_start: reschedule.start || null, time_window_end: reschedule.end || null })
      .eq('id', item.delivery_id)

    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'rescheduled', new_date: reschedule.date, new_window_start: reschedule.start, new_window_end: reschedule.end } : i))
    setSaving(false)
    setRescheduleOpen(null)
  }

  async function doCancel(item: Return) {
    await supabase
      .from('livra_attention_items')
      .update({ status: 'cancelled' })
      .eq('id', item.id)

    await supabase
      .from('livra_deliveries')
      .update({ status: 'cancelled' })
      .eq('id', item.delivery_id)

    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'cancelled' } : i))
  }

  const visible = filter === 'open' ? items.filter(i => i.status === 'open') : items

  const openCount = items.filter(i => i.status === 'open').length

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <Helmet>
        <title>Retururi — Livra Sales</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-zinc-900 dark:text-zinc-50">Retururi</h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Livrări eșuate care necesită acțiune din partea ta
          </p>
        </div>
        {openCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
            <AlertTriangle size={13} className="text-red-500" />
            <span className="text-[13px] font-medium text-red-700 dark:text-red-400">{openCount} necesită atenție</span>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 w-fit">
        {[{ k: 'open', label: 'Active' }, { k: 'all', label: 'Toate' }].map(({ k, label }) => (
          <button
            key={k}
            onClick={() => setFilter(k as 'open' | 'all')}
            className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
              filter === k
                ? 'bg-violet-600 text-white'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Items */}
      {loading ? (
        <div className="text-center py-12 text-zinc-400 text-[13px]">Se încarcă...</div>
      ) : visible.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center">
          <CheckCircle size={32} className="text-emerald-500 mx-auto mb-3" />
          <div className="text-[15px] font-medium text-zinc-800 dark:text-zinc-200">Nicio livrare eșuată</div>
          <div className="text-[13px] text-zinc-400 mt-1">Toate livrările sunt în regulă</div>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(item => (
            <div
              key={item.id}
              className={`bg-white dark:bg-zinc-900 border rounded-xl overflow-hidden transition-colors ${
                item.status === 'open'
                  ? 'border-red-200 dark:border-red-900/50'
                  : item.status === 'rescheduled'
                  ? 'border-emerald-200 dark:border-emerald-900/50'
                  : 'border-zinc-200 dark:border-zinc-800 opacity-60'
              }`}
            >
              {/* Card header */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.status === 'open' ? 'bg-red-50 dark:bg-red-950/40' : item.status === 'rescheduled' ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-zinc-100 dark:bg-zinc-800'
                  }`}>
                    {item.status === 'open'
                      ? <AlertTriangle size={15} className="text-red-500" />
                      : item.status === 'rescheduled'
                      ? <RotateCcw size={15} className="text-emerald-500" />
                      : <Ban size={15} className="text-zinc-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">{item.customer}</span>
                      {item.status === 'rescheduled' && (
                        <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">Reprogramat</span>
                      )}
                      {item.status === 'cancelled' && (
                        <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">Anulat</span>
                      )}
                    </div>
                    <div className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5">{item.address}</div>
                    <div className="mt-2 text-[12px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-md inline-block">
                      Motiv: {item.fail_reason}
                    </div>
                    {item.status === 'rescheduled' && item.new_date && (
                      <div className="mt-2 text-[12px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md inline-block">
                        Reprogramat pentru {item.new_date}
                        {item.new_window_start && `, ${item.new_window_start}–${item.new_window_end}`}
                      </div>
                    )}
                    <div className="text-[11px] text-zinc-400 mt-2">{fmtAgo(item.created_at)}</div>
                  </div>

                  {/* Actions */}
                  {item.status === 'open' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={`tel:${item.phone}`}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                      >
                        <Phone size={12} />
                        {item.phone}
                      </a>
                      <button
                        onClick={() => setRescheduleOpen(rescheduleOpen === item.id ? null : item.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors"
                      >
                        <RotateCcw size={12} />
                        Reprogramează
                      </button>
                      <button
                        onClick={() => doCancel(item)}
                        title="Anulează comanda"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <Ban size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Reschedule panel */}
              {rescheduleOpen === item.id && (
                <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">Programează o nouă livrare</span>
                    <button onClick={() => setRescheduleOpen(null)} className="text-zinc-400 hover:text-zinc-600">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 mb-1.5">
                        <Calendar size={11} /> Dată nouă
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().slice(0,10)}
                        value={reschedule.date}
                        onChange={e => setReschedule(r => ({ ...r, date: e.target.value }))}
                        className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 mb-1.5">
                        <Clock size={11} /> Interval orar (opțional)
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {TIME_WINDOWS.map(tw => {
                          const active = reschedule.start === tw.start && reschedule.end === tw.end
                          return (
                            <button
                              key={tw.label}
                              type="button"
                              onClick={() => {
                                if (active) setReschedule(r => ({ ...r, start: '', end: '' }))
                                else setReschedule(r => ({ ...r, start: tw.start, end: tw.end }))
                              }}
                              className={`py-1 text-[11px] rounded-md border font-medium transition-colors ${
                                active
                                  ? 'bg-violet-600 border-violet-600 text-white'
                                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-violet-400'
                              }`}
                            >
                              {tw.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => doReschedule(item)}
                    disabled={saving || !reschedule.date}
                    className="w-full flex items-center justify-center gap-2 py-2 text-[13px] font-medium rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white transition-colors"
                  >
                    {saving ? <><Loader2 size={13} className="animate-spin" /> Se salvează...</> : 'Confirmă reprogramarea'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
