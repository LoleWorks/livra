import { TileLayer } from 'react-leaflet'

// All three layers require the MapContainer to declare crs={L.CRS.EPSG3395}.
// With the matching CRS Leaflet computes x/y/z natively — no coordinate hacks needed.

const MAP_URL     = 'https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&scale=1&lang=ru_RU'
const SAT_URL     = 'https://core-sat.maps.yandex.net/tiles?l=sat&x={x}&y={y}&z={z}&scale=1'
const TRAFFIC_URL = 'https://core-jams-rdr-cache.maps.yandex.net/1.1/tiles?trf=1&l=trf&x={x}&y={y}&z={z}&scale=1'

const ATTR = '© <a href="https://yandex.com/maps">Yandex Maps</a>'

export function YandexMapLayer() {
  return <TileLayer url={MAP_URL} maxZoom={19} attribution={ATTR} />
}

export function YandexSatLayer() {
  return <TileLayer url={SAT_URL} maxZoom={19} attribution={ATTR} />
}

export function YandexTrafficLayer({ opacity = 0.85 }: { opacity?: number }) {
  return <TileLayer url={TRAFFIC_URL} maxZoom={18} opacity={opacity} pane="overlayPane" />
}
