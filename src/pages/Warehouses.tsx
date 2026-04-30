import { Helmet } from 'react-helmet-async'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Warehouse, Plus, Trash2, Star, Package, ChevronRight, Pencil } from 'lucide-react'
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
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', address: '', is_default: false })
  const [originalAddress, setOriginalAddress] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    if (!user?.id) return
    const [whRes, invRes] = await Promise.all([
      supabase.from('livra_warehouses').select('*')
        .eq('company_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true }),
      supabase.from('livra_inventory').select('warehouse_id').eq('company_id', user.id),
    ])
    setItems((whRes.data ?? []) as Wh[])
    const counts: Record<string, number> = {}
    for (const r of (invRes.data ?? []) as { warehouse_id: string }[]) {
      counts[r.warehouse_id] = (counts[r.warehouse_id] ?? 0) + 1
    }
    setSkuCounts(counts)
  }
  useEffect(() => { load() }, [user?.id])

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

  function openAdd() {
    setEditingId(null)
    // First warehouse defaults to is_default; subsequent ones don't
    setForm({ name: '', address: '', is_default: items.length === 0 })
    setOriginalAddress('')
    setShowModal(true)
  }

  function openEdit(w: Wh) {
    setEditingId(w.id)
    setForm({ name: w.name, address: w.address, is_default: w.is_default })
    setOriginalAddress(w.address)
    setShowModal(true)
  }

  async function save() {
    if (!form.name.trim() || !form.address.trim()) return
    if (!user?.id) return
    setBusy(true)
    if (editingId) {
      const addressChanged = form.address.trim() !== originalAddress.trim()
      const update: Record<string, unknown> = {
        name: form.name.trim(),
        address: form.address.trim(),
        is_default: form.is_default,
      }
      if (addressChanged) {
        const coords = await geocode(form.address)
        update.lat = coords?.lat ?? null
        update.lng = coords?.lng ?? null
      }
      // If we're promoting this one to default, demote the others first
      if (form.is_default) {
        await supabase.from('livra_warehouses').update({ is_default: false })
          .eq('company_id', user.id).neq('id', editingId)
      }
      await supabase.from('livra_warehouses').update(update).eq('id', editingId)
    } else {
      const coords = await geocode(form.address)
      // First warehouse must be default; otherwise honor checkbox
      const willBeDefault = items.length === 0 ? true : form.is_default
      if (willBeDefault) {
        await supabase.from('livra_warehouses').update({ is_default: false })
          .eq('company_id', user.id)
      }
      await supabase.from('livra_warehouses').insert({
        company_id: user.id,
        name: form.name.trim(),
        address: form.address.trim(),
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        is_default: willBeDefault,
      })
    }
    setShowModal(false)
    setEditingId(null)
    setForm({ name: '', address: '', is_default: false })
    setOriginalAddress('')
    setBusy(false)
    load()
  }

  async function setDefault(id: string) {
    if (!user?.id) return
    await supabase.from('livra_warehouses').update({ is_default: false })
      .eq('company_id', user.id).neq('id', id)
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
      <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Depozite</h1>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">
              Locațiile de unde șoferii încarcă coletele înainte de livrare. Optimizatorul plănuiește rutele pornind de la depozitul fiecărui șofer.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-[13px] rounded-lg hover:bg-blue-700"
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
                    onClick={e => { e.preventDefault(); e.stopPropagation(); openEdit(w) }}
                    title="Editează"
                    className="p-2 text-zinc-400 hover:text-blue-500"
                  >
                    <Pencil size={16} />
                  </button>
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

        {showModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4 sm:p-4" onClick={() => !busy && setShowModal(false)}>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                {editingId ? 'Editează depozit' : 'Adaugă depozit'}
              </h2>
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
                  {editingId && form.address.trim() !== originalAddress.trim() && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                      Adresa s-a schimbat — va fi geocodificată din nou la salvare.
                    </p>
                  )}
                </div>
                {/* Default checkbox — first warehouse is forced default */}
                {!(editingId === null && items.length === 0) && (
                  <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_default}
                      onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[12px] text-zinc-700 dark:text-zinc-300">
                      Setează ca depozit implicit
                      <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Șoferii fără un depozit asignat pleacă de aici. Doar un depozit poate fi implicit — celelalte se vor demota automat.
                      </span>
                    </span>
                  </label>
                )}
                {editingId === null && items.length === 0 && (
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Primul depozit este setat automat ca implicit.
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setShowModal(false)} disabled={busy} className="px-3 py-2 text-[13px] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">Anulează</button>
                <button onClick={save} disabled={busy || !form.name.trim() || !form.address.trim()} className="px-3 py-2 bg-blue-600 text-white text-[13px] rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {busy ? 'Se salvează…' : 'Salvează'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  )
}
