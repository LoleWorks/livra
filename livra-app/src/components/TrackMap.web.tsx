import { useEffect, useRef } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ── Icons ─────────────────────────────────────────────────────────────────────

function makeDriverIcon() {
  const c = '#FF5C2C', cd = '#cc3a0f', cl = '#ffe8e0'
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
    <path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20S24 20 24 12C24 5.373 18.627 0 12 0z" fill="#FF5C2C"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>`,
  iconSize: [28, 37], iconAnchor: [14, 37], className: '',
})

// ── Auto-pan ──────────────────────────────────────────────────────────────────

function MapController({ center }: { center: [number, number] }) {
  const map  = useMap()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { map.setView(center, 14); first.current = false }
    else map.panTo(center, { animate: true, duration: 1.5 })
  }, [center[0], center[1]])
  return null
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  driverLat?: number | null
  driverLng?: number | null
  destLat?:   number | null
  destLng?:   number | null
  style?:     React.CSSProperties
}

const YANDEX_URL = 'https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&scale=1&lang=ru_RU'
const YANDEX_ATTR = '© <a href="https://yandex.com/maps">Yandex Maps</a>'
const DEFAULT_CENTER: [number, number] = [47.026, 28.838] // Chișinău

export default function TrackMap({ driverLat, driverLng, destLat, destLng, style }: Props) {
  const driverPos: [number, number] | null =
    driverLat != null && driverLng != null ? [driverLat, driverLng] : null
  const destPos: [number, number] | null =
    destLat != null && destLng != null ? [destLat, destLng] : null
  const center = driverPos ?? destPos ?? DEFAULT_CENTER

  return (
    <div style={{ width: '100%', height: '100%', ...style }}>
      <MapContainer
        center={center}
        zoom={14}
        crs={L.CRS.EPSG3395}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer url={YANDEX_URL} maxZoom={19} attribution={YANDEX_ATTR} />
        <MapController center={center} />
        {driverPos && <Marker position={driverPos} icon={makeDriverIcon()} />}
        {destPos   && <Marker position={destPos}   icon={destIcon} />}
      </MapContainer>
    </div>
  )
}
