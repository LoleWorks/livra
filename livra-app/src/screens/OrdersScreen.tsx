import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import DeliveryCard from '../components/DeliveryCard'
import { colors } from '../lib/colors'
import type { RootStackParamList, Delivery, DeliveryStatus } from '../types'

type Nav = NativeStackNavigationProp<RootStackParamList>

const ALL_ORDERS: Delivery[] = [
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
    driverInitials: 'AM',
    destinationLat: 47.026,
    destinationLng: 28.838,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
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
  {
    id: 'd3',
    orderId: '4760',
    storeName: 'Elefant.md',
    address: 'Str. Albișoara 34, ap. 7',
    status: 'delivered',
    stopOrder: 12,
    totalStops: 12,
    timeWindowStart: new Date(Date.now() - 7 * 86400000).toISOString(),
    timeWindowEnd: new Date(Date.now() - 7 * 86400000 + 3600000).toISOString(),
    driverInitials: 'VT',
    destinationLat: 47.026,
    destinationLng: 28.838,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    deliveredAt: new Date(Date.now() - 7 * 86400000 + 2700000).toISOString(),
  },
  {
    id: 'd4',
    orderId: '4711',
    storeName: 'Fashion MD',
    address: 'Str. Albișoara 34, ap. 7',
    status: 'failed',
    stopOrder: 3,
    totalStops: 3,
    timeWindowStart: new Date(Date.now() - 10 * 86400000).toISOString(),
    timeWindowEnd: new Date(Date.now() - 10 * 86400000 + 3600000).toISOString(),
    driverInitials: 'AM',
    destinationLat: 47.026,
    destinationLng: 28.838,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
]

const FILTERS: { key: DeliveryStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Toate' },
  { key: 'en_route', label: 'Active' },
  { key: 'delivered', label: 'Livrate' },
  { key: 'failed', label: 'Eșuate' },
]

export default function OrdersScreen() {
  const navigation = useNavigation<Nav>()
  const [filter, setFilter] = useState<DeliveryStatus | 'all'>('all')

  const filtered = filter === 'all' ? ALL_ORDERS : ALL_ORDERS.filter(d => d.status === filter)

  return (
    <View style={styles.container}>
      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders list */}
      <ScrollView contentContainerStyle={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={colors.gray200} />
            <Text style={styles.emptyText}>Nicio comandă</Text>
          </View>
        ) : (
          filtered.map(d => (
            <DeliveryCard
              key={d.id}
              delivery={d}
              onPress={() =>
                ['en_route', 'nearby', 'dispatched'].includes(d.status)
                  ? navigation.navigate('Track', { deliveryId: d.id })
                  : navigation.navigate('DeliveryDetail', { deliveryId: d.id })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  filterBar: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    maxHeight: 56,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.gray100,
  },
  filterChipActive: {
    backgroundColor: colors.orange,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray500,
  },
  filterTextActive: {
    color: colors.white,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray400,
    fontWeight: '500',
  },
})
