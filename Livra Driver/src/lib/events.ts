import * as Location from 'expo-location'
import { supabase } from './supabase'

export type EventType =
  | 'login'
  | 'logout'
  | 'route_opened'
  | 'route_completed'
  | 'stop_completed'
  | 'stop_failed'
  | 'break_started'
  | 'break_ended'
  | 'geofence_bypass_used'
  | 'nav_app_opened'

interface LogArgs {
  driverId: string
  eventType: EventType
  routeId?: string | null
  metadata?: Record<string, unknown>
  // Optional explicit lat/lng — if not provided we try to read it from the
  // current GPS. Most events come from screens where we already have the
  // driver's coordinates so we'll usually pass them in.
  lat?: number | null
  lng?: number | null
}

/**
 * Emit a driver activity event into livra_driver_events.
 * Fire-and-forget: failures are logged but never block the UI.
 *
 * Events are how the dispatcher's "Activitate" tab knows what each driver
 * is doing in real time. Idle periods are detected automatically by a DB
 * trigger on livra_driver_locations — no need to emit those from here.
 */
export async function logEvent({
  driverId,
  eventType,
  routeId = null,
  metadata = {},
  lat = null,
  lng = null,
}: LogArgs): Promise<void> {
  try {
    // If caller didn't provide coords, try to read the last known position
    // (cheap — already cached in expo-location)
    if (lat === null || lng === null) {
      try {
        const last = await Location.getLastKnownPositionAsync()
        if (last) {
          lat = last.coords.latitude
          lng = last.coords.longitude
        }
      } catch { /* swallow — events are best-effort */ }
    }

    await supabase.from('livra_driver_events').insert({
      driver_id: driverId,
      route_id: routeId,
      event_type: eventType,
      lat, lng,
      metadata,
    })
  } catch (err) {
    console.warn('[events] failed to log', eventType, err)
  }
}
