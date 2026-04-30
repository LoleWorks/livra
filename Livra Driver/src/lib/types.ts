export interface Driver {
  id: string
  name: string
  pin: string
  color: string
  phone: string | null
}

export interface Route {
  id: string
  driver_id: string
  date: string
  status: 'pending' | 'active' | 'completed'
  created_at: string
}

export interface RouteStop {
  id: string
  route_id: string
  delivery_id: string | null               // null for break stops
  stop_order: number
  status: 'pending' | 'completed' | 'failed'
  completed_at: string | null
  signature_url: string | null
  notes: string | null
  address: string
  client_name: string                       // for breaks, the POI name (e.g. "Lukoil")
  client_phone: string | null
  lat: number
  lng: number
  // 'delivery' | 'lunch_break' | 'fuel_break'
  type: 'delivery' | 'lunch_break' | 'fuel_break'
  break_duration_min: number | null
  // Denormalised from livra_deliveries when the dispatcher creates a delivery stop
  package_description: string | null
  time_window_start: string | null
  time_window_end: string | null
  delivery_notes: string | null
  fail_reason: string | null
}

export interface DriverLocation {
  driver_id: string
  lat: number
  lng: number
  heading: number | null
  updated_at: string
}

export interface OsrmStep {
  instruction: string
  distance: number
  duration: number
  maneuver: {
    type: string
    modifier?: string
    bearing_after?: number
  }
  geometry: {
    coordinates: [number, number][]
  }
}

export interface OsrmRoute {
  distance: number
  duration: number
  steps: OsrmStep[]
  coordinates: [number, number][]
}
