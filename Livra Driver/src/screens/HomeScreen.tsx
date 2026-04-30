import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { clearDriverId } from '../lib/storage'
import { logEvent } from '../lib/events'
import type { Route, RouteStop } from '../lib/types'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../App'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>
  route: RouteProp<RootStackParamList, 'Home'>
}

interface RouteWithStops extends Route {
  stops: RouteStop[]
}

export default function HomeScreen({ navigation, route: navRoute }: Props) {
  const { driverId, driverName } = navRoute.params
  const [routes, setRoutes] = useState<RouteWithStops[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRoutes()

    // Realtime subscription: any time a route is INSERTed/UPDATEd for this
    // driver (or any of its stops change), refetch so the home screen stays
    // in sync without the driver tapping anything.
    const channel = supabase
      .channel(`driver-${driverId}-routes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'livra_routes',
        filter: `driver_id=eq.${driverId}`,
      }, () => loadRoutes())
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'livra_route_stops',
      }, () => loadRoutes())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [driverId])

  const loadRoutes = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const { data: routeData, error } = await supabase
        .from('livra_routes')
        .select('*')
        .eq('driver_id', driverId)
        .eq('date', today)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false })

      if (error) throw error

      const withStops: RouteWithStops[] = []
      for (const r of routeData ?? []) {
        const { data: stops } = await supabase
          .from('livra_route_stops')
          .select('*')
          .eq('route_id', r.id)
          .order('stop_order')
        withStops.push({ ...r, stops: stops ?? [] })
      }
      setRoutes(withStops)
    } catch {
      Alert.alert('Eroare', 'Nu s-au putut încărca rutele.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    // Audit-trail event before we clear local state
    await logEvent({ driverId, eventType: 'logout' })
    // Flip the driver's row to offline so the dispatcher's grey dot lights up.
    await supabase.from('livra_drivers').update({ status: 'offline' }).eq('id', driverId)
    await clearDriverId()
    navigation.replace('Login')
  }

  const completedCount = (stops: RouteStop[]) =>
    stops.filter(s => s.status === 'completed').length

  const renderRoute = ({ item }: { item: RouteWithStops }) => {
    const done = completedCount(item.stops)
    const total = item.stops.length
    const pct = total > 0 ? done / total : 0

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('RouteMap', {
            routeId: item.id,
            driverId,
          })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {total} opriri · {done} livrate
          </Text>
          <View style={[styles.statusBadge, item.status === 'active' && styles.statusActive]}>
            <Text style={styles.statusText}>
              {item.status === 'active' ? 'În curs' : 'Nepornit'}
            </Text>
          </View>
        </View>
        <View style={styles.progress}>
          <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
        </View>
        <Text style={styles.cardSub}>
          {item.stops.slice(0, 2).map(s => s.client_name).join(' · ')}
          {item.stops.length > 2 ? ` +${item.stops.length - 2}` : ''}
        </Text>
        <Text style={styles.startLink}>Deschide ruta →</Text>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bună ziua,</Text>
            <Text style={styles.name}>{driverName}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logout}>
            <Text style={styles.logoutText}>Ieșire</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={styles.loader} color="#2563eb" size="large" />
        ) : routes.length === 0 ? (
          <View style={styles.empty}>
            <ActivityIndicator color="#9ca3af" size="small" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>Nicio rută pentru azi</Text>
            <Text style={styles.emptySub}>
              Aștept o rută de la administrator…{'\n'}Va apărea aici automat.
            </Text>
          </View>
        ) : (
          <FlatList
            data={routes}
            keyExtractor={r => r.id}
            renderItem={renderRoute}
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: { fontSize: 13, color: '#6b7280' },
  name: { fontSize: 22, fontWeight: '700', color: '#111827' },
  logout: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  logoutText: { fontSize: 13, color: '#6b7280' },
  loader: { flex: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  statusBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusActive: { backgroundColor: '#dcfce7' },
  statusText: { fontSize: 12, fontWeight: '500', color: '#374151' },
  progress: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  cardSub: { fontSize: 13, color: '#6b7280', marginBottom: 10 },
  startLink: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  emptySub: { fontSize: 14, color: '#6b7280', textAlign: 'center', maxWidth: 260, lineHeight: 20 },
})
