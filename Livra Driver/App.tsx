import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, AppState, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as Device from 'expo-device'
import './src/lib/locationTask'
import Constants from 'expo-constants'
import { loadDriverId } from './src/lib/storage'
import { supabase } from './src/lib/supabase'
import { startTracking } from './src/lib/tracking'
import { registerPushToken } from './src/lib/notifications'
import { T } from './src/lib/tokens'
import LoginScreen from './src/screens/LoginScreen'
import HomeScreen from './src/screens/HomeScreen'
import DeliveryDetailScreen from './src/screens/DeliveryDetailScreen'
import AfterNavigationScreen from './src/screens/AfterNavigationScreen'
import FailureReasonScreen from './src/screens/FailureReasonScreen'
import ProfileScreen from './src/screens/ProfileScreen'

export type RootStackParamList = {
  Login: undefined
  Home: { driverId: string; driverName: string }
  DeliveryDetail: {
    routeId: string
    driverId: string
    driverName: string
    stopId: string
    stopNum: number
    totalStops: number
  }
  AfterNavigation: {
    routeId: string
    driverId: string
    driverName: string
    stopId: string
    stopNum: number
    totalStops: number
  }
  FailureReason: {
    routeId: string
    driverId: string
    driverName: string
    stopId: string
    stopNum: number
    totalStops: number
  }
  Profile: { driverId: string; driverName: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  const [initialRoute, setInitialRoute] = useState<
    | { name: 'Home'; params: { driverId: string; driverName: string } }
    | { name: 'Login' }
    | null
  >(null)

  const activeDriver = useRef<string | null>(null)

  useEffect(() => {
    checkSession()
  }, [])

  const handleStartTracking = async (driverId: string) => {
    activeDriver.current = driverId
    await startTracking(driverId)
  }

  const checkSession = async () => {
    const driverId = await loadDriverId()
    if (!driverId) { setInitialRoute({ name: 'Login' }); return }
    const { data } = await supabase
      .from('livra_drivers')
      .select('id, name')
      .eq('id', driverId)
      .single()
    if (data) {
      registerPushToken(data.id).catch(err => console.warn('[push]', err))
      handleStartTracking(data.id)
      supabase.from('livra_drivers').update({
        device_name:        Device.brand ?? null,
        device_model:       Device.modelName ?? null,
        device_os:          Device.osName ?? null,
        device_os_version:  Device.osVersion ?? null,
        device_app_version: Constants.expoConfig?.version ?? null,
        last_login:         new Date().toISOString(),
      }).eq('id', data.id).then(() => {})
      setInitialRoute({ name: 'Home', params: { driverId: data.id, driverName: data.name } })
    } else {
      setInitialRoute({ name: 'Login' })
    }
  }

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.color.bg }}>
        <ActivityIndicator size="large" color={T.color.primary} />
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute.name}
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            initialParams={initialRoute.name === 'Home' ? initialRoute.params : undefined}
          />
          <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} />
          <Stack.Screen
            name="AfterNavigation"
            component={AfterNavigationScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="FailureReason" component={FailureReasonScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}
