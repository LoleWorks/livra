import { Helmet } from 'react-helmet-async'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, MapPin, Phone, User, FileText, Package, Clock, Calendar, Loader2, ShoppingCart, Banknote, Truck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getUser } from '../../lib/auth'

type NominatimResult = { place_id: number; display_name: string; lat: string; lon: string }

function useAddressSuggestions(query: string) {
  const [results, setResults] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (query.length < 3) { setResults([]); return }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          q: query, format: 'json', addressdetails: '0',
          limit: '6', countrycodes: 'md',
          viewbox: '26.6,48.5,30.2,45.4', bounded: '1',
        })
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
          headers: { 'Accept-Language': 'ro', 'User-Agent': 'Livra/1.0' },
        })
        setResults(await res.json())
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 350)
  }, [query])

  return { results, loading }
}

type Form = {
  customer: string
  phone: string
  address: string
  notes: string
  order_items: string
  order_value: string
  shipping_cost: string
  package_description: string
  delivery_date: string
  time_window_start: string
  time_window_end: string
}

const EMPTY: Form = {
  customer: '', phone: '', address: '', notes: '',
  order_items: '', order_value: '', shipping_cost: '',
  package_description: '',
  delivery_date: new Date().toISOString().slice(0, 10),
  time_window_start: '', time_window_end: '',
}

const TIME_WINDOWS = [
  { label: '08:00 – 10:00', start: '08:00', end: '10:00' },
  { label: '10:00 – 12:00', start: '10:00', end: '12:00' },
  { label: '12:00 – 14:00', start: '12:00', end: '14:00' },
  { label: '14:00 – 16:00', start: '14:00', end: '16:00' },
  { label: '16:00 – 18:00', start: '16:00', end: '18:00' },
  { label: '18:00 – 20:00', start: '18:00', end: '20:00' },
]

function Field({ label, icon: Icon, required, children }: { label: string; icon: React.ElementType; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
        <Icon size={12} />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-colors'

export default function SalesNewOrder() {
  const navigate = useNavigate()
  const [form, setForm] = useState<Form>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [addrOpen, setAddrOpen] = useState(false)
  const addrRef = useRef<HTMLDivElement>(null)
  const { results: addrSuggestions, loading: addrLoading } = useAddressSuggestions(addrOpen ? form.address : '')

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (addrRef.current && !addrRef.current.contains(e.target as Node)) setAddrOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function set(key: keyof Form, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setError('')
  }

  function validate() {
    if (!form.customer.trim()) return 'Numele clientului este obligatoriu'
    if (!form.phone.trim()) return 'Telefonul este obligatoriu'
    if (!form.address.trim()) return 'Adresa este obligatorie'
    if (!form.delivery_date) return 'Data livrării este obligatorie'
    if (form.order_value && isNaN(parseFloat(form.order_value))) return 'Valoarea comenzii trebuie să fie un număr'
    if (form.shipping_cost && isNaN(parseFloat(form.shipping_cost))) return 'Costul livrării trebuie să fie un număr'
    return ''
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }

    setSaving(true)
    const user = getUser()
    const { error: dbErr } = await supabase.from('livra_deliveries').insert({
      customer:            form.customer.trim(),
      phone:               form.phone.trim(),
      address:             form.address.trim(),
      notes:               form.notes.trim() || null,
      order_items:         form.order_items.trim() || null,
      order_value:         form.order_value ? parseFloat(form.order_value) : null,
      shipping_cost:       form.shipping_cost ? parseFloat(form.shipping_cost) : null,
      package_description: form.package_description.trim() || null,
      delivery_date:       form.delivery_date,
      time_window_start:   form.time_window_start || null,
      time_window_end:     form.time_window_end || null,
      status:              'upcoming',
      assigned_to:         user?.id ?? null,
      company_id:          null, // sales managers don't have a direct company_id lookup here
    })
    setSaving(false)

    if (dbErr) { setError('Eroare la salvare: ' + dbErr.message); return }

    setDone(true)
    setTimeout(() => navigate('/sales/comenzi'), 1800)
  }

  if (done) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <div className="text-center">
          <div className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-50">Comandă adăugată!</div>
          <div className="text-[13px] text-zinc-400 mt-1">Redirecționare către lista de comenzi...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <Helmet>
        <title>Comandă nouă | Livra Sales</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-[18px] font-semibold text-zinc-900 dark:text-zinc-50">Comandă nouă</h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">Completează detaliile comenzii și livrării.</p>
        </div>

        <form onSubmit={submit} className="space-y-5">

          {/* Customer info */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wide">Informații client</div>

            <Field label="Nume client" icon={User} required>
              <input type="text" className={inputCls} placeholder="ex. Maria Ionescu"
                value={form.customer} onChange={e => set('customer', e.target.value)} />
            </Field>

            <Field label="Telefon" icon={Phone} required>
              <input type="tel" className={inputCls} placeholder="ex. 069 123 456"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </Field>

            <Field label="Adresa de livrare" icon={MapPin} required>
              <div ref={addrRef} className="relative">
                <input type="text" className={inputCls} placeholder="ex. str. Ismail 12, Chișinău"
                  value={form.address} autoComplete="off"
                  onChange={e => { set('address', e.target.value); setAddrOpen(true) }}
                  onFocus={() => setAddrOpen(true)} />
                {addrLoading && <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 animate-spin" />}
                {addrOpen && addrSuggestions.length > 0 && (
                  <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden">
                    {addrSuggestions.map(r => {
                      const parts = r.display_name.split(', ')
                      const main = parts.slice(0, 2).join(', ')
                      const sub = parts.slice(2).join(', ')
                      return (
                        <li key={r.place_id}>
                          <button type="button"
                            className="w-full text-left px-3 py-2.5 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
                            onMouseDown={e => { e.preventDefault(); set('address', main); setAddrOpen(false) }}>
                            <div className="flex items-start gap-2">
                              <MapPin size={12} className="text-brand-orange flex-shrink-0 mt-0.5" />
                              <div>
                                <div className="text-[13px] text-zinc-800 dark:text-zinc-200">{main}</div>
                                {sub && <div className="text-[11px] text-zinc-400 truncate">{sub}</div>}
                              </div>
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </Field>

            <Field label="Notițe" icon={FileText}>
              <input type="text" className={inputCls} placeholder="ex. Interfon 3, etaj 2, sună înainte"
                value={form.notes} onChange={e => set('notes', e.target.value)} />
            </Field>
          </div>

          {/* Order details */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wide">Detalii comandă</div>

            <Field label="Produse comandate" icon={ShoppingCart}>
              <textarea className={`${inputCls} resize-none`} rows={2}
                placeholder="ex. 2x Tricou alb M, 1x Pantaloni negri L"
                value={form.order_items} onChange={e => set('order_items', e.target.value)} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Valoare comandă (lei)" icon={Banknote}>
                <input type="number" min="0" step="0.01" className={inputCls} placeholder="ex. 450.00"
                  value={form.order_value} onChange={e => set('order_value', e.target.value)} />
              </Field>
              <Field label="Cost livrare (lei)" icon={Truck}>
                <input type="number" min="0" step="0.01" className={inputCls} placeholder="ex. 35.00"
                  value={form.shipping_cost} onChange={e => set('shipping_cost', e.target.value)} />
              </Field>
            </div>

            <Field label="Descriere colet" icon={Package}>
              <input type="text" className={inputCls} placeholder="ex. 2x cutii medii, fragil"
                value={form.package_description} onChange={e => set('package_description', e.target.value)} />
            </Field>
          </div>

          {/* Delivery schedule */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wide">Programare livrare</div>

            <Field label="Data livrării" icon={Calendar} required>
              <input type="date" className={inputCls}
                min={new Date().toISOString().slice(0, 10)}
                value={form.delivery_date} onChange={e => set('delivery_date', e.target.value)} />
            </Field>

            <Field label="Interval orar preferat de client" icon={Clock}>
              <div className="grid grid-cols-3 gap-2">
                {TIME_WINDOWS.map(tw => {
                  const active = form.time_window_start === tw.start && form.time_window_end === tw.end
                  return (
                    <button key={tw.label} type="button"
                      onClick={() => {
                        if (active) { set('time_window_start', ''); set('time_window_end', '') }
                        else { set('time_window_start', tw.start); set('time_window_end', tw.end) }
                      }}
                      className={`py-2 px-2 text-[12px] rounded-lg border font-medium transition-colors ${
                        active
                          ? 'bg-brand-orange border-brand-orange text-white'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-orange-400 hover:text-brand-orange dark:hover:text-orange-400'
                      }`}>
                      {tw.label}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="time" value={form.time_window_start}
                  onChange={e => set('time_window_start', e.target.value)}
                  className="flex-1 px-3 py-1.5 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400" />
                <span className="text-[12px] text-zinc-400">până la</span>
                <input type="time" value={form.time_window_end}
                  onChange={e => set('time_window_end', e.target.value)}
                  className="flex-1 px-3 py-1.5 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400" />
              </div>
            </Field>

            {form.time_window_start && (
              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40 rounded-lg px-3 py-2 text-[12px] text-orange-700 dark:text-orange-300">
                Livrare programată: <strong>{form.delivery_date}</strong>, interval <strong>{form.time_window_start}–{form.time_window_end}</strong>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg px-4 py-3 text-[13px] text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/sales/comenzi')}
              className="flex-1 py-2.5 text-[13px] font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Anulează
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-medium rounded-lg bg-brand-orange hover:bg-orange-500 disabled:opacity-60 text-white transition-colors">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Se salvează...</> : 'Adaugă comanda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
