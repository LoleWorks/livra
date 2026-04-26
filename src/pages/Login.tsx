import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { API, setUser } from '../lib/auth'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail ?? 'Autentificare eșuată')
        return
      }
      setUser(data)
      if (data.must_change_password) {
        navigate('/change-password', { replace: true })
      } else if (data.role === 'admin') {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/sales', { replace: true })
      }
    } catch {
      setError('Nu s-a putut contacta serverul. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full pl-9 pr-3 py-2.5 text-[13px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors'

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center mb-3 shadow-lg shadow-violet-500/25">
            <Truck size={22} className="text-white" />
          </div>
          <h1 className="text-[20px] font-bold text-zinc-900 dark:text-zinc-50">Livra</h1>
          <p className="text-[13px] text-zinc-400 dark:text-zinc-500 mt-1">Autentifică-te în contul tău</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <form onSubmit={submit} className="space-y-4">

            <div>
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  autoFocus
                  required
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="email@companie.md"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block mb-1.5">Parolă</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••"
                  className={`${inputCls} pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
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
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-[13px] font-medium rounded-lg transition-colors"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Se verifică...</> : 'Autentifică-te'}
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] text-zinc-400 dark:text-zinc-500 mt-4">
          Ai uitat parola? Contactează administratorul.
        </p>
      </div>
    </div>
  )
}
