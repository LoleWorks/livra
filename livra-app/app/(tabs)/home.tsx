import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Animated, Easing } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { tokens as T } from '../../src/theme/tokens'
import { useAuth } from '../../src/context/AuthContext'
import { useOrders } from '../../src/context/OrdersContext'
import { useTrackedParcels, SavedParcel } from '../../src/context/TrackedParcelsContext'
import StatusBadge from '../../src/components/StatusBadge'
import MapBackground from '../../src/components/MapBackground'
import LivraLogo from '../../src/components/LivraLogo'
import { CarrierBadge } from '../../src/components/CarrierBadge'

export default function HomeScreen() {
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

// ─── Progress map ─────────────────────────────────────────────────────────────

const PROGRESS_MAP: Record<string, number> = {
  CreateID: 6, ReceivedFromSender: 14,
  AcceptedAtOriginDepot: 22, DepartureOriginDepot: 32, StoredAtDepot: 24, AwaitingPickup: 26,
  ArrivalTransitDepot: 42, DepartureTransitDepot: 54,
  AtCustoms: 44, DeclarationArrivalCustomTerminal: 40, CustomsCleared: 52,
  ArrivalDestinationDepot: 70, OutForDelivery: 84,
  Delivered: 100, DeliveredToPickupPoint: 100, DeliveredToPostOffice: 100, ReturnedToSender: 100, DeliveryFailed: 80,
}

const ICON = 20  // feather icon size
const PAD  = 4   // road end padding

// ─── Bouncing package road ────────────────────────────────────────────────────

function PackageRoad({ status, done }: { status: string; done: boolean }) {
  const progress   = done ? 100 : (PROGRESS_MAP[status] ?? 35)
  const [trackW, setTrackW] = useState(0)
  const [bounceY]    = useState(() => new Animated.Value(0))
  const [shadowScX]  = useState(() => new Animated.Value(1))
  const accent     = done ? T.color.success : T.color.primary

  useEffect(() => {
    if (done) return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bounceY,   { toValue: -10, duration: 340, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(shadowScX, { toValue: 0.4, duration: 340, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(bounceY,   { toValue: 0,   duration: 300, easing: Easing.in(Easing.quad),  useNativeDriver: true }),
          Animated.timing(shadowScX, { toValue: 1,   duration: 300, useNativeDriver: true }),
        ]),
        Animated.delay(320),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [done, bounceY, shadowScX])

  const pkgLeft = trackW > 0
    ? PAD + (progress / 100) * (trackW - ICON - PAD * 2)
    : -999

  return (
    <View style={pc.road} onLayout={e => setTrackW(e.nativeEvent.layout.width)}>
      {/* Road track */}
      <View style={pc.track} />
      {/* Progress fill */}
      {trackW > 0 && (
        <View style={[pc.trackFill, { width: pkgLeft + ICON / 2, backgroundColor: accent }]} />
      )}
      {/* Origin dot */}
      <View style={[pc.roadDot, pc.roadDotLeft, { backgroundColor: T.color.success }]} />
      {/* Destination dot */}
      <View style={[pc.roadDot, pc.roadDotRight, done ? { backgroundColor: T.color.success } : null]} />

      {/* Shadow */}
      {trackW > 0 && (
        <Animated.View style={[pc.shadow, { left: pkgLeft, transform: [{ scaleX: shadowScX }] }]} />
      )}
      {/* Package */}
      {trackW > 0 && (
        <Animated.View style={[pc.pkg, { left: pkgLeft, transform: [{ translateY: bounceY }] }]}>
          <Feather name={done ? 'check-circle' : 'package'} size={ICON} color={accent} />
        </Animated.View>
      )}

      {/* Labels */}
      <Text style={[pc.roadLabel, { left: 0 }]}>Expeditor</Text>
      <Text style={[pc.roadLabel, { right: 0 }]}>Tu</Text>
    </View>
  )
}

// ─── Parcel card ──────────────────────────────────────────────────────────────

function ParcelCard({ parcel }: { parcel: SavedParcel }) {
  const router = useRouter()
  const done   = parcel.done
  const accent = done ? T.color.success : T.color.primary

  return (
    <TouchableOpacity
      style={[pc.card, done && pc.cardDone]}
      activeOpacity={0.88}
      onPress={() => router.push(`/parcel-tracking?awb=${parcel.awb}${parcel.carrier ? `&carrier=${encodeURIComponent(parcel.carrier)}` : ''}`)}
    >
      <View style={pc.top}>
        <View style={{ flex: 1, marginRight: T.space.xs, minWidth: 0 }}>
          {parcel.customLabel
            ? <Text style={pc.customLabel} numberOfLines={1}>{parcel.customLabel}</Text>
            : null}
          <Text style={pc.awb} numberOfLines={1}>{parcel.awb}</Text>
        </View>
        <View style={[pc.badge, done && pc.badgeDone]}>
          <Text style={[pc.badgeText, done && pc.badgeTextDone]}>{done ? 'Livrat' : 'In drum'}</Text>
        </View>
      </View>

      <PackageRoad status={parcel.status} done={done} />

      <Text style={[pc.statusLabel, done && pc.statusLabelDone]} numberOfLines={1}>
        {parcel.label || 'In procesare'}
      </Text>

      <View style={pc.footer}>
        {parcel.carrier
          ? <CarrierBadge carrier={parcel.carrier} variant="pill" />
          : <Feather name="mail" size={12} color={accent} />
        }
        <Text style={[pc.footerText, { color: T.color.inkSubtle }]}>{parcel.added}</Text>
        <Feather name="chevron-right" size={14} color={accent} />
      </View>
    </TouchableOpacity>
  )
}

function HomeSingle({ activeStop, allStops, name, insets }: any) {
  const router = useRouter()
  const { parcels } = useTrackedParcels()

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

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionMain} activeOpacity={0.9} onPress={() => router.push('/delivery-type')}>
            <View style={styles.actionIcon}>
              <Feather name="truck" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Solicită transport</Text>
              <Text style={styles.actionSub}>Comandă un curier sau camion acum</Text>
            </View>
            <Feather name="arrow-right" size={20} color={T.color.primary} />
          </TouchableOpacity>
        </View>

        {activeStop ? (
          <TouchableOpacity onPress={() => router.push(`/track/${activeStop.id}`)} activeOpacity={0.92} style={styles.heroCard}>
            <View style={styles.heroMap}>
              {activeStop.status === 'pending' ? (
                <View style={styles.searchingMap}>
                  <Feather name="loader" size={40} color="rgba(255,255,255,0.2)" />
                  <Text style={styles.searchingText}>Căutăm cel mai apropiat curier...</Text>
                </View>
              ) : (
                <MapBackground height={160} driverPos={{ x: 60, y: 65 }} destPos={{ x: 50, y: 30 }} showRoute />
              )}
            </View>
            <View style={styles.heroBody}>
              <View style={styles.heroRow}>
                <Text style={styles.heroCode}>{activeStop.package_description || (activeStop.is_on_demand ? 'Comandă On-Demand' : 'Livrare B2B')}</Text>
                <StatusBadge status={activeStop.status as any} />
              </View>
              <Text style={styles.heroETA}>
                {activeStop.time_window_start || (activeStop.status === 'pending' ? 'Acum' : '—')}
                {activeStop.time_window_end ? ` – ${activeStop.time_window_end}` : ''}
              </Text>
              <Text style={styles.heroAddr} numberOfLines={1}>{activeStop.address}</Text>
              <TouchableOpacity style={styles.trackBtn} onPress={() => router.push(`/track/${activeStop.id}`)}>
                <Text style={styles.trackBtnText}>{activeStop.status === 'pending' ? 'Vezi detalii' : 'Urmărește →'}</Text>
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

        {/* Tracked parcels */}
        {parcels.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>COLETE URMĂRITE</Text>
            {parcels.map(p => <ParcelCard key={p.awb} parcel={p} />)}
          </>
        )}

        {/* Entry point — always visible */}
        <TouchableOpacity style={styles.trackingCard} activeOpacity={0.8} onPress={() => router.push('/parcel-tracking')}>
          <View style={styles.trackingIcon}>
            <Feather name="mail" size={20} color={T.color.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.trackingTitle}>Urmărire colet</Text>
            <Text style={styles.trackingSub}>Introdu AWB-ul pentru a vedea starea coletului</Text>
          </View>
          <Feather name="chevron-right" size={16} color={T.color.inkSubtle} />
        </TouchableOpacity>

        {allStops.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>ISTORICUL COMENZILOR</Text>
            {allStops.map((s: any) => {
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

function HomeMulti({ activeStops, insets }: any) {
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
              <StatusBadge status={s.status as any} />
              <Text style={[styles.carouselETA, i === 0 && styles.carouselETAHero]}>{s.time_window_start || (s.status === 'pending' ? 'Acum' : '—')}</Text>
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
  quickActions:  { paddingHorizontal: T.space.lg, marginBottom: T.space.xl },
  actionMain:    { flexDirection: 'row', alignItems: 'center', gap: T.space.md, backgroundColor: T.color.surface, padding: T.space.md, borderRadius: T.radius.xl, borderWidth: 1, borderColor: T.color.border, ...T.shadow.sm },
  actionIcon:    { width: 48, height: 48, borderRadius: T.radius.lg, backgroundColor: T.color.primary, alignItems: 'center', justifyContent: 'center' },
  actionTitle:   { fontSize: T.size.body, fontWeight: T.weight.bold, color: T.color.ink },
  actionSub:     { fontSize: T.size.caption, color: T.color.inkMuted },
  heroCard:      { marginHorizontal: T.space.lg, backgroundColor: T.color.ink, borderRadius: T.radius.xl, overflow: 'hidden', marginBottom: T.space.xl, ...T.shadow.lg },
  heroMap:       { height: 160 },
  searchingMap:  { flex: 1, backgroundColor: T.color.inkStrong, alignItems: 'center', justifyContent: 'center', gap: T.space.md },
  searchingText: { color: 'rgba(255,255,255,0.6)', fontSize: T.size.caption, fontWeight: T.weight.medium },
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
  trackingCard: {
    flexDirection: 'row',  alignItems: 'center', gap: T.space.sm,
    marginHorizontal: T.space.lg, backgroundColor: T.color.surface,
    borderRadius: T.radius.xl, borderWidth: 1, borderColor: T.color.border,
    padding: T.space.md, marginBottom: T.space.lg, ...T.shadow.sm,
  },
  trackingIcon:  {
    width: 40, height: 40, borderRadius: T.radius.pill,
    backgroundColor: T.color.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  trackingTitle: { fontSize: T.size.bodySm, fontWeight: T.weight.bold, color: T.color.ink, marginBottom: 2 },
  trackingSub:   { fontSize: T.size.caption, color: T.color.inkMuted, lineHeight: 16 },
})

const pc = StyleSheet.create({
  card: {
    marginHorizontal: T.space.lg, backgroundColor: T.color.surface,
    borderRadius: T.radius.xl, borderWidth: 1, borderColor: T.color.border,
    borderLeftWidth: 3, borderLeftColor: T.color.primary,
    padding: T.space.md, marginBottom: T.space.sm, ...T.shadow.sm,
  },
  cardDone:      { borderLeftColor: T.color.success },
  top:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: T.space.sm },
  customLabel:   { fontSize: T.size.bodySm, fontWeight: T.weight.bold, color: T.color.ink, marginBottom: 1 },
  awb:           { fontFamily: T.font.mono, fontSize: T.size.caption, color: T.color.inkSubtle, letterSpacing: 0.5 },
  badge:         { paddingHorizontal: 8, paddingVertical: 2, borderRadius: T.radius.pill, backgroundColor: T.color.primaryLight },
  badgeDone:     { backgroundColor: T.color.successBg },
  badgeText:     { fontSize: T.size.micro, fontWeight: T.weight.bold, color: T.color.primary },
  badgeTextDone: { color: T.color.success },

  // Road animation
  road:        { height: 56, position: 'relative', marginBottom: T.space.sm },
  track:       { position: 'absolute', left: PAD, right: PAD, top: 22, height: 2, backgroundColor: T.color.border, borderRadius: 1 },
  trackFill:   { position: 'absolute', left: PAD, top: 22, height: 2, borderRadius: 1 },
  roadDot:     { position: 'absolute', top: 18, width: 10, height: 10, borderRadius: 5 },
  roadDotLeft: { left: PAD - 3, backgroundColor: T.color.success },
  roadDotRight:{ right: PAD - 3, backgroundColor: T.color.border, borderWidth: 1.5, borderColor: T.color.borderStrong },
  shadow:      { position: 'absolute', top: 26, width: ICON, height: 5, borderRadius: 3, backgroundColor: T.color.ink + '18' },
  pkg:         { position: 'absolute', top: 2 },
  roadLabel:   { position: 'absolute', bottom: 0, fontSize: T.size.micro, color: T.color.inkSubtle, fontWeight: T.weight.semibold },

  // Status label
  statusLabel:     { fontSize: T.size.bodySm, fontWeight: T.weight.semibold, color: T.color.ink, marginBottom: T.space.sm, lineHeight: 20 },
  statusLabelDone: { color: T.color.success },

  // Footer
  footer:     { flexDirection: 'row', alignItems: 'center', gap: T.space.xs },
  footerText: { flex: 1, fontSize: T.size.caption, fontWeight: T.weight.semibold },
})
