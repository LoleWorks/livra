import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { tokens as T } from '../../src/theme/tokens'
import { useAuth } from '../../src/context/AuthContext'
import { useOrders } from '../../src/context/OrdersContext'
import StatusBadge from '../../src/components/StatusBadge'
import MapBackground from '../../src/components/MapBackground'
import LivraLogo from '../../src/components/LivraLogo'

export default function HomeScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { customer } = useAuth()
  const { activeStops, allStops, loading } = useOrders()

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator color={T.color.primary} /></View>
  }

  const name = customer?.name?.split(' ')[0] ?? 'bun venit'

  if (activeStops.length >= 2) return <HomeMulti activeStops={activeStops} name={name} insets={insets} />

  return <HomeSingle activeStop={activeStops[0]} allStops={allStops} name={name} insets={insets} />
}

function HomeSingle({ activeStop, allStops, name, insets }: any) {
  const router = useRouter()

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <LivraLogo size={20} />
        <TouchableOpacity onPress={() => router.push('/notifications')} hitSlop={8}>
          <Feather name="bell" size={22} color={T.color.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(T.space.xl, insets.bottom + T.space.md) }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Bună, {name} 👋</Text>

        {activeStop ? (
          <TouchableOpacity onPress={() => router.push(`/track/${activeStop.id}`)} activeOpacity={0.92} style={styles.heroCard}>
            <View style={styles.heroMap}>
              <MapBackground height={160} driverPos={{ x: 60, y: 65 }} destPos={{ x: 50, y: 30 }} showRoute />
            </View>
            <View style={styles.heroBody}>
              <View style={styles.heroRow}>
                <Text style={styles.heroCode}>{activeStop.package_description ?? 'Comandă'}</Text>
                <StatusBadge status="dispatched" />
              </View>
              <Text style={styles.heroETA}>
                {activeStop.time_window_start ?? '—'}
                {activeStop.time_window_end ? ` – ${activeStop.time_window_end}` : ''}
              </Text>
              <Text style={styles.heroAddr} numberOfLines={1}>{activeStop.address}</Text>
              <TouchableOpacity style={styles.trackBtn} onPress={() => router.push(`/track/${activeStop.id}`)}>
                <Text style={styles.trackBtnText}>Urmărește →</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyCard}>
            <Feather name="package" size={36} color={T.color.inkSubtle} />
            <Text style={styles.emptyTitle}>Nicio livrare activă</Text>
            <Text style={styles.emptySub}>Comenzile tale vor apărea aici când sunt în curs de livrare.</Text>
          </View>
        )}

        {allStops.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>ISTORICUL COMENZILOR</Text>
            {allStops.map(s => {
              const isPending   = s.status === 'pending'
              const badgeStatus = s.status === 'completed' ? 'delivered' : s.status === 'failed' ? 'failed' : 'dispatched'
              return (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => router.push(isPending ? `/track/${s.id}` : `/order/${s.id}`)}
                  style={[styles.orderRow, isPending && styles.orderRowActive]}
                >
                  <View style={[styles.orderIcon, isPending && styles.orderIconActive]}>
                    <Feather name={isPending ? 'truck' : 'package'} size={18} color={isPending ? T.color.primary : T.color.inkMuted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderTitle} numberOfLines={1}>{s.shop_name ?? s.package_description ?? s.address}</Text>
                    <Text style={styles.orderAddr} numberOfLines={1}>{s.address}</Text>
                  </View>
                  <StatusBadge status={badgeStatus} />
                </TouchableOpacity>
              )
            })}
          </>
        )}
      </ScrollView>
    </View>
  )
}

function HomeMulti({ activeStops, name, insets }: any) {
  const router = useRouter()

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <LivraLogo size={20} />
        <View style={styles.headerRight}>
          <View style={styles.countChip}><Text style={styles.countText}>{activeStops.length} active</Text></View>
          <TouchableOpacity onPress={() => router.push('/notifications')} hitSlop={8}>
            <Feather name="bell" size={22} color={T.color.ink} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(T.space.xl, insets.bottom + T.space.md) }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Livrări active</Text>
        <MapBackground height={140} driverPos={{ x: 55, y: 60 }} destPos={{ x: 50, y: 30 }} showRoute />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel} contentContainerStyle={{ gap: T.space.sm, paddingHorizontal: T.space.lg }}>
          {activeStops.map((s: any, i: number) => (
            <TouchableOpacity key={s.id} onPress={() => router.push(`/track/${s.id}`)} activeOpacity={0.88}
              style={[styles.carouselCard, i === 0 && styles.carouselCardHero]}>
              <StatusBadge status="dispatched" />
              <Text style={[styles.carouselETA, i === 0 && styles.carouselETAHero]}>{s.time_window_start ?? '—'}</Text>
              <Text style={[styles.carouselDesc, i === 0 && { color: '#fff' }]} numberOfLines={2}>{s.package_description ?? s.address}</Text>
              <Text style={[styles.carouselAddr, i === 0 && { color: 'rgba(255,255,255,0.7)' }]} numberOfLines={1}>{s.address}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => router.push('/(tabs)/orders')} style={styles.tailCard}>
            <Text style={styles.tailText}>Vezi toate{'\n'}livrările</Text>
            <Feather name="arrow-right" size={18} color={T.color.primary} />
          </TouchableOpacity>
        </ScrollView>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: T.color.bg },
  loader:        { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.color.bg },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: T.space.lg, paddingVertical: T.space.md },
  headerRight:   { flexDirection: 'row', alignItems: 'center', gap: T.space.sm },
  countChip:     { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: T.color.primary, borderRadius: T.radius.pill },
  countText:     { fontSize: T.size.micro, color: '#fff', fontWeight: T.weight.bold, fontFamily: T.font.mono, letterSpacing: 0.4 },
  scroll:        { paddingBottom: T.space.xl },
  greeting:      { fontFamily: T.font.display, fontSize: T.size.h1, fontWeight: T.weight.bold, color: T.color.ink, letterSpacing: -0.5, paddingHorizontal: T.space.lg, marginBottom: T.space.md },
  heroCard:      { marginHorizontal: T.space.lg, backgroundColor: T.color.ink, borderRadius: T.radius.xl, overflow: 'hidden', marginBottom: T.space.xl, ...T.shadow.lg },
  heroMap:       { height: 160 },
  heroBody:      { padding: T.space.md, gap: 6 },
  heroRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroCode:      { fontSize: T.size.caption, fontFamily: T.font.mono, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.4, flex: 1 },
  heroETA:       { fontFamily: T.font.display, fontSize: 36, fontWeight: T.weight.bold, color: '#fff', letterSpacing: -1 },
  heroAddr:      { fontSize: T.size.caption, color: 'rgba(255,255,255,0.6)' },
  trackBtn:      { marginTop: T.space.xs, backgroundColor: T.color.primary, borderRadius: T.radius.pill, paddingVertical: T.space.sm, alignItems: 'center' },
  trackBtnText:  { color: '#fff', fontWeight: T.weight.semibold, fontSize: T.size.body },
  emptyCard:     { marginHorizontal: T.space.lg, backgroundColor: T.color.surface, borderRadius: T.radius.xl, borderWidth: 1, borderColor: T.color.border, padding: T.space.xxl, alignItems: 'center', gap: T.space.md, marginBottom: T.space.xl },
  emptyTitle:    { fontSize: T.size.h3, fontWeight: T.weight.semibold, color: T.color.ink },
  emptySub:      { fontSize: T.size.bodySm, color: T.color.inkMuted, textAlign: 'center', lineHeight: 20 },
  sectionTitle:  { fontFamily: T.font.mono, fontSize: T.size.micro, color: T.color.inkSubtle, letterSpacing: 0.6, textTransform: 'uppercase', paddingHorizontal: T.space.lg, marginBottom: T.space.sm },
  orderRow:       { flexDirection: 'row', alignItems: 'center', gap: T.space.sm, marginHorizontal: T.space.lg, backgroundColor: T.color.surface, borderRadius: T.radius.lg, borderWidth: 1, borderColor: T.color.border, padding: T.space.md, marginBottom: 8 },
  orderRowActive: { borderColor: T.color.primaryLight, backgroundColor: T.color.primaryLight },
  orderIcon:      { width: 40, height: 40, borderRadius: T.radius.sm, backgroundColor: T.color.bg, alignItems: 'center', justifyContent: 'center' },
  orderIconActive:{ backgroundColor: 'rgba(255,92,44,0.12)' },
  orderTitle:     { fontSize: T.size.bodySm, fontWeight: T.weight.semibold, color: T.color.ink },
  orderAddr:      { fontSize: T.size.caption, color: T.color.inkMuted, marginTop: 2 },
  carousel:      { marginTop: T.space.md },
  carouselCard:  { width: 240, backgroundColor: T.color.surface, borderRadius: T.radius.xl, borderWidth: 1, borderColor: T.color.border, padding: T.space.md, gap: 6 },
  carouselCardHero: { backgroundColor: T.color.ink, borderColor: T.color.ink },
  carouselETA:   { fontFamily: T.font.display, fontSize: T.size.h2, fontWeight: T.weight.bold, color: T.color.ink, letterSpacing: -0.5 },
  carouselETAHero:{ color: '#fff' },
  carouselDesc:  { fontSize: T.size.bodySm, fontWeight: T.weight.semibold, color: T.color.ink, lineHeight: 20 },
  carouselAddr:  { fontSize: T.size.caption, color: T.color.inkMuted },
  tailCard:      { width: 140, backgroundColor: T.color.primaryLight, borderRadius: T.radius.xl, padding: T.space.md, justifyContent: 'center', alignItems: 'center', gap: T.space.sm },
  tailText:      { fontSize: T.size.bodySm, fontWeight: T.weight.semibold, color: T.color.primary, textAlign: 'center' },
})
