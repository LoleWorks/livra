import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

// WGS84 first eccentricity — the key difference between Yandex (EPSG:3395
// ellipsoidal Mercator) and standard Web Mercator (EPSG:3857 spherical).
const E = 0.0818192

// Convert a tile y index (EPSG:3857, y=0 at north) to geographic latitude.
function tileYToLat(y: number, z: number): number {
  const n = Math.pow(2, z)
  return Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI
}

// Convert geographic latitude to tile y index in EPSG:3395 (Yandex projection).
function latToTileY3395(lat: number, z: number): number {
  const n = Math.pow(2, z)
  const phi = lat * Math.PI / 180
  const sinPhi = Math.sin(phi)
  const mercY = Math.log(
    Math.tan(Math.PI / 4 + phi / 2) *
    Math.pow((1 - E * sinPhi) / (1 + E * sinPhi), E / 2)
  )
  return Math.floor((0.5 - mercY / (2 * Math.PI)) * n)
}

// Extend L.TileLayer to remap y before building the Yandex URL.
// x (longitude-based) is identical in both projections — only y needs fixing.
const YandexTrafficTileLayer = (L.TileLayer as any).extend({
  getTileUrl(coords: L.Coords): string {
    const lat = tileYToLat(coords.y, coords.z)
    const y   = latToTileY3395(lat, coords.z)
    return (
      `https://core-jams-rdr-cache.maps.yandex.net/1.1/tiles` +
      `?trf=1&l=trf&x=${coords.x}&y=${y}&z=${coords.z}&scale=1`
    )
  },
})

interface Props {
  opacity?: number
}

export default function YandexTrafficLayer({ opacity = 0.85 }: Props) {
  const map = useMap()

  useEffect(() => {
    const layer = new YandexTrafficTileLayer('', {
      maxZoom: 18,
      opacity,
      pane: 'overlayPane', // above base tiles, below markers — no extra Pane needed
    })
    map.addLayer(layer)
    return () => { map.removeLayer(layer) }
  }, [map, opacity])

  return null
}
