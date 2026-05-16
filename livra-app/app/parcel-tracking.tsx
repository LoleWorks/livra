import React, { useState, useCallback, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Linking, RefreshControl,
  Animated, Pressable, Platform,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import Svg, { Circle } from 'react-native-svg'
import { tokens as T } from '../src/theme/tokens'
import { useTrackedParcels } from '../src/context/TrackedParcelsContext'
import { fetchTracking, TrackingData, TrackingEvent } from '../src/lib/tracking'

// ─── Translations ─────────────────────────────────────────────────────────────

const EVENT_RO: Record<string, string> = {
  CreateID:                         'Înregistrat și în pregătire',
  ReceivedFromSender:               'Preluat de la expeditor',
  AcceptedAtOriginDepot:            'Acceptat la depoul de origine',
  DepartureOriginDepot:             'Plecat din depoul de origine',
  ArrivalTransitDepot:              'Sosit la depoul de tranzit',
  DepartureTransitDepot:            'Plecat din depoul de tranzit',
  ArrivalDestinationDepot:          'Sosit la depoul destinatar',
  OutForDelivery:                   'La curier, în drum spre tine',
  Delivered:                        'Livrat',
  DeliveredToPickupPoint:           'Livrat la punct de ridicare',
  DeliveredToPostOffice:            'Livrat la oficiul poștal',
  AtCustoms:                        'La vamă',
  DeclarationArrivalCustomTerminal: 'La terminal vamal',
  CustomsCleared:                   'Vămuire finalizată',
  ReturnedToSender:                 'Returnat expeditorului',
  DeliveryFailed:                   'Livrare nereușită',
  StoredAtDepot:                    'Depozitat la depou',
  AwaitingPickup:                   'Așteaptă ridicarea',
  DepartureOriginDepotFuture:       'Va pleca din depoul de origine',
  ArrivalTransitDepotFuture:        'Va sosi la depoul de tranzit',
  DepartureTransitDepotFuture:      'Va pleca din depoul de tranzit',
  ArrivalFuture:                    'Va sosi la depou',
  DepartureFuture:                  'Va pleca din depou',
}

const NEXT_STEP: Record<string, string> = {
  CreateID:                         'Coletul a fost înregistrat. Curierul îl va prelua în curând de la expeditor.',
  ReceivedFromSender:               'Expeditorul a predat coletul. Acum călătoria lui a început!',
  AcceptedAtOriginDepot:            'Coletul e la depoul de plecare. Va fi sortat și trimis pe drum.',
  DepartureOriginDepot:             'Coletul a pornit la drum! Urmează să ajungă la un depou de tranzit.',
  ArrivalTransitDepot:              'Scurtă oprire în tranzit. Va pleca mai departe în curând.',
  DepartureTransitDepot:            'Din nou pe drum! Se apropie tot mai mult de tine.',
  ArrivalDestinationDepot:          'Coletul a ajuns la depoul din zona ta. Curierul îl va prelua mâine dimineață.',
  OutForDelivery:                   'Curierul este pe drum spre tine! Pastrează telefonul aproape, va suna la ușa.',
  AtCustoms:                        'Coletul trece prin vamă. Procesul durează de obicei 1-3 zile lucrătoare.',
  DeclarationArrivalCustomTerminal: 'La terminalul vamal. Documentele sunt în procesare.',
  CustomsCleared:                   'Vămuire finalizată! Coletul continuă drumul spre tine.',
  StoredAtDepot:                    'Coletul te așteaptă la depou. Poți ridica în orele de program.',
  AwaitingPickup:                   'Coletul e gata de ridicare. Treci la oficiul poștal cu actul de identitate.',
  DeliveryFailed:                   'Livrarea nu a reușit de data aceasta. Curierul va mai încerca sau poți ridica personal de la depou.',
}

function translateEvent(event: string): string {
  return EVENT_RO[event] ?? event.replace(/([A-Z])/g, ' $1').trim()
}

function getNextStep(event: string): string | null {
  return NEXT_STEP[event] ?? null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Fixed progress per event key — immune to sparse data from partner carriers
const EVENT_PROGRESS: Record<string, number> = {
  CreateID: 5,
  ReceivedFromSender: 12,
  AcceptedAtOriginDepot: 20,
  DepartureOriginDepot: 30,
  ArrivalTransitDepot: 40,
  DepartureTransitDepot: 52,
  AtCustoms: 43,
  DeclarationArrivalCustomTerminal: 41,
  CustomsCleared: 53,
  ArrivalDestinationDepot: 68,
  OutForDelivery: 84,
  StoredAtDepot: 22,
  AwaitingPickup: 25,
  Delivered: 100,
  DeliveredToPickupPoint: 100,
  DeliveredToPostOffice: 100,
  ReturnedToSender: 96,
  DeliveryFailed: 80,
}

function getProgress(tracking: TrackingEvent[], currentEvent?: TrackingEvent): number {
  const real = tracking.filter(e => !e.is_synthetic)
  if (!real.length) return 0
  if (currentEvent && EVENT_PROGRESS[currentEvent.event] !== undefined) {
    return EVENT_PROGRESS[currentEvent.event]
  }
  // Fallback for unknown event keys
  const passed = real.filter(e => e.event_status === 'passed').length
  const hasNow = real.some(e => e.event_status === 'now')
  return Math.round(((passed + (hasNow ? 0.5 : 0)) / real.length) * 100)
}

function isSparseData(tracking: TrackingEvent[]): boolean {
  return tracking.filter(e => !e.is_synthetic).length <= 2
}

function isDone(tracking: TrackingEvent[]): boolean {
  return tracking.some(e => {
    if (e.event_status !== 'passed' && e.event_status !== 'now') return false
    const key  = e.event?.toLowerCase() ?? ''
    const name = e.event_name?.toLowerCase() ?? ''
    return (
      key.includes('delivered') || key.includes('return') ||
      name.includes('livrat')   || name.includes('returnat')
    )
  })
}

function fmtTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

function fmtDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return iso }
}

function dayLabel(iso: string): string {
  try {
    const d    = new Date(iso)
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
    if (diff === 0) return 'Azi'
    if (diff === 1) return 'Ieri'
    return d.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'short' })
  } catch { return '' }
}

function daysUntil(iso: string): number | null {
  try {
    const d = new Date(iso)
    d.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000)
    return diff
  } catch { return null }
}

function getLastCoords(tracking: TrackingEvent[]): { lat: number; lng: number } | null {
  for (const e of [...tracking].filter(e => e.event_status !== 'future' && !e.is_synthetic).reverse()) {
    const { latitude: lat, longitude: lng } = e.division_coordinates
    if (lat && lng) return { lat, lng }
  }
  return null
}

function energyMsg(count: number): string {
  if (count === 0) return 'Trimite energie coletului'
  if (count === 1) return 'Energia ta a ajuns!'
  if (count < 5)  return `+${count} energii trimise`
  if (count < 10) return `Wow! ${count} - coletul accelerează!`
  return `${count} energii! Campion al asteptarii`
}

function fmtActivity(iso: string): string {
  try {
    const d    = new Date(iso)
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
    const time = d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
    if (diff === 0) return `Azi, ${time}`
    if (diff === 1) return `Ieri, ${time}`
    return `${d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}, ${time}`
  } catch { return '' }
}

// ─── Progress Ring ─────────────────────────────────────────────────────────────

function ProgressRing({ progress, done }: { progress: number; done: boolean }) {
  const size        = 88
  const strokeWidth = 7
  const radius      = (size - strokeWidth) / 2
  const circum      = 2 * Math.PI * radius
  const offset      = circum * (1 - progress / 100)
  const color       = done ? T.color.success : T.color.primary

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Track */}
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={T.color.border} strokeWidth={strokeWidth} fill="none"
        />
        {/* Arc */}
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round"
          strokeDasharray={[circum, circum]}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={[ringStyles.pct, { color }]}>{progress}%</Text>
    </View>
  )
}

const ringStyles = StyleSheet.create({
  pct: { fontSize: T.size.bodySm, fontWeight: T.weight.bold },
})

// ─── Journey Strip ─────────────────────────────────────────────────────────────

function JourneyStrip({ data, done }: { data: TrackingData; done: boolean }) {
  const real = data.tracking.filter(e => !e.is_synthetic)
  const current = real.find(e => e.event_status === 'now')
    ?? [...real].reverse().find(e => e.event_status === 'passed')
  const currentCity = current?.settlement_name || current?.division_name || null

  const origin = data.sender.settlement
  const dest   = data.recipient.settlement

  return (
    <View style={s.card}>
      <Text style={s.cardLabel}>Ruta coletului</Text>
      <View style={js.track}>
        {/* Left dot (origin) */}
        <View style={[js.dot, js.dotDone]} />
        {/* Left segment */}
        <View style={[js.seg, done ? js.segDone : js.segActive]} />
        {/* Middle dot (current) */}
        <View style={[js.dotMid, done ? js.dotDone : js.dotNow]}>
          <Feather name={done ? 'check' : 'package'} size={10} color="#fff" />
        </View>
        {/* Right segment */}
        <View style={[js.seg, done && js.segDone]} />
        {/* Right dot (destination) */}
        <View style={[js.dot, done ? js.dotDone : js.dotFuture]} />
      </View>
      <View style={js.labels}>
        <Text style={js.labelLeft} numberOfLines={1}>{origin}</Text>
        {currentCity ? (
          <Text style={js.labelMid} numberOfLines={1}>{currentCity}</Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <Text style={js.labelRight} numberOfLines={1}>{dest}</Text>
      </View>
    </View>
  )
}

const js = StyleSheet.create({
  track:     { flexDirection: 'row', alignItems: 'center', marginVertical: T.space.sm },
  dot:       { width: 12, height: 12, borderRadius: 6, flexShrink: 0 },
  dotMid:    { width: 22, height: 22, borderRadius: 11, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  dotDone:   { backgroundColor: T.color.success },
  dotNow:    { backgroundColor: T.color.primary },
  dotFuture: { backgroundColor: T.color.border, borderWidth: 2, borderColor: T.color.borderStrong },
  seg:       { flex: 1, height: 3, backgroundColor: T.color.border },
  segDone:   { backgroundColor: T.color.success },
  segActive: { backgroundColor: T.color.primary },
  labels:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  labelLeft: { fontSize: T.size.caption, color: T.color.inkMuted, fontWeight: T.weight.semibold, flex: 1 },
  labelMid:  { fontSize: T.size.caption, color: T.color.primary,  fontWeight: T.weight.bold,    flex: 1, textAlign: 'center' },
  labelRight:{ fontSize: T.size.caption, color: T.color.inkMuted, fontWeight: T.weight.semibold, flex: 1, textAlign: 'right' },
})

// ─── Collapsible Timeline ──────────────────────────────────────────────────────

function Timeline({ events }: { events: TrackingEvent[] }) {
  const [expanded, setExpanded] = useState(false)
  const reversed  = [...events].reverse()
  const visible   = expanded ? reversed : reversed.slice(0, 3)
  const hasMore   = reversed.length > 3

  return (
    <View style={s.card}>
      <Text style={s.cardLabel}>Istoric traseu</Text>
      {events.length === 0 && (
        <Text style={tl.empty}>Niciun eveniment disponibil</Text>
      )}
      {visible.map((evt, i) => {
        const isPassed = evt.event_status === 'passed'
        const isNow    = evt.event_status === 'now'
        const isFuture = evt.event_status === 'future'
        const prevEvt  = visible[i - 1]
        const showDay  = !prevEvt || prevEvt.date.slice(0, 10) !== evt.date.slice(0, 10)

        return (
          <React.Fragment key={`${evt.date}-${i}`}>
            {showDay && <Text style={tl.dayLabel}>{dayLabel(evt.date)}</Text>}
            <View style={[tl.bubble, isNow && tl.bubbleNow, isFuture && tl.bubbleFuture]}>
              <View style={[tl.dot, isPassed && tl.dotPassed, isNow && tl.dotNow, isFuture && tl.dotFuture]} />
              <View style={{ flex: 1 }}>
                <Text style={[tl.name, isNow && tl.nameNow, isFuture && tl.nameFuture]}>
                  {translateEvent(evt.event)}
                </Text>
                {(evt.settlement_name || evt.division_name) ? (
                  <Text style={tl.loc} numberOfLines={1}>
                    {[evt.settlement_name, evt.division_name].filter(Boolean).join(' · ')}
                  </Text>
                ) : null}
                {!isFuture && evt.date ? (
                  <Text style={tl.time}>{fmtTime(evt.date)}</Text>
                ) : null}
              </View>
            </View>
          </React.Fragment>
        )
      })}
      {hasMore && (
        <TouchableOpacity style={tl.expandBtn} onPress={() => setExpanded(e => !e)} activeOpacity={0.7}>
          <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={T.color.primary} />
          <Text style={tl.expandText}>
            {expanded ? 'Ascunde istoricul' : `Arată tot istoricul (${events.length} evenimente)`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const tl = StyleSheet.create({
  empty:      { fontSize: T.size.bodySm, color: T.color.inkSubtle, textAlign: 'center', paddingVertical: T.space.lg },
  dayLabel:   { fontFamily: T.font.mono, fontSize: T.size.micro, color: T.color.inkSubtle, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: T.space.md, marginBottom: T.space.xs },
  bubble:     { flexDirection: 'row', alignItems: 'flex-start', gap: T.space.sm, paddingVertical: T.space.sm, borderBottomWidth: 1, borderBottomColor: T.color.bg },
  bubbleNow:  { backgroundColor: T.color.primaryLight + '55', marginHorizontal: -T.space.md, paddingHorizontal: T.space.md },
  bubbleFuture: { opacity: 0.45 },
  dot:        { width: 10, height: 10, borderRadius: 5, marginTop: 4, flexShrink: 0 },
  dotPassed:  { backgroundColor: T.color.success },
  dotNow:     { backgroundColor: T.color.primary },
  dotFuture:  { backgroundColor: T.color.border, borderWidth: 1.5, borderColor: T.color.inkSubtle },
  name:       { fontSize: T.size.bodySm, fontWeight: T.weight.semibold, color: T.color.ink, lineHeight: 19 },
  nameNow:    { color: T.color.primary },
  nameFuture: { color: T.color.inkMuted, fontWeight: T.weight.regular },
  loc:        { fontSize: T.size.caption, color: T.color.inkMuted, marginTop: 2 },
  time:       { fontSize: T.size.micro, color: T.color.inkSubtle, marginTop: 2, fontWeight: T.weight.semibold },
  expandBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: T.space.xs, paddingTop: T.space.sm, marginTop: T.space.xs },
  expandText: { fontSize: T.size.caption, color: T.color.primary, fontWeight: T.weight.semibold },
})

// ─── Energy Button ─────────────────────────────────────────────────────────────

function EnergyButton() {
  const [count, setCount]  = useState(0)
  const [btnScale]         = useState(() => new Animated.Value(1))
  const [pulseScale]       = useState(() => new Animated.Value(1))
  const [pulseOpacity]     = useState(() => new Animated.Value(0))

  function tap() {
    setCount(c => c + 1)
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.90, duration: 80,  useNativeDriver: true }),
      Animated.spring(btnScale,  { toValue: 1,    friction: 4,   useNativeDriver: true }),
    ]).start()
    pulseScale.setValue(1)
    pulseOpacity.setValue(0.55)
    Animated.parallel([
      Animated.timing(pulseScale,   { toValue: 2.8, duration: 700, useNativeDriver: true }),
      Animated.timing(pulseOpacity, { toValue: 0,   duration: 700, useNativeDriver: true }),
    ]).start()
  }

  return (
    <View style={eb.wrap}>
      <Pressable onPress={tap} style={eb.pressable}>
        {/* Pulse ring */}
        <Animated.View
          pointerEvents="none"
          style={[eb.pulse, { transform: [{ scale: pulseScale }], opacity: pulseOpacity }]}
        />
        {/* Button */}
        <Animated.View style={[eb.btn, { transform: [{ scale: btnScale }] }]}>
          <Feather name="zap" size={16} color={T.color.primary} />
          <Text style={eb.label}>{energyMsg(count)}</Text>
        </Animated.View>
      </Pressable>
      {count > 0 && (
        <View style={eb.badge}>
          <Text style={eb.badgeText}>{count}</Text>
        </View>
      )}
    </View>
  )
}

const EB_SIZE = 56
const eb = StyleSheet.create({
  wrap:      { alignItems: 'center', marginBottom: T.space.sm, position: 'relative' },
  pressable: { alignItems: 'center', justifyContent: 'center' },
  pulse:     {
    position: 'absolute',
    width: EB_SIZE * 2.5, height: EB_SIZE * 2.5,
    borderRadius: EB_SIZE * 1.25,
    borderWidth: 2, borderColor: T.color.primary,
    backgroundColor: 'transparent',
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: T.space.xs,
    backgroundColor: T.color.primaryLight, borderRadius: T.radius.pill,
    paddingHorizontal: T.space.lg, paddingVertical: T.space.sm,
    borderWidth: 1.5, borderColor: T.color.primary + '55',
  },
  label:     { fontSize: T.size.bodySm, fontWeight: T.weight.bold, color: T.color.primary },
  badge:     {
    position: 'absolute', top: -6, right: -6,
    backgroundColor: T.color.primary, borderRadius: T.radius.pill,
    minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { fontSize: T.size.micro, fontWeight: T.weight.bold, color: '#fff' },
})

// ─── Carrier list ─────────────────────────────────────────────────────────────

const ALL_CARRIERS = ['Nova Post', 'Curier Rapid', 'Fan Curier']

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ParcelTrackingScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const params  = useLocalSearchParams<{ awb?: string; carrier?: string }>()

  const { upsertParcel, labelParcel, parcels } = useTrackedParcels()

  const [inputAwb,        setInputAwb]        = useState(params.awb ?? '')
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(params.carrier ?? null)
  const [awb,             setAwb]             = useState<string | null>(null)
  const [data,            setData]            = useState<TrackingData | null>(null)
  const [loading,         setLoading]         = useState(false)
  const [refreshing,      setRefreshing]      = useState(false)
  const [error,           setError]           = useState<string | null>(null)
  const [labelDraft,      setLabelDraft]      = useState('')

  const fetchData = useCallback(async (trackAwb: string, carrier: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true)
    setError(null)
    try {
      const json = await fetchTracking(trackAwb, carrier)
      setData(json)
      const real    = json.tracking.filter(e => !e.is_synthetic)
      const current = real.find(e => e.event_status === 'now')
        ?? [...real].reverse().find(e => e.event_status === 'passed')
      const done = isDone(json.tracking)
      upsertParcel(trackAwb, current?.event ?? '', translateEvent(current?.event ?? ''), done, json.carrier ?? carrier)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nu am putut încărca datele. Verifică numărul AWB și conexiunea la internet.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [upsertParcel])

  useEffect(() => {
    if (params.awb && params.carrier) {
      const cleaned = params.awb.trim().toUpperCase()
      setAwb(cleaned)
      fetchData(cleaned, params.carrier)
    }
  }, [])

  function submit() {
    if (!inputAwb.trim() || !selectedCarrier) return
    const cleaned = inputAwb.trim().toUpperCase()
    setAwb(cleaned)
    setData(null)
    setError(null)
    fetchData(cleaned, selectedCarrier)
  }

  const onRefresh = useCallback(() => {
    if (awb && selectedCarrier) fetchData(awb, selectedCarrier, true)
  }, [awb, selectedCarrier, fetchData])

  // Sync label draft whenever the tracked parcel changes
  useEffect(() => {
    const saved = awb ? parcels.find(p => p.awb === awb) : null
    setLabelDraft(saved?.customLabel ?? '')
  }, [awb, parcels])

  const realEvents   = data?.tracking.filter(e => !e.is_synthetic) ?? []
  const done         = data ? isDone(data.tracking) : false
  const lastCoords   = data ? getLastCoords(data.tracking) : null
  const currentEvent = realEvents.find(e => e.event_status === 'now')
    ?? [...realEvents].reverse().find(e => e.event_status === 'passed')
  const progress     = data ? getProgress(data.tracking, currentEvent) : 0
  const sparse       = data ? isSparseData(data.tracking) : false
  const nextStepText = currentEvent ? getNextStep(currentEvent.event) : null
  const eta          = data?.scheduled_delivery_date ? daysUntil(data.scheduled_delivery_date) : null

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={T.color.ink} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Urmărire colet</Text>
        {awb && !loading ? (
          <TouchableOpacity onPress={onRefresh} hitSlop={10} style={s.backBtn}>
            <Feather name="refresh-cw" size={16} color={T.color.inkMuted} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: Math.max(T.space.xl, insets.bottom + T.space.md) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          awb
            ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.color.primary} />
            : undefined
        }
      >
        {/* AWB input */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Număr AWB</Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              value={inputAwb}
              onChangeText={setInputAwb}
              placeholder="ex. 59000123456789"
              placeholderTextColor={T.color.inkSubtle}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={submit}
            />
            <TouchableOpacity
              style={[s.searchBtn, (!inputAwb.trim() || !selectedCarrier) && s.searchBtnOff]}
              onPress={submit}
              activeOpacity={0.8}
              disabled={!inputAwb.trim() || !selectedCarrier}
            >
              <Feather name="search" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={s.carrierLabel}>Transportator</Text>
          <View style={s.carrierRow}>
            {ALL_CARRIERS.map(c => (
              <TouchableOpacity
                key={c}
                style={[s.carrierChip, selectedCarrier === c && s.carrierChipActive]}
                onPress={() => setSelectedCarrier(prev => prev === c ? null : c)}
                activeOpacity={0.75}
              >
                <Text style={[s.carrierChipText, selectedCarrier === c && s.carrierChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Loading */}
        {loading && (
          <View style={s.centered}>
            <ActivityIndicator size="large" color={T.color.primary} />
            <Text style={s.loadingText}>Se încarcă…</Text>
          </View>
        )}

        {/* Error */}
        {!!error && !loading && (
          <View style={s.errorCard}>
            <Feather name="alert-circle" size={18} color={T.color.danger} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* Results */}
        {data && !loading && (
          <>
            {/* Hero status card */}
            <View style={[s.card, s.heroCard, done && s.heroCardDone]}>
              <View style={s.heroRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.heroAwb}>AWB {data.number}{data.carrier ? ` · ${data.carrier}` : ''}</Text>
                  {currentEvent && (
                    <Text style={[s.heroStatus, done && s.heroStatusDone]} numberOfLines={2}>
                      {translateEvent(currentEvent.event)}
                    </Text>
                  )}
                  {currentEvent?.settlement_name ? (
                    <View style={s.heroLocRow}>
                      <Feather name="map-pin" size={12} color={done ? T.color.success : T.color.primary} />
                      <Text style={[s.heroLoc, done && s.heroLocDone]}>{currentEvent.settlement_name}</Text>
                    </View>
                  ) : null}
                  {currentEvent?.date ? (
                    <Text style={s.heroActivity}>Ultima activitate: {fmtActivity(currentEvent.date)}</Text>
                  ) : null}
                </View>
                <ProgressRing progress={progress} done={done} />
              </View>
            </View>

            {/* Label editor */}
            <View style={s.labelCard}>
              <Feather name="tag" size={14} color={T.color.inkMuted} style={{ marginTop: 1 }} />
              <TextInput
                style={s.labelInput}
                value={labelDraft}
                onChangeText={setLabelDraft}
                onBlur={() => { if (awb) labelParcel(awb, labelDraft.trim()) }}
                onSubmitEditing={() => { if (awb) labelParcel(awb, labelDraft.trim()) }}
                placeholder="Adaugă o etichetă (ex. Cizme albastre)"
                placeholderTextColor={T.color.inkSubtle}
                returnKeyType="done"
                maxLength={48}
              />
              {labelDraft.length > 0 && (
                <TouchableOpacity hitSlop={8} onPress={() => { setLabelDraft(''); if (awb) labelParcel(awb, '') }}>
                  <Feather name="x" size={14} color={T.color.inkSubtle} />
                </TouchableOpacity>
              )}
            </View>

            {/* Journey strip */}
            <JourneyStrip data={data} done={done} />

            {/* Sparse data notice */}
            {sparse && !done && (
              <View style={s.sparseCard}>
                <Feather name="clock" size={14} color={T.color.warning} />
                <Text style={s.sparseText}>
                  Transportatorul inca nu a incarcat toate evenimentele. Informatiile se vor actualiza pe masura ce coletul avanseaza.
                </Text>
              </View>
            )}

            {/* Ce urmează? */}
            {!done && nextStepText && (
              <View style={[s.card, s.nextCard]}>
                <View style={s.nextHeader}>
                  <Feather name="info" size={14} color={T.color.warning} />
                  <Text style={s.nextTitle}>Ce urmeaza?</Text>
                </View>
                <Text style={s.nextText}>{nextStepText}</Text>
              </View>
            )}

            {/* Done message */}
            {done && (
              <View style={[s.card, s.doneCard]}>
                <View style={s.doneIconWrap}>
                  <Feather name="check-circle" size={32} color={T.color.success} />
                </View>
                <Text style={s.doneTitle}>Colet livrat!</Text>
                <Text style={s.doneSub}>Multumim ca ai ales serviciul nostru de urmarire.</Text>
              </View>
            )}

            {/* ETA */}
            {!done && data.scheduled_delivery_date && eta !== null && (
              <View style={[s.card, s.etaCard]}>
                <View style={s.etaLeft}>
                  <Feather name="calendar" size={18} color={T.color.warning} />
                  <View>
                    <Text style={s.etaTitle}>Livrare estimată</Text>
                    <Text style={s.etaDate}>{fmtDate(data.scheduled_delivery_date)}</Text>
                  </View>
                </View>
                {eta >= 0 && (
                  <View style={s.etaBadge}>
                    <Text style={s.etaDays}>{eta}</Text>
                    <Text style={s.etaDaysLabel}>{eta === 1 ? 'zi' : 'zile'}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Energy button */}
            {!done && <EnergyButton />}

            {/* Details */}
            {(data.total_weight > 0 || data.parcels?.[0]?.parcel_description) && (
              <View style={s.card}>
                <Text style={s.cardLabel}>Detalii colet</Text>
                {data.total_weight > 0 && (
                  <View style={s.infoRow}>
                    <Text style={s.infoKey}>Greutate</Text>
                    <Text style={s.infoVal}>{data.total_weight} kg</Text>
                  </View>
                )}
                {!!data.parcels?.[0]?.parcel_description && (
                  <View style={s.infoRow}>
                    <Text style={s.infoKey}>Conținut</Text>
                    <Text style={s.infoVal} numberOfLines={2}>{data.parcels[0].parcel_description}</Text>
                  </View>
                )}
                <View style={s.infoRow}>
                  <Text style={s.infoKey}>De la</Text>
                  <Text style={s.infoVal}>{data.sender.settlement} ({data.sender.country_code})</Text>
                </View>
                <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={s.infoKey}>Către</Text>
                  <Text style={s.infoVal}>{data.recipient.settlement} ({data.recipient.country_code})</Text>
                </View>
              </View>
            )}

            {/* Maps link */}
            {lastCoords && (
              <TouchableOpacity
                style={s.mapsRow}
                activeOpacity={0.8}
                onPress={() => {
                  const { lat, lng } = lastCoords
                  const url = Platform.select({
                    ios:     `maps://?q=${lat},${lng}`,
                    android: `geo:${lat},${lng}?q=${lat},${lng}`,
                    default: `https://www.google.com/maps?q=${lat},${lng}`,
                  })
                  Linking.openURL(url).catch(() =>
                    Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`)
                  )
                }}
              >
                <Feather name="map-pin" size={16} color={T.color.primary} />
                <Text style={s.mapsText}>Deschide ultima locație în Maps</Text>
                <Feather name="chevron-right" size={16} color={T.color.inkSubtle} />
              </TouchableOpacity>
            )}

            {/* Timeline */}
            <Timeline events={realEvents} />
          </>
        )}
      </ScrollView>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: T.color.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: T.space.lg, paddingVertical: T.space.md,
    backgroundColor: T.color.bg,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: T.radius.sm,
    backgroundColor: T.color.surface, alignItems: 'center', justifyContent: 'center',
    ...T.shadow.sm,
  },
  headerTitle: { fontSize: T.size.h3, fontWeight: T.weight.bold, color: T.color.ink },

  scroll: { paddingHorizontal: T.space.lg, paddingTop: T.space.xs },

  card: {
    backgroundColor: T.color.surface, borderRadius: T.radius.xl,
    padding: T.space.md, marginBottom: T.space.sm,
    borderWidth: 1, borderColor: T.color.border, ...T.shadow.sm,
  },
  cardLabel: {
    fontFamily: T.font.mono, fontSize: T.size.micro, color: T.color.inkSubtle,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: T.space.sm,
  },

  inputRow:          { flexDirection: 'row', gap: T.space.xs },
  labelCard:  { flexDirection: 'row', alignItems: 'center', gap: T.space.xs, backgroundColor: T.color.surface, borderRadius: T.radius.xl, paddingHorizontal: T.space.md, paddingVertical: T.space.sm, marginBottom: T.space.sm, borderWidth: 1, borderColor: T.color.border, ...T.shadow.sm },
  labelInput: { flex: 1, fontSize: T.size.bodySm, fontWeight: T.weight.semibold, color: T.color.ink, paddingVertical: 6 },
  carrierLabel:      { fontFamily: T.font.mono, fontSize: T.size.micro, color: T.color.inkSubtle, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: T.space.md, marginBottom: T.space.xs },
  carrierRow:        { flexDirection: 'row', gap: T.space.xs, flexWrap: 'wrap' },
  carrierChip:       { height: 32, paddingHorizontal: T.space.sm, borderRadius: T.radius.pill, borderWidth: 1, borderColor: T.color.borderStrong, justifyContent: 'center', backgroundColor: T.color.bg },
  carrierChipActive: { backgroundColor: T.color.ink, borderColor: T.color.ink },
  carrierChipText:       { fontSize: T.size.caption, fontWeight: T.weight.semibold, color: T.color.ink },
  carrierChipTextActive: { color: '#fff' },
  input: {
    flex: 1, height: 48, backgroundColor: T.color.bg, borderRadius: T.radius.md,
    paddingHorizontal: T.space.md, fontSize: T.size.body, fontWeight: T.weight.semibold,
    color: T.color.ink, letterSpacing: 0.5,
  },
  searchBtn:    { width: 48, height: 48, borderRadius: T.radius.md, backgroundColor: T.color.primary, alignItems: 'center', justifyContent: 'center' },
  searchBtnOff: { backgroundColor: T.color.border },

  centered:    { alignItems: 'center', paddingVertical: 40, gap: T.space.sm },
  loadingText: { fontSize: T.size.bodySm, color: T.color.inkMuted },

  errorCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: T.space.sm,
    backgroundColor: T.color.dangerBg, borderRadius: T.radius.lg,
    padding: T.space.md, marginBottom: T.space.sm,
    borderWidth: 1, borderColor: T.color.danger + '33',
  },
  errorText: { flex: 1, fontSize: T.size.bodySm, color: T.color.danger, lineHeight: 20 },

  // Hero
  heroCard:       { borderLeftWidth: 3, borderLeftColor: T.color.primary },
  heroCardDone:   { borderLeftColor: T.color.success },
  heroRow:        { flexDirection: 'row', alignItems: 'center', gap: T.space.md },
  heroAwb:        { fontFamily: T.font.mono, fontSize: T.size.micro, color: T.color.inkSubtle, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  heroStatus:     { fontFamily: T.font.display, fontSize: T.size.h2, color: T.color.ink, lineHeight: 26, marginBottom: 4 },
  heroStatusDone: { color: T.color.success },
  heroLocRow:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroLoc:        { fontSize: T.size.caption, color: T.color.primary, fontWeight: T.weight.semibold },
  heroLocDone:    { color: T.color.success },
  heroActivity:   { fontSize: T.size.micro, color: T.color.inkSubtle, marginTop: 5 },

  // Next step
  nextCard:   { borderLeftWidth: 3, borderLeftColor: T.color.warning },
  nextHeader: { flexDirection: 'row', alignItems: 'center', gap: T.space.xs, marginBottom: T.space.xs },
  nextTitle:  { fontSize: T.size.bodySm, fontWeight: T.weight.bold, color: T.color.ink },
  nextText:   { fontSize: T.size.bodySm, color: T.color.inkMuted, lineHeight: 20 },

  // Done
  doneCard:     { alignItems: 'center', paddingVertical: T.space.lg, gap: T.space.xs },
  doneIconWrap: { marginBottom: T.space.xs },
  doneTitle:    { fontFamily: T.font.display, fontSize: T.size.h2, color: T.color.success },
  doneSub:      { fontSize: T.size.bodySm, color: T.color.inkMuted, textAlign: 'center' },

  // ETA
  etaCard:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  etaLeft:       { flexDirection: 'row', alignItems: 'center', gap: T.space.sm, flex: 1 },
  etaTitle:      { fontSize: T.size.caption, color: T.color.inkMuted, fontWeight: T.weight.semibold },
  etaDate:       { fontSize: T.size.bodySm, fontWeight: T.weight.bold, color: T.color.ink },
  etaBadge:      { backgroundColor: T.color.warningBg, borderRadius: T.radius.md, paddingHorizontal: T.space.sm, paddingVertical: T.space.xs, alignItems: 'center', minWidth: 48 },
  etaDays:       { fontSize: T.size.h2, fontWeight: T.weight.bold, color: T.color.warning, lineHeight: 26 },
  etaDaysLabel:  { fontSize: T.size.micro, color: T.color.warning, fontWeight: T.weight.semibold },

  // Info rows
  infoRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: T.color.bg, gap: T.space.sm },
  infoKey:  { fontSize: T.size.bodySm, color: T.color.inkMuted, flexShrink: 0 },
  infoVal:  { fontSize: T.size.bodySm, fontWeight: T.weight.semibold, color: T.color.ink, textAlign: 'right', flex: 1 },

  // Maps
  mapsRow:  { flexDirection: 'row', alignItems: 'center', gap: T.space.sm, backgroundColor: T.color.surface, borderRadius: T.radius.xl, padding: T.space.md, marginBottom: T.space.sm, borderWidth: 1, borderColor: T.color.border, ...T.shadow.sm },
  mapsText: { flex: 1, fontSize: T.size.bodySm, fontWeight: T.weight.semibold, color: T.color.ink },

  // Sparse data
  sparseCard: { flexDirection: 'row', alignItems: 'flex-start', gap: T.space.xs, backgroundColor: T.color.warningBg, borderRadius: T.radius.lg, padding: T.space.md, marginBottom: T.space.sm, borderWidth: 1, borderColor: T.color.warning + '44' },
  sparseText: { flex: 1, fontSize: T.size.caption, color: T.color.warning, lineHeight: 18 },
})
