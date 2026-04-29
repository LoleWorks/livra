import { Helmet } from 'react-helmet-async'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Warehouse, Plus, Trash2, Star, Package, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getUser } from '../lib/auth'

type Wh = {
  id: string
  company_id: string
  name: string
  address: string
  lat: number | null
  lng: number | null
  is_default: boolean
  created_at: string
}

export default function Warehouses() {
  const user = getUser()
  const [items, setItems] = useState<Wh[]>([])
  const [skuCounts, setSkuCounts] = useState<Record<string, number>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', address: '' })
  const [busy, setBusy] = useState(false)

  async function load() {
    const [whRes, invRes] = await Promise.all([
      supabase.from('livra_warehouses').select('*').order('is_default', { ascending: false }).order('created_at', { ascending: true }),
      supabase.from('livra_inventory').select('warehouse_id'),
    ])
    setItems((whRes.data ?? []) as Wh[])
    const counts: Record<string, number> = {}
    for (const r of (invRes.data ?? []) as { warehouse_id: string }[]) {
      counts[r.warehouse_id] = (counts[r.warehouse_id] ?? 0) + 1
    }
    setSkuCounts(counts)
  }
  useEffect(() => { load() }, [])

  async function geocode(address: string): Promise<{ lat: number, lng: number } | null> {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ', Moldova')}&format=json&limit=1`,
        { headers: { 'User-Agent': 'Livra/1.0' } },
      )
      const data = await r.json()
      if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    } catch {}
    return null
  }

  async function create() {
    if (!form.name.trim() || !form.address.trim()) return
    setBusy(true)
    const coords = await geocode(form.address)
    const isFirst = items.length === 0
    await supabase.from('livra_warehouses').insert({
      company_id: user?.id,
      name: form.name.trim(),
      address: form.address.trim(),
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      is_default: isFirst,
    })
    setForm({ name: '', address: '' })
    setShowAdd(false)
    setBusy(false)
    load()
  }

  async function setDefault(id: string) {
    await supabase.from('livra_warehouses').update({ is_default: false }).neq('id', id)
    await supabase.from('livra_warehouses').update({ is_default: true }).eq('id', id)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Ștergi acest depozit?')) return
    await supabase.from('livra_warehouses').delete().eq('id', id)
    load()
  }

  return (
    <>
      <Helmet><title>Depozite — Livra</title></Helmet>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Depozite</h1>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">
              Locațiile de unde șoferii încarcă coletele înainte de livrare. Optimizatorul plănuiește rutele pornind de la depozitul fiecărui șofer.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-[13px] rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} /> Adaugă depozit
          </button>
        </div>

        {items.length === 0 ? (
          <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center">
            <Warehouse size={32} className="mx-auto text-zinc-400 mb-3" />
            <p className="text-[13px] text-zinc-500">Niciun depozit configurat încă.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map(w => (
              <Link
                key={w.id}
                to={`/warehouses/${w.id}`}
                className="group flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Warehouse size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100 text-[14px]">{w.name}</span>
                      {w.is_default && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 rounded uppercase tracking-wider font-semibold">Implicit</span>
                      )}
                    </div>
                    <div className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">{w.address}</div>
                    {w.lat == null && (
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">⚠ Adresa nu a fost geocodificată — verifică-o</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-[12px] text-zinc-500 dark:text-zinc-400">
                    <Package size={13} />
                    <span className="tabular-nums font-semibold text-zinc-700 dark:text-zinc-200">{skuCounts[w.id] ?? 0}</span>
                    <span className="hidden sm:inline">produse</span>
                  </div>
                  {!w.is_default && (
                    <button
                      onClick={e => { e.preventDefault(); e.stopPropagation(); setDefault(w.id) }}
                      title="Setează ca depozit implicit"
                      className="p-2 text-zinc-400 hover:text-amber-500"
                    >
                      <Star size={16} />
                    </button>
                  )}
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); remove(w.id) }}
                    title="Șterge"
                    className="p-2 text-zinc-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-600 group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {showAdd && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => !busy && setShowAdd(false)}>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Adaugă depozit</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-[12px] text-zinc-600 dark:text-zinc-400 mb-1">Nume</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="ex. Depozit Botanica"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-zinc-600 dark:text-zinc-400 mb-1">Adresă completă</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="ex. bd. Dacia 50, Chișinău"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-[13px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setShowAdd(false)} disabled={busy} className="px-3 py-2 text-[13px] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">Anulează</button>
                <button onClick={create} disabled={busy || !form.name.trim() || !form.address.trim()} className="px-3 py-2 bg-blue-600 text-white text-[13px] rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {busy ? 'Se salvează…' : 'Salvează'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
