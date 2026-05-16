import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents, Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const YANDEX_URL  = 'https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&scale=1&lang=ru_RU'
const YANDEX_ATTR = '© <a href="https://yandex.com/maps">Yandex Maps</a>'
const DEFAULT_CENTER: [number, number] = [47.026, 28.838]

interface Props {
  flyTo?:          { lat: number; lng: number } | null
  onCenterChange?: (lat: number, lng: number) => void
  staticMarkers?:  { lat: number; lng: number; title: string }[]
}

const storeIcon = L.divIcon({
  html: '<svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="#FF5C2C" stroke-width="2" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3))"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
})

function FlyToController({ flyTo }: { flyTo: Props['flyTo'] }) {
  const map = useMap()
  useEffect(() => {
    if (flyTo) map.flyTo([flyTo.lat, flyTo.lng], 17, { duration: 1.2 })
  }, [flyTo, map])
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

export default function PinMap({ flyTo, onCenterChange, staticMarkers }: Props) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <style>{`
        .store-tooltip {
          background: white !important;
          border: 1px solid #FF5C2C !important;
          border-radius: 4px !important;
          padding: 2px 6px !important;
          font-size: 10px !important;
          font-weight: bold !important;
          color: #FF5C2C !important;
          white-space: nowrap !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: #FF5C2C !important;
        }
      `}</style>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={14}
        crs={L.CRS.EPSG3395}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer url={YANDEX_URL} maxZoom={19} attribution={YANDEX_ATTR} />
        
        {staticMarkers?.map((m, idx) => (
          <Marker key={idx} position={[m.lat, m.lng]} icon={storeIcon}>
            <Tooltip permanent direction="top" offset={[0, -10]} className="store-tooltip">
              {m.title}
            </Tooltip>
          </Marker>
        ))}

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
