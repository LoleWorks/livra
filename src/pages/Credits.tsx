import { useState, useEffect } from 'react'
import { Plus, ArrowDownLeft, ArrowUpRight, Zap, X, Check, CreditCard } from 'lucide-react'
import { supabase } from '../lib/supabase'

type Transaction = { id: string; type: 'deduct' | 'topup'; desc: string; date: string; amount: number }
type Package = { credits: number; price: string; per: string; popular: boolean }

const PACKAGES: Package[] = [
  { credits: 100,  price: '2,000 MDL', per: '20 MDL/credit', popular: false },
  { credits: 300,  price: '5,400 MDL', per: '18 MDL/credit', popular: false },
  { credits: 500,  price: '8,500 MDL', per: '17 MDL/credit', popular: true  },
  { credits: 1000, price: '15,000 MDL', per: '15 MDL/credit', popular: false },
]

function formatTxDate(iso: string): string {
  const d = new Date(iso)
  const months = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec']
  return `${d.getDate()} ${months[d.getMonth()]}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function Credits() {
  const [balance, setBalance]           = useState(0)
  const [creditsId, setCreditsId]       = useState<string | null>(null)
  const [txs, setTxs]                   = useState<Transaction[]>([])
  const [selectedPkg, setSelectedPkg]   = useState<Package | null>(null)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [showSuccess, setShowSuccess]   = useState(false)

  useEffect(() => {
    supabase
      .from('livra_credits')
      .select('*')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) { setBalance(data.balance ?? 0); setCreditsId(data.id) }
      })
    supabase
      .from('livra_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setTxs(data.map(r => ({
          id: r.id,
          type: r.type as Transaction['type'],
          desc: r.description ?? '',
          date: r.created_at,
          amount: r.amount,
        })))
      })
  }, [])

  function openPurchase(pkg: Package) {
    setSelectedPkg(pkg)
    setShowConfirm(true)
    setShowSuccess(false)
  }

  async function handlePurchase() {
    if (!selectedPkg) return
    const newBalance = balance + selectedPkg.credits
    const desc = `Reîncărcare · ${selectedPkg.credits} credite`
    const now = new Date().toISOString()

    if (creditsId) {
      await supabase.from('livra_credits').update({ balance: newBalance }).eq('id', creditsId)
    }
    const { data: txData } = await supabase
      .from('livra_transactions')
      .insert({ type: 'topup', description: desc, amount: selectedPkg.credits })
      .select()
      .single()

    setBalance(newBalance)
    if (txData) {
      setTxs(prev => [{ id: txData.id, type: 'topup', desc, date: txData.created_at ?? now, amount: selectedPkg.credits }, ...prev])
    }
    setShowSuccess(true)
    setTimeout(() => {
      setShowConfirm(false)
      setShowSuccess(false)
      setSelectedPkg(null)
    }, 1800)
  }

  const todayStr = new Date().toDateString()
  const usedToday = txs.filter(t => t.type === 'deduct' && new Date(t.date).toDateString() === todayStr).length
  const thisMonth = txs.filter(t => t.type === 'topup').reduce((s, t) => s + t.amount, 0)

  return (
    <>
      {/* Purchase modal */}
      {showConfirm && selectedPkg && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => !showSuccess && setShowConfirm(false)} />
          <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            {showSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 px-6 gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                  <Check size={24} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-center">
                  <div className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">Plată procesată</div>
                  <div className="text-[13px] text-zinc-400 dark:text-zinc-500 mt-1">
                    +{selectedPkg.credits} credite adăugate în cont
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">Confirmă achiziția</span>
                  <button onClick={() => setShowConfirm(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
                    <X size={14} />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">Pachet {selectedPkg.credits} credite</span>
                      {selectedPkg.popular && (
                        <span className="flex items-center gap-1 bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <Zap size={8} /> Popular
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {[['Credite', `${selectedPkg.credits}`], ['Preț', selectedPkg.price], ['Cost per credit', selectedPkg.per]].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[12px]">
                          <span className="text-zinc-500 dark:text-zinc-400">{k}</span>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3">
                    <CreditCard size={16} className="text-zinc-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-[12px] font-medium text-zinc-800 dark:text-zinc-200">•••• •••• •••• 4242</div>
                      <div className="text-[11px] text-zinc-400 dark:text-zinc-500">Visa · exp 12/26</div>
                    </div>
                    <button className="text-[11px] text-brand-orange dark:text-orange-400 hover:underline">Schimbă</button>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handlePurchase}
                      className="flex-1 flex items-center justify-center gap-2 bg-brand-orange hover:bg-orange-500 text-white text-[13px] font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      <Check size={14} /> Plătește {selectedPkg.price}
                    </button>
                    <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-[13px] text-zinc-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      Anulează
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-5 h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Credite</span>
          <span className="text-[12px] text-zinc-400 dark:text-zinc-500">1 credit = 1 livrare finalizată</span>
        </div>

        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-4 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-brand-orange rounded-xl p-4 flex flex-col justify-between">
              <div className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider">Sold curent</div>
              <div>
                <div className="text-4xl font-bold text-white">{balance}</div>
                <div className="text-[12px] text-blue-200 mt-0.5">credite · ≈ {(balance * 20).toLocaleString()} MDL</div>
              </div>
              <button
                onClick={() => openPurchase(PACKAGES[2])}
                className="mt-3 flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-[12px] font-semibold py-1.5 rounded-lg transition-colors"
              >
                <Plus size={12} /> Cumpără credite
              </button>
            </div>

            {[
              { label: 'Folosite azi',   value: String(usedToday), sub: 'livrări facturate'     },
              { label: 'Luna aceasta',   value: String(thisMonth), sub: `≈ ${(thisMonth * 20).toLocaleString()} MDL` },
              { label: 'Medie zilnică',  value: '~28',             sub: 'ultimele 30 zile'       },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500">{s.label}</div>
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">{s.value}</div>
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Packages */}
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Pachete</p>
            <div className="grid grid-cols-4 gap-3">
              {PACKAGES.map(pkg => (
                <button
                  key={pkg.credits}
                  onClick={() => openPurchase(pkg)}
                  className={`relative text-left rounded-xl p-4 border transition-all hover:scale-[1.02] active:scale-[0.99] ${
                    pkg.popular
                      ? 'bg-white dark:bg-zinc-900 border-orange-500 dark:border-brand-orange ring-1 ring-blue-500 dark:ring-blue-600'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 left-3 bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap size={8} /> Popular
                    </span>
                  )}
                  <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{pkg.credits}</div>
                  <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-3">credite</div>
                  <div className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">{pkg.price}</div>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{pkg.per}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Transactions */}
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Tranzacții</p>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              {txs.map(t => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${t.type === 'topup' ? 'bg-emerald-50 dark:bg-emerald-950/50' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                    {t.type === 'topup'
                      ? <ArrowDownLeft size={13} className="text-emerald-600 dark:text-emerald-400" />
                      : <ArrowUpRight size={13} className="text-zinc-400 dark:text-zinc-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-zinc-800 dark:text-zinc-200">{t.desc}</div>
                    <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">{formatTxDate(t.date)}</div>
                  </div>
                  <div className={`text-[13px] font-semibold tabular-nums ${t.type === 'topup' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {t.amount > 0 ? '+' : ''}{t.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
