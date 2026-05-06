import { Helmet } from 'react-helmet-async'
import React, { useState, useEffect } from 'react'
import { X, Check, RefreshCw, Copy, Webhook, Activity, ShoppingCart, ShoppingBag, Download, ChevronDown, Link2, Save, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getUser } from '../lib/auth'

const API_BASE    = import.meta.env.VITE_API_URL ?? 'https://api.livra.loleworks.com'
const WEBHOOK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-orders`
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

type CopiedKey = 'url' | 'payload' | 'key' | 'amo_url' | 'bx_url'
type Platform = 'woocommerce' | 'opencart'
type ModalStep = 'platform' | 'guide'

const PLATFORM_META: Record<Platform, {
  label: string
  version: string
  color: string
  bg: string
  icon: React.ReactNode
  steps: string[]
}> = {
  woocommerce: {
    label: 'WooCommerce',
    version: 'WordPress + WooCommerce',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800',
    icon: <ShoppingBag size={20} />,
    steps: [
      'Descarcă plugin-ul Livra pentru WooCommerce (butonul de mai sus)',
      'Intră în WordPress → Plugins → Adaugă nou → Încarcă plugin',
      'Selectează fișierul .zip descărcat și apasă Instalează acum',
      'Activează plugin-ul după instalare',
      'Mergi la WooCommerce → Setări → tab-ul Livra',
      'Lipește URL-ul Webhook de mai jos în câmpul "URL Webhook"',
      'Lipește Cheia API în câmpul "Cheie API" și salvează',
    ],
  },
  opencart: {
    label: 'OpenCart',
    version: 'OpenCart 3.x / 4.x',
    color: 'text-brand-orange dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
    icon: <ShoppingCart size={20} />,
    steps: [
      'Descarcă extensia Livra pentru OpenCart (butonul de mai sus)',
      'Intră în admin OpenCart → Extensions → Installer',
      'Încarcă fișierul .ocmod.zip și apasă Install',
      'Mergi la Extensions → Extensions → Modules → Livra → Install',
      'Apasă Edit, bifează Status: Enabled',
      'Lipește URL-ul Webhook de mai jos și Cheia API în câmpuri',
      'Salvează setările — comenzile vor veni automat',
    ],
  },
}

function formatLastSync(iso: string | null): string {
  if (!iso) return 'niciodată'
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'acum'
  if (diff < 3600) return `acum ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `acum ${Math.floor(diff / 3600)} ore`
  return `acum ${Math.floor(diff / 86400)} zile`
}

interface AmoCrmConfig {
  id?: string
  subdomain: string
  api_token: string
  trigger_stage: string
  failed_stage: string
  field_phone: string
  field_address: string
  field_items: string
  webhook_secret: string
}

const AMOCRM_DEFAULTS: AmoCrmConfig = {
  subdomain: '', api_token: '', trigger_stage: 'Confirmat', failed_stage: 'Replanificare',
  field_phone: 'Telefon', field_address: 'Adresa livrare',
  field_items: 'Produse', webhook_secret: '',
}

interface BitrixConfig {
  id?: string
  domain: string
  api_user_id: string
  api_token: string
  trigger_stage: string
  failed_stage: string
  field_phone: string
  field_address: string
  field_items: string
  webhook_secret: string
}

const BITRIX_DEFAULTS: BitrixConfig = {
  domain: '', api_user_id: '', api_token: '',
  trigger_stage: 'Confirmat', failed_stage: 'Replanificare',
  field_phone: 'UF_CRM_PHONE', field_address: 'UF_CRM_ADDRESS',
  field_items: 'UF_CRM_ITEMS', webhook_secret: '',
}

export default function Integrations() {
  const [showModal, setShowModal] = useState(false)
  const [modalStep, setModalStep] = useState<ModalStep>('platform')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [copied, setCopied] = useState<CopiedKey | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [apiKeyId, setApiKeyId] = useState<string | null>(null)
  const [lastUsedAt, setLastUsedAt] = useState<string | null | undefined>(undefined)
  const [totalReceived, setTotalReceived] = useState<number | null>(null)
  const [regenerating, setRegenerating] = useState(false)

  // panel open state — open by default only if already configured
  const [amoOpen,     setAmoOpen]     = useState(false)
  const [bitrixOpen,  setBitrixOpen]  = useState(false)
  const [webhookOpen, setWebhookOpen] = useState(false)

  // amoCRM
  const [amo, setAmo] = useState<AmoCrmConfig>(AMOCRM_DEFAULTS)
  const [amoId, setAmoId] = useState<string | null>(null)
  const [amoSaving, setAmoSaving] = useState(false)
  const [amoSaved, setAmoSaved] = useState(false)
  const [amoError, setAmoError] = useState<string | null>(null)

  // Bitrix24
  const [bitrix, setBitrix] = useState<BitrixConfig>(BITRIX_DEFAULTS)
  const [bitrixId, setBitrixId] = useState<string | null>(null)
  const [bitrixSaving, setBitrixSaving] = useState(false)
  const [bitrixSaved, setBitrixSaved] = useState(false)
  const [bitrixError, setBitrixError] = useState<string | null>(null)

  const user = getUser()

  const amoWebhookUrl = amo.webhook_secret
    ? `${API_BASE}/webhook/amocrm/${user?.id}?secret=${amo.webhook_secret}`
    : null

  const bitrixWebhookUrl = bitrix.webhook_secret
    ? `${API_BASE}/webhook/bitrix24/${user?.id}?secret=${bitrix.webhook_secret}`
    : null

  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('livra_api_keys')
      .select('id, key, last_used_at')
      .eq('admin_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setApiKey(data.key)
          setApiKeyId(data.id)
          setLastUsedAt(data.last_used_at ?? null)
          if (data.last_used_at) setWebhookOpen(true)
        } else {
          setLastUsedAt(null)
        }
      })

    supabase
      .from('livra_webhook_orders')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', user.id)
      .then(({ count }) => setTotalReceived(count ?? 0))

    // Load amoCRM config
    supabase
      .from('livra_crm_integrations')
      .select('*')
      .eq('company_id', user.id)
      .eq('crm_type', 'amocrm')
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setAmoId(data.id)
          setAmoOpen(true)
          setAmo({
            subdomain:      data.subdomain     ?? '',
            api_token:      data.api_token     ?? '',
            trigger_stage:  data.trigger_stage ?? 'Confirmat',
            failed_stage:   data.failed_stage  ?? 'Replanificare',
            field_phone:    data.field_phone   ?? 'Telefon',
            field_address:  data.field_address ?? 'Adresa livrare',
            field_items:    data.field_items   ?? 'Produse',
            webhook_secret: data.webhook_secret ?? '',
          })
        } else {
          const secret = Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0')).join('')
          setAmo(prev => ({ ...prev, webhook_secret: secret }))
        }
      })

    // Load Bitrix24 config
    supabase
      .from('livra_crm_integrations')
      .select('*')
      .eq('company_id', user.id)
      .eq('crm_type', 'bitrix24')
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setBitrixId(data.id)
          setBitrixOpen(true)
          setBitrix({
            domain:         data.subdomain     ?? '',
            api_user_id:    data.api_user_id   ?? '',
            api_token:      data.api_token     ?? '',
            trigger_stage:  data.trigger_stage ?? 'Confirmat',
            failed_stage:   data.failed_stage  ?? 'Replanificare',
            field_phone:    data.field_phone   ?? 'UF_CRM_PHONE',
            field_address:  data.field_address ?? 'UF_CRM_ADDRESS',
            field_items:    data.field_items   ?? 'UF_CRM_ITEMS',
            webhook_secret: data.webhook_secret ?? '',
          })
        } else {
          const secret = Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0')).join('')
          setBitrix(prev => ({ ...prev, webhook_secret: secret }))
        }
      })
  }, [user?.id])

  function copyToClipboard(text: string, key: 'url' | 'payload' | 'key') {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  async function regenerateKey() {
    if (!user?.id) return
    setRegenerating(true)
    try {
      const newKey = 'livra_' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map(b => b.toString(16).padStart(2, '0')).join('')
      if (apiKeyId) {
        await supabase.from('livra_api_keys').update({ key: newKey, last_used_at: null }).eq('id', apiKeyId)
        setLastUsedAt(null)
      } else {
        const { data } = await supabase
          .from('livra_api_keys')
          .insert({ key: newKey, admin_id: user.id, name: 'Cheie principală' })
          .select('id')
          .single()
        if (data) setApiKeyId(data.id)
      }
      setApiKey(newKey)
    } catch { /* silent */ }
    setRegenerating(false)
  }

  async function saveAmo() {
    if (!user?.id) return
    if (!amo.subdomain.trim() || !amo.api_token.trim()) {
      setAmoError('Subdomain-ul si API token-ul sunt obligatorii.')
      return
    }
    setAmoError(null)
    setAmoSaving(true)
    const payload = {
      company_id: user.id, crm_type: 'amocrm',
      subdomain:      amo.subdomain.trim(),
      api_token:      amo.api_token.trim(),
      trigger_stage:  amo.trigger_stage.trim(),
      failed_stage:   amo.failed_stage.trim(),
      field_phone:    amo.field_phone.trim(),
      field_address:  amo.field_address.trim(),
      field_items:    amo.field_items.trim(),
      webhook_secret: amo.webhook_secret,
      updated_at:     new Date().toISOString(),
    }
    if (amoId) {
      await supabase.from('livra_crm_integrations').update(payload).eq('id', amoId)
    } else {
      const { data } = await supabase.from('livra_crm_integrations').insert(payload).select('id').single()
      if (data) setAmoId(data.id)
    }
    setAmoSaving(false)
    setAmoSaved(true)
    setTimeout(() => setAmoSaved(false), 2500)
  }

  async function saveBitrix() {
    if (!user?.id) return
    if (!bitrix.domain.trim() || !bitrix.api_user_id.trim() || !bitrix.api_token.trim()) {
      setBitrixError('Domain-ul, User ID si API token sunt obligatorii.')
      return
    }
    setBitrixError(null)
    setBitrixSaving(true)
    const payload = {
      company_id:     user.id, crm_type: 'bitrix24',
      subdomain:      bitrix.domain.trim(),
      api_user_id:    bitrix.api_user_id.trim(),
      api_token:      bitrix.api_token.trim(),
      trigger_stage:  bitrix.trigger_stage.trim(),
      failed_stage:   bitrix.failed_stage.trim(),
      field_phone:    bitrix.field_phone.trim(),
      field_address:  bitrix.field_address.trim(),
      field_items:    bitrix.field_items.trim(),
      webhook_secret: bitrix.webhook_secret,
      updated_at:     new Date().toISOString(),
    }
    if (bitrixId) {
      await supabase.from('livra_crm_integrations').update(payload).eq('id', bitrixId)
    } else {
      const { data } = await supabase.from('livra_crm_integrations').insert(payload).select('id').single()
      if (data) setBitrixId(data.id)
    }
    setBitrixSaving(false)
    setBitrixSaved(true)
    setTimeout(() => setBitrixSaved(false), 2500)
  }

  function openGuide(p: Platform) {
    setSelectedPlatform(p)
    setModalStep('guide')
    setShowModal(true)
  }

  const meta = selectedPlatform ? PLATFORM_META[selectedPlatform] : null

  // ── shared collapsible card header ──────────────────────────────────────────
  function CardHeader({
    icon, label, badge, sub, open, onToggle,
  }: {
    icon: React.ReactNode
    label: string
    badge: React.ReactNode
    sub: string
    open: boolean
    onToggle: () => void
  }) {
    return (
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 text-left"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-zinc-100 dark:bg-zinc-800">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">{label}</span>
            {badge}
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{sub}</p>
        </div>
        <ChevronDown size={15} className={`text-zinc-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
    )
  }

  return (
    <>
      <Helmet>
        <title>Integrări | Livra</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Plugin install modal */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <span className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">
                {meta ? `Instalare plugin ${meta.label}` : 'Alege platforma'}
              </span>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
                <X size={14} />
              </button>
            </div>

            {meta && selectedPlatform && (
              <div className="p-5 space-y-4">
                <a
                  href={selectedPlatform === 'woocommerce' ? '/plugins/livra-woocommerce.zip' : '/plugins/livra-opencart.ocmod.zip'}
                  download
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border font-semibold text-[13px] transition-colors ${meta.bg} ${meta.color}`}
                >
                  <Download size={14} /> Descarcă plugin-ul {meta.label}
                </a>
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Pași de instalare</p>
                  <ol className="space-y-2">
                    {meta.steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[12px] text-zinc-600 dark:text-zinc-300">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-brand-orange dark:text-orange-400 text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">URL Webhook</p>
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2">
                    <code className="flex-1 text-[11px] text-zinc-700 dark:text-zinc-300 truncate font-mono">{WEBHOOK_URL}</code>
                    <button onClick={() => copyToClipboard(WEBHOOK_URL, 'url')} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex-shrink-0">
                      {copied === 'url' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Cheia ta API</p>
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2">
                    <code className="flex-1 text-[11px] text-zinc-700 dark:text-zinc-300 truncate font-mono">{apiKey ?? '…'}</code>
                    <button onClick={() => apiKey && copyToClipboard(apiKey, 'key')} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex-shrink-0">
                      {copied === 'key' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[13px] font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                  Închide
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col h-full">
        <div className="flex items-center px-5 h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Integrări</span>
        </div>

        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-4 space-y-6">

          {/* ── E-COMMERCE ── */}
          <section>
            <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">E-commerce</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(['woocommerce', 'opencart'] as Platform[]).map(p => {
                const m = PLATFORM_META[p]
                return (
                  <button
                    key={p}
                    onClick={() => openGuide(p)}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.bg.split(' ').slice(0, 2).join(' ')}`}>
                      <span className={m.color}>{m.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[13px] font-semibold ${m.color}`}>{m.label}</div>
                      <div className="text-[11px] text-zinc-400 dark:text-zinc-500">{m.version}</div>
                    </div>
                    <Download size={13} className="text-zinc-400 flex-shrink-0" />
                  </button>
                )
              })}
            </div>
          </section>

          {/* ── CRM ── */}
          <section>
            <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">CRM</p>
            <div className="space-y-2">

              {/* amoCRM */}
              <div className={`bg-white dark:bg-zinc-900 rounded-xl border transition-colors ${amoId ? 'border-emerald-200 dark:border-emerald-900/60' : 'border-zinc-200 dark:border-zinc-800'}`}>
                <div className="px-4 py-3">
                  <CardHeader
                    icon={<Link2 size={14} className={amoId ? 'text-emerald-500' : 'text-violet-500'} />}
                    label="amoCRM"
                    badge={amoId
                      ? <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Conectat</span>
                      : <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">Neconectat</span>
                    }
                    sub={amoId ? `${amo.subdomain}.amocrm.ru · trigger: ${amo.trigger_stage}` : 'Conecteaza amoCRM pentru a primi comenzi confirmate'}
                    open={amoOpen}
                    onToggle={() => setAmoOpen(o => !o)}
                  />
                </div>
                {amoOpen && (
                  <div className="px-4 pb-4 space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Subdomain</label>
                        <input className="mt-1 w-full text-[12px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 font-mono focus:outline-none focus:border-violet-400" placeholder="compania-mea" value={amo.subdomain} onChange={e => setAmo(p => ({ ...p, subdomain: e.target.value }))} />
                        <p className="text-[10px] text-zinc-400 mt-0.5">compania-mea.amocrm.ru</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">API Token</label>
                        <input type="password" className="mt-1 w-full text-[12px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 font-mono focus:outline-none focus:border-violet-400" placeholder="••••••••••••••••" value={amo.api_token} onChange={e => setAmo(p => ({ ...p, api_token: e.target.value }))} />
                        <p className="text-[10px] text-zinc-400 mt-0.5">Settings → Integrations → API keys</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Etapa trigger</label>
                        <input className="mt-1 w-full text-[12px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-violet-400" placeholder="Confirmat" value={amo.trigger_stage} onChange={e => setAmo(p => ({ ...p, trigger_stage: e.target.value }))} />
                        <p className="text-[10px] text-zinc-400 mt-0.5">Cand ajunge aici, comanda vine in Livra</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Etapa livrare esuata</label>
                        <input className="mt-1 w-full text-[12px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-violet-400" placeholder="Replanificare" value={amo.failed_stage} onChange={e => setAmo(p => ({ ...p, failed_stage: e.target.value }))} />
                        <p className="text-[10px] text-zinc-400 mt-0.5">Lead-ul revine aici cand soferul rateaza</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Campuri personalizate (case-insensitive)</p>
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { key: 'field_phone', label: 'Telefon', placeholder: 'Telefon' },
                          { key: 'field_address', label: 'Adresa', placeholder: 'Adresa livrare' },
                          { key: 'field_items', label: 'Produse', placeholder: 'Produse' },
                        ] as const).map(({ key, label, placeholder }) => (
                          <div key={key}>
                            <label className="text-[10px] text-zinc-400">{label}</label>
                            <input className="mt-1 w-full text-[12px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-violet-400" placeholder={placeholder} value={amo[key]} onChange={e => setAmo(p => ({ ...p, [key]: e.target.value }))} />
                          </div>
                        ))}
                      </div>
                    </div>
                    {amoWebhookUrl && (
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">URL Webhook → lipeste in amoCRM</p>
                        <div className="flex items-center gap-2 bg-zinc-950 rounded-lg px-3 py-2">
                          <code className="flex-1 text-[11px] text-zinc-300 truncate font-mono">{amoWebhookUrl}</code>
                          <button onClick={() => { navigator.clipboard.writeText(amoWebhookUrl); setCopied('amo_url'); setTimeout(() => setCopied(null), 2000) }} className="text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0">
                            {copied === 'amo_url' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1">Settings → Webhooks → Add webhook → Lead: status changed</p>
                      </div>
                    )}
                    {amoError && <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2"><AlertCircle size={13} className="text-red-500 flex-shrink-0" /><p className="text-[11px] text-red-600 dark:text-red-400">{amoError}</p></div>}
                    <button onClick={saveAmo} disabled={amoSaving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[12px] font-semibold transition-colors disabled:opacity-60">
                      {amoSaved ? <Check size={14} /> : amoSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                      {amoSaved ? 'Salvat!' : amoSaving ? 'Se salveaza...' : 'Salveaza'}
                    </button>
                  </div>
                )}
              </div>

              {/* Bitrix24 */}
              <div className={`bg-white dark:bg-zinc-900 rounded-xl border transition-colors ${bitrixId ? 'border-emerald-200 dark:border-emerald-900/60' : 'border-zinc-200 dark:border-zinc-800'}`}>
                <div className="px-4 py-3">
                  <CardHeader
                    icon={<Link2 size={14} className={bitrixId ? 'text-emerald-500' : 'text-blue-500'} />}
                    label="Bitrix24"
                    badge={bitrixId
                      ? <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Conectat</span>
                      : <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">Neconectat</span>
                    }
                    sub={bitrixId ? `${bitrix.domain} · trigger: ${bitrix.trigger_stage}` : 'Conecteaza Bitrix24 pentru a primi deal-uri confirmate'}
                    open={bitrixOpen}
                    onToggle={() => setBitrixOpen(o => !o)}
                  />
                </div>
                {bitrixOpen && (
                  <div className="px-4 pb-4 space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Domain</label>
                        <input className="mt-1 w-full text-[12px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 font-mono focus:outline-none focus:border-blue-400" placeholder="compania.bitrix24.ru" value={bitrix.domain} onChange={e => setBitrix(p => ({ ...p, domain: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">User ID</label>
                        <input className="mt-1 w-full text-[12px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 font-mono focus:outline-none focus:border-blue-400" placeholder="1" value={bitrix.api_user_id} onChange={e => setBitrix(p => ({ ...p, api_user_id: e.target.value }))} />
                        <p className="text-[10px] text-zinc-400 mt-0.5">Din URL-ul inbound webhook</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Token</label>
                        <input type="password" className="mt-1 w-full text-[12px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 font-mono focus:outline-none focus:border-blue-400" placeholder="••••••••••••••••" value={bitrix.api_token} onChange={e => setBitrix(p => ({ ...p, api_token: e.target.value }))} />
                        <p className="text-[10px] text-zinc-400 mt-0.5">Settings → Integrations → Inbound webhook</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Etapa trigger</label>
                        <input className="mt-1 w-full text-[12px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-400" placeholder="Confirmat sau C1:1" value={bitrix.trigger_stage} onChange={e => setBitrix(p => ({ ...p, trigger_stage: e.target.value }))} />
                        <p className="text-[10px] text-zinc-400 mt-0.5">Nume sau ID etapa (ex: C1:1)</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Etapa livrare esuata</label>
                        <input className="mt-1 w-full text-[12px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-400" placeholder="Replanificare sau C1:2" value={bitrix.failed_stage} onChange={e => setBitrix(p => ({ ...p, failed_stage: e.target.value }))} />
                        <p className="text-[10px] text-zinc-400 mt-0.5">Deal-ul revine aici cand soferul rateaza</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Coduri campuri deal</p>
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { key: 'field_phone', label: 'Telefon', placeholder: 'UF_CRM_PHONE' },
                          { key: 'field_address', label: 'Adresa', placeholder: 'UF_CRM_ADDRESS' },
                          { key: 'field_items', label: 'Produse', placeholder: 'UF_CRM_ITEMS' },
                        ] as const).map(({ key, label, placeholder }) => (
                          <div key={key}>
                            <label className="text-[10px] text-zinc-400">{label}</label>
                            <input className="mt-1 w-full text-[12px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 font-mono focus:outline-none focus:border-blue-400" placeholder={placeholder} value={bitrix[key]} onChange={e => setBitrix(p => ({ ...p, [key]: e.target.value }))} />
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1.5">CRM → Deal fields → coloana Code</p>
                    </div>
                    {bitrixWebhookUrl && (
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">URL Webhook → lipeste in Bitrix24</p>
                        <div className="flex items-center gap-2 bg-zinc-950 rounded-lg px-3 py-2">
                          <code className="flex-1 text-[11px] text-zinc-300 truncate font-mono">{bitrixWebhookUrl}</code>
                          <button onClick={() => { navigator.clipboard.writeText(bitrixWebhookUrl); setCopied('bx_url'); setTimeout(() => setCopied(null), 2000) }} className="text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0">
                            {copied === 'bx_url' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1">Settings → Automation → Outbound webhooks → Deal updated</p>
                      </div>
                    )}
                    {bitrixError && <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2"><AlertCircle size={13} className="text-red-500 flex-shrink-0" /><p className="text-[11px] text-red-600 dark:text-red-400">{bitrixError}</p></div>}
                    <button onClick={saveBitrix} disabled={bitrixSaving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold transition-colors disabled:opacity-60">
                      {bitrixSaved ? <Check size={14} /> : bitrixSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                      {bitrixSaved ? 'Salvat!' : bitrixSaving ? 'Se salveaza...' : 'Salveaza'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── WEBHOOK DIRECT ── */}
          <section>
            <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Webhook direct</p>
            <div className={`bg-white dark:bg-zinc-900 rounded-xl border transition-colors ${lastUsedAt ? 'border-emerald-200 dark:border-emerald-900/60' : 'border-zinc-200 dark:border-zinc-800'}`}>
              <div className="px-4 py-3">
                <CardHeader
                  icon={lastUsedAt
                    ? <Activity size={14} className="text-emerald-500" />
                    : <Webhook size={14} className="text-brand-orange dark:text-orange-400" />
                  }
                  label="Webhook"
                  badge={lastUsedAt === undefined
                    ? <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">Se încarcă…</span>
                    : lastUsedAt
                      ? <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Activ</span>
                      : <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">Neconectat</span>
                  }
                  sub={lastUsedAt
                    ? `Ultimul request: ${formatLastSync(lastUsedAt)}${totalReceived !== null ? ` · ${totalReceived} comenzi primite` : ''}`
                    : 'API key + endpoint pentru integrari custom sau scripturi'
                  }
                  open={webhookOpen}
                  onToggle={() => setWebhookOpen(o => !o)}
                />
              </div>
              {webhookOpen && (
                <div className="px-4 pb-4 space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Cheia ta API</p>
                      <button onClick={regenerateKey} disabled={regenerating} className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors disabled:opacity-50">
                        <RefreshCw size={11} className={regenerating ? 'animate-spin' : ''} />
                        {regenerating ? 'Se generează…' : 'Regenerează'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2">
                      <code className="flex-1 text-[11px] text-zinc-700 dark:text-zinc-300 truncate font-mono">{apiKey ?? '…'}</code>
                      <button onClick={() => apiKey && copyToClipboard(apiKey, 'key')} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex-shrink-0">
                        {copied === 'key' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">Trimisă ca header <code className="font-mono">X-Api-Key</code></p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Endpoint URL</p>
                    <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2">
                      <code className="flex-1 text-[11px] text-zinc-700 dark:text-zinc-300 truncate">{WEBHOOK_URL}</code>
                      <button onClick={() => copyToClipboard(WEBHOOK_URL, 'url')} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex-shrink-0">
                        {copied === 'url' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Exemplu curl</p>
                    <div className="relative bg-zinc-950 rounded-lg p-3">
                      <pre className="text-[11px] text-zinc-300 overflow-x-auto whitespace-pre-wrap">{`curl -X POST ${WEBHOOK_URL} \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: ${apiKey ?? '<cheia-ta>'}" \\
  -d '${WEBHOOK_SAMPLE}'`}</pre>
                      <button onClick={() => copyToClipboard(`curl -X POST ${WEBHOOK_URL} \\\n  -H "Content-Type: application/json" \\\n  -H "X-Api-Key: ${apiKey ?? '<cheia-ta>'}" \\\n  -d '${WEBHOOK_SAMPLE}'`, 'payload')} className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                        {copied === 'payload' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
