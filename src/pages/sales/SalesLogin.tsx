import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { signIn } from '../../lib/auth'

export default function SalesLogin() {
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
      const user = await signIn(email, password)
      if (user.must_change_password) {
        navigate('/sales/change-password', { replace: true })
      } else {
        navigate('/sales', { replace: true })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Autentificare eșuată')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full pl-9 pr-3 py-2.5 text-[13px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-colors'

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <Helmet>
        <title>Autentificare | Livra Sales</title>
        <meta name="description" content="Intră în contul tău Livra Sales pentru a gestiona comenzile." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex flex-col items-center mb-3">
            <span className="text-[32px] font-bold text-[#161513] dark:text-white tracking-widest uppercase font-serif leading-none">LIVRA</span>
            <svg width="72" height="5" viewBox="0 0 72 5">
              <line x1="0" y1="2.5" x2="58" y2="2.5" stroke="#ff5c2c" strokeWidth="2"/>
              <polygon points="58,0.5 72,2.5 58,4.5" fill="#ff5c2c"/>
            </svg>
          </div>
          <span className="text-[11px] font-medium text-brand-orange bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-full mt-2">Sales</span>
          <p className="text-[13px] text-zinc-400 dark:text-zinc-500 mt-2">Autentifică-te în contul tău</p>
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
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-orange hover:bg-orange-500 disabled:opacity-50 text-white text-[13px] font-medium rounded-lg transition-colors"
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
