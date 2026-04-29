import { Helmet } from 'react-helmet-async'
import { useState, useRef, useEffect } from 'react'
import { Plus, Phone, MapPin, MoreHorizontal, X, Check, Pencil, Trash2, Smartphone, Eye, EyeOff, Copy, Mail, ShoppingBag, KeyRound, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'

// ── Sales Manager types ───────────────────────────────────────────────────────

type SalesManager = {
  id: string
  name: string
  phone: string
  email: string
  status: 'activ' | 'inactiv'
  initials: string
  color: string
  created_at: string
}

type Driver = {
  id: string
  name: string
  phone: string
  pin: string
  status: 'active' | 'done' | 'offline' | 'lunch_break' | 'fuel_break'
  total: number
  today: number
  goal: number
  initials: string
  color: string
  device_name: string | null
  device_model: string | null
  last_login: string | null
}

type DriverLocation = {
  driver_id: string
  lat: number
  lng: number
  updated_at: string
}

// "12s ago" / "3m ago" / "1h ago" | short human-readable elapsed time
function fmtAgo(iso: string): string {
  const sec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (sec < 60)    return `acum ${Math.round(sec)}s`
  if (sec < 3600)  return `acum ${Math.round(sec / 60)} min`
  if (sec < 86400) return `acum ${Math.round(sec / 3600)} h`
  return `acum ${Math.round(sec / 86400)} zile`
}

const COLORS = [
  'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  'bg-orange-100 dark:bg-orange-900/30 text-brand-orange dark:text-orange-400',
  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
]

const COLOR_KEYS = ['violet', 'blue', 'emerald', 'amber', 'rose', 'cyan']
const COLOR_MAP: Record<string, string> = {
  violet: COLORS[0], blue: COLORS[1], emerald: COLORS[2],
  amber: COLORS[3], rose: COLORS[4], cyan: COLORS[5],
}

const statusDot: Record<string, string> = {
  active:      'bg-emerald-500',
  lunch_break: 'bg-amber-500',
  fuel_break:  'bg-amber-500',
  done:        'bg-orange-500',
  offline:     'bg-zinc-300 dark:bg-zinc-600',
}
const statusLabel: Record<string, string> = {
  active:      'Activ',
  lunch_break: 'Pauză masă',
  fuel_break:  'Pauză combustibil',
  done:        'Finalizat',
  offline:     'Offline',
}
const statusBadge: Record<string, string> = {
  active:      'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
  lunch_break: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',
  fuel_break:  'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',
  done:        'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50',
  offline:     'text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800',
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function mapRow(d: Record<string, unknown>): Driver {
  return {
    id: d.id as string,
    name: d.name as string,
    phone: (d.phone as string) ?? '',
    pin: (d.pin as string) ?? '',
    status: (d.status as Driver['status']) ?? 'offline',
    total: (d.total as number) ?? 0,
    today: (d.today as number) ?? 0,
    goal: (d.goal as number) ?? 0,
    initials: (d.initials as string) ?? initials(d.name as string),
    color: COLOR_MAP[d.color as string] ?? COLORS[0],
    device_name: (d.device_name as string) ?? null,
    device_model: (d.device_model as string) ?? null,
    last_login: (d.last_login as string) ?? null,
  }
}

// Generic menu that closes on outside click
function ItemMenu({ onEdit, onDelete, deleteLabel }: { onEdit: () => void; onDelete: () => void; deleteLabel: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-6 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg py-1 w-36 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onEdit() }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Pencil size={12} className="text-zinc-400" /> Editează
          </button>
          <button
            onClick={() => { setOpen(false); onDelete() }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 size={12} /> {deleteLabel}
          </button>
        </div>
      )}
    </div>
  )
}

export default function Drivers() {
  const [tab, setTab] = useState<'soferi' | 'agenti'>('soferi')

  // ── Drivers state ──────────────────────────────────────────────────────────
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [locations, setLocations] = useState<Record<string, DriverLocation>>({})
  const [now, setNow] = useState(Date.now())
  const [revealedPins, setRevealedPins] = useState<Set<string>>(new Set())
  const [copiedPinId, setCopiedPinId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Driver | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', pin: '' })
  const [pinError, setPinError] = useState('')

  // ── Sales managers state ───────────────────────────────────────────────────
  const [managers, setManagers] = useState<SalesManager[]>([])
  const [showMgrModal, setShowMgrModal] = useState(false)
  const [editMgr, setEditMgr] = useState<SalesManager | null>(null)
  const [mgrForm, setMgrForm] = useState({ name: '', phone: '', email: '', status: 'activ' as 'activ' | 'inactiv', password: '' })
  const [mgrSaving, setMgrSaving] = useState(false)
  const [mgrError, setMgrError] = useState('')
  const [tempPw, setTempPw] = useState('')
  const [tempPwSaving, setTempPwSaving] = useState(false)
  const [tempPwDone, setTempPwDone] = useState(false)

  // Initial load + 30-second auto-refresh of driver rows + last-known positions.
  // Realtime subscription on top of that means ANY change (new login, position
  // update, status flip) is reflected within ~1s without waiting for the timer.
  useEffect(() => {
    const fetchAll = async () => {
      const today = new Date().toISOString().slice(0, 10)
      const [dRes, lRes, sRes] = await Promise.all([
        supabase.from('livra_drivers').select('*').order('created_at'),
        supabase.from('livra_driver_locations').select('driver_id, lat, lng, updated_at'),
        // Completed delivery stops joined via routes for the per-driver counts
        supabase.from('livra_route_stops')
          .select('route_id, status, type, livra_routes!inner(driver_id, date)')
          .eq('status', 'completed')
          .eq('type', 'delivery'),
      ])
      // Tally totals + today's count per driver from real data
      const totalByDriver: Record<string, number> = {}
      const todayByDriver: Record<string, number> = {}
      for (const row of (sRes.data ?? []) as unknown as Array<{ livra_routes: { driver_id: string; date: string } }>) {
        const did = row.livra_routes?.driver_id
        if (!did) continue
        totalByDriver[did] = (totalByDriver[did] ?? 0) + 1
        if (row.livra_routes.date === today) {
          todayByDriver[did] = (todayByDriver[did] ?? 0) + 1
        }
      }
      if (dRes.data) {
        // Override the stored total/today columns with the real counts
        const enriched = dRes.data.map(d => ({
          ...d,
          total: totalByDriver[d.id as string] ?? 0,
          today: todayByDriver[d.id as string] ?? 0,
        }))
        setDrivers(enriched.map(mapRow))
      }
      if (lRes.data) {
        const map: Record<string, DriverLocation> = {}
        for (const r of lRes.data) map[r.driver_id] = r as DriverLocation
        setLocations(map)
      }
    }
    fetchAll()

    // Load sales managers
    supabase.from('livra_sales_managers').select('*').order('created_at')
      .then(({ data }) => { if (data) setManagers(data as SalesManager[]) })

    const refresh = setInterval(fetchAll, 30_000)

    // Also tick once a second so the "acum 12s" text stays accurate
    const ticker = setInterval(() => setNow(Date.now()), 1000)

    // Realtime: instantly reflect status changes + location updates
    const channel = supabase
      .channel('drivers-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'livra_drivers' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'livra_driver_locations' }, () => {
        // Just refetch locations | driver rows are unchanged
        supabase.from('livra_driver_locations').select('driver_id, lat, lng, updated_at')
          .then(({ data }) => {
            if (!data) return
            const map: Record<string, DriverLocation> = {}
            for (const r of data) map[r.driver_id] = r as DriverLocation
            setLocations(map)
          })
      })
      .subscribe()

    return () => {
      clearInterval(refresh)
      clearInterval(ticker)
      supabase.removeChannel(channel)
    }
  }, [])
  // `now` is referenced in render so eslint doesn't complain that it's unused
  void now

  function openAdd() {
    setEditTarget(null)
    setForm({ name: '', phone: '', pin: '' })
    setPinError('')
    setShowModal(true)
  }

  function openEdit(d: Driver) {
    setEditTarget(d)
    setForm({ name: d.name, phone: d.phone, pin: '' })
    setPinError('')
    setShowModal(true)
  }

  async function checkPinUnique(pin: string, excludeId?: string): Promise<boolean> {
    const { data } = await supabase
      .from('livra_drivers')
      .select('id')
      .eq('pin', pin)
    if (!data || data.length === 0) return true
    if (excludeId && data.every(r => r.id === excludeId)) return true
    return false
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setPinError('')
    const ini = initials(form.name)
    if (editTarget) {
      const updates: Record<string, unknown> = { name: form.name, phone: form.phone, initials: ini }
      if (form.pin.length >= 4) {
        const unique = await checkPinUnique(form.pin, editTarget.id)
        if (!unique) { setPinError('Acest PIN este deja folosit de alt șofer.'); return }
        updates.pin = form.pin
      }
      const { data } = await supabase
        .from('livra_drivers')
        .update(updates)
        .eq('id', editTarget.id)
        .select()
        .single()
      if (data) setDrivers(prev => prev.map(d => d.id === editTarget.id
        ? { ...d, name: form.name, phone: form.phone, initials: ini }
        : d
      ))
    } else {
      if (form.pin.length < 4) { setPinError('PIN-ul trebuie să aibă cel puțin 4 cifre.'); return }
      const unique = await checkPinUnique(form.pin)
      if (!unique) { setPinError('Acest PIN este deja folosit de alt șofer.'); return }
      const colorKey = COLOR_KEYS[drivers.length % COLOR_KEYS.length]
      const { data } = await supabase
        .from('livra_drivers')
        .insert({ name: form.name, phone: form.phone, pin: form.pin, status: 'offline', total: 0, today: 0, goal: 0, initials: ini, color: colorKey })
        .select()
        .single()
      if (data) setDrivers(prev => [...prev, mapRow(data as Record<string, unknown>)])
    }
    setShowModal(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('livra_drivers').delete().eq('id', id)
    setDrivers(prev => prev.filter(d => d.id !== id))
  }

  // ── Manager CRUD ───────────────────────────────────────────────────────────

  function openAddMgr() {
    setEditMgr(null)
    setMgrForm({ name: '', phone: '', email: '', status: 'activ', password: '' })
    setMgrError('')
    setTempPw('')
    setTempPwDone(false)
    setShowMgrModal(true)
  }

  function openEditMgr(m: SalesManager) {
    setEditMgr(m)
    setMgrForm({ name: m.name, phone: m.phone, email: m.email, status: m.status, password: '' })
    setMgrError('')
    setTempPw('')
    setTempPwDone(false)
    setShowMgrModal(true)
  }

  async function handleSaveMgr() {
    if (!mgrForm.name.trim() || !mgrForm.email.trim()) return
    setMgrError('')
    setMgrSaving(true)
    try {
      if (editMgr) {
        // Update name/phone/email/status via Supabase directly (no password change here)
        await supabase
          .from('livra_sales_managers')
          .update({ name: mgrForm.name, phone: mgrForm.phone, email: mgrForm.email, status: mgrForm.status, initials: initials(mgrForm.name) })
          .eq('id', editMgr.id)
        setManagers(prev => prev.map(m => m.id === editMgr.id
          ? { ...m, name: mgrForm.name, phone: mgrForm.phone, email: mgrForm.email, status: mgrForm.status, initials: initials(mgrForm.name) }
          : m
        ))
        setShowMgrModal(false)
      } else {
        // Create new manager via Supabase Edge Function
        if (!mgrForm.password || mgrForm.password.length < 6) {
          setMgrError('Parola trebuie să aibă cel puțin 6 caractere')
          return
        }
        const { data, error } = await supabase.functions.invoke('create-manager', {
          body: { name: mgrForm.name, phone: mgrForm.phone, email: mgrForm.email, status: mgrForm.status, password: mgrForm.password },
        })
        if (error || !data) { setMgrError((data as { error?: string })?.error ?? error?.message ?? 'Eroare la creare'); return }
        setManagers(prev => [...prev, data as SalesManager])
        setShowMgrModal(false)
      }
    } finally {
      setMgrSaving(false)
    }
  }

  async function handleSetTempPassword() {
    if (!editMgr || !tempPw || tempPw.length < 6) return
    setTempPwSaving(true)
    try {
      const { error } = await supabase.functions.invoke('reset-manager-password', {
        body: { manager_id: editMgr.id, temp_password: tempPw },
      })
      if (!error) {
        setTempPwDone(true)
        setTempPw('')
      }
    } finally {
      setTempPwSaving(false)
    }
  }

  async function handleDeleteMgr(id: string) {
    await supabase.from('livra_sales_managers').delete().eq('id', id)
    setManagers(prev => prev.filter(m => m.id !== id))
  }

  return (
    <>
      <Helmet>
        <title>Utilizatori | Livra</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">
                {editTarget ? 'Editează șofer' : 'Adaugă șofer nou'}
              </span>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">Nume complet *</label>
                <input
                  autoFocus
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  placeholder="Ion Popescu"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-orange-500 placeholder:text-zinc-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">Telefon</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  placeholder="069 000 000"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-orange-500 placeholder:text-zinc-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
                  PIN aplicație {editTarget ? '(lasă gol pentru a păstra)' : '*'}
                </label>
                <input
                  value={form.pin}
                  onChange={e => { setPinError(''); setForm(p => ({ ...p, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })) }}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  placeholder="ex: 1234"
                  inputMode="numeric"
                  className={`w-full bg-zinc-50 dark:bg-zinc-800 border text-zinc-800 dark:text-zinc-200 text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 placeholder:text-zinc-400 transition-colors tracking-widest ${pinError ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-zinc-200 dark:border-zinc-700 focus:ring-blue-500 focus:border-orange-500'}`}
                />
                {pinError && <p className="text-[11px] text-red-500 mt-1">{pinError}</p>}
              </div>
              {form.name && (
                <div className="flex items-center gap-2 pt-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold ${COLORS[editTarget ? drivers.findIndex(d => d.id === editTarget.id) % COLORS.length : drivers.length % COLORS.length]}`}>
                    {initials(form.name)}
                  </div>
                  <span className="text-[12px] text-zinc-500 dark:text-zinc-400">Previzualizare inițiale</span>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={!form.name.trim()}
                  className="flex items-center gap-1.5 bg-brand-orange hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <Check size={13} /> {editTarget ? 'Salvează' : 'Adaugă'}
                </button>
                <button onClick={() => setShowModal(false)} className="text-[13px] text-zinc-500 px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  Anulează
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales manager modal */}
      {showMgrModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowMgrModal(false)} />
          <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">
                {editMgr ? 'Editează agent' : 'Adaugă agent de vânzări'}
              </span>
              <button onClick={() => setShowMgrModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">Nume complet *</label>
                <input
                  autoFocus
                  value={mgrForm.name}
                  onChange={e => setMgrForm(p => ({ ...p, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSaveMgr()}
                  placeholder="Maria Popescu"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-orange-500 placeholder:text-zinc-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">Telefon</label>
                <input
                  value={mgrForm.phone}
                  onChange={e => setMgrForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="069 000 000"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-orange-500 placeholder:text-zinc-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">Email *</label>
                <input
                  type="email"
                  value={mgrForm.email}
                  onChange={e => setMgrForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="agent@companie.md"
                  disabled={!!editMgr}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-orange-500 placeholder:text-zinc-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {editMgr && <p className="text-[10px] text-zinc-400 mt-1">Emailul nu poate fi modificat după creare.</p>}
              </div>

              {/* Password | only on create */}
              {!editMgr && (
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">Parolă inițială *</label>
                  <input
                    type="password"
                    value={mgrForm.password}
                    onChange={e => setMgrForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Cel puțin 6 caractere"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-orange-500 placeholder:text-zinc-400 transition-colors"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Agentul va fi rugat să o schimbe la prima autentificare.</p>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">Status</label>
                <div className="flex gap-2">
                  {(['activ', 'inactiv'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setMgrForm(p => ({ ...p, status: s }))}
                      className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
                        mgrForm.status === s
                          ? s === 'activ'
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-zinc-500 border-zinc-500 text-white'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {s === 'activ' ? 'Activ' : 'Inactiv'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temp password reset | only on edit */}
              {editMgr && (
                <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <KeyRound size={10} /> Resetare parolă
                  </label>
                  {tempPwDone ? (
                    <div className="flex items-center gap-2 text-[12px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg px-3 py-2">
                      <Check size={13} /> Parolă temporară setată. Agentul va fi rugat să o schimbe la autentificare.
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempPw}
                        onChange={e => setTempPw(e.target.value)}
                        placeholder="Parolă temporară"
                        className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-orange-500 placeholder:text-zinc-400 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleSetTempPassword}
                        disabled={tempPwSaving || tempPw.length < 6}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-[12px] font-medium rounded-lg transition-colors whitespace-nowrap"
                      >
                        {tempPwSaving ? '...' : 'Setează'}
                      </button>
                    </div>
                  )}
                  <div className="flex items-start gap-1 mt-1.5">
                    <AlertTriangle size={10} className="text-zinc-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-zinc-400">Agentul va fi obligat să schimbe parola temporară la prima autentificare.</p>
                  </div>
                </div>
              )}

              {mgrError && (
                <div className="text-[12px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg px-3 py-2">
                  {mgrError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveMgr}
                  disabled={mgrSaving || !mgrForm.name.trim() || !mgrForm.email.trim()}
                  className="flex items-center gap-1.5 bg-brand-orange hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <Check size={13} /> {editMgr ? 'Salvează' : 'Adaugă'}
                </button>
                <button onClick={() => setShowMgrModal(false)} className="text-[13px] text-zinc-500 px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  Anulează
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 md:px-5 h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0 gap-2">
          {/* Tab switcher */}
          <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 min-w-0 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setTab('soferi')}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${tab === 'soferi' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}`}
            >
              Șoferi ({drivers.length})
            </button>
            <button
              onClick={() => setTab('agenti')}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${tab === 'agenti' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}`}
            >
              <span className="hidden sm:inline">Agenți de vânzări</span><span className="sm:hidden">Agenți</span> ({managers.length})
            </button>
          </div>
          {tab === 'soferi' ? (
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 bg-brand-orange hover:bg-orange-500 text-white text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
            >
              <Plus size={12} /> <span className="hidden sm:inline">Adaugă șofer</span><span className="sm:hidden">Adaugă</span>
            </button>
          ) : (
            <button
              onClick={openAddMgr}
              className="flex items-center gap-1.5 bg-brand-orange hover:bg-orange-500 text-white text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
            >
              <Plus size={12} /> <span className="hidden sm:inline">Adaugă agent</span><span className="sm:hidden">Adaugă</span>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-4">

          {/* ── Managers tab ─────────────────────────────────────────────── */}
          {tab === 'agenti' && (
            <div className="space-y-2">
              {managers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-zinc-400 dark:text-zinc-600">
                  <ShoppingBag size={32} className="text-zinc-300 dark:text-zinc-700" />
                  <p className="text-[13px]">Niciun agent adăugat încă</p>
                  <button onClick={openAddMgr} className="flex items-center gap-1.5 text-[12px] text-brand-orange dark:text-orange-400 hover:underline">
                    <Plus size={12} /> Adaugă primul agent
                  </button>
                </div>
              ) : managers.map(m => (
                <div key={m.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${m.color}`}>
                    {m.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-50">{m.name}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${m.status === 'activ' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                        {m.status === 'activ' ? 'Activ' : 'Inactiv'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-0.5">
                      {m.phone && (
                        <a href={`tel:${m.phone}`} className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500 hover:text-brand-orange dark:hover:text-orange-400 transition-colors">
                          <Phone size={9} /> {m.phone}
                        </a>
                      )}
                      {m.email && (
                        <a href={`mailto:${m.email}`} className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500 hover:text-brand-orange dark:hover:text-orange-400 transition-colors">
                          <Mail size={9} /> {m.email}
                        </a>
                      )}
                    </div>
                  </div>
                  <ItemMenu onEdit={() => openEditMgr(m)} onDelete={() => handleDeleteMgr(m.id)} deleteLabel="Șterge agent" />
                </div>
              ))}
            </div>
          )}

          {/* ── Drivers tab ──────────────────────────────────────────────── */}
          {tab === 'soferi' && (drivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-400 dark:text-zinc-600">
              <div className="text-4xl">🚚</div>
              <p className="text-[13px]">Niciun șofer adăugat încă</p>
              <button onClick={openAdd} className="flex items-center gap-1.5 text-[12px] text-brand-orange dark:text-orange-400 hover:underline">
                <Plus size={12} /> Adaugă primul șofer
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {drivers.map((d) => {
                const pct = d.goal > 0 ? Math.round((d.today / d.goal) * 100) : 0
                return (
                  <div key={d.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold ${d.color}`}>
                            {d.initials}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-900 ${statusDot[d.status]}`} />
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-50">{d.name}</div>
                          <div className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                            <Phone size={9} />{d.phone || '—'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge[d.status]}`}>
                          {statusLabel[d.status]}
                        </span>
                        <ItemMenu onEdit={() => openEdit(d)} onDelete={() => handleDelete(d.id)} deleteLabel="Șterge șofer" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg px-3 py-2.5">
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500">Total livrări</div>
                        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">{d.total}</div>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg px-3 py-2.5">
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500">Azi</div>
                        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">
                          {d.today}{d.goal > 0 && <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">/{d.goal}</span>}
                        </div>
                      </div>
                    </div>

                    {d.goal > 0 && (
                      <div>
                        <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500 mb-1">
                          <span>Progres</span><span>{pct}%</span>
                        </div>
                        <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 mt-2.5">
                      <Smartphone size={9} className={d.device_model ? 'text-orange-400' : 'text-zinc-300 dark:text-zinc-600'} />
                      {d.device_model
                        ? <span>{d.device_name ? `${d.device_name} · ` : ''}{d.device_model}</span>
                        : <span className="italic">Niciun dispozitiv conectat</span>
                      }
                    </div>
                    {(() => {
                      const loc = locations[d.id]
                      if (!loc) {
                        // Driver has never sent a position
                        if (d.status === 'offline') return null
                        return (
                          <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                            <MapPin size={9} className="text-zinc-300" /> Așteaptă semnal GPS…
                          </div>
                        )
                      }
                      const ageSec = (Date.now() - new Date(loc.updated_at).getTime()) / 1000
                      const fresh = ageSec < 120 // green dot only if updated in the last 2 minutes
                      return (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                          <MapPin size={9} className={fresh ? 'text-emerald-500' : 'text-amber-500'} />
                          <span title={`${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`}>
                            Poziție actualizată {fmtAgo(loc.updated_at)}
                          </span>
                        </div>
                      )
                    })()}

                    {/* PIN reveal | admin can recover the driver's login code if they forget it */}
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">PIN:</span>
                      <span className="text-[11px] font-mono font-semibold text-zinc-700 dark:text-zinc-300 tracking-wider select-all">
                        {revealedPins.has(d.id) ? d.pin : '••••'}
                      </span>
                      <button
                        onClick={() => setRevealedPins(s => {
                          const n = new Set(s)
                          if (n.has(d.id)) n.delete(d.id); else n.add(d.id)
                          return n
                        })}
                        className="text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors"
                        title={revealedPins.has(d.id) ? 'Ascunde PIN' : 'Arată PIN'}
                      >
                        {revealedPins.has(d.id) ? <EyeOff size={11} /> : <Eye size={11} />}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(d.pin)
                          setCopiedPinId(d.id)
                          setTimeout(() => setCopiedPinId(p => p === d.id ? null : p), 1500)
                        }}
                        className="text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors"
                        title="Copiază PIN"
                      >
                        {copiedPinId === d.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
