import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Delivery } from '../types'
import { colors, statusColors } from '../lib/colors'

type Props = {
  delivery: Delivery
  onPress: () => void
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function DeliveryCard({ delivery, onPress }: Props) {
  const sc = statusColors[delivery.status] ?? statusColors.pending
  const isActive = ['dispatched', 'en_route', 'nearby'].includes(delivery.status)

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Store + status */}
      <View style={styles.row}>
        <View style={styles.storeInitials}>
          <Text style={styles.storeInitialsText}>
            {delivery.storeName.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.storeName}>{delivery.storeName}</Text>
          <Text style={styles.orderId}>#{delivery.orderId}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.badgeText, { color: sc.text }]}>{sc.label}</Text>
        </View>
      </View>

      {/* Address */}
      <View style={styles.addressRow}>
        <Ionicons name="location-outline" size={14} color={colors.gray400} />
        <Text style={styles.address} numberOfLines={1}>{delivery.address}</Text>
      </View>

      {/* Time window */}
      <View style={styles.timeRow}>
        <Ionicons name="time-outline" size={14} color={colors.gray400} />
        <Text style={styles.time}>
          {fmtTime(delivery.timeWindowStart)} – {fmtTime(delivery.timeWindowEnd)}
        </Text>
        {isActive && (
          <View style={styles.liveChip}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        )}
      </View>

      {/* Progress bar for active deliveries */}
      {isActive && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${((delivery.stopOrder) / delivery.totalStops) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {delivery.stopOrder}/{delivery.totalStops} opriri
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  storeInitials: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff0eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeInitialsText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.orange,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
  },
  orderId: {
    fontSize: 12,
    color: colors.gray400,
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  address: {
    fontSize: 13,
    color: colors.gray500,
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  time: {
    fontSize: 13,
    color: colors.gray500,
    flex: 1,
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff0eb',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.orange,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.orange,
  },
  progressContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.gray100,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.orange,
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.gray400,
  },
})
