import { Helmet } from 'react-helmet-async'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapContainer, Marker, useMap } from 'react-leaflet'
import { YandexMapLayer } from '../components/YandexLayer'
import L from 'leaflet'
import { MapPin, Package, AlertCircle, CheckCircle2, Clock, ChevronDown, ChevronUp, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

type TrackData = {
  id: string
  customer: string
  address: string
  lat: number | null
  lng: number | null
  status: string
  stop_order: number | null
  total_stops: number | null
  estimated_arrival: string | null
  notes: string
  driver_location: { lat: number; lng: number; updated_at: string } | null
  ad?: { image_url: string; click_url: string } | null
}

// ── Store links (update when app is published) ────────────────────────────────

const APP_STORE_URL = 'https://apps.apple.com/app/livra/id000000000'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=md.livra.app'

function getStoreUrl(): string | null {
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua)) return APP_STORE_URL
  if (/android/i.test(ua)) return PLAY_STORE_URL
  return null
}

// ── Easter egg messages ───────────────────────────────────────────────────────

const DRIVER_MESSAGES = [
  "Vin spre tine mai repede decât livrează concurența săptămâna 🚀",
  "Coletul tău stă liniștit și se gândește la tine 📦❤️",
  "Am trecut de semafor pe galben. Pentru tine. 🚦",
  "GPS-ul zice 'viraj stânga', eu zic 'nu, mulțumesc' 🗺️",
  "Fiecare frână bruscă e un mesaj de dragoste pentru pachetul tău 💝",
  "Eu și coletul tău ascultăm manele în surdină. Nu-i spune nimănui 🎵",
  "Am promis că ajung la timp. GPS-ul nu e de acord. 😅",
  "Tractorul din față nu știe că tu mă aștepți 🚜😤",
  "Coletul tău e pe locul copilotului. E important pentru mine 🪑",
  "Dacă suni la ușă de 3 ori, înseamnă că am găsit parcare greu 🅿️",
  "Conduc cu ambele mâini pe volan. Serios. Chiar acum. 🙌",
  "Adresa ta e singura pe care o știu sigur azi 📍",
  "Am mai fost pe strada asta. Sau alta asemănătoare. 🤔",
  "Coletul tău n-a căzut. Aproape, dar n-a căzut. 😬",
  "Ocolesc un câine care se uită la mine mai amenințător decât șeful meu 🐕",
  "Merg cu 40 km/h și mă simt invincibil 💨",
  "Tu ești ultima livrare. Asta te face specială/special ⭐",
  "Am refuzat să parchez și să caut cu piciorul | vin direct la tine 🚗",
  "Coletul zumzăie. Nu știu de ce. Dar pare fericit. 📦✨",
  "Dacă nu deschizi la ușă, stau și cânt până deschizi 🎤",
  "Mă gândesc la bacșiș. Nu pentru mine, pentru motivație 🤑",
  "Am ocolit o groapă de 3 ori. Coletul a supraviețuit 💪",
]

let lastMsgIdx = -1
function pickMessage() {
  let idx
  do { idx = Math.floor(Math.random() * DRIVER_MESSAGES.length) } while (idx === lastMsgIdx)
  lastMsgIdx = idx
  return DRIVER_MESSAGES[idx]
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function makeDriverIcon() {
  const c = '#ff5c2c', cd = '#c94016', cl = '#fff3ef'
  const van = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 38" width="64" height="38" style="filter:drop-shadow(0 2px 8px rgba(0,0,0,0.35))">
    <rect x="1" y="3" width="36" height="26" rx="3.5" fill="${c}"/>
    <path d="M37 3 L49 3 Q58 3 60 13 L60 29 L37 29 Z" fill="${cd}"/>
    <path d="M39 6 L46 6 Q53 6 55 14 L55 25 L39 25 Z" fill="${cl}" opacity="0.75"/>
    <rect x="4" y="6" width="29" height="15" rx="2" fill="${cl}" opacity="0.45"/>
    <rect x="59" y="22" width="4" height="7" rx="2" fill="${cd}"/>
    <ellipse cx="59" cy="18" rx="2" ry="2.5" fill="#fef08a"/>
    <rect x="1" y="14" width="2.5" height="7" rx="1.25" fill="#fca5a5"/>
    <rect x="4" y="28" width="54" height="4" rx="2" fill="${cd}" opacity="0.35"/>
    <circle cx="14" cy="32" r="6" fill="#1e293b"/>
    <circle cx="14" cy="32" r="3.5" fill="#475569"/>
    <circle cx="14" cy="32" r="1.5" fill="#94a3b8"/>
    <circle cx="47" cy="32" r="6" fill="#1e293b"/>
    <circle cx="47" cy="32" r="3.5" fill="#475569"/>
    <circle cx="47" cy="32" r="1.5" fill="#94a3b8"/>
  </svg>`
  return L.divIcon({ html: van, iconSize: [64, 38], iconAnchor: [32, 38], className: '' })
}

const destIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="37" style="filter:drop-shadow(0 2px 6px rgba(0,0,0,0.3))">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20S24 20 24 12C24 5.373 18.627 0 12 0z" fill="#ff5c2c"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>`,
  iconSize: [28, 37], iconAnchor: [14, 37], className: '',
})

// ── Map auto-pan ──────────────────────────────────────────────────────────────

function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { map.setView(center, 14); first.current = false }
    else map.panTo(center, { animate: true, duration: 1.5 })
  }, [center[0], center[1]])
  return null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtAgo(iso: string) {
  const sec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (sec < 60) return `acum ${Math.round(sec)}s`
  if (sec < 3600) return `acum ${Math.round(sec / 60)} min`
  return `acum ${Math.round(sec / 3600)} h`
}


// ── Main ──────────────────────────────────────────────────────────────────────

type SheetState = 'peek' | 'partial' | 'full'

const SHEET_HEIGHT = 0.85 // 85vh

function snapY(state: SheetState) {
  const h = window.innerHeight * SHEET_HEIGHT
  if (state === 'full')    return 0
  if (state === 'partial') return h - 280
  return h - 60 // peek: only 60px visible
}

export default function Track() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<TrackData | null>(null)
  const [error, setError] = useState('')
  const [sheet, setSheet] = useState<SheetState>('partial')
  const [bubble, setBubble] = useState<string | null>(null)
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number } | null>(null)
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const startTranslate = useRef(0)
  const currentTranslate = useRef(snapY('partial'))
  const isMobile = () => window.innerWidth < 768

  function applyTranslate(y: number, animate: 'none' | 'smooth' | 'bounce' = 'none') {
    if (!sheetRef.current || !isMobile()) return
    sheetRef.current.style.transition =
      animate === 'bounce' ? 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)' :
      animate === 'smooth' ? 'transform 0.4s cubic-bezier(0.32,0.72,0,1)' :
      'none'
    sheetRef.current.style.transform = `translateY(${y}px)`
    currentTranslate.current = y
  }

  function snapTo(state: SheetState, bounce = false) {
    setSheet(state)
    applyTranslate(snapY(state), bounce ? 'bounce' : 'smooth')
  }

  function showBubble(e: L.LeafletMouseEvent) {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    setBubble(pickMessage())
    setBubblePos({ x: e.containerPoint.x, y: e.containerPoint.y })
    bubbleTimer.current = setTimeout(() => { setBubble(null); setBubblePos(null) }, 4000)
  }

  function onTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY
    startTranslate.current = currentTranslate.current
    applyTranslate(currentTranslate.current, 'none')
  }

  function onTouchMove(e: React.TouchEvent) {
    const delta = e.touches[0].clientY - startY.current
    const h = window.innerHeight * SHEET_HEIGHT
    const raw = startTranslate.current + delta
    // rubber-band past limits
    const clamped = raw < 0
      ? raw / 4
      : raw > h - 60
      ? (h - 60) + (raw - (h - 60)) / 4
      : raw
    applyTranslate(clamped, 'none')
  }

  function onTouchEnd(e: React.TouchEvent) {
    const delta = e.changedTouches[0].clientY - startY.current
    const h = window.innerHeight * SHEET_HEIGHT
    const cur = currentTranslate.current
    // bounce when released past the limits
    const pastTop  = cur < 0
    const pastPeek = cur > h - 60

    if (delta < -40) {
      snapTo(sheet === 'peek' ? 'partial' : 'full', pastTop)
    } else if (delta > 40) {
      snapTo(sheet === 'full' ? 'partial' : 'peek', pastPeek)
    } else {
      const snaps: [number, SheetState][] = [[0, 'full'], [h - 280, 'partial'], [h - 60, 'peek']]
      const nearest = snaps.reduce((a, b) => Math.abs(a[0] - cur) < Math.abs(b[0] - cur) ? a : b)
      snapTo(nearest[1], pastTop || pastPeek)
    }
  }

  function onHandleTap() {
    snapTo(sheet === 'peek' ? 'partial' : 'peek')
  }

  async function load() {
    if (!token) return
    try {
      // Look up by route stop ID (links sent via SMS)
      const { data: stop } = await supabase
        .from('livra_route_stops')
        .select('id, client_name, address, lat, lng, status, stop_order, estimated_arrival, route_id, delivery_notes')
        .eq('id', token)
        .single()

      if (stop) {
        const [{ data: siblings }, { data: route }] = await Promise.all([
          supabase.from('livra_route_stops').select('id').eq('route_id', stop.route_id).eq('type', 'delivery'),
          supabase.from('livra_routes').select('driver_id').eq('id', stop.route_id).single(),
        ])
        let driver_location = null
        if (route?.driver_id) {
          const { data: loc } = await supabase
            .from('livra_driver_locations').select('lat, lng, updated_at')
            .eq('driver_id', route.driver_id).single()
          if (loc) driver_location = loc
        }
        setData({
          id: stop.id,
          customer: stop.client_name,
          address: stop.address,
          lat: stop.lat,
          lng: stop.lng,
          status: stop.status,
          stop_order: stop.stop_order,
          total_stops: siblings?.length ?? null,
          estimated_arrival: stop.estimated_arrival ?? null,
          notes: stop.delivery_notes ?? '',
          driver_location,
        })
        return
      }

      // Fallback: legacy tracking token on livra_deliveries
      const { data: delivery, error } = await supabase
        .from('livra_deliveries')
        .select('*')
        .eq('tracking_token', token)
        .single()
      if (error || !delivery) {
        setError('Comanda nu a fost găsită.')
        return
      }
      let driver_location = null
      if (delivery.driver_id) {
        const { data: loc } = await supabase
          .from('livra_driver_locations').select('lat, lng, updated_at')
          .eq('driver_id', delivery.driver_id).single()
        if (loc) driver_location = loc
      }
      setData({ ...delivery, estimated_arrival: delivery.time_window_start ?? null, driver_location })
    } catch {
      setError('Nu s-a putut încărca informația. Încearcă din nou.')
    }
  }

  useEffect(() => {
    if (isMobile()) applyTranslate(snapY('partial'))
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 10_000)
    return () => clearInterval(id)
  }, [token])

  const driverPos: [number, number] | null = data?.driver_location
    ? [data.driver_location.lat, data.driver_location.lng]
    : null

  const destPos: [number, number] | null =
    data?.lat && data?.lng ? [data.lat, data.lng] : null

  const mapCenter: [number, number] = driverPos ?? destPos ?? [47.026, 28.838]
  const isOnRoute = data?.status === 'dispatched'
  const isDelivered = data?.status === 'delivered'
  const isFailed = data?.status === 'failed'
  const stopsAhead = isOnRoute && data?.stop_order != null ? data.stop_order - 1 : 0
  const isNextStop = isOnRoute && stopsAhead === 0

  const statusColor = isDelivered ? 'bg-emerald-500'
    : isFailed ? 'bg-red-500'
    : isNextStop ? 'bg-[#ff5c2c]'
    : isOnRoute ? 'bg-[#ff5c2c]'
    : 'bg-zinc-400'

  const statusLabel = isDelivered ? 'Livrat'
    : isFailed ? 'Eșuat'
    : isNextStop ? 'În drum spre tine'
    : isOnRoute && stopsAhead > 0
      ? `${stopsAhead} ${stopsAhead === 1 ? 'oprire' : 'opriri'} înainte`
    : isOnRoute ? 'În drum spre tine'
    : 'Se pregătește'

  const clampedBubbleLeft = bubblePos
    ? Math.max(8, Math.min(bubblePos.x - 120, window.innerWidth - 248))
    : 0

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Helmet>
        <title>{data ? `Livrare pentru ${data.customer} | Livra` : 'Urmărire livrare | Livra'}</title>
        <meta name="description" content="Urmărește în timp real unde este coletul tău și când ajunge la ușa ta." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Full-screen map */}
      <MapContainer
        center={mapCenter}
        zoom={14}
        crs={L.CRS.EPSG3395}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <YandexMapLayer />
        <MapController center={mapCenter} />
        {driverPos && (
          <Marker
            position={driverPos}
            icon={makeDriverIcon()}
            eventHandlers={{ click: (e) => showBubble(e as unknown as L.LeafletMouseEvent) }}
          />
        )}
        {destPos && <Marker position={destPos} icon={destIcon} />}
      </MapContainer>

      {/* Speech bubble | floats above the van */}
      {bubble && bubblePos && (
        <div
          className="absolute z-[1001] pointer-events-none"
          style={{ left: clampedBubbleLeft, top: bubblePos.y - 90 }}
        >
          <div className="relative bg-zinc-900 text-white text-[12px] font-medium rounded-2xl px-4 py-3 shadow-xl leading-relaxed w-60 animate-fade-in">
            {bubble}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
              style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid #18181b' }}
            />
          </div>
        </div>
      )}

      {/* Card | bottom sheet on mobile, floating card top-left on desktop */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-[1000] md:absolute md:bottom-auto md:top-4 md:left-4 md:right-auto md:w-72 h-[85vh] md:h-auto md:transform-none bg-white/95 backdrop-blur-md rounded-t-2xl md:rounded-2xl border-t border-zinc-100 md:border shadow-[0_-4px_24px_rgba(0,0,0,0.08)] md:shadow-xl overflow-hidden will-change-transform"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Drag handle | mobile only */}
        <div
          className="flex justify-center pt-3 pb-1 md:hidden cursor-grab active:cursor-grabbing"
          onClick={onHandleTap}
        >
          <div className="w-10 h-1 rounded-full bg-zinc-200" />
        </div>

        {/* Scrollable content wrapper */}
        <div className="overflow-y-auto h-full">

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-2 pb-3 md:pt-4 border-b border-zinc-100">
          <div className="flex flex-col leading-none">
            <span className="text-[12px] font-bold text-[#161513] tracking-widest uppercase">Livra</span>
            <svg width="28" height="3" viewBox="0 0 28 3"><line x1="0" y1="1.5" x2="22" y2="1.5" stroke="#ff5c2c" strokeWidth="1.5"/><polygon points="22,0 28,1.5 22,3" fill="#ff5c2c"/></svg>
          </div>
          <button
            onClick={() => setSheet(s => s === 'peek' ? 'partial' : 'peek')}
            className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors md:flex hidden"
          >
            {sheet === 'peek' ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 flex items-start gap-2">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-red-600">{error}</p>
          </div>
        )}

        {/* Body */}
        {data && sheet !== 'peek' && (
          <div className="px-4 py-3 space-y-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor} ${isNextStop ? 'animate-pulse' : ''}`} />
              <span className="text-[12px] font-semibold text-zinc-700">{statusLabel}</span>
            </div>

            {/* Estimated arrival */}
            {isOnRoute && data.estimated_arrival && (
              <div>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Ora estimată</p>
                <p className="text-[22px] font-bold text-zinc-900 leading-none">{data.estimated_arrival}</p>
              </div>
            )}

            {/* Delivered / failed */}
            {isDelivered && (
              <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <p className="text-[12px] text-emerald-700 font-medium">Comanda a fost livrată. Mulțumim!</p>
              </div>
            )}
            {isFailed && (
              <div className="flex items-center gap-2 bg-red-50 rounded-xl px-3 py-2">
                <AlertCircle size={14} className="text-red-500" />
                <p className="text-[12px] text-red-700 font-medium">Livrarea nu a reușit. Te vom contacta.</p>
              </div>
            )}

            {/* Progress bar */}
            {isOnRoute && data.stop_order != null && data.total_stops != null && (
              <div>
                <div className="flex justify-end text-[10px] text-zinc-400 mb-1.5">
                  <span>{data.stop_order}/{data.total_stops}</span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: data.total_stops }, (_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1 rounded-full transition-colors ${
                        i < data.stop_order! - 1 ? 'bg-emerald-400'
                        : i === data.stop_order! - 1 ? 'bg-[#ff5c2c]'
                        : 'bg-zinc-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Address */}
            <div className="flex items-start gap-2.5 bg-zinc-50 rounded-xl px-3 py-2.5">
              <MapPin size={13} className="text-[#ff5c2c] flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-zinc-400 mb-0.5">Adresa de livrare</p>
                <p className="text-[12px] font-medium text-zinc-800 leading-snug">{data.address}</p>
                {data.notes && <p className="text-[11px] text-zinc-400 mt-1">{data.notes}</p>}
              </div>
              <Package size={12} className="text-zinc-300 flex-shrink-0 mt-0.5" />
            </div>

            {/* Last update */}
            {data.driver_location?.updated_at && (
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-300">
                <Clock size={9} />
                <span>Actualizat {fmtAgo(data.driver_location.updated_at)}</span>
              </div>
            )}

            {/* Partner Ad Space - only show if ad exists */}
            {data.ad && (
              <div className="mt-4 pt-4 border-t border-zinc-200">
                <a
                  href={data.ad.click_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-24 bg-zinc-100 rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
                >
                  <img
                    src={data.ad.image_url}
                    alt="Partner ad"
                    className="w-full h-full object-cover"
                  />
                </a>
              </div>
            )}
          </div>
        )}

        {/* App download CTA */}
        <div className="mx-4 mb-4 mt-1">
          {(() => {
            const storeUrl = getStoreUrl()
            const inner = (
              <>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ff5c2c' }}>
                  <Download size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-white leading-none mb-0.5">Descarcă aplicația Livra</p>
                  <p className="text-[10px] text-zinc-400 leading-none">
                    {/iphone|ipad|ipod/i.test(navigator.userAgent) ? 'Disponibil pe App Store' : /android/i.test(navigator.userAgent) ? 'Disponibil pe Google Play' : 'Urmărește toate comenzile tale live'}
                  </p>
                </div>
                <svg width="6" height="10" viewBox="0 0 6 10" fill="none" className="flex-shrink-0">
                  <path d="M1 1l4 4-4 4" stroke="#ff5c2c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )
            const cls = "flex items-center gap-3 bg-[#161513] rounded-2xl px-4 py-3 shadow-lg shadow-black/10 active:opacity-90 transition-opacity"
            return storeUrl
              ? <a href={storeUrl} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
              : <Link to="/app" className={cls}>{inner}</Link>
          })()}
        </div>

        </div>{/* end scrollable wrapper */}
      </div>
    </div>
  )
}
