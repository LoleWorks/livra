import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { useState, useEffect, useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import DeliveryCard from '../components/DeliveryCard'
import { colors } from '../lib/colors'
import { useUser } from '../lib/context'
import { getMyDeliveries } from '../lib/api'
import type { RootStackParamList, Delivery, DeliveryStatus } from '../types'

type Nav = NativeStackNavigationProp<RootStackParamList>

const FILTERS: { key: DeliveryStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Toate' },
  { key: 'en_route', label: 'Active' },
  { key: 'delivered', label: 'Livrate' },
  { key: 'failed', label: 'Eșuate' },
]

export default function OrdersScreen() {
  const navigation = useNavigation<Nav>()
  const { phone } = useUser()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<DeliveryStatus | 'all'>('all')

  const load = useCallback(async () => {
    if (!phone) return
    const data = await getMyDeliveries(phone)
    setDeliveries(data)
    setLoading(false)
    setRefreshing(false)
  }, [phone])

  useEffect(() => { load() }, [load])

  const filtered = filter === 'all'
    ? deliveries
    : deliveries.filter(d =>
        filter === 'en_route'
          ? ['en_route', 'dispatched', 'nearby'].includes(d.status)
          : d.status === filter
      )

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.cream }}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.filterBar} contentContainerStyle={styles.filterContent}
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

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={colors.orange} />}
      >
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
  filterBar: { backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray100, maxHeight: 56 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.gray100 },
  filterChipActive: { backgroundColor: colors.orange },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.gray500 },
  filterTextActive: { color: colors.white },
  list: { padding: 16, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: colors.gray400, fontWeight: '500' },
})
