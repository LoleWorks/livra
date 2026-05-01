import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const YANDEX_URL  = 'https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&scale=1&lang=ru_RU'
const YANDEX_ATTR = '© <a href="https://yandex.com/maps">Yandex Maps</a>'
const DEFAULT_CENTER: [number, number] = [47.026, 28.838]

interface Props {
  flyTo?:          { lat: number; lng: number } | null
  onCenterChange?: (lat: number, lng: number) => void
}

function FlyToController({ flyTo }: { flyTo: Props['flyTo'] }) {
  const map = useMap()
  useEffect(() => {
    if (flyTo) map.flyTo([flyTo.lat, flyTo.lng], 17, { duration: 1.2 })
  }, [flyTo?.lat, flyTo?.lng])
  return null
}

function CenterTracker({ onCenterChange }: { onCenterChange?: (lat: number, lng: number) => void }) {
  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter()
      onCenterChange?.(c.lat, c.lng)
    },
  })
  return null
}

export default function PinMap({ flyTo, onCenterChange }: Props) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={14}
        crs={L.CRS.EPSG3395}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer url={YANDEX_URL} maxZoom={19} attribution={YANDEX_ATTR} />
        <FlyToController flyTo={flyTo} />
        <CenterTracker onCenterChange={onCenterChange} />
      </MapContainer>

      {/* Fixed centre pin — stays still while map moves underneath */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -100%)',
        zIndex: 1000, pointerEvents: 'none',
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="32" height="42"
          style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.35))' }}>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20S24 20 24 12C24 5.373 18.627 0 12 0z" fill="#FF5C2C"/>
          <circle cx="12" cy="12" r="5" fill="white"/>
        </svg>
      </div>
    </div>
  )
}
