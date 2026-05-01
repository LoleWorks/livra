import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { tokens as T } from '../theme/tokens'

type Status = 'preparing' | 'dispatched' | 'transit' | 'arriving' | 'delivered' | 'failed'

interface Props { status: Status }

const map: Record<Status, { label: string; bg: string; color: string }> = {
  preparing:  { label: 'Se pregătește', bg: T.color.warningBg,    color: T.color.warning },
  dispatched: { label: 'Trimisă',       bg: T.color.primaryLight,  color: T.color.primaryDark },
  transit:    { label: 'În drum',        bg: T.color.primaryLight,  color: T.color.primaryDark },
  arriving:   { label: 'Aproape',        bg: T.color.primary,       color: '#fff' },
  delivered:  { label: 'Livrată',        bg: T.color.successBg,     color: T.color.success },
  failed:     { label: 'Eșuată',         bg: T.color.dangerBg,      color: T.color.danger },
}

export default function StatusBadge({ status }: Props) {
  const s = map[status] ?? map.preparing
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      {status === 'arriving' && <View style={styles.dot} />}
      <Text style={[styles.label, { color: s.color }]}>{s.label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: T.radius.pill,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff',
  },
  label: {
    fontSize: T.size.micro + 1,
    fontFamily: T.font.mono,
    fontWeight: T.weight.semibold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
})
