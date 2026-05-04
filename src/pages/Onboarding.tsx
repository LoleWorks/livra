import { Helmet } from 'react-helmet-async'
import { useState, useEffect, useRef } from 'react'
import {
  Building2, MapPin, Truck, Check, Plus, Trash2,
  Eye, EyeOff, Loader2, ChevronRight, ChevronLeft,
  RefreshCw, Copy, Mail, Lock, Phone, User, Warehouse,
  ShoppingBag, ShoppingCart, Download, ChevronDown, ChevronUp,
  Package, Upload, X, AlertCircle, Star, Webhook, Code2,
  UserCog, CheckCircle2, XCircle,
} from 'lucide-react'
import { MapContainer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { YandexMapLayer } from '../components/YandexLayer'
import { supabase } from '../lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

type CompanyForm      = { company_name: string; name: string; email: string; phone: string; password: string }
type WarehouseRow     = { _id: string; name: string; address: string; lat: number | null; lng: number | null }
type DriverRow        = { _id: string; name: string; phone: string; pin: string; home_warehouse_id: string | null }
type SalesManagerRow  = { _id: string; name: string; email: string; phone: string; password: string }
type ParsedRow        = { sku: string; product_name: string; quantity: number }
type FieldMapping = { sku: string; product_name: string; quantity: string }

// ── CSV helpers (same logic as WarehouseDetail) ───────────────────────────────

function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (c === '"') inQuotes = false
      else cell += c
    } else {
      if (c === '"') inQuotes = true
      else if (c === ',' || c === ';' || c === '\t') { row.push(cell); cell = '' }
      else if (c === '\r') { /* skip */ }
      else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = '' }
      else cell += c
    }
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row) }
  return rows.filter(r => r.some(v => v.trim().length))
}

function guessMapping(headers: string[]): FieldMapping {
  const h = headers.map(s => s.trim().toLowerCase())
  const find = (...terms: string[]) => {
    for (const term of terms) {
      const idx = h.findIndex(col => col.includes(term))
      if (idx >= 0) return headers[idx]
    }
    return ''
  }
  return {
    sku: find('артикул', 'sku', 'cod ', 'cod_', '\tcod', 'код', 'арт'),
    product_name: find('наименование', 'номенклатура', 'produs', 'product', 'товар', 'name', 'denumire'),
    quantity: find('количество', 'cantitate', 'qty', 'quantity', 'stoc', 'кол', 'остат'),
  }
}

// ── Integration guide data ────────────────────────────────────────────────────

const WEBHOOK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-orders`

type Platform = 'woocommerce' | 'opencart'

const PLATFORMS: Record<Platform, {
  label: string
  version: string
  color: string
  bg: string
  icon: React.ReactNode
  downloadHref: string
  steps: string[]
}> = {
  woocommerce: {
    label: 'WooCommerce',
    version: 'WordPress + WooCommerce',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800',
    icon: <ShoppingBag size={16} />,
    downloadHref: '/plugins/livra-woocommerce.zip',
    steps: [
      'Descarcă plugin-ul Livra pentru WooCommerce (butonul de mai sus)',
      'Intră în WordPress → Plugins → Adaugă nou → Încarcă plugin',
      'Selectează fișierul .zip descărcat și apasă Instalează acum',
      'Activează plugin-ul după instalare',
      'Mergi la WooCommerce → Setări → tab-ul Livra',
      'Lipește URL-ul Webhook în câmpul "URL Webhook"',
      'Lipește Cheia API în câmpul "Cheie API" și salvează',
    ],
  },
  opencart: {
    label: 'OpenCart',
    version: 'OpenCart 3.x / 4.x',
    color: 'text-orange-500 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
    icon: <ShoppingCart size={16} />,
    downloadHref: '/plugins/livra-opencart.ocmod.zip',
    steps: [
      'Descarcă extensia Livra pentru OpenCart (butonul de mai sus)',
      'Intră în admin OpenCart → Extensions → Installer',
      'Încarcă fișierul .ocmod.zip și apasă Install',
      'Mergi la Extensions → Extensions → Modules → Livra → Install',
      'Apasă Edit, bifează Status: Enabled',
      'Lipește URL-ul Webhook și Cheia API în câmpuri',
      'Salvează setările — comenzile vor veni automat',
    ],
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomPin() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function randomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(10)))
    .map(b => chars[b % chars.length]).join('')
}

function newWarehouse(): WarehouseRow {
  return { _id: Math.random().toString(36).slice(2), name: '', address: '', lat: null, lng: null }
}

function newSalesManager(): SalesManagerRow {
  return { _id: Math.random().toString(36).slice(2), name: '', email: '', phone: '', password: randomPassword() }
}

// ── Shared style atoms ────────────────────────────────────────────────────────

const iCls = [
  'w-full px-3 py-2.5 text-[13px]',
  'bg-zinc-50 dark:bg-zinc-800',
  'border border-zinc-200 dark:border-zinc-700 rounded-lg',
  'text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400',
  'focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400',
  'transition-colors',
].join(' ')

const iIconCls = [
  'w-full pl-9 pr-3 py-2.5 text-[13px]',
  'bg-zinc-50 dark:bg-zinc-800',
  'border border-zinc-200 dark:border-zinc-700 rounded-lg',
  'text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400',
  'focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400',
  'transition-colors',
].join(' ')

const lCls = 'text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block mb-1.5'

// ── Map helpers ───────────────────────────────────────────────────────────────

const warehousePinIcon = L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;background:#ff5c2c;border:3px solid white;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) })
  return null
}

function MapFlyTo({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap()
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 15, { animate: true })
  }, [lat, lng])
  return null
}

// ── Step config ───────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Companie',  Icon: Building2 },
  { label: 'Depozite',  Icon: Warehouse  },
  { label: 'Inventar',  Icon: Package    },
  { label: 'Șoferi',    Icon: Truck      },
  { label: 'Manageri',  Icon: UserCog    },
  { label: 'Confirmare', Icon: Check     },
  { label: 'Integrare', Icon: Webhook    },
]

// ── Main component ────────────────────────────────────────────────────────────

export default function Onboarding() {
  const [step, setStep]               = useState(1)
  const [company, setCompany]         = useState<CompanyForm>({ company_name: '', name: '', email: '', phone: '', password: '' })
  const [warehouses, setWarehouses]   = useState<WarehouseRow[]>([newWarehouse()])
  const [inventories, setInventories] = useState<Record<string, ParsedRow[]>>({})
  const [drivers, setDrivers]         = useState<DriverRow[]>([])
  const [salesManagers, setSalesManagers] = useState<SalesManagerRow[]>([])
  const [showPw, setShowPw]           = useState(false)
  const [busy, setBusy]               = useState(false)
  const [error, setError]             = useState('')
  const [result, setResult]           = useState<{ adminId: string; apiKey: string } | null>(null)
  const [copied, setCopied]           = useState<string | null>(null)

  // ── Warehouse helpers ──────────────────────────────────────────────────────

  function addWarehouse() {
    setWarehouses(p => [...p, newWarehouse()])
  }
  function removeWarehouse(id: string) {
    setWarehouses(p => p.filter(w => w._id !== id))
    setInventories(p => { const n = { ...p }; delete n[id]; return n })
  }
  function updateWarehouse(id: string, patch: Partial<Omit<WarehouseRow, '_id'>>) {
    setWarehouses(p => p.map(w => w._id === id ? { ...w, ...patch } : w))
  }

  // ── Driver helpers ─────────────────────────────────────────────────────────

  function addDriver() {
    const defaultWarehouse = warehouses[0]?._id ?? null
    setDrivers(p => [...p, { _id: Math.random().toString(36).slice(2), name: '', phone: '', pin: randomPin(), home_warehouse_id: defaultWarehouse }])
  }
  function removeDriver(id: string) {
    setDrivers(p => p.filter(d => d._id !== id))
  }
  function updateDriver(id: string, patch: Partial<Omit<DriverRow, '_id'>>) {
    setDrivers(p => p.map(d => d._id === id ? { ...d, ...patch } : d))
  }

  // ── Sales manager helpers ──────────────────────────────────────────────────

  function addSalesManager() {
    setSalesManagers(p => [...p, newSalesManager()])
  }
  function removeSalesManager(id: string) {
    setSalesManagers(p => p.filter(m => m._id !== id))
  }
  function updateSalesManager(id: string, patch: Partial<Omit<SalesManagerRow, '_id'>>) {
    setSalesManagers(p => p.map(m => m._id === id ? { ...m, ...patch } : m))
  }

  // ── Copy helper ────────────────────────────────────────────────────────────

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  // ── Validation ─────────────────────────────────────────────────────────────

  function validate() {
    if (step === 1) {
      if (!company.company_name.trim())  return 'Introduceți numele companiei'
      if (!company.name.trim())          return 'Introduceți numele adminului'
      if (!company.email.includes('@'))  return 'Email invalid'
      if (company.password.length < 8)  return 'Parola trebuie să aibă minim 8 caractere'
    }
    if (step === 2) {
      if (warehouses.length === 0) return 'Adăugați cel puțin un depozit'
      for (const w of warehouses) {
        if (!w.name.trim()) return 'Completați denumirea pentru fiecare depozit'
        if (!w.address.trim() && !w.lat) return 'Fiecare depozit trebuie să aibă adresă sau locație pe hartă'
      }
    }
    // step 3 (inventory) — optional
    if (step === 4) {
      for (const d of drivers) {
        if (!d.name.trim())          return 'Completați numele pentru fiecare șofer'
        if (!d.phone.trim())         return 'Completați numărul de telefon pentru fiecare șofer'
        if (!/^\d{4}$/.test(d.pin)) return 'PIN-ul trebuie să fie exact 4 cifre'
      }
      const pins = drivers.map(d => d.pin)
      if (new Set(pins).size !== pins.length) return 'Doi șoferi au același PIN — fiecare PIN trebuie să fie unic'
    }
    if (step === 5) {
      for (const m of salesManagers) {
        if (!m.name.trim())             return 'Completați numele pentru fiecare manager'
        if (!m.email.includes('@'))     return 'Email invalid pentru un manager'
        if (m.password.length < 6)     return 'Parola managerului trebuie să aibă minim 6 caractere'
      }
      const emails = salesManagers.map(m => m.email.toLowerCase())
      if (new Set(emails).size !== emails.length) return 'Doi manageri au același email'
    }
    return null
  }

  async function next() {
    setError('')
    const err = validate()
    if (err) { setError(err); return }

    if (step === 4 && drivers.length > 0) {
      setBusy(true)
      for (const d of drivers) {
        const { data } = await supabase.functions.invoke('check-driver-pin', { body: { pin: d.pin } })
        if (!data?.available) {
          setError(`PIN-ul ${d.pin} (${d.name || 'șofer'}) este deja folosit în platformă. Generați un PIN nou.`)
          setBusy(false)
          return
        }
      }
      setBusy(false)
    }

    setStep(s => (s + 1) as any)
  }

  function back() {
    setError('')
    setStep(s => (s - 1) as any)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleCreate() {
    setBusy(true)
    setError('')
    try {
      const body = {
        company,
        warehouses: warehouses.map((w, i) => ({
          _id: w._id,
          name: w.name,
          address: w.address,
          lat: w.lat ?? null,
          lng: w.lng ?? null,
          is_default: i === 0,
          inventory: inventories[w._id] ?? [],
        })),
        drivers: drivers.map(d => ({
          name: d.name,
          phone: d.phone,
          pin: d.pin,
          home_warehouse_id: d.home_warehouse_id,
        })),
        salesManagers: salesManagers.map(m => ({
          name: m.name,
          email: m.email,
          phone: m.phone,
          password: m.password,
        })),
      }
      const { data, error: fnErr } = await supabase.functions.invoke('setup-company', { body })
      if (fnErr || !data?.success) {
        setError(data?.error ?? fnErr?.message ?? 'Eroare necunoscută')
        return
      }
      setResult({ adminId: data.adminId, apiKey: data.apiKey })
      setStep(7 as any)
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    setStep(1)
    setCompany({ company_name: '', name: '', email: '', phone: '', password: '' })
    setWarehouses([newWarehouse()])
    setInventories({})
    setDrivers([])
    setSalesManagers([])
    setResult(null)
    setError('')
    setShowPw(false)
  }

  // ── Wizard ─────────────────────────────────────────────────────────────────

  const { Icon: StepIcon } = STEPS[step - 1]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-start py-10 px-4">
      <Helmet>
        <title>Onboarding client | Livra</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <span className="text-[28px] font-bold text-[#161513] dark:text-white tracking-widest uppercase font-serif leading-none">LIVRA</span>
        <svg width="72" height="5" viewBox="0 0 72 5">
          <line x1="0" y1="2.5" x2="58" y2="2.5" stroke="#ff5c2c" strokeWidth="2" />
          <polygon points="58,0.5 72,2.5 58,4.5" fill="#ff5c2c" />
        </svg>
        <p className="text-[13px] text-zinc-400 dark:text-zinc-500 mt-2">Configurare client nou</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-start w-full max-w-xl mb-8">
        {STEPS.map((s, i) => {
          const n = i + 1
          const isActive = n === step
          const isDone   = n < step
          return (
            <div key={n} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all',
                  isDone   ? 'bg-orange-500 text-white' :
                  isActive ? 'bg-orange-500 text-white ring-4 ring-orange-200 dark:ring-orange-900/40' :
                             'bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-400',
                ].join(' ')}>
                  {isDone ? <Check size={13} strokeWidth={3} /> : n}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${isActive ? 'text-orange-500' : 'text-zinc-400 dark:text-zinc-500'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-[2px] flex-1 mx-2 mt-[-14px] rounded-full transition-colors ${isDone ? 'bg-orange-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Card */}
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <StepIcon size={15} className="text-orange-500 flex-shrink-0" />
          <span className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-200">
            {step === 1 && 'Date companie și cont admin'}
            {step === 2 && 'Depozite'}
            {step === 3 && 'Inventar inițial'}
            {step === 4 && 'Șoferi'}
            {step === 5 && 'Manageri vânzări'}
            {step === 6 && 'Verificare și confirmare'}
            {step === 7 && 'Conectare magazin'}
          </span>
          {step < 7 && <span className="ml-auto text-[11px] text-zinc-400 flex-shrink-0">Pasul {step} din 6</span>}
          {step === 7 && <span className="ml-auto text-[11px] text-emerald-500 font-medium flex-shrink-0">✓ Cont creat</span>}
        </div>

        {/* Card body */}
        <div className="p-6">
          {step === 1 && <Step1 company={company} setCompany={setCompany} showPw={showPw} setShowPw={setShowPw} />}
          {step === 2 && <Step2Warehouses warehouses={warehouses} add={addWarehouse} remove={removeWarehouse} update={updateWarehouse} />}
          {step === 3 && <Step3Inventory warehouses={warehouses} inventories={inventories} setInventories={setInventories} />}
          {step === 4 && <Step4Drivers drivers={drivers} warehouses={warehouses} add={addDriver} remove={removeDriver} update={updateDriver} />}
          {step === 5 && <Step5SalesManagers managers={salesManagers} add={addSalesManager} remove={removeSalesManager} update={updateSalesManager} />}
          {step === 6 && <Step6Review company={company} warehouses={warehouses} inventories={inventories} drivers={drivers} salesManagers={salesManagers} />}
          {step === 7 && result && <Step7Integration company={company} drivers={drivers} apiKey={result.apiKey} copy={copy} copied={copied} />}

          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg px-3 py-2.5 text-[12px] text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Card footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 dark:border-zinc-800">
          {step > 1 && step < 7
            ? (
              <button onClick={back} className="flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                <ChevronLeft size={15} /> Înapoi
              </button>
            )
            : <div />
          }

          {step < 6 && (
            <button onClick={next} disabled={busy} className="flex items-center gap-1.5 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-[13px] font-semibold rounded-lg transition-colors">
              {busy ? <Loader2 size={14} className="animate-spin" /> : null}
              {step === 3 ? 'Continuă (opțional)' : step === 5 ? 'Continuă (opțional)' : 'Continuă'} <ChevronRight size={15} />
            </button>
          )}

          {step === 6 && (
            <button
              onClick={handleCreate}
              disabled={busy}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-[13px] font-semibold rounded-lg transition-colors"
            >
              {busy
                ? <><Loader2 size={14} className="animate-spin" /> Se creează...</>
                : <><Check size={14} /> Creează cont</>
              }
            </button>
          )}

          {step === 7 && (
            <button
              onClick={reset}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-[13px] font-semibold rounded-lg transition-colors"
            >
              <Check size={14} /> Finalizează onboarding
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Step 1: Company / Admin ───────────────────────────────────────────────────

function Step1({ company, setCompany, showPw, setShowPw }: {
  company: CompanyForm
  setCompany: React.Dispatch<React.SetStateAction<CompanyForm>>
  showPw: boolean
  setShowPw: (v: boolean) => void
}) {
  const set = (f: keyof CompanyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCompany(p => ({ ...p, [f]: e.target.value }))

  return (
    <div className="space-y-4">
      <div>
        <label className={lCls}>Nume companie *</label>
        <div className="relative">
          <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input autoFocus value={company.company_name} onChange={set('company_name')} placeholder="Ex: Firma SRL" className={iIconCls} />
        </div>
      </div>
      <div>
        <label className={lCls}>Nume admin *</label>
        <div className="relative">
          <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input value={company.name} onChange={set('name')} placeholder="Ion Popescu" className={iIconCls} />
        </div>
      </div>
      <div>
        <label className={lCls}>Email *</label>
        <div className="relative">
          <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="email" value={company.email} onChange={set('email')} placeholder="ion@firma.md" className={iIconCls} />
        </div>
      </div>
      <div>
        <label className={lCls}>Telefon</label>
        <div className="relative">
          <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input value={company.phone} onChange={set('phone')} placeholder="069 000 000" className={iIconCls} />
        </div>
      </div>
      <div>
        <label className={lCls}>Parolă *</label>
        <div className="relative">
          <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type={showPw ? 'text' : 'password'}
            value={company.password}
            onChange={set('password')}
            placeholder="min. 8 caractere"
            className={`${iIconCls} pr-9`}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5">
          Clientul va putea schimba parola după prima autentificare.
        </p>
      </div>
    </div>
  )
}

// ── Step 2: Warehouses ────────────────────────────────────────────────────────

function Step2Warehouses({ warehouses, add, remove, update }: {
  warehouses: WarehouseRow[]
  add: () => void
  remove: (id: string) => void
  update: (id: string, patch: Partial<Omit<WarehouseRow, '_id'>>) => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(warehouses[0]?._id ?? null)

  function toggle(id: string) {
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <div className="space-y-3">
      {warehouses.map((w, i) => (
        <WarehouseCard
          key={w._id}
          warehouse={w}
          index={i}
          expanded={expandedId === w._id}
          canDelete={warehouses.length > 1}
          onToggle={() => toggle(w._id)}
          onDelete={() => remove(w._id)}
          onUpdate={(patch) => update(w._id, patch)}
        />
      ))}

      <button
        onClick={() => { add(); setExpandedId(warehouses[warehouses.length]?._id ?? null) }}
        className="flex items-center gap-1.5 text-[13px] font-medium text-orange-500 hover:text-orange-600 transition-colors"
      >
        <Plus size={14} /> Adaugă depozit
      </button>

      <p className="text-[12px] text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3">
        Primul depozit va fi setat ca implicit. Poți adăuga mai multe depozite mai târziu din panoul de control.
      </p>
    </div>
  )
}

function WarehouseCard({ warehouse, index, expanded, canDelete, onToggle, onDelete, onUpdate }: {
  warehouse: WarehouseRow
  index: number
  expanded: boolean
  canDelete: boolean
  onToggle: () => void
  onDelete: () => void
  onUpdate: (patch: Partial<Omit<WarehouseRow, '_id'>>) => void
}) {
  const [geocoding, setGeocoding] = useState(false)

  async function geocodeAddress() {
    if (!warehouse.address.trim()) return
    setGeocoding(true)
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(warehouse.address + ', Moldova')}&format=json&limit=1`,
        { headers: { 'User-Agent': 'Livra/1.0' } },
      )
      const data = await r.json()
      if (data?.[0]) onUpdate({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
    } finally {
      setGeocoding(false)
    }
  }

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'User-Agent': 'Livra/1.0' } },
      )
      const data = await r.json()
      if (data?.address) {
        const { road, house_number, city, town, village } = data.address
        const street = [road, house_number].filter(Boolean).join(' ')
        const locality = city ?? town ?? village ?? ''
        onUpdate({ address: [street, locality].filter(Boolean).join(', ') })
      }
    } catch {}
  }

  function handleMapClick(lat: number, lng: number) {
    onUpdate({ lat, lng })
    reverseGeocode(lat, lng)
  }

  function handleDragEnd(e: L.DragEndEvent) {
    const { lat, lng } = (e.target as L.Marker).getLatLng()
    onUpdate({ lat, lng })
    reverseGeocode(lat, lng)
  }

  const MOLDOVA: [number, number] = [47.0245, 28.8322]
  const displayName = warehouse.name.trim() || `Depozit ${index + 1}`

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
        onClick={onToggle}
      >
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold ${index === 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
          {index === 0 ? <Star size={12} /> : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">{displayName}</div>
          {!expanded && (warehouse.address || warehouse.lat) && (
            <div className="text-[11px] text-zinc-400 truncate mt-0.5">
              {warehouse.address || `${warehouse.lat?.toFixed(4)}, ${warehouse.lng?.toFixed(4)}`}
            </div>
          )}
        </div>
        {warehouse.lat && !expanded && (
          <MapPin size={12} className="text-orange-400 flex-shrink-0" />
        )}
        {canDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition-colors flex-shrink-0"
          >
            <Trash2 size={13} />
          </button>
        )}
        {expanded ? <ChevronUp size={14} className="text-zinc-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-zinc-400 flex-shrink-0" />}
      </div>

      {/* Expanded form */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <div>
            <label className={lCls}>Denumire depozit *</label>
            <input
              value={warehouse.name}
              onChange={e => onUpdate({ name: e.target.value })}
              placeholder="Ex: Depozit Central"
              className={iCls}
            />
          </div>

          <div>
            <label className={lCls}>Adresă</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={warehouse.address}
                  onChange={e => onUpdate({ address: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && geocodeAddress()}
                  placeholder="str. Exemplu 1, Chișinău"
                  className={iIconCls}
                />
              </div>
              <button
                type="button"
                onClick={geocodeAddress}
                disabled={geocoding || !warehouse.address.trim()}
                className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[12px] font-semibold text-zinc-600 dark:text-zinc-300 disabled:opacity-40 transition-colors flex-shrink-0 flex items-center gap-1.5"
              >
                {geocoding ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
                Caută
              </button>
            </div>
          </div>

          <div>
            <label className={lCls}>Locație pe hartă *</label>
            <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700" style={{ height: 260 }}>
              <MapContainer
                center={MOLDOVA}
                zoom={8}
                crs={L.CRS.EPSG3395}
                style={{ height: '100%', width: '100%' }}
              >
                <YandexMapLayer />
                <MapClickHandler onMapClick={handleMapClick} />
                <MapFlyTo lat={warehouse.lat} lng={warehouse.lng} />
                {warehouse.lat && warehouse.lng && (
                  <Marker
                    position={[warehouse.lat, warehouse.lng]}
                    icon={warehousePinIcon}
                    draggable
                    eventHandlers={{ dragend: handleDragEnd }}
                  />
                )}
              </MapContainer>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5">
              {warehouse.lat
                ? '✓ Pin plasat · Trage pentru a ajusta poziția'
                : 'Apasă pe hartă pentru a plasa pinul · sau caută adresa mai sus'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Step 3: Inventory ─────────────────────────────────────────────────────────

const MAPPING_FIELDS: { field: keyof FieldMapping; label: string; required: boolean; hint: string }[] = [
  { field: 'sku',          label: 'SKU / Articol',   required: true,  hint: '1C: Артикул' },
  { field: 'product_name', label: 'Denumire produs', required: false, hint: '1C: Наименование' },
  { field: 'quantity',     label: 'Cantitate',       required: true,  hint: '1C: Количество' },
]

function Step3Inventory({ warehouses, inventories, setInventories }: {
  warehouses: WarehouseRow[]
  inventories: Record<string, ParsedRow[]>
  setInventories: React.Dispatch<React.SetStateAction<Record<string, ParsedRow[]>>>
}) {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [activeId, setActiveId]           = useState<string | null>(null)
  const [rawFile, setRawFile]             = useState<{ headers: string[]; rows: string[][]; fileName: string } | null>(null)
  const [mapping, setMapping]             = useState<FieldMapping>({ sku: '', product_name: '', quantity: '' })
  const [showMapping, setShowMapping]     = useState(false)
  const [preview, setPreview]             = useState<{ rows: ParsedRow[]; fileName: string; warehouseId: string } | null>(null)
  const [parseErr, setParseErr]           = useState<string | null>(null)

  async function onFile(warehouseId: string, file: File) {
    setParseErr(null)
    setActiveId(warehouseId)
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      if (rows.length < 2) throw new Error('Fișierul este gol sau nu are antet.')
      const headers = rows[0].map(h => h.trim())
      setRawFile({ headers, rows: rows.slice(1), fileName: file.name })
      setMapping(guessMapping(headers))
      setShowMapping(true)
    } catch (e) {
      setParseErr(e instanceof Error ? e.message : 'Eroare la citirea fișierului.')
    }
    const ref = fileRefs.current[warehouseId]
    if (ref) ref.value = ''
  }

  function applyMapping() {
    if (!rawFile || !activeId) return
    const { headers, rows, fileName } = rawFile
    const skuIdx  = headers.indexOf(mapping.sku)
    const nameIdx = mapping.product_name ? headers.indexOf(mapping.product_name) : -1
    const qtyIdx  = headers.indexOf(mapping.quantity)

    const parsed: ParsedRow[] = []
    for (const r of rows) {
      const sku = (r[skuIdx] ?? '').trim()
      const qty = parseFloat((r[qtyIdx] ?? '0').replace(',', '.'))
      if (!sku || isNaN(qty)) continue
      parsed.push({ sku, quantity: qty, product_name: nameIdx >= 0 ? (r[nameIdx] ?? '').trim() : '' })
    }

    if (!parsed.length) {
      setParseErr('Niciun rând valid găsit cu maparea selectată.')
      setShowMapping(false)
      setRawFile(null)
      return
    }

    setShowMapping(false)
    setRawFile(null)
    setPreview({ rows: parsed, fileName, warehouseId: activeId })
  }

  function confirmPreview() {
    if (!preview) return
    setInventories(p => ({ ...p, [preview.warehouseId]: preview.rows }))
    setPreview(null)
    setActiveId(null)
  }

  const canApply = !!mapping.sku && !!mapping.quantity

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-4">
        Încarcă inventarul inițial pentru fiecare depozit. Acest pas este opțional — poți adăuga inventar mai târziu din panoul de control.
      </p>

      {warehouses.map((w, i) => {
        const rows = inventories[w._id]
        const hasInventory = rows && rows.length > 0
        return (
          <div key={w._id} className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${hasInventory ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                {hasInventory
                  ? <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
                  : <Package size={13} className="text-zinc-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">
                  {w.name || `Depozit ${i + 1}`}
                  {i === 0 && <span className="ml-2 text-[10px] text-orange-500 font-normal">(implicit)</span>}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {hasInventory
                    ? `${rows.length} produse încărcate`
                    : 'Niciun inventar — click pentru a încărca'}
                </div>
              </div>
              <button
                onClick={() => fileRefs.current[w._id]?.click()}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors flex-shrink-0',
                  hasInventory
                    ? 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                    : 'bg-orange-500 hover:bg-orange-600 text-white',
                ].join(' ')}
              >
                <Upload size={12} />
                {hasInventory ? 'Înlocuiește' : 'Încarcă CSV'}
              </button>
              <input
                ref={el => { fileRefs.current[w._id] = el }}
                type="file"
                accept=".csv,.tsv,.txt,text/csv,text/plain"
                hidden
                onChange={e => { const f = e.target.files?.[0]; if (f) onFile(w._id, f) }}
              />
            </div>

            {/* Inline preview of already-uploaded inventory */}
            {hasInventory && (
              <div className="border-t border-zinc-100 dark:border-zinc-800 overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="text-left px-3 py-1.5 text-zinc-500 font-medium">SKU</th>
                      <th className="text-left px-3 py-1.5 text-zinc-500 font-medium">Produs</th>
                      <th className="text-right px-3 py-1.5 text-zinc-500 font-medium">Cant.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((r, ri) => (
                      <tr key={ri} className="border-t border-zinc-100 dark:border-zinc-800">
                        <td className="px-3 py-1.5 font-mono text-zinc-700 dark:text-zinc-300">{r.sku}</td>
                        <td className="px-3 py-1.5 text-zinc-500 dark:text-zinc-400 truncate max-w-[160px]">{r.product_name || '—'}</td>
                        <td className="px-3 py-1.5 text-right text-zinc-700 dark:text-zinc-300">{r.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 5 && (
                  <div className="text-center text-[11px] text-zinc-400 py-1.5 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800">
                    + {rows.length - 5} rânduri suplimentare
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {parseErr && (
        <div className="flex items-center gap-2 text-[12px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg px-3 py-2.5">
          <AlertCircle size={13} /> {parseErr}
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">Previzualizare inventar</h2>
              <button onClick={() => setPreview(null)} className="p-1 text-zinc-400 hover:text-zinc-600">
                <X size={16} />
              </button>
            </div>
            <p className="text-[12px] text-zinc-500 mb-4">{preview.fileName} · {preview.rows.length} rânduri</p>
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 mb-4">
              <table className="w-full text-[12px]">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                  <tr>
                    <th className="text-left px-3 py-2 text-zinc-500 font-medium">SKU</th>
                    <th className="text-left px-3 py-2 text-zinc-500 font-medium">Produs</th>
                    <th className="text-right px-3 py-2 text-zinc-500 font-medium">Cant.</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, 50).map((r, i) => (
                    <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="px-3 py-1.5 font-mono text-zinc-700 dark:text-zinc-300">{r.sku}</td>
                      <td className="px-3 py-1.5 text-zinc-600 dark:text-zinc-400">{r.product_name || '—'}</td>
                      <td className="px-3 py-1.5 text-right text-zinc-700 dark:text-zinc-300">{r.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.rows.length > 50 && (
                <div className="text-center text-[11px] text-zinc-400 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
                  + {preview.rows.length - 50} rânduri suplimentare
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setPreview(null)} className="px-3 py-2 text-[12px] text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">Anulează</button>
              <button onClick={confirmPreview} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-[12px] font-semibold rounded-lg">
                Confirmă și salvează
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Column mapping modal */}
      {showMapping && rawFile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowMapping(false); setRawFile(null) }}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">Mapează coloanele</h2>
              <button onClick={() => { setShowMapping(false); setRawFile(null) }} className="p-1 text-zinc-400 hover:text-zinc-600">
                <X size={16} />
              </button>
            </div>
            <p className="text-[12px] text-zinc-500 mb-5">
              Selectează ce coloană din <span className="font-medium text-zinc-700 dark:text-zinc-300">{rawFile.fileName}</span> corespunde fiecărui câmp.
            </p>
            <div className="space-y-3">
              {MAPPING_FIELDS.map(({ field, label, required, hint }) => (
                <div key={field} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                  <div className="sm:w-40 sm:flex-shrink-0">
                    <div className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">
                      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{hint}</div>
                  </div>
                  <div className="relative flex-1">
                    <select
                      value={mapping[field]}
                      onChange={e => setMapping(m => ({ ...m, [field]: e.target.value }))}
                      className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-[12px] text-zinc-800 dark:text-zinc-200 pr-7 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                    >
                      <option value="">{required ? 'Alege coloana…' : '— Ignoră —'}</option>
                      {rawFile.headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>

            {canApply && rawFile.rows.length > 0 && (
              <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-[11px] text-zinc-400 mb-2">Previzualizare (primele 3 rânduri):</p>
                <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-[11px]">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                      <tr>
                        {MAPPING_FIELDS.filter(f => mapping[f.field]).map(f => (
                          <th key={f.field} className="text-left px-2 py-1.5 text-zinc-500 font-medium whitespace-nowrap">{mapping[f.field]}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rawFile.rows.slice(0, 3).map((row, i) => (
                        <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800">
                          {MAPPING_FIELDS.filter(f => mapping[f.field]).map(f => (
                            <td key={f.field} className="px-2 py-1.5 text-zinc-600 dark:text-zinc-400 max-w-[130px] truncate">
                              {row[rawFile.headers.indexOf(mapping[f.field])] ?? '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => { setShowMapping(false); setRawFile(null) }} className="px-3 py-2 text-[12px] text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">Anulează</button>
              <button onClick={applyMapping} disabled={!canApply} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-[12px] font-semibold rounded-lg disabled:opacity-50">
                Aplică și previzualizează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Step 4: Drivers ───────────────────────────────────────────────────────────

async function findFreePin(exclude: string[] = []): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const pin = randomPin()
    if (exclude.includes(pin)) continue
    const { data } = await supabase.functions.invoke('check-driver-pin', { body: { pin } })
    if (data?.available) return pin
  }
  return randomPin()
}

function Step4Drivers({ drivers, warehouses, add, remove, update }: {
  drivers: DriverRow[]
  warehouses: WarehouseRow[]
  add: () => void
  remove: (id: string) => void
  update: (id: string, patch: Partial<Omit<DriverRow, '_id'>>) => void
}) {
  const [regenBusy, setRegenBusy] = useState<string | null>(null)

  async function regenPin(id: string) {
    setRegenBusy(id)
    const otherPins = drivers.filter(d => d._id !== id).map(d => d.pin)
    const pin = await findFreePin(otherPins)
    update(id, { pin })
    setRegenBusy(null)
  }

  return (
    <div className="space-y-3">
      {drivers.length === 0 ? (
        <div className="text-center py-10 text-zinc-400 dark:text-zinc-500">
          <Truck size={36} className="mx-auto mb-3 opacity-25" />
          <p className="text-[13px] font-medium">Niciun șofer adăugat</p>
          <p className="text-[12px] mt-1">Poți sări acest pas și adăuga șoferi mai târziu</p>
        </div>
      ) : (
        <div className="space-y-2">
          {drivers.map((d, i) => (
            <div key={d._id} className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Șofer {i + 1}
                </span>
                <button
                  onClick={() => remove(d._id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lCls}>Nume *</label>
                  <div className="relative">
                    <User size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      value={d.name}
                      onChange={e => update(d._id, { name: e.target.value })}
                      placeholder="Ion Popescu"
                      className={iIconCls}
                    />
                  </div>
                </div>
                <div>
                  <label className={lCls}>
                    Telefon serviciu *
                  </label>
                  <div className="relative">
                    <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      value={d.phone}
                      onChange={e => update(d._id, { phone: e.target.value })}
                      placeholder="069 000 000"
                      className={iIconCls}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lCls}>PIN aplicație</label>
                  <div className="relative">
                    <input
                      value={d.pin}
                      onChange={e => update(d._id, { pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      maxLength={4}
                      placeholder="1234"
                      className={`${iCls} pr-8 font-mono tracking-widest`}
                    />
                    <button
                      type="button"
                      onClick={() => regenPin(d._id)}
                      disabled={regenBusy === d._id}
                      title="Generează PIN unic nou"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-orange-500 transition-colors disabled:opacity-50"
                    >
                      {regenBusy === d._id
                        ? <Loader2 size={12} className="animate-spin" />
                        : <RefreshCw size={12} />}
                    </button>
                  </div>
                </div>
                {warehouses.length > 1 && (
                  <div>
                    <label className={lCls}>Depozit asignat</label>
                    <div className="relative">
                      <select
                        value={d.home_warehouse_id ?? ''}
                        onChange={e => update(d._id, { home_warehouse_id: e.target.value || null })}
                        className={`${iCls} appearance-none pr-7`}
                      >
                        <option value="">— Neasignat —</option>
                        {warehouses.map((w, wi) => (
                          <option key={w._id} value={w._id}>
                            {w.name || `Depozit ${wi + 1}`}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={add}
        className="flex items-center gap-1.5 text-[13px] font-medium text-orange-500 hover:text-orange-600 transition-colors"
      >
        <Plus size={14} /> Adaugă șofer
      </button>

      <div className="space-y-2">
        <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl px-4 py-3">
          <Phone size={13} className="text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-blue-700 dark:text-blue-300">
            Numărul de telefon trebuie să fie cel de <span className="font-semibold">serviciu</span> al șoferului — acesta va fi folosit pentru contact în timpul livrărilor. PIN-ul este unic în toată platforma.
          </p>
        </div>
        {warehouses.length > 1 && (
          <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-xl px-4 py-3">
            <Warehouse size={13} className="text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-amber-700 dark:text-amber-300">
              Depozitul asignat reprezintă <span className="font-semibold">locația de start</span> a șoferului — de acolo va începe ziua de lucru și de acolo vor fi calculate rutele.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Step 5: Sales Managers ────────────────────────────────────────────────────

function Step5SalesManagers({ managers, add, remove, update }: {
  managers: SalesManagerRow[]
  add: () => void
  remove: (id: string) => void
  update: (id: string, patch: Partial<Omit<SalesManagerRow, '_id'>>) => void
}) {
  const [showPws, setShowPws] = useState<Record<string, boolean>>({})
  const [regenBusy, setRegenBusy] = useState<string | null>(null)

  function togglePw(id: string) {
    setShowPws(p => ({ ...p, [id]: !p[id] }))
  }

  async function regenPw(id: string) {
    setRegenBusy(id)
    await new Promise(r => setTimeout(r, 100))
    update(id, { password: randomPassword() })
    setRegenBusy(null)
  }

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
        Adaugă managerii de vânzări care vor procesa comenzile. Acest pas este opțional — poți adăuga manageri mai târziu din panoul de control.
      </p>

      {managers.length > 0 && (
        <div className="space-y-2">
          {managers.map((m, i) => (
            <div key={m._id} className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Manager {i + 1}
                </span>
                <button
                  onClick={() => remove(m._id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lCls}>Nume *</label>
                  <div className="relative">
                    <User size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      value={m.name}
                      onChange={e => update(m._id, { name: e.target.value })}
                      placeholder="Vasile Ionescu"
                      className={iIconCls}
                    />
                  </div>
                </div>
                <div>
                  <label className={lCls}>Email *</label>
                  <div className="relative">
                    <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      value={m.email}
                      onChange={e => update(m._id, { email: e.target.value })}
                      placeholder="vasile@firma.md"
                      className={iIconCls}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lCls}>Telefon</label>
                  <div className="relative">
                    <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      value={m.phone}
                      onChange={e => update(m._id, { phone: e.target.value })}
                      placeholder="069 000 000"
                      className={iIconCls}
                    />
                  </div>
                </div>
                <div>
                  <label className={lCls}>Parolă *</label>
                  <div className="relative">
                    <input
                      type={showPws[m._id] ? 'text' : 'password'}
                      value={m.password}
                      onChange={e => update(m._id, { password: e.target.value })}
                      placeholder="min. 6 caractere"
                      className={`${iCls} pr-14`}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => regenPw(m._id)}
                        disabled={regenBusy === m._id}
                        title="Generează parolă nouă"
                        className="text-zinc-400 hover:text-orange-500 transition-colors disabled:opacity-50"
                      >
                        {regenBusy === m._id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePw(m._id)}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                      >
                        {showPws[m._id] ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={add}
        className="flex items-center gap-1.5 text-[13px] font-medium text-orange-500 hover:text-orange-600 transition-colors"
      >
        <Plus size={14} /> Adaugă manager
      </button>
    </div>
  )
}

// ── Step 6: Review ────────────────────────────────────────────────────────────

function Step6Review({ company, warehouses, inventories, drivers, salesManagers }: {
  company: CompanyForm
  warehouses: WarehouseRow[]
  inventories: Record<string, ParsedRow[]>
  drivers: DriverRow[]
  salesManagers: SalesManagerRow[]
}) {
  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-[12px] text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 text-right">{value || '—'}</span>
    </div>
  )

  return (
    <div className="space-y-4">
      <Section label="Cont admin">
        <Row label="Companie" value={company.company_name} />
        <Row label="Nume"     value={company.name} />
        <Row label="Email"    value={company.email} />
        <Row label="Telefon"  value={company.phone} />
        <Row label="Parolă"   value={'•'.repeat(Math.min(company.password.length, 16))} />
      </Section>

      <Section label={`Depozite (${warehouses.length})`}>
        {warehouses.map((w, i) => (
          <div key={w._id} className="flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {i === 0 && <Star size={11} className="text-orange-400 flex-shrink-0" />}
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 truncate">{w.name}</div>
                {w.address && <div className="text-[11px] text-zinc-400 truncate">{w.address}</div>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {w.lat && <MapPin size={11} className="text-orange-400" />}
              {inventories[w._id]?.length ? (
                <span className="text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded">
                  {inventories[w._id].length} SKU
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </Section>

      {drivers.length > 0 && (
        <Section label={`Șoferi (${drivers.length})`}>
          {drivers.map(d => {
            const wh = warehouses.find(w => w._id === d.home_warehouse_id)
            return (
              <div key={d._id} className="flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <div>
                  <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">{d.name || '—'}</div>
                  {wh && <div className="text-[11px] text-zinc-400 mt-0.5">{wh.name}</div>}
                </div>
                <span className="text-[12px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded">
                  PIN {d.pin}
                </span>
              </div>
            )
          })}
        </Section>
      )}

      {salesManagers.length > 0 && (
        <Section label={`Manageri vânzări (${salesManagers.length})`}>
          {salesManagers.map(m => (
            <div key={m._id} className="flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
              <div>
                <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">{m.name || '—'}</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">{m.email}</div>
              </div>
              <span className="text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded">
                {'•'.repeat(Math.min(m.password.length, 10))}
              </span>
            </div>
          ))}
        </Section>
      )}

      <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
        Verifică datele de mai sus și apasă <strong className="text-zinc-600 dark:text-zinc-300">Creează cont</strong> pentru a finaliza.
      </p>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className={lCls}>{label}</p>
      <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4">
        {children}
      </div>
    </div>
  )
}

// ── Step 7: Integration ───────────────────────────────────────────────────────

type IntegrationPlatform = Platform | 'webhook'

const WEBHOOK_SAMPLE = `{
  "order_id": "ORD-001",
  "customer_name": "Maria Ionescu",
  "customer_phone": "069 123 456",
  "delivery_address": "str. Ismail 12, Chișinău",
  "notes": "Interfon 3",
  "order_items": "2x Tricou alb, 1x Pantaloni",
  "order_value": 450.00,
  "shipping_cost": 50.00
}`

function Step7Integration({ company, drivers, apiKey, copy, copied }: {
  company: CompanyForm
  drivers: DriverRow[]
  apiKey: string
  copy: (text: string, key: string) => void
  copied: string | null
}) {
  const [platform, setPlatform] = useState<IntegrationPlatform | null>(null)
  const [showPins, setShowPins] = useState(false)
  const [testState, setTestState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [testMsg, setTestMsg] = useState('')

  async function testConnection() {
    setTestState('loading')
    setTestMsg('')
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({
          order_id: `TEST-${Date.now()}`,
          customer_name: 'Test Livra',
          customer_phone: '000000000',
          delivery_address: 'Test',
          _test: true,
        }),
      })
      if (res.ok || res.status === 200 || res.status === 201) {
        setTestState('ok')
        setTestMsg('Conexiune reușită — webhook-ul răspunde corect.')
      } else {
        const txt = await res.text().catch(() => '')
        setTestState('error')
        setTestMsg(`Eroare HTTP ${res.status}${txt ? ': ' + txt.slice(0, 120) : ''}`)
      }
    } catch (e) {
      setTestState('error')
      setTestMsg(e instanceof Error ? e.message : 'Eroare de rețea')
    }
  }

  function CopyBtn({ text, k }: { text: string; k: string }) {
    return (
      <button
        onClick={() => copy(text, k)}
        className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 transition-colors flex-shrink-0"
      >
        {copied === k ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
      </button>
    )
  }

  function CredRow({ label, value, k }: { label: string; value: string; k?: string }) {
    return (
      <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
        <span className="text-[12px] text-zinc-500 dark:text-zinc-400 flex-shrink-0 mr-4">{label}</span>
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[12px] font-mono font-medium text-zinc-800 dark:text-zinc-200 truncate">{value}</span>
          {k && <CopyBtn text={value} k={k} />}
        </div>
      </div>
    )
  }

  function CodeBlock({ text, k }: { text: string; k: string }) {
    return (
      <div className="relative bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 rounded-lg p-3 overflow-x-auto">
        <button
          onClick={() => copy(text, k)}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          {copied === k ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
        </button>
        <pre className="text-[11px] text-zinc-300 font-mono leading-relaxed pr-8">{text}</pre>
      </div>
    )
  }

  const PLATFORM_OPTIONS: { id: IntegrationPlatform; label: string; sub: string; color: string; activeBg: string; activeRing: string; icon: React.ReactNode }[] = [
    {
      id: 'woocommerce',
      label: 'WooCommerce',
      sub: 'WordPress + WooCommerce',
      color: 'text-violet-600 dark:text-violet-400',
      activeBg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800',
      activeRing: 'ring-violet-400',
      icon: <ShoppingBag size={16} />,
    },
    {
      id: 'opencart',
      label: 'OpenCart',
      sub: 'OpenCart 3.x / 4.x',
      color: 'text-orange-500 dark:text-orange-400',
      activeBg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
      activeRing: 'ring-orange-400',
      icon: <ShoppingCart size={16} />,
    },
    {
      id: 'webhook',
      label: 'Webhook direct',
      sub: 'Magazin propriu / custom',
      color: 'text-sky-600 dark:text-sky-400',
      activeBg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
      activeRing: 'ring-sky-400',
      icon: <Code2 size={16} />,
    },
  ]

  return (
    <div className="space-y-5">

      {/* Compact credentials */}
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2">
          <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Cont creat — credențiale client</span>
        </div>
        <div className="px-4">
          <CredRow label="Link"      value="livra.loleworks.com/login" k="cred-url" />
          <CredRow label="Email"     value={company.email}             k="cred-email" />
          <CredRow label="Parolă"    value={company.password}          k="cred-pw" />
          <CredRow label="Cheie API" value={apiKey}                    k="cred-key" />
        </div>
      </div>

      {/* Driver PINs collapsible */}
      {drivers.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowPins(p => !p)}
            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <Truck size={13} className="text-zinc-400" />
            <span className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide flex-1 text-left">
              PIN-uri șoferi ({drivers.length})
            </span>
            {showPins ? <ChevronUp size={13} className="text-zinc-400" /> : <ChevronDown size={13} className="text-zinc-400" />}
          </button>
          {showPins && (
            <div className="border-t border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 px-4">
              {drivers.map(d => (
                <div key={d._id} className="flex items-center justify-between py-2">
                  <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">{d.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] font-mono font-bold tracking-widest text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      {d.pin}
                    </span>
                    <CopyBtn text={d.pin} k={`pin-${d._id}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Platform picker */}
      <div>
        <p className={lCls}>Conectare magazin online (opțional)</p>
        <div className="grid grid-cols-3 gap-2">
          {PLATFORM_OPTIONS.map(opt => {
            const active = platform === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setPlatform(active ? null : opt.id)}
                className={[
                  'flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all',
                  active
                    ? `${opt.activeBg} ring-2 ring-offset-1 ${opt.activeRing}`
                    : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600',
                ].join(' ')}
              >
                <span className={active ? opt.color : 'text-zinc-400'}>{opt.icon}</span>
                <div>
                  <div className={`text-[11px] font-semibold ${active ? opt.color : 'text-zinc-700 dark:text-zinc-300'}`}>{opt.label}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{opt.sub}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* WooCommerce / OpenCart guide */}
      {(platform === 'woocommerce' || platform === 'opencart') && (() => {
        const meta = PLATFORMS[platform]
        return (
          <div className="space-y-4">
            <a
              href={meta.downloadHref}
              download
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[13px] font-semibold transition-colors ${meta.bg} ${meta.color}`}
            >
              <Download size={14} /> Descarcă plugin-ul {meta.label}
            </a>
            <div>
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Pași de instalare</p>
              <ol className="space-y-2">
                {meta.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[12px] text-zinc-600 dark:text-zinc-300">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-500 text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">URL Webhook</p>
              <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2">
                <code className="flex-1 text-[11px] text-zinc-700 dark:text-zinc-300 truncate font-mono">{WEBHOOK_URL}</code>
                <CopyBtn text={WEBHOOK_URL} k="wh-url" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Cheie API</p>
              <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2">
                <code className="flex-1 text-[11px] text-zinc-700 dark:text-zinc-300 truncate font-mono">{apiKey}</code>
                <CopyBtn text={apiKey} k="wh-apikey" />
              </div>
            </div>
            <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 rounded-lg px-3 py-2.5">
              <Check size={13} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Odată configurat, comenzile noi vor apărea automat în <span className="font-semibold">Rute → Comenzi noi</span>.
              </p>
            </div>
          </div>
        )
      })()}

      {/* Webhook direct guide */}
      {platform === 'webhook' && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 rounded-lg px-3 py-2.5">
            <Webhook size={13} className="text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-sky-700 dark:text-sky-300">
              Trimite un <strong>HTTP POST</strong> la URL-ul de mai jos cu header-ul <code className="font-mono bg-sky-100 dark:bg-sky-900/50 px-1 rounded">x-api-key</code> și body JSON la fiecare comandă nouă.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Endpoint</p>
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2">
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">POST</span>
              <code className="flex-1 text-[11px] text-zinc-700 dark:text-zinc-300 truncate font-mono">{WEBHOOK_URL}</code>
              <CopyBtn text={WEBHOOK_URL} k="dw-url" />
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Header de autentificare</p>
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2">
              <code className="flex-1 text-[11px] text-zinc-700 dark:text-zinc-300 font-mono">
                x-api-key: <span className="text-orange-500">{apiKey}</span>
              </code>
              <CopyBtn text={`x-api-key: ${apiKey}`} k="dw-header" />
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Body JSON (exemplu)</p>
            <CodeBlock text={WEBHOOK_SAMPLE} k="dw-payload" />
          </div>

          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Câmpuri</p>
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden text-[11px]">
              {[
                { field: 'order_id',          type: 'string',  req: true,  desc: 'ID unic al comenzii în sistemul vostru' },
                { field: 'customer_name',     type: 'string',  req: true,  desc: 'Numele complet al clientului' },
                { field: 'customer_phone',    type: 'string',  req: true,  desc: 'Telefon de contact al clientului' },
                { field: 'delivery_address',  type: 'string',  req: true,  desc: 'Adresa de livrare completă' },
                { field: 'notes',             type: 'string',  req: false, desc: 'Instrucțiuni speciale (interfon, etaj etc.)' },
                { field: 'order_items',       type: 'string',  req: false, desc: 'Descriere produse (text liber)' },
                { field: 'order_value',       type: 'number',  req: false, desc: 'Valoarea comenzii în lei' },
                { field: 'shipping_cost',     type: 'number',  req: false, desc: 'Cost livrare în lei' },
              ].map((row, i) => (
                <div key={row.field} className={`grid grid-cols-[auto_1fr] gap-x-3 px-3 py-2 ${i > 0 ? 'border-t border-zinc-100 dark:border-zinc-800' : ''}`}>
                  <div className="flex items-center gap-1.5">
                    <code className="font-mono text-orange-500 dark:text-orange-400 whitespace-nowrap">{row.field}</code>
                    <span className="text-zinc-400 text-[10px] font-mono">{row.type}</span>
                    {row.req && <span className="text-red-500 text-[10px] font-bold">*</span>}
                  </div>
                  <span className="text-zinc-500 dark:text-zinc-400">{row.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {platform && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Test conexiune</p>
          <button
            onClick={testConnection}
            disabled={testState === 'loading'}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[13px] font-semibold text-zinc-700 dark:text-zinc-200 disabled:opacity-50 transition-colors"
          >
            {testState === 'loading'
              ? <Loader2 size={14} className="animate-spin" />
              : testState === 'ok'
              ? <CheckCircle2 size={14} className="text-emerald-500" />
              : testState === 'error'
              ? <XCircle size={14} className="text-red-500" />
              : <Webhook size={14} />}
            {testState === 'loading' ? 'Se testează...' : 'Testează conexiunea'}
          </button>
          {testState === 'ok' && (
            <div className="flex items-center gap-2 text-[12px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg px-3 py-2.5">
              <CheckCircle2 size={13} /> {testMsg}
            </div>
          )}
          {testState === 'error' && (
            <div className="flex items-start gap-2 text-[12px] text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg px-3 py-2.5">
              <XCircle size={13} className="flex-shrink-0 mt-0.5" /> {testMsg}
            </div>
          )}
        </div>
      )}

      {!platform && (
        <p className="text-[12px] text-zinc-400 text-center py-2">
          Selectează platforma pentru a vedea ghidul de configurare, sau apasă <strong>Finalizează</strong> dacă integrarea se face mai târziu.
        </p>
      )}
    </div>
  )
}
