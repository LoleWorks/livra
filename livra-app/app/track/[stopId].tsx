import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Linking, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { tokens as T } from '../../src/theme/tokens'
import { supabase, RouteStop, DriverLocation } from '../../src/lib/supabase'
import TrackMap from '../../src/components/TrackMap'
import StatusBadge from '../../src/components/StatusBadge'

const STEPS = ['Comandat', 'Preluat', 'În drum', 'Livrat']
const TAGS   = ['La timp', 'Politicos', 'Atent cu coletul', 'Recomand', 'Rapid']

function stepIndex(status: RouteStop['status']) {
  if (status === 'completed') return 3
  return 2
}

// ─── Rating modal ────────────────────────────────────────────────────────────

function RatingModal({ visible, stopId, onDone }: { visible: boolean; stopId: string; onDone: () => void }) {
  const insets             = useSafeAreaInsets()
  const [stars,   setStars]   = useState(5)
  const [tags,    setTags]    = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [busy,    setBusy]    = useState(false)
  const [done,    setDone]    = useState(false)

  const toggleTag = (t: string) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const submit = async () => {
    setBusy(true)
    await supabase.from('livra_delivery_ratings').upsert(
      { stop_id: stopId, stars, tags, comment: comment.trim() || null },
      { onConflict: 'stop_id' },
    )
    setBusy(false)
    setDone(true)
    setTimeout(onDone, 1400)
  }

  if (done) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={m.backdrop}>
          <View style={[m.sheet, { paddingBottom: Math.max(T.space.xl, insets.bottom + T.space.md) }]}>
            <View style={m.successCircle}>
              <Feather name="check" size={32} color="#fff" />
            </View>
            <Text style={m.successTitle}>Mulțumim!</Text>
            <Text style={m.successSub}>Evaluarea ta a fost înregistrată.</Text>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={m.backdrop}>
          <View style={[m.sheet, { paddingBottom: Math.max(T.space.xl, insets.bottom + T.space.md) }]}>
            {/* Handle */}
            <View style={m.handle} />

            {/* Header */}
            <View style={m.confettiRow}>
              <Text style={m.confetti}>🎉</Text>
              <View style={m.avatar}><Text style={m.avatarText}>Ș</Text></View>
              <Text style={m.confetti}>🎉</Text>
            </View>
            <Text style={m.title}>Livrare finalizată!</Text>
            <Text style={m.sub}>Cum a fost experiența cu șoferul?</Text>

            {/* Stars */}
            <View style={m.starsRow}>
              {[1,2,3,4,5].map(s => (
                <TouchableOpacity key={s} onPress={() => setStars(s)} hitSlop={8}>
                  <Text style={[m.star, s <= stars && m.starActive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tag chips */}
            <View style={m.tags}>
              {TAGS.map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => toggleTag(t)}
                  style={[m.tag, tags.includes(t) && m.tagActive]}
                >
                  <Text style={[m.tagText, tags.includes(t) && m.tagTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment */}
            <TextInput
              style={m.textarea}
              placeholder="Comentariu opțional…"
              placeholderTextColor={T.color.inkSubtle}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />

            {/* Buttons */}
            <TouchableOpacity
              style={[m.submitBtn, busy && { opacity: 0.6 }]}
              onPress={submit}
              disabled={busy}
            >
              <Text style={m.submitText}>{busy ? 'Se trimite…' : 'Trimite evaluarea'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={m.skipBtn} onPress={onDone}>
              <Text style={m.skipText}>Sari peste</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// ─── Track screen ─────────────────────────────────────────────────────────────

export default function TrackScreen() {
  const { stopId } = useLocalSearchParams<{ stopId: string }>()
  const router     = useRouter()
  const insets     = useSafeAreaInsets()

  const [stop,          setStop]          = useState<RouteStop | null>(null)
  const [driverLoc,     setDriverLoc]     = useState<DriverLocation | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [lastUpd,       setLastUpd]       = useState('')
  const [ratingVisible, setRatingVisible] = useState(false)

  const prevStatus = useRef<string | null>(null)

  const fetchStop = useCallback(async () => {
    if (!stopId) return
    const { data } = await supabase.from('livra_route_stops').select('*').eq('id', stopId).single()
    setStop(data)
    if (data?.route_id) fetchDriver(data.route_id)
    setLoading(false)

    // Show rating modal when status flips to completed for the first time
    if (data?.status === 'completed' && prevStatus.current !== 'completed') {
      // Only show if not already rated
      const { data: existing } = await supabase
        .from('livra_delivery_ratings')
        .select('id')
        .eq('stop_id', stopId)
        .maybeSingle()
      if (!existing) setRatingVisible(true)
    }
    prevStatus.current = data?.status ?? null
  }, [stopId])

  const fetchDriver = async (routeId: string) => {
    const { data: route } = await supabase.from('livra_routes').select('driver_id').eq('id', routeId).single()
    if (!route?.driver_id) return
    const { data: loc } = await supabase.from('livra_driver_locations').select('*').eq('driver_id', route.driver_id).single()
    if (loc) {
      setDriverLoc(loc)
      setLastUpd(new Date(loc.updated_at).toLocaleTimeString('ro-MD', { hour: '2-digit', minute: '2-digit' }))
    }
  }

  useEffect(() => {
    fetchStop()
    const channel = supabase.channel(`track:${stopId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'livra_route_stops', filter: `id=eq.${stopId}` }, () => fetchStop())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [stopId])

  // Realtime + 30s poll for driver location
  useEffect(() => {
    if (!stop?.route_id) return
    let driverId: string | null = null

    const setup = async () => {
      const { data: route } = await supabase.from('livra_routes').select('driver_id').eq('id', stop.route_id).single()
      driverId = route?.driver_id ?? null
      if (!driverId) return

      const ch = supabase.channel(`driver:${driverId}`)
        .on('postgres_changes', {
          event: 'UPDATE', schema: 'public',
          table: 'livra_driver_locations',
          filter: `driver_id=eq.${driverId}`,
        }, (payload) => {
          const loc = payload.new as DriverLocation
          setDriverLoc(loc)
          setLastUpd(new Date(loc.updated_at).toLocaleTimeString('ro-MD', { hour: '2-digit', minute: '2-digit' }))
        })
        .subscribe()

      return ch
    }

    let channel: Awaited<ReturnType<typeof setup>>
    setup().then(ch => { channel = ch })

    const id = setInterval(() => fetchDriver(stop.route_id), 30000)
    return () => {
      clearInterval(id)
      if (channel) supabase.removeChannel(channel)
    }
  }, [stop?.route_id])

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator color={T.color.primary} /></View>
  }
  if (!stop) {
    return <View style={styles.loader}><Text style={{ color: T.color.inkMuted }}>Comanda nu a fost găsită.</Text></View>
  }

  const step = stepIndex(stop.status)

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Full-bleed map */}
      <View style={styles.mapWrap}>
        <TrackMap
          driverLat={driverLoc?.lat}
          driverLng={driverLoc?.lng}
          destLat={stop.lat}
          destLng={stop.lng}
        />

        {/* Floating top bar */}
        <View style={[styles.topBar, { top: T.space.sm }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.floatBtn}>
            <Feather name="chevron-left" size={22} color={T.color.ink} />
          </TouchableOpacity>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live · {lastUpd || '—'}</Text>
          </View>
          <TouchableOpacity style={styles.floatBtn} onPress={fetchStop}>
            <Feather name="crosshair" size={20} color={T.color.ink} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom sheet */}
      <View style={[styles.sheet, { paddingBottom: Math.max(T.space.xl, insets.bottom + T.space.md) }]}>
        <View style={styles.handle} />

        {/* ETA */}
        <View style={styles.etaRow}>
          <View>
            <Text style={styles.etaLabel}>FEREASTRĂ LIVRARE</Text>
            <Text style={styles.etaValue}>
              {stop.time_window_start ?? '—'}
              {stop.time_window_end ? ` – ${stop.time_window_end}` : ''}
            </Text>
          </View>
          <StatusBadge status={stop.status === 'completed' ? 'delivered' : stop.status === 'failed' ? 'failed' : 'dispatched'} />
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.timelineStep}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, i <= step && styles.timelineDotActive, i === step && styles.timelineDotCurrent]} />
                {i < STEPS.length - 1 && <View style={[styles.timelineLine, i < step && styles.timelineLineActive]} />}
              </View>
              <Text style={[styles.timelineLabel, i <= step && styles.timelineLabelActive]}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Driver card */}
        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}><Text style={styles.driverAvatarText}>Ș</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.driverName}>Șoferul tău</Text>
            <Text style={styles.driverSub}>Livra</Text>
          </View>
          {stop.client_phone && (
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${stop.client_phone}`)} style={styles.callBtn}>
              <Feather name="phone" size={18} color={T.color.success} />
            </TouchableOpacity>
          )}
        </View>

        {/* Order summary */}
        <TouchableOpacity onPress={() => router.push(`/order/${stopId}`)} style={styles.summaryRow}>
          <Feather name="package" size={18} color={T.color.inkMuted} />
          <Text style={styles.summaryText} numberOfLines={1}>{stop.package_description ?? stop.address}</Text>
          <Feather name="chevron-right" size={16} color={T.color.inkSubtle} />
        </TouchableOpacity>
      </View>

      {/* Rating modal — appears when driver marks delivery done */}
      {stopId && (
        <RatingModal
          visible={ratingVisible}
          stopId={stopId}
          onDone={() => setRatingVisible(false)}
        />
      )}
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:               { flex: 1, backgroundColor: T.color.bg },
  loader:             { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.color.bg },
  mapWrap:            { flex: 1, position: 'relative' },
  topBar:             { position: 'absolute', left: T.space.lg, right: T.space.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  floatBtn:           { width: 44, height: 44, borderRadius: 22, backgroundColor: T.color.surface, alignItems: 'center', justifyContent: 'center', ...T.shadow.md },
  livePill:           { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.color.surface, paddingHorizontal: T.space.sm, paddingVertical: 8, borderRadius: T.radius.pill, ...T.shadow.sm },
  liveDot:            { width: 8, height: 8, borderRadius: 4, backgroundColor: T.color.success },
  liveText:           { fontSize: T.size.caption, fontWeight: T.weight.semibold, color: T.color.ink, fontFamily: T.font.mono },
  sheet:              { backgroundColor: T.color.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: T.space.lg, gap: T.space.md, ...T.shadow.sheet },
  handle:             { width: 36, height: 4, borderRadius: 2, backgroundColor: T.color.borderStrong, alignSelf: 'center', marginBottom: T.space.xs },
  etaRow:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  etaLabel:           { fontFamily: T.font.mono, fontSize: T.size.micro, color: T.color.inkSubtle, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 },
  etaValue:           { fontFamily: T.font.display, fontSize: 36, fontWeight: T.weight.bold, color: T.color.ink, letterSpacing: -1 },
  timeline:           { flexDirection: 'row', justifyContent: 'space-between' },
  timelineStep:       { alignItems: 'center', flex: 1 },
  timelineLeft:       { alignItems: 'center', width: '100%' },
  timelineDot:        { width: 12, height: 12, borderRadius: 6, backgroundColor: T.color.borderStrong, marginBottom: 4 },
  timelineDotActive:  { backgroundColor: T.color.primary },
  timelineDotCurrent: { width: 16, height: 16, borderRadius: 8, borderWidth: 3, borderColor: T.color.primaryLight },
  timelineLine:       { position: 'absolute', top: 6, left: '50%', right: '-50%', height: 2, backgroundColor: T.color.borderStrong },
  timelineLineActive: { backgroundColor: T.color.primary },
  timelineLabel:      { fontSize: 10, color: T.color.inkSubtle, textAlign: 'center', fontWeight: T.weight.medium },
  timelineLabelActive:{ color: T.color.primary, fontWeight: T.weight.bold },
  driverCard:         { flexDirection: 'row', alignItems: 'center', gap: T.space.sm, backgroundColor: T.color.bg, borderRadius: T.radius.md, padding: T.space.md },
  driverAvatar:       { width: 44, height: 44, borderRadius: 22, backgroundColor: T.color.ink, alignItems: 'center', justifyContent: 'center' },
  driverAvatarText:   { fontFamily: T.font.display, fontSize: 18, fontWeight: T.weight.bold, color: '#fff' },
  driverName:         { fontSize: T.size.bodySm, fontWeight: T.weight.semibold, color: T.color.ink },
  driverSub:          { fontSize: T.size.caption, color: T.color.inkMuted },
  callBtn:            { width: 40, height: 40, borderRadius: 20, backgroundColor: T.color.successBg, alignItems: 'center', justifyContent: 'center' },
  summaryRow:         { flexDirection: 'row', alignItems: 'center', gap: T.space.sm, backgroundColor: T.color.bg, borderRadius: T.radius.md, padding: T.space.md },
  summaryText:        { flex: 1, fontSize: T.size.bodySm, color: T.color.ink, fontWeight: T.weight.medium },
})

const m = StyleSheet.create({
  backdrop:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:         { backgroundColor: T.color.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: T.space.lg, gap: T.space.sm },
  handle:        { width: 36, height: 4, borderRadius: 2, backgroundColor: T.color.borderStrong, alignSelf: 'center', marginBottom: T.space.xs },
  confettiRow:   { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: T.space.md, marginBottom: T.space.sm },
  confetti:      { fontSize: 28 },
  avatar:        { width: 64, height: 64, borderRadius: 32, backgroundColor: T.color.ink, alignItems: 'center', justifyContent: 'center' },
  avatarText:    { fontFamily: T.font.display, fontSize: 26, fontWeight: T.weight.bold, color: '#fff' },
  title:         { fontFamily: T.font.display, fontSize: T.size.h2, fontWeight: T.weight.bold, color: T.color.ink, letterSpacing: -0.5, textAlign: 'center' },
  sub:           { fontSize: T.size.bodySm, color: T.color.inkMuted, textAlign: 'center', marginBottom: T.space.xs },
  starsRow:      { flexDirection: 'row', justifyContent: 'center', gap: T.space.xs, marginVertical: T.space.xs },
  star:          { fontSize: 38, color: T.color.borderStrong },
  starActive:    { color: T.color.primary },
  tags:          { flexDirection: 'row', flexWrap: 'wrap', gap: T.space.xs, justifyContent: 'center', marginVertical: T.space.xs },
  tag:           { paddingHorizontal: T.space.md, paddingVertical: 6, backgroundColor: T.color.bg, borderWidth: 1, borderColor: T.color.borderStrong, borderRadius: T.radius.pill },
  tagActive:     { backgroundColor: T.color.primary, borderColor: T.color.primary },
  tagText:       { fontSize: T.size.bodySm, fontWeight: T.weight.medium, color: T.color.ink },
  tagTextActive: { color: '#fff' },
  textarea:      { backgroundColor: T.color.bg, borderWidth: 1, borderColor: T.color.border, borderRadius: T.radius.md, padding: T.space.md, fontSize: T.size.bodySm, color: T.color.ink, minHeight: 64, textAlignVertical: 'top', marginTop: T.space.xs },
  submitBtn:     { backgroundColor: T.color.primary, borderRadius: T.radius.lg, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: T.space.sm },
  submitText:    { color: '#fff', fontSize: T.size.body, fontWeight: T.weight.bold },
  skipBtn:       { alignItems: 'center', paddingVertical: T.space.sm },
  skipText:      { fontSize: T.size.bodySm, color: T.color.inkMuted },
  successCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: T.color.success, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: T.space.xl },
  successTitle:  { fontFamily: T.font.display, fontSize: T.size.h2, fontWeight: T.weight.bold, color: T.color.ink, textAlign: 'center' },
  successSub:    { fontSize: T.size.bodySm, color: T.color.inkMuted, textAlign: 'center', marginTop: T.space.xs, marginBottom: T.space.xl },
})
