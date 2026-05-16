import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { tokens as T } from '../../src/theme/tokens'
import { useAuth } from '../../src/context/AuthContext'
import { Pin } from '../../src/lib/supabase'

export default function PinsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { customer } = useAuth()
  const pins: Pin[] = customer?.pins ?? []

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Locații</Text>
        <TouchableOpacity onPress={() => router.push('/pins/add')} style={styles.addBtn}>
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.list, { paddingBottom: Math.max(T.space.xl, insets.bottom + T.space.md) }]} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Pin pentru sat sau adresă fără stradă</Text>
          <Text style={styles.bannerSub}>Pune un pin pe hartă o singură dată. Toate livrările Livra ajung exact acolo.</Text>
        </View>

        {pins.map((p, i) => (
          <TouchableOpacity key={p.id ?? i} style={[styles.row, p.primary && styles.rowPrimary]} onPress={() => router.push(`/pins/${p.id}`)} activeOpacity={0.7}>
            <View style={styles.rowIcon}>
              <Feather name="map-pin" size={20} color={T.color.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.rowNameRow}>
                <Text style={styles.rowName}>{p.name}</Text>
                {p.primary && <View style={styles.primaryChip}><Text style={styles.primaryText}>PRIMARĂ</Text></View>}
              </View>
              <Text style={styles.rowAddr}>{p.address ?? 'Pin GPS'}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={T.color.inkSubtle} />
          </TouchableOpacity>
        ))}

        {pins.length === 0 && (
          <View style={styles.empty}>
            <Feather name="map-pin" size={36} color={T.color.inkSubtle} />
            <Text style={styles.emptyTitle}>Nicio locație salvată</Text>
            <Text style={styles.emptySub}>Adaugă prima ta locație de livrare.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.color.bg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: T.space.lg, paddingTop: T.space.sm, paddingBottom: T.space.md },
  title:       { fontFamily: T.font.display, fontSize: 28, fontWeight: T.weight.bold, color: T.color.ink, letterSpacing: -0.5 },
  addBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: T.color.primary, alignItems: 'center', justifyContent: 'center' },
  list:        { paddingHorizontal: T.space.lg, paddingBottom: T.space.xl, gap: T.space.sm },
  banner:      { backgroundColor: T.color.primary, borderRadius: T.radius.lg, padding: T.space.md, gap: 4 },
  bannerTitle: { fontSize: T.size.bodySm, fontWeight: T.weight.semibold, color: '#fff' },
  bannerSub:   { fontSize: T.size.caption, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
  row:         { flexDirection: 'row', alignItems: 'center', gap: T.space.sm, backgroundColor: T.color.surface, borderRadius: T.radius.lg, borderWidth: 1, borderColor: T.color.border, padding: T.space.md },
  rowPrimary:  { borderColor: T.color.primary },
  rowIcon:     { width: 44, height: 44, borderRadius: T.radius.sm, backgroundColor: T.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  rowNameRow:  { flexDirection: 'row', alignItems: 'center', gap: T.space.xs, marginBottom: 2 },
  rowName:     { fontSize: T.size.body, fontWeight: T.weight.semibold, color: T.color.ink },
  primaryChip: { backgroundColor: T.color.primary, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  primaryText: { fontSize: 9, fontFamily: T.font.mono, fontWeight: T.weight.bold, color: '#fff', letterSpacing: 0.5 },
  rowAddr:     { fontSize: T.size.caption, color: T.color.inkMuted },
  empty:       { alignItems: 'center', paddingTop: T.space.xxxl, gap: T.space.md },
  emptyTitle:  { fontSize: T.size.h3, fontWeight: T.weight.semibold, color: T.color.ink },
  emptySub:    { fontSize: T.size.bodySm, color: T.color.inkMuted },
})
