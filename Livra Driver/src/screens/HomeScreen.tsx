import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, RefreshControl,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'
import { T } from '../lib/tokens'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../App'
import type { RouteStop } from '../lib/types'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>
  route: RouteProp<RootStackParamList, 'Home'>
}

type RouteData = {
  id: string
  date: string
  status: string
  total_distance_km: number | null
  total_duration_min: number | null
}

function fmtDuration(min: number | null): string {
  if (!min) return '—'
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m}min`
}

function fmtDate(): string {
  const s = new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function shortRouteId(id: string): string {
  return 'R-' + id.slice(0, 4).toUpperCase()
}

function firstNameOf(full: string): string {
  return full.split(' ')[0]
}

export default function HomeScreen({ navigation, route: navRoute }: Props) {
  const { driverId, driverName } = navRoute.params
  const insets = useSafeAreaInsets()
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [stops, setStops] = useState<RouteStop[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const deliveryStops = stops.filter(s => s.type === 'delivery')
  const firstStop = stops[0]
  const lastDelivery = deliveryStops[deliveryStops.length - 1]

  const load = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10)
    const { data: routes } = await supabase
      .from('livra_routes')
      .select('id, date, status, total_distance_km, total_duration_min')
      .eq('driver_id', driverId)
      .eq('date', today)
      .in('status', ['pending', 'active'])
      .limit(1)

    if (!routes?.length) {
      setRouteData(null)
      setStops([])
      setLoading(false)
      setRefreshing(false)
      return
    }

    const r = routes[0] as RouteData
    setRouteData(r)

    const { data: stopsData } = await supabase
      .from('livra_route_stops')
      .select('*')
      .eq('route_id', r.id)
      .order('stop_order')

    setStops((stopsData ?? []) as RouteStop[])
    setLoading(false)
    setRefreshing(false)
  }, [driverId])

  const loadRef = useRef(load)
  useEffect(() => { loadRef.current = load }, [load])

  useEffect(() => {
    loadRef.current()
    const ch = supabase.channel(`home-${driverId}-${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'livra_routes', filter: `driver_id=eq.${driverId}` }, () => loadRef.current())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'livra_route_stops' }, () => loadRef.current())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [driverId])

  const handleStartRoute = () => {
    if (!routeData) return
    const firstPending = deliveryStops.find(s => s.status === 'pending')
    if (!firstPending) return
    const stopNum = deliveryStops.indexOf(firstPending) + 1
    navigation.push('DeliveryDetail', {
      routeId: routeData.id,
      driverId,
      driverName,
      stopId: firstPending.id,
      stopNum,
      totalStops: deliveryStops.length,
    })
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.color.bg }}>
        <ActivityIndicator size="large" color={T.color.primary} />
      </View>
    )
  }

  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <View>
          <Text style={s.headerSub}>{fmtDate()}</Text>
          <Text style={s.headerTitle}>Bună, {firstNameOf(driverName)}</Text>
        </View>
        <TouchableOpacity
          style={s.avatar}
          onPress={() => navigation.push('Profile', { driverId, driverName })}
          accessibilityLabel="Profil și setări"
        >
          <Feather name="user" size={20} color={T.color.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.body}
        contentContainerStyle={s.bodyContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={T.color.primary} />
        }
      >
        <Text style={s.sectionLabel}>RUTA DE AZI</Text>

        {routeData ? (
          <>
            <TouchableOpacity style={s.routeCard} onPress={handleStartRoute} activeOpacity={0.9}>
              <View style={s.routeCardTop}>
                <View>
                  <Text style={s.routeIdLabel}>{shortRouteId(routeData.id)}</Text>
                  <Text style={s.routeStopCount}>{deliveryStops.length} opriri</Text>
                </View>
                <View style={s.routeIconCircle}>
                  <Feather name="trending-up" size={26} color="#fff" />
                </View>
              </View>

              <View style={s.statRow}>
                <View style={s.statItem}>
                  <Text style={s.statLabel}>DISTANȚĂ</Text>
                  <Text style={s.statValue}>
                    {routeData.total_distance_km ? `${Math.round(routeData.total_distance_km)} km` : '—'}
                  </Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                  <Text style={s.statLabel}>TIMP EST.</Text>
                  <Text style={s.statValue}>{fmtDuration(routeData.total_duration_min)}</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                  <Text style={s.statLabel}>START</Text>
                  <Text style={s.statValue}>
                    {firstStop?.time_window_start?.slice(0, 5) ?? '09:00'}
                  </Text>
                </View>
              </View>

              <View style={s.timeline}>
                <View style={s.timelineTrack}>
                  <View style={s.timelineDot} />
                  <View style={s.timelineLine} />
                  <View style={s.timelineSquare} />
                </View>
                <View style={s.timelineContent}>
                  <Text style={s.timelineSubLabel}>Pornire · {firstStop?.client_name ?? 'Depozit'}</Text>
                  <Text style={s.timelineAddr}>{firstStop?.address ?? '—'}</Text>
                  <Text style={[s.timelineSubLabel, { marginTop: 14 }]}>Final · Oprire {deliveryStops.length}</Text>
                  <Text style={s.timelineAddr}>{lastDelivery?.address ?? '—'}</Text>
                </View>
              </View>

              <View style={s.routeCardFooter}>
                <Text style={s.routeCardFooterText}>Apasă pentru a începe</Text>
                <Feather name="chevron-right" size={20} color="#fff" />
              </View>
            </TouchableOpacity>

            <View style={s.helperNote}>
              <Feather name="info" size={18} color={T.color.inkMuted} style={{ marginTop: 1 }} />
              <Text style={s.helperText}>
                Vei vedea detaliile fiecărei opriri pe rând. După ce finalizezi o livrare, treci automat la următoarea.
              </Text>
            </View>
          </>
        ) : (
          <View style={s.emptyCard}>
            <Feather name="package" size={32} color={T.color.inkSubtle} />
            <Text style={s.emptyTitle}>Nicio rută pentru azi</Text>
            <Text style={s.emptyBody}>Trage în jos pentru a actualiza sau contactați dispeceratul.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.color.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: T.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: T.color.border,
  },
  headerSub: {
    fontFamily: T.font.mono,
    fontSize: 11,
    color: T.color.inkSubtle,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: T.font.display,
    fontSize: 28,
    fontWeight: '700',
    color: T.color.ink,
    letterSpacing: -0.5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: T.color.surface,
    borderWidth: 1,
    borderColor: T.color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  bodyContent: { padding: 20 },
  sectionLabel: {
    fontFamily: T.font.mono,
    fontSize: 11,
    color: T.color.inkSubtle,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  routeCard: {
    backgroundColor: T.color.primary,
    borderRadius: T.radius.xl,
    padding: 24,
    shadowColor: '#161513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  routeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  routeIdLabel: {
    fontFamily: T.font.mono,
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  routeStopCount: {
    fontFamily: T.font.display,
    fontSize: 38,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 42,
    letterSpacing: -1,
  },
  routeIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    marginBottom: 20,
  },
  statItem: { flex: 1 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  statValue: { fontFamily: T.font.mono, fontSize: 18, fontWeight: '700', color: '#fff' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.18)', marginRight: 14 },
  timeline: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  timelineTrack: { alignItems: 'center', paddingTop: 4 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
  timelineLine: { width: 2, flex: 1, backgroundColor: 'rgba(255,255,255,0.4)', minHeight: 28, marginVertical: 4 },
  timelineSquare: { width: 10, height: 10, borderRadius: 2, backgroundColor: '#fff' },
  timelineContent: { flex: 1 },
  timelineSubLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  timelineAddr: { fontSize: 14, fontWeight: '600', color: '#fff' },
  routeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  routeCardFooterText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  helperNote: {
    marginTop: 20,
    padding: 14,
    backgroundColor: T.color.surface,
    borderWidth: 1,
    borderColor: T.color.border,
    borderRadius: T.radius.lg,
    flexDirection: 'row',
    gap: 10,
  },
  helperText: { flex: 1, fontSize: 13, color: T.color.inkMuted, lineHeight: 20 },
  emptyCard: {
    backgroundColor: T.color.surface,
    borderRadius: T.radius.lg,
    borderWidth: 1,
    borderColor: T.color.border,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: T.color.ink, textAlign: 'center' },
  emptyBody: { fontSize: 13, color: T.color.inkMuted, textAlign: 'center', lineHeight: 20 },
})
