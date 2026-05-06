import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Package, MapPin, Clock, CheckCircle, Circle, ChevronRight, AlertCircle, Truck, ExternalLink } from 'lucide-react'
import { MapContainer, Marker } from 'react-leaflet'
import { YandexMapLayer } from '../../components/YandexLayer'
import L from 'leaflet'

const DEPOT_ICON = L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;background:#ff5c2c;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(255,92,44,0.5)"></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
})

const TEST_AWB = 'NPMD00000000051596NPG'

interface TrackingEvent {
  number: string
  date: string
  event: string
  event_name: string
  event_status: 'passed' | 'now' | 'future'
  country_code: string
  code: string
  parcel_number: string
  settlement_name: string
  division_name: string
  division_coordinates: { latitude: number; longitude: number }
  is_synthetic?: boolean
}

interface TrackingData {
  number: string
  sender: { country_code: string; settlement: string; latitude: number; longitude: number }
  recipient: { country_code: string; settlement: string; latitude: number; longitude: number }
  scheduled_delivery_date: string
  tracking: TrackingEvent[]
  total_weight: number
}

const EVENT_ICONS: Record<string, string> = {
  CreateID: '📦',
  DeclarationArrivalCustomTerminal: '🛃',
  LoadingCourierFuture: '🚚',
  LoadingCourier: '🚚',
  DepartureFuture: '✈️',
  ArrivalFuture: '📍',
  ArrivalDestinationDepotFuture: '🏭',
  DepartureDestinationDepotFuture: '🚛',
  Delivered: '✅',
  default: '📍',
}

function getEventEmoji(event: string) {
  return EVENT_ICONS[event] ?? EVENT_ICONS.default
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-MD', { day: 'numeric', month: 'long' })
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ro-MD', { hour: '2-digit', minute: '2-digit' })
}

function fmtDateTime(iso: string) {
  return `${fmtDate(iso)}, ${fmtTime(iso)}`
}

function getLastKnownCoords(tracking: TrackingEvent[]): [number, number] | null {
  const candidates = [...tracking]
    .filter(e => e.event_status !== 'future')
    .reverse()
  for (const e of candidates) {
    const { latitude, longitude } = e.division_coordinates
    if (latitude && longitude && latitude !== 0 && longitude !== 0) {
      return [latitude, longitude]
    }
  }
  return null
}

function getProgressPercent(tracking: TrackingEvent[]) {
  const total = tracking.length
  const passed = tracking.filter(e => e.event_status === 'passed').length
  const now = tracking.find(e => e.event_status === 'now')
  return Math.round(((passed + (now ? 0.5 : 0)) / total) * 100)
}

function isOutForDelivery(tracking: TrackingEvent[]) {
  const current = tracking.find(e => e.event_status === 'now')
  return current?.event?.toLowerCase().includes('courier') || current?.event?.toLowerCase().includes('delivery')
}

export default function NovapostTrackingDemo() {
  const [data, setData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [awb, setAwb] = useState(TEST_AWB)
  const [inputAwb, setInputAwb] = useState(TEST_AWB)
  const [advocacyClicked, setAdvocacyClicked] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`https://api.novapost.com/site/v.1.0/shipments/tracking/${awb}`)
      .then(r => r.json())
      .then((d: TrackingData) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError('Nu am putut încărca datele de tracking.')
        setLoading(false)
      })
  }, [awb])

  const currentEvent = data?.tracking.find(e => e.event_status === 'now')
  const passedEvents = data?.tracking.filter(e => e.event_status === 'passed') ?? []
  const futureEvents = data?.tracking.filter(e => e.event_status === 'future') ?? []
  const progress = data ? getProgressPercent(data.tracking) : 0
  const outForDelivery = data ? isOutForDelivery(data.tracking) : false
  const lastCoords = data ? getLastKnownCoords(data.tracking) : null

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Helmet><title>Dev — Novapost Tracking UX</title></Helmet>

      {/* Dev banner */}
      <div className="bg-amber-400 text-amber-900 text-xs font-mono px-4 py-2 text-center font-semibold">
        PAGINA DE DEZVOLTARE — test UX tracking Novapost — nu este vizibilă utilizatorilor
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">

        {/* AWB input */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
          <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-2">Număr AWB</label>
          <div className="flex gap-2">
            <input
              value={inputAwb}
              onChange={e => setInputAwb(e.target.value.toUpperCase())}
              className="flex-1 text-sm font-mono bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="NPMD..."
            />
            <button
              onClick={() => setAwb(inputAwb)}
              className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors"
            >
              Track
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-zinc-500">Se încarcă...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950 rounded-2xl border border-red-200 dark:border-red-800 p-4 flex gap-3 items-center">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Hero card */}
            <div className={`rounded-2xl p-5 text-white ${outForDelivery ? 'bg-orange-500' : 'bg-zinc-900 dark:bg-zinc-800'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-mono opacity-60 uppercase tracking-wider mb-1">
                    {outForDelivery ? '🚚 Curier în drum' : '📦 Coletul tău'}
                  </p>
                  <p className="text-2xl font-bold tracking-tight">
                    {currentEvent?.event_name ?? 'În procesare'}
                  </p>
                </div>
                <div className="text-3xl">{currentEvent ? getEventEmoji(currentEvent.event) : '📦'}</div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs opacity-70">
                <span>{data.sender.settlement}, {data.sender.country_code}</span>
                <ChevronRight size={12} />
                <span>{data.recipient.settlement}, {data.recipient.country_code}</span>
              </div>

              {data.scheduled_delivery_date && (
                <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
                  <Clock size={14} className="opacity-70" />
                  <span className="text-sm">
                    Livrare estimată: <strong>{fmtDate(data.scheduled_delivery_date)}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Current location */}
            {currentEvent?.division_name && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 flex gap-3 items-center">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Locație curentă</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{currentEvent.division_name}</p>
                  <p className="text-xs text-zinc-500">{currentEvent.settlement_name}, {currentEvent.country_code}</p>
                </div>
              </div>
            )}

            {/* Map — last known depot location */}
            {lastCoords && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                  <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Ultima locație cunoscută</p>
                  <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">Depou · nu GPS live</span>
                </div>
                <div style={{ height: 200 }}>
                  <MapContainer
                    center={lastCoords}
                    zoom={14}
                    crs={L.CRS.EPSG3395}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    attributionControl={false}
                    dragging={false}
                    scrollWheelZoom={false}
                  >
                    <YandexMapLayer />
                    <Marker position={lastCoords} icon={DEPOT_ICON} />
                  </MapContainer>
                </div>
                {currentEvent?.division_name && (
                  <div className="px-4 py-3 flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800">
                    <MapPin size={13} className="text-orange-500 shrink-0" />
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">{currentEvent.division_name}, {currentEvent.settlement_name}</span>
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-4 pt-4 pb-2">
                <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Cronologie</p>
              </div>

              <div className="px-4 pb-4 space-y-0">
                {/* Passed events */}
                {passedEvents.map((evt, i) => (
                  <TimelineRow
                    key={`${evt.event}-${i}`}
                    evt={evt}
                    status="passed"
                    isLast={false}
                  />
                ))}

                {/* Current event */}
                {currentEvent && (
                  <TimelineRow
                    evt={currentEvent}
                    status="now"
                    isLast={futureEvents.length === 0}
                  />
                )}

                {/* Future events */}
                {futureEvents.map((evt, i) => (
                  <TimelineRow
                    key={`${evt.event}-${i}`}
                    evt={evt}
                    status="future"
                    isLast={i === futureEvents.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Package info */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Detalii colet</p>
              <div className="flex items-center gap-3">
                <Package size={15} className="text-zinc-400" />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">AWB: <span className="font-mono font-semibold">{awb}</span></span>
              </div>
              {data.total_weight > 0 && (
                <div className="flex items-center gap-3">
                  <Package size={15} className="text-zinc-400" />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Greutate: {data.total_weight} kg</span>
                </div>
              )}
            </div>

            {/* Advocacy banner */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 rounded-2xl border border-orange-200 dark:border-orange-800/50 p-5">
              <div className="flex gap-3 mb-3">
                <Truck size={20} className="text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Vrei tracking live GPS?</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Aceasta este urmărire bazată pe evenimente. Cu integrarea Novapost × Livra ai vedea curierul în timp real pe hartă.
                  </p>
                </div>
              </div>
              {!advocacyClicked ? (
                <button
                  onClick={() => setAdvocacyClicked(true)}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink size={14} />
                  Cere Novapost să se integreze cu Livra
                </button>
              ) : (
                <div className="flex items-center gap-2 py-2.5 bg-green-100 dark:bg-green-950 rounded-xl px-4">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">Mulțumim! 847 utilizatori au cerut același lucru.</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function TimelineRow({ evt, status, isLast }: { evt: TrackingEvent; status: 'passed' | 'now' | 'future'; isLast: boolean }) {
  return (
    <div className="flex gap-3">
      {/* Line + dot */}
      <div className="flex flex-col items-center w-7 shrink-0">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
          status === 'now'
            ? 'bg-orange-500 ring-4 ring-orange-100 dark:ring-orange-950'
            : status === 'passed'
            ? 'bg-zinc-800 dark:bg-zinc-200'
            : 'bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-600'
        }`}>
          {status === 'passed' ? (
            <CheckCircle size={14} className="text-white dark:text-zinc-900" />
          ) : status === 'now' ? (
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
          ) : (
            <Circle size={12} className="text-zinc-400" />
          )}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 my-1 ${
            status === 'passed' ? 'bg-zinc-200 dark:bg-zinc-700' : 'border-l-2 border-dashed border-zinc-200 dark:border-zinc-700'
          }`} />
        )}
      </div>

      {/* Content */}
      <div className={`pb-4 flex-1 ${isLast ? 'pb-0' : ''}`}>
        <p className={`text-sm font-semibold leading-tight ${
          status === 'now'
            ? 'text-orange-600 dark:text-orange-400'
            : status === 'passed'
            ? 'text-zinc-900 dark:text-zinc-100'
            : 'text-zinc-400 dark:text-zinc-500'
        }`}>
          {getEventEmoji(evt.event)} {evt.event_name}
        </p>
        {evt.division_name && (
          <p className="text-xs text-zinc-400 mt-0.5">{evt.division_name}</p>
        )}
        <p className={`text-xs mt-0.5 ${status === 'future' ? 'text-zinc-400' : 'text-zinc-400'}`}>
          {status === 'future' ? '⏱ ' : ''}{fmtDateTime(evt.date)}
        </p>
      </div>
    </div>
  )
}
