import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Loader2, Eye, EyeOff, ShieldCheck, Truck } from 'lucide-react'
import { API, getUser, setUser } from '../lib/auth'

export default function ChangePassword() {
  const navigate = useNavigate()
  const user = getUser()
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  function validate() {
    if (newPw.length < 8) return 'Parola trebuie să aibă cel puțin 8 caractere'
    if (newPw !== confirmPw) return 'Parolele nu coincid'
    return ''
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user!.id, role: user!.role, new_password: newPw }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail ?? 'A apărut o eroare')
        return
      }
      setUser({ ...user!, must_change_password: false })
      if (user!.role === 'admin') {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/sales', { replace: true })
      }
    } catch {
      setError('Nu s-a putut contacta serverul.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full pl-9 pr-10 py-2.5 text-[13px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors'

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <Helmet>
        <title>Schimbă parola — Livra</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center mb-3 shadow-lg shadow-violet-500/25">
            <Truck size={22} className="text-white" />
          </div>
          <h1 className="text-[20px] font-bold text-zinc-900 dark:text-zinc-50">Setează parola</h1>
          <p className="text-[13px] text-zinc-400 dark:text-zinc-500 mt-1 text-center max-w-xs">
            Contul tău folosește o parolă temporară. Trebuie să o schimbi înainte de a continua.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
          <ShieldCheck size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-700 dark:text-amber-400">
            Alege o parolă puternică de cel puțin 8 caractere. Nu o împărtăși cu nimeni.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <form onSubmit={submit} className="space-y-4">

            <div>
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block mb-1.5">Parolă nouă</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showNew ? 'text' : 'password'}
                  autoFocus
                  required
                  value={newPw}
                  onChange={e => { setNewPw(e.target.value); setError('') }}
                  placeholder="Cel puțin 8 caractere"
                  className={inputCls}
                />
                <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors">
                  {showNew ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              {newPw && (
                <div className="flex gap-1 mt-1.5">
                  {[4, 6, 8, 10].map(n => (
                    <div key={n} className={`flex-1 h-1 rounded-full transition-colors ${newPw.length >= n ? 'bg-violet-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block mb-1.5">Confirmă parola</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPw}
                  onChange={e => { setConfirmPw(e.target.value); setError('') }}
                  placeholder="Repetă parola"
                  className={`${inputCls} ${confirmPw && confirmPw !== newPw ? 'border-red-400 focus:border-red-400' : ''}`}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors">
                  {showConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg px-3 py-2.5 text-[12px] text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !newPw || !confirmPw}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-[13px] font-medium rounded-lg transition-colors"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Se salvează...</> : 'Setează parola'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
