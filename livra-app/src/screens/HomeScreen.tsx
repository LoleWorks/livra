import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'
import { useState, useCallback, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import DeliveryCard from '../components/DeliveryCard'
import { colors } from '../lib/colors'
import { useUser } from '../lib/context'
import { getMyDeliveries } from '../lib/api'
import type { RootStackParamList, Delivery } from '../types'

type Nav = NativeStackNavigationProp<RootStackParamList>

function firstNameOf(full: string) {
  return full.split(' ')[0]
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>()
  const { phone, name } = useUser()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    if (!phone) return
    const data = await getMyDeliveries(phone)
    setDeliveries(data)
    setLoading(false)
    setRefreshing(false)
  }, [phone])

  useEffect(() => { load() }, [load])

  const onRefresh = useCallback(() => { setRefreshing(true); load() }, [load])

  const active = deliveries.filter(d => ['en_route', 'dispatched', 'nearby'].includes(d.status))
  const today = new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.cream }}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.orange} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bună, {firstNameOf(name ?? 'acolo')}!</Text>
          <Text style={styles.subtitle}>{today.charAt(0).toUpperCase() + today.slice(1)}</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={colors.black} />
        </TouchableOpacity>
      </View>

      {/* Active deliveries */}
      {active.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLiveDot} />
            <Text style={styles.sectionTitle}>Active acum</Text>
          </View>
          {active.map(d => (
            <DeliveryCard
              key={d.id}
              delivery={d}
              onPress={() => navigation.navigate('Track', { deliveryId: d.id })}
            />
          ))}
        </>
      )}

      {active.length === 0 && (
        <View style={styles.emptyCard}>
          <Ionicons name="cube-outline" size={48} color={colors.gray200} />
          <Text style={styles.emptyTitle}>Nicio livrare activă</Text>
          <Text style={styles.emptySubtitle}>
            Când un magazin partener va trimite o comandă, vei vedea curierul live aici.
          </Text>
        </View>
      )}

      {/* Recent */}
      {deliveries.filter(d => d.status === 'delivered' || d.status === 'failed').slice(0, 3).length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Recente</Text>
          {deliveries
            .filter(d => d.status === 'delivered' || d.status === 'failed')
            .slice(0, 3)
            .map(d => (
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
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 24, marginTop: 8,
  },
  greeting: { fontSize: 24, fontWeight: '700', color: colors.black },
  subtitle: { fontSize: 14, color: colors.gray500, marginTop: 2 },
  notifBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionLiveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.orange },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.black },
  emptyCard: {
    backgroundColor: colors.white, borderRadius: 20, padding: 32,
    alignItems: 'center', marginBottom: 24,
  },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: colors.black, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: colors.gray400, textAlign: 'center', lineHeight: 20 },
})
