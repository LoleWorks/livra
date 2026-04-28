import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { View, Text } from 'react-native'

import HomeScreen from './src/screens/HomeScreen'
import OrdersScreen from './src/screens/OrdersScreen'
import LocationsScreen from './src/screens/LocationsScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import TrackScreen from './src/screens/TrackScreen'
import SetLocationScreen from './src/screens/SetLocationScreen'
import DeliveryDetailScreen from './src/screens/DeliveryDetailScreen'
import { colors } from './src/lib/colors'
import type { RootStackParamList, MainTabParamList } from './src/types'

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()

function LogoTitle() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 0 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.black, letterSpacing: 2 }}>
        LIVRA
      </Text>
      <View style={{ marginLeft: 4, marginBottom: 2, width: 28, height: 3, backgroundColor: colors.orange, borderRadius: 2 }} />
    </View>
  )
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [string, string]> = {
            Home: ['home', 'home-outline'],
            Orders: ['receipt', 'receipt-outline'],
            Locations: ['location', 'location-outline'],
            Profile: ['person', 'person-outline'],
          }
          const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline']
          return <Ionicons name={(focused ? active : inactive) as any} size={size} color={color} />
        },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray100,
          height: 64,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: colors.white },
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.black, fontWeight: '700' },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Acasă', headerTitle: () => <LogoTitle /> }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ tabBarLabel: 'Comenzi', headerTitle: 'Comenzile mele' }}
      />
      <Tab.Screen
        name="Locations"
        component={LocationsScreen}
        options={{ tabBarLabel: 'Locații', headerTitle: 'Locațiile mele' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil', headerTitle: 'Profil' }}
      />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.white },
          headerShadowVisible: false,
          headerTintColor: colors.black,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.cream },
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="Track"
          component={TrackScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SetLocation"
          component={SetLocationScreen}
          options={{ title: 'Setează locația', presentation: 'modal' }}
        />
        <Stack.Screen
          name="DeliveryDetail"
          component={DeliveryDetailScreen}
          options={{ title: 'Detalii comandă' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
