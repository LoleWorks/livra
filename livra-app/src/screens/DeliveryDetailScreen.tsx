import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { colors, statusColors } from '../lib/colors'
import type { RootStackParamList } from '../types'

type Props = NativeStackScreenProps<RootStackParamList, 'DeliveryDetail'>

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-MD', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function DeliveryDetailScreen({ route }: Props) {
  const navigation = useNavigation()

  // Mock data — replace with store/API lookup by deliveryId
  const delivery = {
    id: route.params.deliveryId,
    orderId: '4799',
    storeName: 'Megapolis',
    address: 'Bd. Dacia 18, ap. 3, Chișinău',
    status: 'delivered' as const,
    driverName: 'Ion P.',
    driverInitials: 'IP',
    timeWindowStart: new Date(Date.now() - 2 * 86400000).toISOString(),
    timeWindowEnd: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString(),
    deliveredAt: new Date(Date.now() - 2 * 86400000 + 1800000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: '',
    rating: null as number | null,
  }

  const sc = statusColors[delivery.status]

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Store header */}
      <View style={styles.storeCard}>
        <View style={styles.storeIcon}>
          <Text style={styles.storeIconText}>{delivery.storeName.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.storeName}>{delivery.storeName}</Text>
          <Text style={styles.orderId}>Comanda #{delivery.orderId}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.badgeText, { color: sc.text }]}>{sc.label}</Text>
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cronologie</Text>
        <View style={styles.timeline}>
          <TimelineEvent
            icon="cube-outline"
            color={colors.gray400}
            label="Comandă preluată"
            time={fmtDate(delivery.createdAt) + ' · ' + fmtTime(delivery.createdAt)}
          />
          <TimelineEvent
            icon="car-outline"
            color={colors.violet}
            label="Expediat la livrare"
            time={fmtDate(delivery.timeWindowStart) + ' · ' + fmtTime(delivery.timeWindowStart)}
          />
          {delivery.deliveredAt && (
            <TimelineEvent
              icon="checkmark-circle"
              color={colors.emerald}
              label="Livrat cu succes"
              time={fmtDate(delivery.deliveredAt) + ' · ' + fmtTime(delivery.deliveredAt)}
              last
            />
          )}
        </View>
      </View>

      {/* Delivery info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalii livrare</Text>
        <View style={styles.infoCard}>
          <InfoRow icon="location-outline" label="Adresă" value={delivery.address} />
          <InfoRow icon="time-outline" label="Interval" value={`${fmtTime(delivery.timeWindowStart)} – ${fmtTime(delivery.timeWindowEnd)}`} />
          <InfoRow icon="person-outline" label="Curier" value={delivery.driverName} last />
        </View>
      </View>

      {/* Rating */}
      {delivery.status === 'delivered' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evaluează livrarea</Text>
          <View style={styles.ratingCard}>
            <Text style={styles.ratingPrompt}>Cum a fost livrarea?</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n}>
                  <Ionicons
                    name={delivery.rating && n <= delivery.rating ? 'star' : 'star-outline'}
                    size={36}
                    color={colors.amber}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

function TimelineEvent({
  icon, color, label, time, last = false,
}: {
  icon: string; color: string; label: string; time: string; last?: boolean
}) {
  return (
    <View style={tlStyles.row}>
      <View style={tlStyles.iconCol}>
        <View style={[tlStyles.dot, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={14} color={colors.white} />
        </View>
        {!last && <View style={tlStyles.line} />}
      </View>
      <View style={tlStyles.textCol}>
        <Text style={tlStyles.label}>{label}</Text>
        <Text style={tlStyles.time}>{time}</Text>
      </View>
    </View>
  )
}

function InfoRow({ icon, label, value, last = false }: { icon: string; label: string; value: string; last?: boolean }) {
  return (
    <View style={[infoStyles.row, !last && infoStyles.border]}>
      <Ionicons name={icon as any} size={16} color={colors.gray400} />
      <View style={{ flex: 1 }}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, paddingBottom: 48 },
  storeCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  storeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff0eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeIconText: { fontSize: 14, fontWeight: '700', color: colors.orange },
  storeName: { fontSize: 16, fontWeight: '600', color: colors.black },
  orderId: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.gray400, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  timeline: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  ratingCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  ratingPrompt: { fontSize: 16, fontWeight: '600', color: colors.black, marginBottom: 16 },
  stars: { flexDirection: 'row', gap: 8 },
})

const tlStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  iconCol: { alignItems: 'center', width: 28 },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  line: { width: 2, flex: 1, backgroundColor: colors.gray200, marginVertical: 4 },
  textCol: { flex: 1, paddingBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.black },
  time: { fontSize: 12, color: colors.gray400, marginTop: 2 },
})

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  border: { borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  label: { fontSize: 11, color: colors.gray400, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  value: { fontSize: 14, color: colors.black, fontWeight: '500' },
})
