import * as TaskManager from 'expo-task-manager'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

export const LOCATION_TASK = 'livra-location-task'

// Minimal Supabase client for use inside the background task.
// The task runs in a separate JS context and cannot import the app's supabase singleton.
const bgSupabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } },
)

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }: any) => {
  if (error) return
  const locations = data?.locations
  if (!locations?.length) return

  const driverId = await AsyncStorage.getItem('@livra_driver_id')
  if (!driverId) return

  const { latitude: lat, longitude: lng, heading } = locations[locations.length - 1].coords
  await bgSupabase.from('livra_driver_locations').upsert(
    { driver_id: driverId, lat, lng, heading: heading ?? null, updated_at: new Date().toISOString() },
    { onConflict: 'driver_id' },
  )
})
