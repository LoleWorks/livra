import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ShoppingBag, Truck, Shield, Star } from 'lucide-react'
import LivraCheckoutButton from '../../components/LivraCheckoutButton'

interface FormData {
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  notes: string
}

export default function CheckoutDemo() {
  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: 'Chisinau',
    notes: '',
  })
  const [filled, setFilled] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleFill(data: { name: string; phone: string; address: string; lat: number; lng: number; label: string }) {
    const parts = data.name.trim().split(' ')
    setForm(prev => ({
      ...prev,
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      phone: data.phone,
      address: data.address,
    }))
    setFilled(true)
  }

  function set(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (filled) setFilled(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-10 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={28} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Comanda plasata!</h2>
          <p className="text-sm text-zinc-500 mb-6">Vei primi un SMS cu linkul de tracking cand soferul pleaca spre tine.</p>
          <button onClick={() => { setSubmitted(false); setFilled(false); setForm({ firstName: '', lastName: '', phone: '', address: '', city: 'Chisinau', notes: '' }) }}
            className="px-6 py-2.5 bg-[#ff5c2c] text-white rounded-xl text-sm font-semibold hover:bg-[#e04a1f] transition-colors">
            Comanda noua (reset demo)
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Checkout Demo — Livra Dev</title>
      </Helmet>

      {/* Dev banner */}
      <div className="bg-amber-400 text-amber-900 text-xs font-semibold text-center py-2 px-4">
        Pagina de dezvoltare — nu este vizibila utilizatorilor
      </div>

      <div className="min-h-screen bg-zinc-50">

        {/* Fake store nav */}
        <nav className="bg-white border-b border-zinc-200 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-pink-500 rounded-lg flex items-center justify-center">
                <ShoppingBag size={14} className="text-white" />
              </div>
              <span className="font-bold text-zinc-900">Floraria Bella</span>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
              <span className="text-xs text-zinc-500 ml-1">4.9 (312 recenzii)</span>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Order form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6">
              <h2 className="font-bold text-zinc-900 mb-5 text-lg">Date de livrare</h2>

              {/* Livra button */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-100">
                <LivraCheckoutButton onFill={handleFill} />
                <span className="text-sm text-zinc-400">sau completeaza manual mai jos</span>
              </div>

              {filled && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <p className="text-xs font-medium text-green-700">Adresa completata automat din contul Livra</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">Prenume</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={e => set('firstName', e.target.value)}
                    placeholder="Ion"
                    className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5c2c] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">Nume</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={e => set('lastName', e.target.value)}
                    placeholder="Popescu"
                    className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5c2c] bg-white"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Numar de telefon</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+373 69 123 456"
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5c2c] bg-white"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Adresa de livrare</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  placeholder="Str. Stefan cel Mare 100, ap. 12"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5c2c] bg-white transition-colors ${filled ? 'border-green-300 bg-green-50' : 'border-zinc-300'}`}
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Oras</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5c2c] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Instructiuni speciale (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="Etaj 3, interfon 12, langa Mega Image..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5c2c] bg-white resize-none"
                />
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Truck, text: 'Livrare in aceeasi zi' },
                { icon: Shield, text: 'Plata la livrare' },
                { icon: Star, text: 'Tracking live sofer' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="bg-white border border-zinc-200 rounded-xl p-3 flex items-center gap-2">
                  <Icon size={14} className="text-[#ff5c2c] shrink-0" />
                  <span className="text-xs text-zinc-600">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-zinc-200 p-5">
              <h3 className="font-bold text-zinc-900 mb-4">Rezumat comanda</h3>

              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-100">
                <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  🌹
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Buchet Trandafiri Rosii</p>
                  <p className="text-xs text-zinc-500">25 fire, ambalaj premium</p>
                  <p className="text-sm font-bold text-zinc-900 mt-1">450 MDL</p>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span>450 MDL</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Livrare</span>
                  <span className="text-green-600 font-medium">Gratuit</span>
                </div>
                <div className="flex justify-between font-bold text-zinc-900 pt-2 border-t border-zinc-100">
                  <span>Total</span>
                  <span>450 MDL</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!form.firstName || !form.phone || !form.address) return
                  setSubmitted(true)
                }}
                disabled={!form.firstName || !form.phone || !form.address}
                className="w-full py-3 bg-[#ff5c2c] hover:bg-[#e04a1f] disabled:opacity-40 text-white font-bold rounded-xl transition-colors text-sm"
              >
                Plaseaza comanda
              </button>
              <p className="text-xs text-zinc-400 text-center mt-3">Plata la livrare in numerar sau card</p>
            </div>

            {/* Dev info box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-800 mb-2">Info dev</p>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>OTP de test: <strong>123456</strong></li>
                <li>Conturi salvate in localStorage</li>
                <li>Pin drop pe harta reala Chisinau</li>
                <li>Adresa reverse geocodata via Nominatim</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
