import React, { useEffect, useRef } from 'react'
import { Stack, useRouter } from 'expo-router'
import { useFonts, Fraunces_700Bold, Fraunces_700Bold_Italic } from '@expo-google-fonts/fraunces'
import * as SplashScreen from 'expo-splash-screen'
import * as Notifications from 'expo-notifications'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '../src/context/AuthContext'
import { OrdersProvider } from '../src/context/OrdersContext'
import { TrackedParcelsProvider } from '../src/context/TrackedParcelsContext'
import { NotificationsProvider, useNotifications } from '../src/context/NotificationsContext'

SplashScreen.preventAutoHideAsync()

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

function AppNavigator() {
  const router    = useRouter()
  const { addNotif } = useNotifications()
  const tapRef    = useRef<Notifications.Subscription | null>(null)
  const recvRef   = useRef<Notifications.Subscription | null>(null)

  useEffect(() => {
    recvRef.current = Notifications.addNotificationReceivedListener(notification => {
      const content = notification.request.content
      const data    = content.data as Record<string, string>
      addNotif({
        title:   content.title ?? '',
        body:    content.body  ?? '',
        time:    new Date().toISOString(),
        awb:     data?.awb,
        carrier: data?.carrier,
      })
    })

    tapRef.current = Notifications.addNotificationResponseReceivedListener(response => {
      const content = response.notification.request.content
      const data    = content.data as Record<string, string>
      const awb     = data?.awb
      const carrier = data?.carrier

      // Save notification if it wasn't already captured by the foreground listener
      addNotif({
        title:   content.title ?? '',
        body:    content.body  ?? '',
        time:    new Date().toISOString(),
        awb,
        carrier,
      })

      if (awb) {
        const url = `/parcel-tracking?awb=${encodeURIComponent(awb)}${carrier ? `&carrier=${encodeURIComponent(carrier)}` : ''}`
        router.push(url as any)
      }
    })

    return () => {
      recvRef.current?.remove()
      tapRef.current?.remove()
    }
  }, [])

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F4F3EF' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding/index" />
      <Stack.Screen name="onboarding/name" />
      <Stack.Screen name="onboarding/pin" />
      <Stack.Screen name="onboarding/time-window" />
      <Stack.Screen name="auth/phone" />
      <Stack.Screen name="auth/otp" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="track/[stopId]" />
      <Stack.Screen name="order/[stopId]/index" />
      <Stack.Screen name="order/[stopId]/rate" />
      <Stack.Screen name="pins/add" />
      <Stack.Screen name="pins/[id]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="help" />
      <Stack.Screen name="parcel-tracking" />
      <Stack.Screen name="dev-notifications" />
    </Stack>
  )
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Fraunces_700Bold, Fraunces_700Bold_Italic })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OrdersProvider>
          <TrackedParcelsProvider>
            <NotificationsProvider>
              <AppNavigator />
            </NotificationsProvider>
          </TrackedParcelsProvider>
        </OrdersProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
