import * as Location from 'expo-location'
import { supabase } from './supabase'
import { LOCATION_TASK } from './locationTask'

export async function startTracking(driverId: string) {
  await supabase.from('livra_drivers').update({ status: 'active' }).eq('id', driverId)

  const { status: fg } = await Location.requestForegroundPermissionsAsync()
  if (fg !== 'granted') return

  const { status: bg } = await Location.requestBackgroundPermissionsAsync()

  const already = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK).catch(() => false)
  if (!already) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 10000,
      distanceInterval: 15,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Livra Driver',
        notificationBody: 'Transmitere locatie GPS activa',
        notificationColor: '#FF5C2C',
      },
      ...(bg !== 'granted' ? { pausesUpdatesAutomatically: false } : {}),
    })
  }
}

export async function stopTracking(driverId: string) {
  const running = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK).catch(() => false)
  if (running) await Location.stopLocationUpdatesAsync(LOCATION_TASK)
  await supabase.from('livra_drivers').update({ status: 'offline' }).eq('id', driverId)
}
