import { useState, useEffect, useRef } from 'react'
import { MapContainer, Marker, useMapEvents } from 'react-leaflet'
import { YandexMapLayer } from './YandexLayer'
import L from 'leaflet'
import { X, MapPin, Phone, Check, ChevronDown } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface SavedAddress {
  label: string
  address: string
  lat: number
  lng: number
}

interface LivraUser {
  phone: string
  name: string
  addresses: SavedAddress[]
}

interface FillData {
  name: string
  phone: string
  address: string
  lat: number
  lng: number
  label: string
}

interface Props {
  onFill: (data: FillData) => void
}

// ── Local storage helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = 'livra_demo_users'

function getUsers(): LivraUser[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveUser(user: LivraUser) {
  const users = getUsers().filter(u => u.phone !== user.phone)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...users, user]))
}

function findUser(phone: string): LivraUser | null {
  return getUsers().find(u => u.phone === phone) || null
}

// ── Pin drop map component ────────────────────────────────────────────────────

function PinDropMap({ pin, onPin }: { pin: [number, number] | null; onPin: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPin(e.latlng.lat, e.latlng.lng)
    },
  })

  const icon = L.divIcon({
    className: '',
    html: `<div style="width:32px;height:32px;background:#ff5c2c;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3);margin-top:-32px;margin-left:-16px;"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  })

  return pin ? <Marker position={pin} icon={icon} /> : null
}

// ── Steps ─────────────────────────────────────────────────────────────────────

type Step = 'choice' | 'login-phone' | 'login-otp' | 'login-select' | 'register-phone' | 'register-otp' | 'register-name' | 'register-pin' | 'register-label'

export default function LivraCheckoutButton({ onFill }: Props) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('choice')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [pin, setPin] = useState<[number, number] | null>(null)
  const [pinAddress, setPinAddress] = useState('')
  const [label, setLabel] = useState('Casa')
  const [customLabel, setCustomLabel] = useState('')
  const [foundUser, setFoundUser] = useState<LivraUser | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null)
  const [error, setError] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const CHISINAU: [number, number] = [47.0245, 28.8322]

  function reset() {
    setStep('choice')
    setPhone('')
    setOtp('')
    setName('')
    setPin(null)
    setPinAddress('')
    setLabel('Casa')
    setCustomLabel('')
    setFoundUser(null)
    setSelectedAddress(null)
    setError('')
    setOtpSent(false)
  }

  function close() {
    setOpen(false)
    reset()
  }

  // ── Reverse geocode pin to address string ──────────────────────────────────

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await res.json()
      setPinAddress(data.display_name?.split(',').slice(0, 3).join(', ') || `${lat.toFixed(5)}, ${lng.toFixed(5)}`)
    } catch {
      setPinAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
    }
  }

  function handlePin(lat: number, lng: number) {
    setPin([lat, lng])
    reverseGeocode(lat, lng)
  }

  // ── OTP send (demo: always succeeds) ──────────────────────────────────────

  function sendOtp() {
    if (phone.replace(/\s/g, '').length < 8) {
      setError('Introduceti un numar valid')
      return
    }
    setError('')
    setOtpSent(true)
  }

  // ── OTP verify (demo code: 123456) ────────────────────────────────────────

  function verifyOtp(nextStep: Step) {
    if (otp !== '123456') {
      setError('Cod incorect. Folositi 123456 pentru demo.')
      return
    }
    setError('')
    setStep(nextStep)
  }

  // ── Login flow ────────────────────────────────────────────────────────────

  function handleLoginOtp() {
    const user = findUser(phone)
    if (!user) {
      setError('Numar negasit. Inregistrati-va mai intai.')
      return
    }
    setFoundUser(user)
    verifyOtp('login-select')
  }

  function handleSelectAddress(addr: SavedAddress) {
    setSelectedAddress(addr)
    onFill({
      name: foundUser!.name,
      phone: foundUser!.phone,
      address: addr.address,
      lat: addr.lat,
      lng: addr.lng,
      label: addr.label,
    })
    close()
  }

  // ── Register flow ─────────────────────────────────────────────────────────

  function handleRegisterOtp() {
    verifyOtp('register-name')
  }

  function handleSaveAddress() {
    const finalLabel = label === 'Alta' ? (customLabel || 'Alta adresa') : label
    const newAddress: SavedAddress = {
      label: finalLabel,
      address: pinAddress,
      lat: pin![0],
      lng: pin![1],
    }
    const existing = findUser(phone)
    const user: LivraUser = {
      phone,
      name,
      addresses: [...(existing?.addresses || []), newAddress],
    }
    saveUser(user)
    onFill({
      name,
      phone,
      address: pinAddress,
      lat: pin![0],
      lng: pin![1],
      label: finalLabel,
    })
    close()
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* The button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff5c2c] hover:bg-[#e04a1f] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
      >
        <img src="https://livra.loleworks.com/livra-logo-white.png" alt="Livra" className="h-4 w-auto" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        <span>Completeaza cu Livra</span>
      </button>

      {/* Modal backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#ff5c2c] flex items-center justify-center">
                  <MapPin size={12} className="text-white" />
                </div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Livra</span>
              </div>
              <button onClick={close} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5">

              {/* ── Step: choice ── */}
              {step === 'choice' && (
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Completeaza comanda mai rapid</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Adresele tale salvate se completeaza automat in formular.</p>
                  <button
                    onClick={() => setStep('login-phone')}
                    className="w-full py-3 bg-[#ff5c2c] hover:bg-[#e04a1f] text-white font-semibold rounded-xl mb-3 transition-colors"
                  >
                    Intra in cont
                  </button>
                  <button
                    onClick={() => setStep('register-phone')}
                    className="w-full py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Creeaza cont nou
                  </button>
                </div>
              )}

              {/* ── Step: login phone ── */}
              {step === 'login-phone' && (
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Numarul de telefon</h2>
                  <p className="text-sm text-zinc-500 mb-5">Iti trimitem un cod de verificare.</p>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="tel"
                      placeholder="+373 69 123 456"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="flex-1 px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#ff5c2c]"
                    />
                    <button onClick={sendOtp} className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700">
                      Trimite
                    </button>
                  </div>
                  {otpSent && (
                    <>
                      <p className="text-xs text-zinc-400 mb-2">Cod demo: <strong>123456</strong></p>
                      <input
                        type="text"
                        placeholder="Cod OTP"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        maxLength={6}
                        className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#ff5c2c] mb-3 tracking-widest text-center"
                      />
                      <button onClick={handleLoginOtp} className="w-full py-3 bg-[#ff5c2c] hover:bg-[#e04a1f] text-white font-semibold rounded-xl transition-colors">
                        Verifica
                      </button>
                    </>
                  )}
                  {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                </div>
              )}

              {/* ── Step: login select address ── */}
              {step === 'login-select' && foundUser && (
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Buna, {foundUser.name}</h2>
                  <p className="text-sm text-zinc-500 mb-5">Selecteaza adresa de livrare.</p>
                  <div className="space-y-3">
                    {foundUser.addresses.map((addr, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectAddress(addr)}
                        className="w-full text-left px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-[#ff5c2c] hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin size={12} className="text-[#ff5c2c]" />
                          <span className="text-xs font-semibold text-[#ff5c2c] uppercase tracking-wide">{addr.label}</span>
                        </div>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-snug">{addr.address}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Step: register phone ── */}
              {step === 'register-phone' && (
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Creeaza cont Livra</h2>
                  <p className="text-sm text-zinc-500 mb-5">Salveaza adresele tale pentru a completa comenzile mai rapid.</p>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="tel"
                      placeholder="+373 69 123 456"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="flex-1 px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#ff5c2c]"
                    />
                    <button onClick={sendOtp} className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700">
                      Trimite
                    </button>
                  </div>
                  {otpSent && (
                    <>
                      <p className="text-xs text-zinc-400 mb-2">Cod demo: <strong>123456</strong></p>
                      <input
                        type="text"
                        placeholder="Cod OTP"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        maxLength={6}
                        className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#ff5c2c] mb-3 tracking-widest text-center"
                      />
                      <button onClick={handleRegisterOtp} className="w-full py-3 bg-[#ff5c2c] hover:bg-[#e04a1f] text-white font-semibold rounded-xl transition-colors">
                        Verifica
                      </button>
                    </>
                  )}
                  {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                </div>
              )}

              {/* ── Step: register name ── */}
              {step === 'register-name' && (
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Cum te numesti?</h2>
                  <p className="text-sm text-zinc-500 mb-5">Numele tau va aparea automat in comenzile viitoare.</p>
                  <input
                    type="text"
                    placeholder="Prenume Nume"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#ff5c2c] mb-4"
                  />
                  <button
                    onClick={() => { if (name.trim().length > 1) { setError(''); setStep('register-pin') } else setError('Introduceti numele') }}
                    className="w-full py-3 bg-[#ff5c2c] hover:bg-[#e04a1f] text-white font-semibold rounded-xl transition-colors"
                  >
                    Continua
                  </button>
                  {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                </div>
              )}

              {/* ── Step: register pin ── */}
              {step === 'register-pin' && (
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Marcheaza locatia exacta</h2>
                  <p className="text-sm text-zinc-500 mb-3">Apasa pe harta unde sa ajunga soferul.</p>
                  <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 mb-3" style={{ height: 260 }}>
                    <MapContainer
                      center={CHISINAU}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                      zoomControl={true}
                    >
                      <YandexMapLayer />
                      <PinDropMap pin={pin} onPin={handlePin} />
                    </MapContainer>
                  </div>
                  {pin ? (
                    <div className="flex items-start gap-2 mb-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-200 dark:border-orange-800">
                      <MapPin size={14} className="text-[#ff5c2c] mt-0.5 shrink-0" />
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{pinAddress || 'Se incarca adresa...'}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 mb-4 text-center">Apasa pe harta pentru a plasa pinul</p>
                  )}
                  <button
                    disabled={!pin}
                    onClick={() => setStep('register-label')}
                    className="w-full py-3 bg-[#ff5c2c] hover:bg-[#e04a1f] disabled:opacity-40 text-white font-semibold rounded-xl transition-colors"
                  >
                    Confirma locatia
                  </button>
                </div>
              )}

              {/* ── Step: register label ── */}
              {step === 'register-label' && (
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Ce adresa este aceasta?</h2>
                  <p className="text-sm text-zinc-500 mb-5">Da un nume acestei locatii pentru a o recunoaste data viitoare.</p>
                  <div className="flex gap-2 mb-4">
                    {['Casa', 'Birou', 'Alta'].map(l => (
                      <button
                        key={l}
                        onClick={() => setLabel(l)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${label === l ? 'bg-[#ff5c2c] border-[#ff5c2c] text-white' : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-[#ff5c2c]'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  {label === 'Alta' && (
                    <input
                      type="text"
                      placeholder="ex: Bunica, Sala de sport..."
                      value={customLabel}
                      onChange={e => setCustomLabel(e.target.value)}
                      className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#ff5c2c] mb-4"
                    />
                  )}
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl mb-4">
                    <p className="text-xs text-zinc-500 mb-0.5">{label === 'Alta' ? (customLabel || 'Alta adresa') : label}</p>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300">{pinAddress}</p>
                  </div>
                  <button
                    onClick={handleSaveAddress}
                    className="w-full py-3 bg-[#ff5c2c] hover:bg-[#e04a1f] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    Salveaza si completeaza
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  )
}
