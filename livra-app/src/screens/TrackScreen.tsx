import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator } from 'react-native'
import { useEffect, useState, useRef } from 'react'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { colors, statusColors } from '../lib/colors'
import { getDeliveryById, subscribeToDelivery } from '../lib/api'
import type { RootStackParamList, Delivery } from '../types'

type Props = NativeStackScreenProps<RootStackParamList, 'Track'>

function fmtTime(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function MapPlaceholder({ driverInitials }: { driverInitials: string }) {
  return (
    <View style={map.container}>
      <View style={[map.street, map.streetH, { top: '30%' }]} />
      <View style={[map.street, map.streetH, { top: '55%' }]} />
      <View style={[map.street, map.streetH, { top: '75%' }]} />
      <View style={[map.street, map.streetV, { left: '25%' }]} />
      <View style={[map.street, map.streetV, { left: '60%' }]} />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <View key={i} style={[map.dash, { top: `${28 + i * 8}%` as any, left: `${28 + i * 5}%` as any }]} />
      ))}
      <View style={map.dest}>
        <Ionicons name="home" size={16} color={colors.white} />
      </View>
      <View style={map.driver}>
        <Text style={map.driverText}>{driverInitials}</Text>
      </View>
    </View>
  )
}

export default function TrackScreen({ route }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [loading, setLoading] = useState(true)
  const unsubRef = useRef<(() => void) | null>(null)

  const reload = async () => {
    const d = await getDeliveryById(route.params.deliveryId)
    if (d) setDelivery(d)
  }

  useEffect(() => {
    getDeliveryById(route.params.deliveryId).then(d => {
      if (d) {
        setDelivery(d)
        // subscribe to real-time updates for this stop + driver
        // we need the route's driver_id — fetch it via a fresh query isn't ideal here
        // instead we poll every 15s as a fallback for the map position
      }
      setLoading(false)
    })

    const interval = setInterval(reload, 15000)
    return () => clearInterval(interval)
  }, [route.params.deliveryId])

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.orange} /></View>
  }
  if (!delivery) return null

  const sc = statusColors[delivery.status] ?? statusColors['dispatched']

  return (
    <View style={styles.container}>
      <MapPlaceholder driverInitials={delivery.driverInitials} />

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={20} color={colors.black} />
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.handle} />

        <View style={[styles.statusChip, { backgroundColor: sc.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: sc.text }]} />
          <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
        </View>

        {delivery.timeWindowStart && delivery.timeWindowEnd && (
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Interval de livrare</Text>
            <Text style={styles.timeValue}>
              {fmtTime(delivery.timeWindowStart)}
              <Text style={styles.timeSep}> – </Text>
              {fmtTime(delivery.timeWindowEnd)}
            </Text>
          </View>
        )}

        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            {Array.from({ length: delivery.totalStops }, (_, i) => (
              <View
                key={i}
                style={[styles.progressSegment, {
                  backgroundColor:
                    i < delivery.stopOrder - 1 ? colors.emerald
                    : i === delivery.stopOrder - 1 ? colors.orange
                    : colors.gray200,
                }]}
              />
            ))}
          </View>
          <Text style={styles.progressLabel}>Oprirea {delivery.stopOrder} din {delivery.totalStops}</Text>
        </View>

        <View style={styles.driverRow}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverInitials}>{delivery.driverInitials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.driverName}>{delivery.driverName ?? 'Curier'}</Text>
            <Text style={styles.driverSub}>Curierul tău</Text>
          </View>
        </View>

        {delivery.address && (
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color={colors.gray400} />
            <Text style={styles.addressText}>{delivery.address}</Text>
          </View>
        )}
        {delivery.notes && (
          <View style={styles.notesRow}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.gray400} />
            <Text style={styles.notesText}>{delivery.notes}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const map = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8f0e8', position: 'relative', overflow: 'hidden' },
  street: { position: 'absolute', backgroundColor: '#d0d8d0' },
  streetH: { left: 0, right: 0, height: 10 },
  streetV: { top: 0, bottom: 0, width: 10 },
  dash: { position: 'absolute', width: 18, height: 4, borderRadius: 2, backgroundColor: colors.orange, opacity: 0.8 },
  dest: {
    position: 'absolute', top: '22%', left: '58%',
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.emerald, borderWidth: 3, borderColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  driver: {
    position: 'absolute', bottom: '35%', left: '25%',
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.orange, borderWidth: 3, borderColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  driverText: { fontSize: 11, fontWeight: '700', color: colors.white },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backBtn: {
    position: 'absolute', top: 52, left: 20,
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  card: {
    backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 32,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
  },
  handle: { width: 36, height: 4, backgroundColor: colors.gray200, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 16 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 13, fontWeight: '600' },
  timeBlock: { marginBottom: 14 },
  timeLabel: { fontSize: 11, color: colors.gray400, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  timeValue: { fontSize: 28, fontWeight: '700', color: colors.black },
  timeSep: { color: colors.gray400, fontWeight: '400', fontSize: 20 },
  progressSection: { marginBottom: 16 },
  progressRow: { flexDirection: 'row', gap: 3, marginBottom: 4 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
  progressLabel: { fontSize: 12, color: colors.gray400 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.gray100, marginBottom: 8 },
  driverAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff0eb', alignItems: 'center', justifyContent: 'center' },
  driverInitials: { fontSize: 14, fontWeight: '700', color: colors.orange },
  driverName: { fontSize: 15, fontWeight: '600', color: colors.black },
  driverSub: { fontSize: 12, color: colors.gray400 },
  addressRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginBottom: 6 },
  addressText: { fontSize: 13, color: colors.gray500, flex: 1 },
  notesRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  notesText: { fontSize: 13, color: colors.gray500, flex: 1 },
})
