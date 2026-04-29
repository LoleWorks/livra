import { Helmet } from 'react-helmet-async'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, MapPin, Phone, User, FileText, Package, Clock, Calendar, Loader2, ShoppingCart, Banknote, Truck, Search, X, Plus, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getUser } from '../../lib/auth'

type NominatimResult = { place_id: number; display_name: string; lat: string; lon: string }
type InventoryRow = { sku: string; product_name: string | null; quantity: number; warehouse_id: string }
type InventoryHit = { sku: string; name: string; stock: { warehouseId: string; warehouseName: string; qty: number }[]; totalQty: number }
type Line = { sku: string; name: string; qty: number }

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
  order_value: string
  shipping_cost: string
  package_description: string
  delivery_date: string
  time_window_start: string
  time_window_end: string
}

const EMPTY: Form = {
  customer: '', phone: '', address: '', notes: '',
  order_value: '', shipping_cost: '',
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
  const user = getUser()
  const [form, setForm] = useState<Form>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [addrOpen, setAddrOpen] = useState(false)
  const addrRef = useRef<HTMLDivElement>(null)
  const { results: addrSuggestions, loading: addrLoading } = useAddressSuggestions(addrOpen ? form.address : '')

  // SKU picker state
  const [lines, setLines] = useState<Line[]>([])
  const [skuQuery, setSkuQuery] = useState('')
  const [skuOpen, setSkuOpen] = useState(false)
  const [skuLoading, setSkuLoading] = useState(false)
  const [skuHits, setSkuHits] = useState<InventoryHit[]>([])
  const [warehouseNames, setWarehouseNames] = useState<Record<string, string>>({})
  const [hasInventory, setHasInventory] = useState<boolean | null>(null)
  const skuRef = useRef<HTMLDivElement>(null)
  const skuTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (addrRef.current && !addrRef.current.contains(e.target as Node)) setAddrOpen(false)
      if (skuRef.current && !skuRef.current.contains(e.target as Node)) setSkuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Load warehouse names + check inventory existence once
  useEffect(() => {
    if (!user?.company_id) return
    supabase.from('livra_warehouses')
      .select('id, name')
      .eq('company_id', user.company_id)
      .then(({ data }) => {
        const map: Record<string, string> = {}
        for (const w of (data ?? []) as { id: string; name: string }[]) map[w.id] = w.name
        setWarehouseNames(map)
      })
    supabase.from('livra_inventory')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', user.company_id)
      .then(({ count }) => setHasInventory((count ?? 0) > 0))
  }, [user?.company_id])

  // SKU search (debounced)
  useEffect(() => {
    if (!skuOpen || !user?.company_id) return
    if (skuTimer.current) clearTimeout(skuTimer.current)
    const q = skuQuery.trim()
    skuTimer.current = setTimeout(async () => {
      setSkuLoading(true)
      try {
        let query = supabase
          .from('livra_inventory')
          .select('sku, product_name, quantity, warehouse_id')
          .eq('company_id', user.company_id)
          .gt('quantity', 0)
          .limit(60)
        if (q.length >= 1) {
          const safe = q.replace(/[%,()]/g, ' ')
          query = query.or(`sku.ilike.%${safe}%,product_name.ilike.%${safe}%`)
        }
        const { data } = await query
        const rows = (data ?? []) as InventoryRow[]
        const bySku = new Map<string, InventoryHit>()
        for (const r of rows) {
          const hit = bySku.get(r.sku) ?? {
            sku: r.sku,
            name: r.product_name ?? r.sku,
            stock: [],
            totalQty: 0,
          }
          hit.stock.push({
            warehouseId: r.warehouse_id,
            warehouseName: warehouseNames[r.warehouse_id] ?? '—',
            qty: r.quantity,
          })
          hit.totalQty += r.quantity
          if (!bySku.has(r.sku)) bySku.set(r.sku, hit)
        }
        setSkuHits(Array.from(bySku.values()).slice(0, 10))
      } finally {
        setSkuLoading(false)
      }
    }, 250)
  }, [skuQuery, skuOpen, user?.company_id, warehouseNames])

  function addLine(hit: InventoryHit) {
    setLines(prev => {
      const existing = prev.find(l => l.sku === hit.sku)
      if (existing) {
        return prev.map(l => l.sku === hit.sku ? { ...l, qty: l.qty + 1 } : l)
      }
      return [...prev, { sku: hit.sku, name: hit.name, qty: 1 }]
    })
    setSkuQuery('')
    setSkuOpen(false)
  }

  function updateLineQty(sku: string, qty: number) {
    if (qty <= 0) { setLines(prev => prev.filter(l => l.sku !== sku)); return }
    setLines(prev => prev.map(l => l.sku === sku ? { ...l, qty } : l))
  }

  function removeLine(sku: string) {
    setLines(prev => prev.filter(l => l.sku !== sku))
  }

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
    const itemsText = lines.length
      ? lines.map(l => `${l.qty}x ${l.name} [${l.sku}]`).join(', ')
      : null
    const itemsJson = lines.length ? lines.map(l => ({ sku: l.sku, name: l.name, qty: l.qty })) : null
    const { error: dbErr } = await supabase.from('livra_deliveries').insert({
      customer:            form.customer.trim(),
      phone:               form.phone.trim(),
      address:             form.address.trim(),
      notes:               form.notes.trim() || null,
      order_items:         itemsText,
      order_items_json:    itemsJson,
      order_value:         form.order_value ? parseFloat(form.order_value) : null,
      shipping_cost:       form.shipping_cost ? parseFloat(form.shipping_cost) : null,
      package_description: form.package_description.trim() || null,
      delivery_date:       form.delivery_date,
      time_window_start:   form.time_window_start || null,
      time_window_end:     form.time_window_end || null,
      status:              'upcoming',
      assigned_to:         user?.id ?? null,
      company_id:          user?.company_id ?? null,
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
              {hasInventory === false && (
                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg px-3 py-2 mb-2 text-[12px] text-amber-700 dark:text-amber-300">
                  <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                  <span>Niciun inventar încărcat încă. Cere managerului să încarce fișierul de inventar din ecranul „Inventar".</span>
                </div>
              )}
              <div ref={skuRef} className="relative">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    autoComplete="off"
                    className={`${inputCls} pl-9`}
                    placeholder="Caută produs după SKU sau denumire…"
                    value={skuQuery}
                    onFocus={() => setSkuOpen(true)}
                    onChange={e => { setSkuQuery(e.target.value); setSkuOpen(true) }}
                  />
                  {skuLoading && <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 animate-spin" />}
                </div>
                {skuOpen && (
                  <ul className="absolute z-50 left-0 right-0 top-full mt-1 max-h-72 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
                    {skuHits.length === 0 && !skuLoading && (
                      <li className="px-3 py-3 text-[12px] text-zinc-400 text-center">
                        {hasInventory === false ? 'Niciun produs disponibil' : 'Niciun rezultat'}
                      </li>
                    )}
                    {skuHits.map(hit => (
                      <li key={hit.sku}>
                        <button type="button"
                          className="w-full text-left px-3 py-2 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
                          onMouseDown={e => { e.preventDefault(); addLine(hit) }}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-[13px] text-zinc-800 dark:text-zinc-200 truncate">{hit.name}</div>
                              <div className="text-[11px] text-zinc-400 font-mono">{hit.sku}</div>
                            </div>
                            <div className="flex flex-col items-end flex-shrink-0">
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{hit.totalQty} în stoc</span>
                              <span className="text-[10px] text-zinc-400 truncate max-w-[160px]">
                                {hit.stock.map(s => `${s.warehouseName}: ${s.qty}`).join(' · ')}
                              </span>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {lines.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {lines.map(l => (
                    <li key={l.sku} className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] text-zinc-800 dark:text-zinc-200 truncate">{l.name}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{l.sku}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => updateLineQty(l.sku, l.qty - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700">−</button>
                        <input type="number" min="1" value={l.qty}
                          onChange={e => updateLineQty(l.sku, parseInt(e.target.value || '0', 10))}
                          className="w-12 text-center text-[12px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-orange-400" />
                        <button type="button" onClick={() => updateLineQty(l.sku, l.qty + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700">
                          <Plus size={12} />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeLine(l.sku)}
                        className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                        <X size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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
