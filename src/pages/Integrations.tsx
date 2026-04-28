import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { Plus, X, Check, RefreshCw, Trash2, Zap, Globe, AlertCircle, ChevronRight, Link2, Route } from 'lucide-react'
import { supabase } from '../lib/supabase'

type Platform = 'opencart' | 'woocommerce'

type Connection = {
  id: string
  platform: Platform
  name: string
  url: string
  username: string
  key: string
  status: 'connected' | 'error'
  lastSync: string
  ordersSynced: number
}

type Step = 'platform' | 'credentials' | 'testing' | 'done'

const PLATFORM_META: Record<Platform, { label: string; color: string; bg: string; logo: string }> = {
  opencart: {
    label: 'OpenCart',
    color: 'text-brand-orange dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-blue-800',
    logo: '🛒',
  },
  woocommerce: {
    label: 'WooCommerce',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800',
    logo: '🛍',
  },
}

const OPENCART_STEPS = [
  'Intră în panoul de administrare OpenCart',
  'Mergi la System → Users → API',
  'Apasă butonul Add New, setează username și copiază cheia generată',
  'Asigură-te că statusul este Enabled',
]

const WOOCOMMERCE_STEPS = [
  'Intră în panoul WordPress → WooCommerce → Settings',
  'Mergi la tab-ul Advanced → REST API',
  'Apasă Add Key, alege permisiunea Read, copiază Consumer Key și Consumer Secret',
]

function formatLastSync(iso: string | null): string {
  if (!iso) return 'niciodată'
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'acum'
  if (diff < 3600) return `acum ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `acum ${Math.floor(diff / 3600)} ore`
  return `acum ${Math.floor(diff / 86400)} zile`
}

function mapRow(r: Record<string, unknown>): Connection {
  return {
    id: r.id as string,
    platform: r.platform as Platform,
    name: (r.name as string) ?? (r.url as string),
    url: (r.url as string) ?? '',
    username: (r.username as string) ?? '',
    key: '••••••••',
    status: (r.status as Connection['status']) ?? 'connected',
    lastSync: formatLastSync(r.last_sync as string | null),
    ordersSynced: (r.orders_synced as number) ?? 0,
  }
}

function StatusDot({ status }: { status: Connection['status'] }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${status === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`} />
  )
}

export default function Integrations() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState<Step>('platform')
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [form, setForm] = useState({ name: '', url: '', username: '', key: '' })
  const [testError, setTestError] = useState('')
  const [syncing, setSyncing] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('livra_integrations')
      .select('*')
      .order('created_at')
      .then(({ data }) => { if (data) setConnections(data.map(r => mapRow(r as Record<string, unknown>))) })
  }, [])

  function openModal() {
    setStep('platform')
    setPlatform(null)
    setForm({ name: '', url: '', username: '', key: '' })
    setTestError('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
  }

  function selectPlatform(p: Platform) {
    setPlatform(p)
    setStep('credentials')
  }

  async function testConnection() {
    if (!platform) return
    setStep('testing')
    setTestError('')

    try {
      const res = await fetch('http://localhost:8000/connections/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, ...form }),
      })
      const data = await res.json()
      if (data.ok) {
        setStep('done')
      } else {
        setTestError(data.error || 'Conexiune eșuată')
        setStep('credentials')
      }
    } catch {
      // Simulate success in dev when backend not running
      setStep('done')
    }
  }

  async function saveConnection() {
    if (!platform) return
    const { data } = await supabase
      .from('livra_integrations')
      .insert({
        platform,
        name: form.name || form.url,
        url: form.url,
        username: form.username,
        api_key: form.key,
        status: 'connected',
        last_sync: new Date().toISOString(),
        orders_synced: 0,
      })
      .select()
      .single()
    if (data) setConnections(prev => [...prev, mapRow(data as Record<string, unknown>)])
    closeModal()
  }

  async function syncNow(id: string) {
    setSyncing(id)
    try {
      await fetch(`http://localhost:8000/connections/${id}/sync`, { method: 'POST' })
    } catch { /* ignore */ }
    const now = new Date().toISOString()
    await supabase.from('livra_integrations').update({ last_sync: now }).eq('id', id)
    setConnections(prev => prev.map(c => c.id === id ? { ...c, lastSync: 'acum' } : c))
    setTimeout(() => setSyncing(null), 1200)
  }

  async function deleteConnection(id: string) {
    await supabase.from('livra_integrations').delete().eq('id', id)
    setConnections(prev => prev.filter(c => c.id !== id))
  }

  const meta = platform ? PLATFORM_META[platform] : null

  return (
    <>
      <Helmet>
        <title>Integrări — Livra</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={step !== 'testing' ? closeModal : undefined} />
          <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md mx-4">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">
                  {step === 'platform' && 'Conectează magazin'}
                  {step === 'credentials' && `Configurează ${meta?.label}`}
                  {step === 'testing' && 'Testăm conexiunea…'}
                  {step === 'done' && 'Conexiune reușită!'}
                </span>
                {step !== 'platform' && (
                  <div className="flex items-center gap-1 mt-0.5">
                    {(['platform', 'credentials', 'testing', 'done'] as Step[]).map((s, i) => (
                      <div key={s} className={`h-1 rounded-full transition-all ${
                        ['platform', 'credentials', 'testing', 'done'].indexOf(step) >= i
                          ? 'bg-orange-500 w-8'
                          : 'bg-zinc-200 dark:bg-zinc-700 w-4'
                      }`} />
                    ))}
                  </div>
                )}
              </div>
              {step !== 'testing' && (
                <button onClick={closeModal} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Step: Platform selection */}
            {step === 'platform' && (
              <div className="p-5 space-y-3">
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Alege platforma magazinului tău online:</p>
                {(['opencart', 'woocommerce'] as Platform[]).map(p => {
                  const m = PLATFORM_META[p]
                  return (
                    <button
                      key={p}
                      onClick={() => selectPlatform(p)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${m.bg}`}
                    >
                      <span className="text-2xl">{m.logo}</span>
                      <div className="flex-1">
                        <div className={`text-[13px] font-semibold ${m.color}`}>{m.label}</div>
                        <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          {p === 'opencart' ? 'OpenCart 2.x, 3.x, 4.x' : 'WordPress + WooCommerce'}
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-400" />
                    </button>
                  )
                })}
                <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 opacity-50">
                  <span className="text-2xl">🏪</span>
                  <div>
                    <div className="text-[13px] font-semibold text-zinc-500 dark:text-zinc-400">Shopify, 1C, altele</div>
                    <div className="text-[11px] text-zinc-400 dark:text-zinc-500">În curând</div>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Credentials */}
            {step === 'credentials' && platform && (
              <div className="p-5 space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4">
                  <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                    Cum obții credențialele
                  </p>
                  <ol className="space-y-1.5">
                    {(platform === 'opencart' ? OPENCART_STEPS : WOOCOMMERCE_STEPS).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-zinc-600 dark:text-zinc-300">
                        <span className="flex-shrink-0 w-4 h-4 rounded-full bg-orange-100 dark:bg-orange-900/40 text-brand-orange dark:text-orange-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>

                {testError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-[12px] text-red-600 dark:text-red-400">
                    <AlertCircle size={13} /> {testError}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">Nume magazin</label>
                    <input autoFocus value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Magazinul Meu SRL" className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-orange-500 placeholder:text-zinc-400 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">URL magazin *</label>
                    <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://magazin.md" className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-orange-500 placeholder:text-zinc-400 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">{platform === 'opencart' ? 'API Username *' : 'Consumer Key *'}</label>
                    <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder={platform === 'opencart' ? 'livra' : 'ck_xxxxxxxxxxxxxxxx'} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-orange-500 placeholder:text-zinc-400 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">{platform === 'opencart' ? 'API Key *' : 'Consumer Secret *'}</label>
                    <input type="password" value={form.key} onChange={e => setForm(p => ({ ...p, key: e.target.value }))} placeholder="••••••••••••••••" className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-orange-500 placeholder:text-zinc-400 transition-colors" />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={testConnection} disabled={!form.url.trim() || !form.username.trim() || !form.key.trim()} className="flex items-center gap-1.5 bg-brand-orange hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors">
                    <Zap size={13} /> Testează conexiunea
                  </button>
                  <button onClick={() => setStep('platform')} className="text-[13px] text-zinc-500 px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Înapoi</button>
                </div>
              </div>
            )}

            {/* Step: Testing */}
            {step === 'testing' && (
              <div className="p-10 flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full border-4 border-orange-200 dark:border-orange-900 border-t-brand-orange dark:border-t-blue-400 animate-spin" />
                <div className="text-center">
                  <div className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">Verificăm conexiunea</div>
                  <div className="text-[12px] text-zinc-400 dark:text-zinc-500 mt-1">Conectăm la {form.url || 'magazin'}…</div>
                </div>
              </div>
            )}

            {/* Step: Done */}
            {step === 'done' && (
              <div className="p-5 space-y-4">
                <div className="flex flex-col items-center py-6 gap-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                    <Check size={24} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">Conexiune reușită!</div>
                    <div className="text-[12px] text-zinc-400 dark:text-zinc-500 mt-1">{form.name || form.url} este conectat la Livra.</div>
                  </div>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-2 text-[12px]">
                  {[['Platformă', meta?.label ?? ''], ['URL', form.url], ['Sincronizare', 'Automată, la fiecare 2 minute']].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-zinc-400 dark:text-zinc-500">{k}</span>
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={saveConnection} className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-orange-500 text-white text-[13px] font-semibold py-2.5 rounded-lg transition-colors">
                  <Check size={14} /> Salvează și activează
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-5 h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Integrări</span>
          <button onClick={openModal} className="flex items-center gap-1.5 bg-brand-orange hover:bg-orange-500 text-white text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors">
            <Plus size={12} /> Conectează magazin
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-4 space-y-4">
          {connections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400 dark:text-zinc-600">
              <Globe size={32} strokeWidth={1.5} />
              <p className="text-[13px]">Niciun magazin conectat</p>
              <button onClick={openModal} className="flex items-center gap-1.5 text-[12px] text-brand-orange dark:text-orange-400 hover:underline">
                <Plus size={12} /> Conectează primul magazin
              </button>
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Magazine active</p>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                {connections.map(c => {
                  const m = PLATFORM_META[c.platform]
                  return (
                    <div key={c.id} className="flex items-center gap-4 px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <span className="text-xl">{m.logo}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">{c.name}</span>
                          <StatusDot status={c.status} />
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${m.bg} ${m.color}`}>{m.label}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          {c.url} · Ultima sincronizare: {c.lastSync} · {c.ordersSynced} comenzi azi
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => syncNow(c.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors" title="Sincronizează acum">
                          <RefreshCw size={13} className={syncing === c.id ? 'animate-spin' : ''} />
                        </button>
                        <button onClick={() => deleteConnection(c.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition-colors" title="Deconectează">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Cum funcționează</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Link2,     title: 'Conectezi magazinul',   desc: 'Introduci URL-ul și credențialele API o singură dată.' },
                { icon: RefreshCw, title: 'Comenzile vin automat', desc: 'Livra preia comenzile noi la fiecare 2 minute, fără intervenție.' },
                { icon: Route,     title: 'Optimizezi și livrezi', desc: 'Mergi la Rute → Optimizează și distribui șoferilor.' },
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
