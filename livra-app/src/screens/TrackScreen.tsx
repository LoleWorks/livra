import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import MapView, { Marker, Polyline } from 'react-native-maps'
import { colors, statusColors } from '../lib/colors'
import type { RootStackParamList, Delivery } from '../types'

type Props = NativeStackScreenProps<RootStackParamList, 'Track'>

function fmtTime(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const MOCK: Delivery = {
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
}

export default function TrackScreen({ route }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<MapView>(null)

  useEffect(() => {
    setTimeout(() => { setDelivery(MOCK); setLoading(false) }, 600)
  }, [route.params.deliveryId])

  useEffect(() => {
    if (!delivery?.driverLocation) return
    const { lat: dLat, lng: dLng } = delivery.driverLocation
    const { destinationLat, destinationLng } = delivery
    mapRef.current?.fitToCoordinates(
      [
        { latitude: dLat, longitude: dLng },
        { latitude: destinationLat, longitude: destinationLng },
      ],
      { edgePadding: { top: 80, right: 60, bottom: 360, left: 60 }, animated: true },
    )
  }, [delivery])

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.orange} /></View>
  }
  if (!delivery) return null

  const sc = statusColors[delivery.status]
  const driverCoord = delivery.driverLocation
    ? { latitude: delivery.driverLocation.lat, longitude: delivery.driverLocation.lng }
    : null
  const destCoord = { latitude: delivery.destinationLat, longitude: delivery.destinationLng }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: (delivery.destinationLat + (delivery.driverLocation?.lat ?? delivery.destinationLat)) / 2,
          longitude: (delivery.destinationLng + (delivery.driverLocation?.lng ?? delivery.destinationLng)) / 2,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
        showsUserLocation={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {driverCoord && (
          <Marker coordinate={driverCoord} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={map.driverMarker}>
              <Text style={map.driverText}>{delivery.driverInitials}</Text>
            </View>
          </Marker>
        )}
        <Marker coordinate={destCoord} anchor={{ x: 0.5, y: 1 }}>
          <View style={map.destMarker}>
            <Ionicons name="home" size={16} color={colors.white} />
          </View>
        </Marker>
        {driverCoord && (
          <Polyline
            coordinates={[driverCoord, destCoord]}
            strokeColor={colors.orange}
            strokeWidth={3}
            lineDashPattern={[8, 6]}
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={20} color={colors.black} />
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.handle} />

        <View style={[styles.statusChip, { backgroundColor: sc.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: sc.text }]} />
          <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
        </View>

        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Interval de livrare</Text>
          <Text style={styles.timeValue}>
            {fmtTime(delivery.timeWindowStart)}
            <Text style={styles.timeSep}> – </Text>
            {fmtTime(delivery.timeWindowEnd)}
          </Text>
        </View>

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
          <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL('tel:+37300000000')}>
            <Ionicons name="call-outline" size={20} color={colors.black} />
          </TouchableOpacity>
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
  driverMarker: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.orange,
    borderWidth: 3, borderColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, elevation: 6,
  },
  driverText: { fontSize: 11, fontWeight: '700', color: colors.white },
  destMarker: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.emerald,
    borderWidth: 3, borderColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, elevation: 6,
  },
})

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backBtn: {
    position: 'absolute', top: 52, left: 20,
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  card: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
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
  callBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  addressRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginBottom: 6 },
  addressText: { fontSize: 13, color: colors.gray500, flex: 1 },
  notesRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  notesText: { fontSize: 13, color: colors.gray500, flex: 1 },
})
