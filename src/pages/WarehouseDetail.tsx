import { Helmet } from 'react-helmet-async'
import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Upload, AlertCircle, CheckCircle2, Clock, X, ChevronDown, Search, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getUser } from '../lib/auth'

type Warehouse = { id: string; name: string; address: string; is_default: boolean; lat: number | null; lng: number | null }
type InventoryRow = { id: string; sku: string; product_name: string | null; quantity: number; updated_at: string }
type ParsedRow = { sku: string; product_name: string; quantity: number }
type FieldMapping = { sku: string; product_name: string; quantity: string }
type UploadRecord = { id: string; uploaded_at: string; file_name: string | null; row_count: number }

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

function fmtAgo(iso: string): string {
  const sec = (Date.now() - new Date(iso).getTime()) / 1000
  if (sec < 60) return `acum ${Math.round(sec)}s`
  if (sec < 3600) return `acum ${Math.round(sec / 60)} min`
  if (sec < 86400) return `acum ${Math.round(sec / 3600)} h`
  return `acum ${Math.round(sec / 86400)} zile`
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

const mappingStorageKey = (userId: string) => `livra_inv_mapping_${userId}`

export default function WarehouseDetail() {
  const { id: warehouseId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = getUser()
  const fileRef = useRef<HTMLInputElement>(null)

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null)
  const [inventory, setInventory] = useState<InventoryRow[]>([])
  const [uploads, setUploads] = useState<UploadRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [preview, setPreview] = useState<{ rows: ParsedRow[]; fileName: string } | null>(null)
  const [rawFile, setRawFile] = useState<{ headers: string[]; rows: string[][]; fileName: string } | null>(null)
  const [mapping, setMapping] = useState<FieldMapping>({ sku: '', product_name: '', quantity: '' })
  const [showMappingModal, setShowMappingModal] = useState(false)

  async function load() {
    if (!warehouseId) return
    setLoading(true)
    const [whRes, invRes, upRes] = await Promise.all([
      supabase.from('livra_warehouses').select('id, name, address, is_default, lat, lng').eq('id', warehouseId).single(),
      supabase.from('livra_inventory').select('id, sku, product_name, quantity, updated_at').eq('warehouse_id', warehouseId).order('product_name', { ascending: true }),
      supabase.from('livra_inventory_uploads').select('*').order('uploaded_at', { ascending: false }).limit(5),
    ])
    setWarehouse(whRes.data as Warehouse | null)
    setInventory((invRes.data ?? []) as InventoryRow[])
    setUploads((upRes.data ?? []) as UploadRecord[])
    setLoading(false)
  }
  useEffect(() => { load() }, [warehouseId])

  async function onFile(file: File) {
    setMsg(null)
    setBusy(true)
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      if (rows.length < 2) throw new Error('Fișierul este gol sau nu are antet.')
      const headers = rows[0].map(h => h.trim())
      const dataRows = rows.slice(1)

      const savedKey = user?.id ? mappingStorageKey(user.id) : null
      const saved = savedKey ? localStorage.getItem(savedKey) : null
      const savedMapping: FieldMapping | null = saved ? JSON.parse(saved) : null
      const validSaved = savedMapping &&
        [savedMapping.sku, savedMapping.quantity].every(col => !col || headers.includes(col)) &&
        (!savedMapping.product_name || headers.includes(savedMapping.product_name))

      setRawFile({ headers, rows: dataRows, fileName: file.name })
      setMapping(validSaved
        ? { sku: savedMapping!.sku, product_name: savedMapping!.product_name, quantity: savedMapping!.quantity }
        : guessMapping(headers))
      setShowMappingModal(true)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Eroare la citirea fișierului.'
      setMsg({ kind: 'err', text: message })
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function applyMapping() {
    if (!rawFile) return
    const { headers, rows, fileName } = rawFile
    const skuIdx = headers.indexOf(mapping.sku)
    const nameIdx = mapping.product_name ? headers.indexOf(mapping.product_name) : -1
    const qtyIdx = headers.indexOf(mapping.quantity)

    const parsed: ParsedRow[] = []
    for (const r of rows) {
      const sku = (r[skuIdx] ?? '').trim()
      const qty = parseFloat((r[qtyIdx] ?? '0').replace(',', '.'))
      if (!sku || isNaN(qty)) continue
      parsed.push({
        sku,
        quantity: qty,
        product_name: nameIdx >= 0 ? (r[nameIdx] ?? '').trim() : '',
      })
    }

    if (!parsed.length) {
      setMsg({ kind: 'err', text: 'Niciun rând valid găsit cu maparea selectată.' })
      setShowMappingModal(false)
      setRawFile(null)
      return
    }

    if (user?.id) {
      // Persist mapping (warehouse field stays whatever was saved — we don't touch it here)
      const existing = localStorage.getItem(mappingStorageKey(user.id))
      const merged = {
        ...(existing ? JSON.parse(existing) : {}),
        sku: mapping.sku,
        product_name: mapping.product_name,
        quantity: mapping.quantity,
      }
      localStorage.setItem(mappingStorageKey(user.id), JSON.stringify(merged))
    }

    setShowMappingModal(false)
    setRawFile(null)
    setPreview({ rows: parsed, fileName })
  }

  async function commitUpload() {
    if (!preview || !warehouseId) return
    setBusy(true)
    setMsg(null)
    try {
      const rows = preview.rows.map(p => ({
        company_id: user?.id,
        warehouse_id: warehouseId,
        sku: p.sku,
        product_name: p.product_name || null,
        quantity: p.quantity,
        updated_at: new Date().toISOString(),
      }))

      // Replace inventory wholesale for this warehouse
      await supabase.from('livra_inventory').delete().eq('warehouse_id', warehouseId)
      for (let i = 0; i < rows.length; i += 500) {
        await supabase.from('livra_inventory').insert(rows.slice(i, i + 500))
      }
      await supabase.from('livra_inventory_uploads').insert({
        company_id: user?.id,
        file_name: preview.fileName,
        row_count: rows.length,
        uploaded_by: user?.id,
      })
      setMsg({ kind: 'ok', text: `${rows.length} rânduri încărcate cu succes.` })
      setPreview(null)
      await load()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Eroare la încărcare.'
      setMsg({ kind: 'err', text: message })
    } finally {
      setBusy(false)
    }
  }

  function cancelMapping() { setShowMappingModal(false); setRawFile(null) }

  const lastUpload = uploads[0]
  const mappingFields = [
    { field: 'sku' as const,          label: 'SKU / Articol',   required: true,  hint: '1C: Артикул' },
    { field: 'product_name' as const, label: 'Denumire produs', required: false, hint: '1C: Наименование' },
    { field: 'quantity' as const,     label: 'Cantitate',       required: true,  hint: '1C: Количество' },
  ]
  const canApply = !!mapping.sku && !!mapping.quantity

  const filtered = search.trim()
    ? inventory.filter(i => {
        const q = search.toLowerCase()
        return i.sku.toLowerCase().includes(q) || (i.product_name ?? '').toLowerCase().includes(q)
      })
    : inventory

  if (!loading && !warehouse) {
    return (
      <div className="p-6">
        <p className="text-[13px] text-zinc-500">Depozit negăsit.</p>
        <button onClick={() => navigate('/warehouses')} className="mt-2 text-[13px] text-blue-600 hover:underline">← Înapoi la depozite</button>
      </div>
    )
  }

  return (
    <>
      <Helmet><title>{warehouse?.name ?? 'Depozit'} — Livra</title></Helmet>
      <div className="p-6 space-y-6 max-w-5xl">
        <div>
          <Link to="/warehouses" className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 mb-2">
            <ArrowLeft size={13} /> Toate depozitele
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{warehouse?.name}</h1>
            {warehouse?.is_default && (
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 rounded uppercase tracking-wider font-semibold flex items-center gap-1">
                <Star size={10} /> Implicit
              </span>
            )}
          </div>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">{warehouse?.address}</p>
        </div>

        {/* Status + upload card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Package size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-[14px] font-medium text-zinc-900 dark:text-zinc-100">{inventory.length} produse în acest depozit</div>
                {lastUpload ? (
                  <div className="text-[12px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                    <Clock size={12} />
                    Ultima încărcare: {fmtAgo(lastUpload.uploaded_at)} ({lastUpload.row_count} rânduri)
                  </div>
                ) : (
                  <div className="text-[12px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-0.5">
                    <AlertCircle size={12} />
                    Niciun inventar încărcat încă
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-[12px] rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Upload size={14} /> Încarcă inventar
            </button>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,text/csv,text/plain" hidden onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
          </div>
        </div>

        {msg && (
          <div className={`flex items-center gap-2 text-[13px] px-4 py-3 rounded-lg ${msg.kind === 'ok' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300'}`}>
            {msg.kind === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {msg.text}
          </div>
        )}

        {/* Preview before commit */}
        {preview && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-medium text-zinc-900 dark:text-zinc-100">Previzualizare: {preview.fileName}</div>
                <div className="text-[12px] text-zinc-500 mt-0.5">
                  {preview.rows.length} rânduri vor înlocui inventarul curent ({inventory.length} rânduri).
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPreview(null)} disabled={busy} className="px-3 py-2 text-[12px] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">Anulează</button>
                <button onClick={commitUpload} disabled={busy} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-[12px] rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {busy ? 'Se salvează…' : 'Confirmă și salvează'}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-[12px]">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">SKU</th>
                    <th className="text-left px-3 py-2 font-medium">Produs</th>
                    <th className="text-right px-3 py-2 font-medium">Cantitate</th>
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
                <div className="text-center text-[11px] text-zinc-500 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
                  + {preview.rows.length - 50} rânduri suplimentare
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inventory list */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">Produse în depozit</h2>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Caută SKU sau denumire…"
                className="pl-7 pr-3 py-1.5 text-[12px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md w-56 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="text-left px-4 py-2 font-medium w-40">SKU</th>
                  <th className="text-left px-4 py-2 font-medium">Denumire produs</th>
                  <th className="text-right px-4 py-2 font-medium w-28">Cantitate</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="text-center py-12 text-zinc-400">Se încarcă…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-12">
                      <Package size={24} className="text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                      <p className="text-[12px] text-zinc-400">
                        {inventory.length === 0
                          ? 'Niciun produs în acest depozit. Încarcă un fișier CSV pentru a începe.'
                          : 'Niciun produs nu corespunde căutării.'}
                      </p>
                    </td>
                  </tr>
                ) : filtered.map(row => (
                  <tr key={row.id} className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-2 font-mono text-zinc-700 dark:text-zinc-300">{row.sku}</td>
                    <td className="px-4 py-2 text-zinc-700 dark:text-zinc-300">{row.product_name || <span className="text-zinc-400">—</span>}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-zinc-800 dark:text-zinc-200 font-semibold">{row.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && inventory.length > 0 && (
            <div className="px-4 py-2 text-[11px] text-zinc-400 bg-zinc-50/50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800">
              {filtered.length} din {inventory.length} produse
            </div>
          )}
        </div>
      </div>

      {/* Field mapping modal */}
      {showMappingModal && rawFile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={cancelMapping}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">Mapează coloanele</h2>
              <button onClick={cancelMapping} className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                <X size={16} />
              </button>
            </div>
            <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-5">
              Selectează ce coloană din <span className="font-medium text-zinc-700 dark:text-zinc-300">{rawFile.fileName}</span> corespunde fiecărui câmp. Rândurile vor fi încărcate în depozitul <span className="font-medium text-zinc-700 dark:text-zinc-300">{warehouse?.name}</span>.
            </p>

            <div className="space-y-3">
              {mappingFields.map(({ field, label, required, hint }) => (
                <div key={field} className="flex items-center gap-4">
                  <div className="w-40 flex-shrink-0">
                    <div className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">
                      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
                    </div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{hint}</div>
                  </div>
                  <div className="relative flex-1">
                    <select
                      value={mapping[field]}
                      onChange={e => setMapping(m => ({ ...m, [field]: e.target.value }))}
                      className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-[12px] text-zinc-800 dark:text-zinc-200 pr-7 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    >
                      <option value="">{required ? 'Alege coloana…' : '— Ignoră —'}</option>
                      {rawFile.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>

            {canApply && rawFile.rows.length > 0 && (
              <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-2">Previzualizare (primele 3 rânduri):</div>
                <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-[11px]">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                      <tr>
                        {mappingFields.filter(f => mapping[f.field]).map(f => (
                          <th key={f.field} className="text-left px-2 py-1.5 text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">{mapping[f.field]}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rawFile.rows.slice(0, 3).map((row, i) => (
                        <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800">
                          {mappingFields.filter(f => mapping[f.field]).map(f => {
                            const idx = rawFile.headers.indexOf(mapping[f.field])
                            return (
                              <td key={f.field} className="px-2 py-1.5 text-zinc-600 dark:text-zinc-400 max-w-[130px] truncate">
                                {row[idx] ?? '—'}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={cancelMapping} className="px-3 py-2 text-[12px] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">Anulează</button>
              <button onClick={applyMapping} disabled={!canApply} className="px-3 py-2 bg-blue-600 text-white text-[12px] rounded-lg hover:bg-blue-700 disabled:opacity-50">
                Aplică și previzualizează
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
