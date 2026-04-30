import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import Constants from 'expo-constants'
import { supabase } from './supabase'

// Foreground notification behavior — show banner + play sound even when app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

/**
 * Request permission, fetch the Expo push token for this device, and persist it
 * against the driver's row in Supabase. Safe to call multiple times — overwrites
 * the same token on each login (drivers can switch devices).
 */
export async function registerPushToken(driverId: string): Promise<string | null> {
  if (!Device.isDevice) {
    // Push notifications don't work on emulators
    return null
  }

  // Android: create a notification channel so notifications show on Android 8+
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('routes', {
      name: 'Rute noi',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563eb',
      sound: 'default',
    })
  }

  // Permission flow
  const existing = await Notifications.getPermissionsAsync()
  let status = existing.status
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync()
    status = req.status
  }
  if (status !== 'granted') return null

  // Fetch the push token (Expo's project-scoped token).
  // FCM often returns SERVICE_NOT_AVAILABLE on the first call after install,
  // especially on Xiaomi/MIUI — Google Play Services takes ~30s to register
  // a freshly-installed app. Retry with exponential backoff up to 5 times.
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId

  let token: string | null = null
  let lastErr: unknown = null
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const tokenResp = await Notifications.getExpoPushTokenAsync({ projectId })
      token = tokenResp.data
      break
    } catch (err) {
      lastErr = err
      // Wait 2s, 4s, 8s, 16s before next attempt
      await new Promise(r => setTimeout(r, Math.pow(2, attempt + 1) * 1000))
    }
  }

  if (!token) {
    console.warn('[push] all retries failed:', lastErr)
    return null
  }

  // Persist to Supabase so the dispatcher can target this driver's device
  await supabase
    .from('livra_drivers')
    .update({ push_token: token })
    .eq('id', driverId)

  console.log('[push] token registered for driver', driverId)
  return token
}
