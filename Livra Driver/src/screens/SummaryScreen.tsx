import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { logEvent } from '../lib/events'
import type { RouteStop } from '../lib/types'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../App'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Summary'>
  route: RouteProp<RootStackParamList, 'Summary'>
}

export default function SummaryScreen({ navigation, route: navRoute }: Props) {
  const { routeId, driverId } = navRoute.params
  const [stops, setStops] = useState<RouteStop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data } = await supabase
      .from('livra_route_stops')
      .select('*')
      .eq('route_id', routeId)
      .order('stop_order')

    if (data) setStops(data)

    await supabase
      .from('livra_routes')
      .update({ status: 'completed' })
      .eq('id', routeId)

    // Mark driver as done for the day. Status flips back to 'active' next time
    // they open another route, or 'offline' when they log out.
    // We INTENTIONALLY do NOT delete livra_driver_locations — the dispatcher
    // still wants to see where the driver finished and when they were last seen.
    await supabase
      .from('livra_drivers')
      .update({ status: 'done' })
      .eq('id', driverId)

    // Audit-trail event for the dispatcher's Activitate tab
    if (data) {
      const completed = data.filter(s => s.status === 'completed').length
      const failed    = data.filter(s => s.status === 'failed').length
      logEvent({
        driverId, routeId, eventType: 'route_completed',
        metadata: { total: data.length, completed, failed },
      })
    }

    setLoading(false)
  }

  const delivered = stops.filter(s => s.status === 'completed').length
  const failed = stops.filter(s => s.status === 'failed').length

  const renderStop = ({ item }: { item: RouteStop }) => (
    <View style={styles.stopRow}>
      <View style={[
        styles.dot,
        item.status === 'completed' ? styles.dotDone : styles.dotFail,
      ]} />
      <View style={styles.stopInfo}>
        <Text style={styles.stopName}>{item.client_name}</Text>
        <Text style={styles.stopAddr}>{item.address}</Text>
        {item.notes ? <Text style={styles.stopNotes}>{item.notes}</Text> : null}
      </View>
      <Text style={[
        styles.stopStatus,
        item.status === 'completed' ? styles.statusOk : styles.statusFail,
      ]}>
        {item.status === 'completed' ? 'Livrat' : 'Eșuat'}
      </Text>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Rută finalizată</Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{delivered}</Text>
            <Text style={styles.statLabel}>Livrate</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, failed > 0 && styles.statNumFail]}>{failed}</Text>
            <Text style={styles.statLabel}>Eșuate</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{stops.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        <FlatList
          data={stops}
          keyExtractor={s => s.id}
          renderItem={renderStop}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          style={styles.list}
        />

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.replace('Home', { driverId, driverName: '' })}
        >
          <Text style={styles.doneBtnText}>Înapoi la ecranul principal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { flex: 1, padding: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: { alignItems: 'center', gap: 4 },
  statNum: { fontSize: 28, fontWeight: '700', color: '#111827' },
  statNumFail: { color: '#dc2626' },
  statLabel: { fontSize: 12, color: '#6b7280' },
  statDiv: { width: 1, height: 40, backgroundColor: '#e5e7eb' },
  list: { flex: 1 },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  dotDone: { backgroundColor: '#16a34a' },
  dotFail: { backgroundColor: '#dc2626' },
  stopInfo: { flex: 1, gap: 2 },
  stopName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  stopAddr: { fontSize: 12, color: '#6b7280' },
  stopNotes: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic' },
  stopStatus: { fontSize: 12, fontWeight: '600' },
  statusOk: { color: '#16a34a' },
  statusFail: { color: '#dc2626' },
  sep: { height: 8 },
  doneBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})
