import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import { useFonts, Fraunces_700Bold, Fraunces_700Bold_Italic } from '@expo-google-fonts/fraunces'
import * as SplashScreen from 'expo-splash-screen'
import * as Notifications from 'expo-notifications'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '../src/context/AuthContext'
import { OrdersProvider } from '../src/context/OrdersContext'

SplashScreen.preventAutoHideAsync()

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
})

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
          </Stack>
        </OrdersProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
