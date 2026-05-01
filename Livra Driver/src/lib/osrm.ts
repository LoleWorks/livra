import type { OsrmRoute, OsrmStep } from './types'

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving'

function maneuverToInstruction(step: any): string {
  const type: string = step.maneuver?.type ?? ''
  const modifier: string = step.maneuver?.modifier ?? ''
  const name: string = step.name ?? ''

  const on = name ? ` pe ${name}` : ''

  switch (type) {
    case 'depart': return `Porniți${on}`
    case 'arrive': return `Ați ajuns la destinație`
    case 'turn': {
      if (modifier === 'left') return `Virați la stânga${on}`
      if (modifier === 'right') return `Virați la dreapta${on}`
      if (modifier === 'slight left') return `Ușor la stânga${on}`
      if (modifier === 'slight right') return `Ușor la dreapta${on}`
      if (modifier === 'sharp left') return `Virați brusc la stânga${on}`
      if (modifier === 'sharp right') return `Virați brusc la dreapta${on}`
      if (modifier === 'uturn') return `Întoarceți-vă${on}`
      return `Continuați${on}`
    }
    case 'new name': return `Continuați${on}`
    case 'continue': return `Continuați${on}`
    case 'merge': return `Intrați${on}`
    case 'roundabout':
    case 'rotary': {
      const exit = step.maneuver?.exit ?? ''
      return `La sens giratoriu, ieșirea ${exit}${on}`
    }
    case 'fork': {
      if (modifier?.includes('left')) return `Țineți stânga${on}`
      if (modifier?.includes('right')) return `Țineți dreapta${on}`
      return `Continuați${on}`
    }
    default: return `Continuați${on}`
  }
}

export async function fetchRoute(
  waypoints: { lat: number; lng: number }[]
): Promise<OsrmRoute> {
  const coords = waypoints.map(w => `${w.lng},${w.lat}`).join(';')
  const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson&steps=true`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`OSRM error ${res.status}`)

  const data = await res.json()
  const route = data.routes?.[0]
  if (!route) throw new Error('No route returned')

  const allCoords: [number, number][] = route.geometry.coordinates

  const steps: OsrmStep[] = route.legs
    .flatMap((leg: any) => leg.steps ?? [])
    .map((s: any): OsrmStep => ({
      instruction: maneuverToInstruction(s),
      distance: s.distance,
      duration: s.duration,
      maneuver: s.maneuver,
      geometry: s.geometry,
    }))

  return {
    distance: route.distance,
    duration: route.duration,
    steps,
    coordinates: allCoords,
  }
}
