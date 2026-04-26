import { useState, useEffect } from 'react'
import { GeoJSON } from 'react-leaflet'

export default function MoldovaBorder() {
  const [geo, setGeo] = useState<any>(null)

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries/MDA.geo.json')
      .then(r => r.json())
      .then(setGeo)
      .catch(() => {})
  }, [])

  if (!geo) return null

  return (
    <GeoJSON
      key="moldova"
      data={geo}
      style={{
        color: '#3b82f6',
        weight: 2,
        opacity: 0.6,
        fillColor: '#3b82f6',
        fillOpacity: 0.04,
        dashArray: '6 4',
      }}
    />
  )
}
