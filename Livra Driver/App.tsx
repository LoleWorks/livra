import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as Notifications from 'expo-notifications'
import { loadDriverId } from './src/lib/storage'
import { supabase } from './src/lib/supabase'
import { registerPushToken } from './src/lib/notifications'
import LoginScreen from './src/screens/LoginScreen'
import HomeScreen from './src/screens/HomeScreen'
import RouteMapScreen from './src/screens/RouteMapScreen'
import SummaryScreen from './src/screens/SummaryScreen'

export type RootStackParamList = {
  Login: undefined
  Home: { driverId: string; driverName: string }
  RouteMap: { routeId: string; driverId: string }
  Summary: { routeId: string; driverId: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  const navRef = useRef<NavigationContainerRef<RootStackParamList>>(null)
  const [initialRoute, setInitialRoute] = useState<
    { name: 'Home'; params: { driverId: string; driverName: string } } |
    { name: 'Login' } |
    null
  >(null)

  useEffect(() => {
    checkSession()

    // Handle notification tap when the app is in background (suspended).
    // For the killed-app case, checkSession() → Home → loadRoutes() already
    // handles it, so we only need the listener for the suspended case.
    const sub = Notifications.addNotificationResponseReceivedListener(async response => {
      const data = response.notification.request.content.data as Record<string, string> | null
      const routeId = data?.route_id
      const driverId = data?.driver_id ?? (await loadDriverId()) ?? undefined

      if (!navRef.current?.isReady() || !driverId) return

      if (routeId) {
        // Deep-link straight into the route map if the backend included the ID.
        navRef.current.navigate('RouteMap', { routeId, driverId })
      }
      // If no routeId, the HomeScreen AppState listener will call loadRoutes()
      // as soon as the app comes to the foreground.
    })

    return () => sub.remove()
  }, [])

  const checkSession = async () => {
    const driverId = await loadDriverId()
    if (!driverId) {
      setInitialRoute({ name: 'Login' })
      return
    }
    const { data } = await supabase
      .from('livra_drivers')
      .select('id, name')
      .eq('id', driverId)
      .single()

    if (data) {
      // Re-register the push token for already-logged-in drivers (in case the
      // token rotated or this is the first launch after install).
      registerPushToken(data.id).catch(err => console.warn('[push]', err))
      setInitialRoute({ name: 'Home', params: { driverId: data.id, driverName: data.name } })
    } else {
      setInitialRoute({ name: 'Login' })
    }
  }

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer ref={navRef}>
        <Stack.Navigator
          initialRouteName={initialRoute.name}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            initialParams={initialRoute.name === 'Home' ? initialRoute.params : undefined}
          />
          <Stack.Screen
            name="RouteMap"
            component={RouteMapScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="Summary"
            component={SummaryScreen}
            options={{ gestureEnabled: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}
