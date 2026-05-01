import { Helmet } from 'react-helmet-async'
import React, { useState, useEffect } from 'react'
import { X, Check, RefreshCw, Copy, Webhook, Activity, Route, ShoppingCart, ShoppingBag, Download, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getUser } from '../lib/auth'

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

export default function Integrations() {
  const [showModal, setShowModal] = useState(false)
  const [modalStep, setModalStep] = useState<ModalStep>('platform')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [copied, setCopied] = useState<'url' | 'payload' | 'key' | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [apiKeyId, setApiKeyId] = useState<string | null>(null)
  const [lastUsedAt, setLastUsedAt] = useState<string | null | undefined>(undefined)
  const [totalReceived, setTotalReceived] = useState<number | null>(null)
  const [regenerating, setRegenerating] = useState(false)

  const user = getUser()

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
        } else {
          setLastUsedAt(null)
        }
      })

    supabase
      .from('livra_webhook_orders')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', user.id)
      .then(({ count }) => setTotalReceived(count ?? 0))
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

  function openGuide(p: Platform) {
    setSelectedPlatform(p)
    setModalStep('guide')
    setShowModal(true)
  }

  const meta = selectedPlatform ? PLATFORM_META[selectedPlatform] : null

  return (
    <>
      <Helmet>
        <title>Integrări | Livra</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <span className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">
                {modalStep === 'platform' ? 'Alege platforma' : `Instalare plugin ${meta?.label}`}
              </span>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
                <X size={14} />
              </button>
            </div>

            {modalStep === 'platform' && (
              <div className="p-5 space-y-3">
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Alege platforma pentru a vedea ghidul de instalare:</p>
                {(['woocommerce', 'opencart'] as Platform[]).map(p => {
                  const m = PLATFORM_META[p]
                  return (
                    <button
                      key={p}
                      onClick={() => { setSelectedPlatform(p); setModalStep('guide') }}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${m.bg}`}
                    >
                      <span className={m.color}>{m.icon}</span>
                      <div className="flex-1">
                        <div className={`text-[13px] font-semibold ${m.color}`}>{m.label}</div>
                        <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">{m.version}</div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-400" />
                    </button>
                  )
                })}
              </div>
            )}

            {modalStep === 'guide' && meta && selectedPlatform && (
              <div className="p-5 space-y-4">
                {/* Download button */}
                <a
                  href={selectedPlatform === 'woocommerce'
                    ? '/plugins/livra-woocommerce.zip'
                    : '/plugins/livra-opencart.ocmod.zip'}
                  download
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border font-semibold text-[13px] transition-colors ${meta.bg} ${meta.color}`}
                >
                  <Download size={14} /> Descarcă plugin-ul {meta.label}
                </a>

                {/* Steps */}
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Pași de instalare</p>
                  <ol className="space-y-2">
                    {meta.steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[12px] text-zinc-600 dark:text-zinc-300">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-brand-orange dark:text-orange-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Webhook URL */}
                <div>
                  <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">URL Webhook</p>
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2">
                    <code className="flex-1 text-[11px] text-zinc-700 dark:text-zinc-300 truncate font-mono">{WEBHOOK_URL}</code>
                    <button onClick={() => copyToClipboard(WEBHOOK_URL, 'url')} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex-shrink-0">
                      {copied === 'url' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                {/* API Key */}
                <div>
                  <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Cheia ta API</p>
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2">
                    <code className="flex-1 text-[11px] text-zinc-700 dark:text-zinc-300 truncate font-mono">{apiKey ?? '…'}</code>
                    <button onClick={() => apiKey && copyToClipboard(apiKey, 'key')} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex-shrink-0">
                      {copied === 'key' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">Copiază această cheie și pune-o în setările plugin-ului.</p>
                </div>

                <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 rounded-lg px-3 py-2.5">
                  <Check size={13} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Odată configurat, comenzile noi vor apărea automat în <span className="font-semibold">Rute → Comenzi noi</span> fără nicio acțiune suplimentară.
                  </p>
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
        <div className="flex items-center justify-between px-5 h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Integrări</span>
        </div>

        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-4 space-y-4">

          {/* Plugin cards */}
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Plugin-uri disponibile</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(['woocommerce', 'opencart'] as Platform[]).map(p => {
                const m = PLATFORM_META[p]
                return (
                  <div key={p} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${m.bg.split(' ').slice(0, 2).join(' ')}`}>
                        <span className={m.color}>{m.icon}</span>
                      </div>
                      <div>
                        <div className={`text-[13px] font-semibold ${m.color}`}>{m.label}</div>
                        <div className="text-[11px] text-zinc-400 dark:text-zinc-500">{m.version}</div>
                      </div>
                    </div>
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                      Comenzile din {m.label} sunt trimise automat la Livra când statutul devine "Procesare".
                    </p>
                    <button
                      onClick={() => openGuide(p)}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border text-[12px] font-semibold transition-colors ${m.bg} ${m.color}`}
                    >
                      <Download size={13} /> Ghid instalare
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Webhook section */}
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Webhook direct</p>
            <div className={`bg-white dark:bg-zinc-900 rounded-xl p-4 space-y-4 border ${lastUsedAt ? 'border-emerald-200 dark:border-emerald-900/60' : 'border-zinc-200 dark:border-zinc-800'}`}>

              {/* Status header */}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${lastUsedAt ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-orange-50 dark:bg-orange-950/40'}`}>
                  {lastUsedAt
                    ? <Activity size={15} className="text-emerald-600 dark:text-emerald-400" />
                    : <Webhook size={15} className="text-brand-orange dark:text-orange-400" />
                  }
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">Webhook</span>
                    {lastUsedAt === undefined
                      ? <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">Se încarcă…</span>
                      : lastUsedAt
                        ? <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Activ
                          </span>
                        : <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                            Neconectat
                          </span>
                    }
                  </div>
                  <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {lastUsedAt
                      ? `Ultimul request: ${formatLastSync(lastUsedAt)}${totalReceived !== null ? ` · ${totalReceived} comenzi primite total` : ''}`
                      : 'Niciun request primit încă. Instalează un plugin sau trimite comenzile manual.'
                    }
                  </div>
                </div>
              </div>

              {/* API Key */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Cheia ta API</p>
                  <button
                    onClick={regenerateKey}
                    disabled={regenerating}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={11} className={regenerating ? 'animate-spin' : ''} />
                    {regenerating ? 'Se generează…' : 'Regenerează'}
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2">
                  <code className="flex-1 text-[11px] text-zinc-700 dark:text-zinc-300 truncate font-mono">
                    {apiKey ?? '…'}
                  </code>
                  <button onClick={() => apiKey && copyToClipboard(apiKey, 'key')} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex-shrink-0">
                    {copied === 'key' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">Trimisă ca header <code className="font-mono">X-Api-Key</code> în fiecare request.</p>
              </div>

              {/* Endpoint */}
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Endpoint URL</p>
                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2">
                  <code className="flex-1 text-[11px] text-zinc-700 dark:text-zinc-300 truncate">{WEBHOOK_URL}</code>
                  <button onClick={() => copyToClipboard(WEBHOOK_URL, 'url')} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex-shrink-0">
                    {copied === 'url' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              {/* Curl example */}
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Exemplu request</p>
                <div className="relative bg-zinc-950 rounded-lg p-3">
                  <pre className="text-[11px] text-zinc-300 overflow-x-auto whitespace-pre-wrap">{`curl -X POST ${WEBHOOK_URL} \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: ${apiKey ?? '<cheia-ta>'}" \\
  -d '${WEBHOOK_SAMPLE}'`}</pre>
                  <button
                    onClick={() => copyToClipboard(
                      `curl -X POST ${WEBHOOK_URL} \\\n  -H "Content-Type: application/json" \\\n  -H "X-Api-Key: ${apiKey ?? '<cheia-ta>'}" \\\n  -d '${WEBHOOK_SAMPLE}'`,
                      'payload'
                    )}
                    className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {copied === 'payload' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 rounded-lg px-3 py-2.5">
                <Route size={13} className="text-zinc-400 dark:text-zinc-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Comenzile primite apar instant în <span className="font-semibold text-zinc-700 dark:text-zinc-300">Rute → Comenzi noi</span>. Nu este necesar niciun import manual.
                </p>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Cum funcționează</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { icon: Download,  title: 'Instalezi plugin-ul',     desc: 'Descarci și configurezi plugin-ul Livra în WooCommerce sau OpenCart.' },
                { icon: Webhook,   title: 'Comenzile vin automat',    desc: 'La fiecare comandă nouă, platforma trimite datele direct la Livra.' },
                { icon: Route,     title: 'Optimizezi și livrezi',    desc: 'Mergi la Rute → Optimizează și distribui șoferilor.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center mb-3">
                    <Icon size={15} className="text-brand-orange dark:text-orange-400" />
                  </div>
                  <div className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 mb-1">{title}</div>
                  <div className="text-[11px] text-zinc-400 dark:text-zinc-500">{desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
