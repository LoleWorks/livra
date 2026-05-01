import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { tokens as T } from '../../src/theme/tokens'
import { useOrders } from '../../src/context/OrdersContext'
import { RouteStop } from '../../src/lib/supabase'
import StatusBadge from '../../src/components/StatusBadge'
import { Feather } from '@expo/vector-icons'

type Filter = 'Toate' | 'Active' | 'Livrate'

function stopStatus(s: RouteStop): 'dispatched' | 'delivered' | 'failed' {
  if (s.status === 'pending')   return 'dispatched'
  if (s.status === 'completed') return 'delivered'
  return 'failed'
}

export default function OrdersScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { allStops, loading, refresh } = useOrders()
  const [filter, setFilter] = useState<Filter>('Toate')

  const filtered = allStops.filter(s => {
    if (filter === 'Active')  return s.status === 'pending'
    if (filter === 'Livrate') return s.status === 'completed'
    return true
  })

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Comenzi</Text>
      </View>

      <View style={styles.chips}>
        {(['Toate', 'Active', 'Livrate'] as Filter[]).map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)}
            style={[styles.chip, filter === f && styles.chipActive]}>
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: Math.max(T.space.xl, insets.bottom + T.space.md) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={T.color.primary} />}
      >
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Feather name="package" size={36} color={T.color.inkSubtle} />
            <Text style={styles.emptyText}>Nicio comandă</Text>
          </View>
        )}
        {filtered.map(s => (
          <TouchableOpacity key={s.id} onPress={() => router.push(`/order/${s.id}`)} activeOpacity={0.8} style={styles.row}>
            <View style={styles.rowIcon}>
              <Text style={styles.rowIconText}>{(s.shop_name ?? s.package_description ?? s.address)[0]?.toUpperCase() ?? '?'}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.rowTop}>
                <Text style={styles.rowTitle} numberOfLines={1}>{s.shop_name ?? s.package_description ?? s.address}</Text>
                <StatusBadge status={stopStatus(s)} />
              </View>
              <Text style={styles.rowDesc} numberOfLines={1}>{s.address}</Text>
              <Text style={styles.rowDate}>{s.time_window_start ?? s.completed_at?.slice(0, 10) ?? ''}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: T.color.bg },
  titleRow:      { paddingHorizontal: T.space.lg, paddingTop: T.space.sm, paddingBottom: T.space.md },
  title:         { fontFamily: T.font.display, fontSize: 28, fontWeight: T.weight.bold, color: T.color.ink, letterSpacing: -0.5 },
  chips:         { flexDirection: 'row', gap: T.space.xs, paddingHorizontal: T.space.lg, paddingBottom: T.space.md },
  chip:          { height: 36, paddingHorizontal: T.space.md, borderRadius: T.radius.pill, borderWidth: 1, borderColor: T.color.borderStrong, justifyContent: 'center' },
  chipActive:    { backgroundColor: T.color.ink, borderColor: T.color.ink },
  chipText:      { fontSize: T.size.bodySm, fontWeight: T.weight.semibold, color: T.color.ink },
  chipTextActive:{ color: '#fff' },
  list:          { paddingHorizontal: T.space.lg, paddingBottom: T.space.xl, gap: T.space.sm },
  empty:         { alignItems: 'center', paddingTop: T.space.xxxl, gap: T.space.md },
  emptyText:     { fontSize: T.size.body, color: T.color.inkMuted },
  row:           { flexDirection: 'row', alignItems: 'center', gap: T.space.sm, backgroundColor: T.color.surface, borderRadius: T.radius.lg, borderWidth: 1, borderColor: T.color.border, padding: T.space.md },
  rowIcon:       { width: 44, height: 44, borderRadius: T.radius.sm, backgroundColor: T.color.bg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowIconText:   { fontFamily: T.font.display, fontSize: T.size.h3, fontWeight: T.weight.bold, color: T.color.ink },
  rowTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  rowTitle:      { fontSize: T.size.bodySm, fontWeight: T.weight.semibold, color: T.color.ink, flex: 1, marginRight: T.space.xs },
  rowDesc:       { fontSize: T.size.bodySm, color: T.color.ink },
  rowDate:       { fontSize: T.size.caption, color: T.color.inkMuted, marginTop: 2 },
})
