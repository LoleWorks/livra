import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native'
import { useState, useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import DeliveryCard from '../components/DeliveryCard'
import { colors } from '../lib/colors'
import type { RootStackParamList, Delivery } from '../types'

type Nav = NativeStackNavigationProp<RootStackParamList>

// Mock active deliveries – will be replaced by real API call
const MOCK_ACTIVE: Delivery[] = [
  {
    id: 'd1',
    orderId: '4821',
    storeName: 'Fashion MD',
    address: 'Str. Albișoara 34, ap. 7',
    status: 'en_route',
    stopOrder: 3,
    totalStops: 8,
    timeWindowStart: new Date(Date.now() - 10 * 60000).toISOString(),
    timeWindowEnd: new Date(Date.now() + 20 * 60000).toISOString(),
    notes: 'Etajul 3, scara A',
    driverName: 'Alexandru M.',
    driverInitials: 'AM',
    driverLocation: { lat: 47.024, lng: 28.835, updatedAt: new Date(Date.now() - 30000).toISOString() },
    destinationLat: 47.026,
    destinationLng: 28.838,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
]

const MOCK_RECENT: Delivery[] = [
  {
    id: 'd2',
    orderId: '4799',
    storeName: 'Megapolis',
    address: 'Bd. Dacia 18, ap. 3',
    status: 'delivered',
    stopOrder: 5,
    totalStops: 5,
    timeWindowStart: new Date(Date.now() - 2 * 86400000).toISOString(),
    timeWindowEnd: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString(),
    driverInitials: 'IP',
    destinationLat: 47.03,
    destinationLng: 28.84,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    deliveredAt: new Date(Date.now() - 2 * 86400000 + 1800000).toISOString(),
  },
]

export default function HomeScreen() {
  const navigation = useNavigation<Nav>()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1200)
  }, [])

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.orange} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bună ziua!</Text>
          <Text style={styles.subtitle}>Urmărești-ți livrările</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={colors.black} />
        </TouchableOpacity>
      </View>

      {/* Active deliveries */}
      {MOCK_ACTIVE.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLiveDot} />
            <Text style={styles.sectionTitle}>Active acum</Text>
          </View>
          {MOCK_ACTIVE.map(d => (
            <DeliveryCard
              key={d.id}
              delivery={d}
              onPress={() => navigation.navigate('Track', { deliveryId: d.id })}
            />
          ))}
        </>
      )}

      {/* Empty state */}
      {MOCK_ACTIVE.length === 0 && (
        <View style={styles.emptyCard}>
          <Ionicons name="cube-outline" size={48} color={colors.gray200} />
          <Text style={styles.emptyTitle}>Nicio livrare activă</Text>
          <Text style={styles.emptySubtitle}>
            Când un magazin partener va trimite o comandă, vei vedea curierul live aici.
          </Text>
        </View>
      )}

      {/* Recent deliveries */}
      {MOCK_RECENT.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Recente</Text>
          {MOCK_RECENT.map(d => (
            <DeliveryCard
              key={d.id}
              delivery={d}
              onPress={() => navigation.navigate('DeliveryDetail', { deliveryId: d.id })}
            />
          ))}
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: 2,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray400,
    textAlign: 'center',
    lineHeight: 20,
  },
})
