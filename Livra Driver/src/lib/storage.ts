import AsyncStorage from '@react-native-async-storage/async-storage'

const DRIVER_ID_KEY = '@livra_driver_id'
const NAV_APP_KEY   = '@livra_nav_app'

export type NavApp = 'waze' | 'google' | 'apple'

export async function saveDriverId(id: string): Promise<void> {
  await AsyncStorage.setItem(DRIVER_ID_KEY, id)
}

export async function loadDriverId(): Promise<string | null> {
  return AsyncStorage.getItem(DRIVER_ID_KEY)
}

export async function clearDriverId(): Promise<void> {
  await AsyncStorage.removeItem(DRIVER_ID_KEY)
}

export async function saveNavApp(app: NavApp): Promise<void> {
  await AsyncStorage.setItem(NAV_APP_KEY, app)
}

export async function loadNavApp(): Promise<NavApp> {
  const v = await AsyncStorage.getItem(NAV_APP_KEY)
  return (v === 'google' || v === 'apple' || v === 'waze') ? v : 'waze'  // Waze default
}
