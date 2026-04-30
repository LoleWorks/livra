import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
  Modal,
  TextInput,
  Pressable,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import * as Location from 'expo-location'
import { supabase } from '../lib/supabase'
import { openExternalNav, buildBulkGoogleMapsUrl } from '../lib/nav'
import { logEvent } from '../lib/events'
import type { RouteStop } from '../lib/types'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../App'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RouteMap'>
  route: RouteProp<RootStackParamList, 'RouteMap'>
}

const FAIL_REASONS = [
  'Clientul nu a răspuns',
  'Adresă incorectă',
  'Pachet refuzat de client',
  'Client nu este la adresă',
  'Altă',
]

// Geofence: driver must be within this many meters of the stop coordinates
// to mark it Done/Failed. The "Sunt la altă adresă" override bypasses this.
const GEOFENCE_RADIUS_M = 150

// Centralised palette — keeps the screen visually consistent and easy to retheme.
const C = {
  bg:        '#f5f5f4',     // page background (warm gray)
  card:      '#ffffff',
  border:    '#e7e5e4',
  divider:   '#f3f4f6',
  textHi:    '#0f172a',     // headings (slate-900)
  textMid:   '#475569',     // body (slate-600)
  textLow:   '#94a3b8',     // hints (slate-400)
  primary:   '#2563eb',     // Livra blue
  primaryFg: '#ffffff',
  primaryBg: '#eff6ff',     // primary tint backgrounds
  success:   '#16a34a',
  successBg: '#dcfce7',
  danger:    '#dc2626',
  dangerBg:  '#fef2f2',
  warning:   '#f59e0b',
  warningBg: '#fffbeb',
}

export default function RouteMapScreen({ navigation, route: navRoute }: Props) {
  const { routeId, driverId } = navRoute.params

  const [stops, setStops] = useState<RouteStop[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [driverCoord, setDriverCoord] = useState<{ latitude: number; longitude: number } | null>(null)
  const [bypassLocation, setBypassLocation] = useState(false)
  const [failModalOpen, setFailModalOpen] = useState(false)
  const [failReason, setFailReason] = useState<string>('')
  const [failCustom, setFailCustom] = useState('')
  const [busy, setBusy] = useState(false)
  // On-demand break: driver taps a button, picks lunch/fuel, then taps "End"
  // when they're back in the car. While on break the driver's status in the
  // database is `lunch_break`/`fuel_break` so the dispatcher sees it live.
  const [onBreak, setOnBreak] = useState<{ type: 'lunch_break' | 'fuel_break'; startedAt: number } | null>(null)
  const [breakPickerOpen, setBreakPickerOpen] = useState(false)
  const [, setNowTs] = useState(Date.now())   // ticks once a second to refresh the banner timer

  const locationSub = useRef<Location.LocationSubscription | null>(null)
  const lastUpsert  = useRef<number>(0)

  useEffect(() => {
    init()
    return () => { locationSub.current?.remove() }
  }, [])

  // Banner timer ticker — only runs while on break
  useEffect(() => {
    if (!onBreak) return
    const id = setInterval(() => setNowTs(Date.now()), 1000)
    return () => clearInterval(id)
  }, [onBreak])

  const startBreak = async (type: 'lunch_break' | 'fuel_break') => {
    const startedAt = Date.now()
    setOnBreak({ type, startedAt })
    setBreakPickerOpen(false)
    await supabase.from('livra_drivers').update({ status: type }).eq('id', driverId)
    logEvent({
      driverId, routeId, eventType: 'break_started',
      lat: driverCoord?.latitude, lng: driverCoord?.longitude,
      metadata: { break_type: type },
    })
  }

  const endBreak = async () => {
    const duration = onBreak ? Math.floor((Date.now() - onBreak.startedAt) / 1000) : 0
    const breakType = onBreak?.type
    setOnBreak(null)
    await supabase.from('livra_drivers').update({ status: 'active' }).eq('id', driverId)
    logEvent({
      driverId, routeId, eventType: 'break_ended',
      lat: driverCoord?.latitude, lng: driverCoord?.longitude,
      metadata: { break_type: breakType, duration_sec: duration },
    })
  }

  const init = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permisiune necesară', 'Activați localizarea pentru a confirma livrările.')
    }

    const { data, error } = await supabase
      .from('livra_route_stops')
      .select('*')
      .eq('route_id', routeId)
      .order('stop_order')

    if (error || !data?.length) {
      Alert.alert('Eroare', 'Nu s-au putut încărca opririle.')
      navigation.goBack()
      return
    }

    setStops(data)
    // The "current" stop is the next pending DELIVERY — breaks aren't actionable.
    const firstPendingIdx = data.findIndex(s => s.status === 'pending' && s.type === 'delivery')
    setCurrentIdx(firstPendingIdx >= 0 ? firstPendingIdx : 0)

    // Mark both the route AND the driver as active so the dispatcher's
    // Drivers page shows the green "Activ" dot + status pill.
    await supabase.from('livra_routes').update({ status: 'active' }).eq('id', routeId)
    await supabase.from('livra_drivers').update({ status: 'active' }).eq('id', driverId)
    logEvent({ driverId, routeId, eventType: 'route_opened', metadata: { stop_count: data.length } })

    if (status === 'granted') {
      try {
        const pos = await Location.getCurrentPositionAsync({})
        setDriverCoord({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })

        locationSub.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 8000, distanceInterval: 10 },
          handleLocationUpdate,
        )
      } catch {}
    }

    setLoading(false)
  }

  const handleLocationUpdate = useCallback(async (loc: Location.LocationObject) => {
    const { latitude: lat, longitude: lng, heading } = loc.coords
    setDriverCoord({ latitude: lat, longitude: lng })

    const now = Date.now()
    if (now - lastUpsert.current > 7000) {
      lastUpsert.current = now
      await supabase.from('livra_driver_locations').upsert({
        driver_id: driverId,
        lat,
        lng,
        heading: heading ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'driver_id' })
    }
  }, [driverId])

  const handleNavigate = async () => {
    const stop = stops[currentIdx]
    if (!stop) return
    logEvent({
      driverId, routeId, eventType: 'nav_app_opened',
      lat: driverCoord?.latitude, lng: driverCoord?.longitude,
      metadata: { stop_id: stop.id, customer: stop.client_name },
    })
    await openExternalNav(stop.lat, stop.lng, stop.address)
  }

  const handleCallClient = () => {
    const stop = stops[currentIdx]
    if (!stop?.client_phone) return
    Linking.openURL(`tel:${stop.client_phone.replace(/\s/g, '')}`).catch(() => {
      Alert.alert('Eroare', 'Nu am putut deschide aplicația de telefon.')
    })
  }

  const openFullRouteInGoogleMaps = async () => {
    const pending = stops.filter(s => s.status === 'pending')
    if (pending.length === 0) {
      Alert.alert('Toate opririle livrate', 'Nu mai sunt opriri de livrat.')
      return
    }
    if (pending.length > 10) {
      Alert.alert(
        'Ruta este prea lungă',
        `Google Maps acceptă max 10 opriri (ai ${pending.length}). Voi deschide doar primele 10.`,
        [{ text: 'OK', onPress: () => doOpenRoute(pending.slice(0, 10)) }],
      )
      return
    }
    doOpenRoute(pending)
  }

  const doOpenRoute = async (waypoints: RouteStop[]) => {
    const origin = driverCoord ?? { latitude: waypoints[0].lat, longitude: waypoints[0].lng }
    const url = buildBulkGoogleMapsUrl(
      { lat: origin.latitude, lng: origin.longitude },
      waypoints.map(s => ({ lat: s.lat, lng: s.lng })),
    )
    if (!url) return Alert.alert('Eroare', 'Nu am putut construi ruta.')
    const ok = await Linking.canOpenURL(url).catch(() => false)
    if (!ok) return Alert.alert('Google Maps nu este instalat', 'Instalează Google Maps din Play Store.')
    await Linking.openURL(url)
  }

  const checkGeofence = (stop: RouteStop): { allowed: boolean; distanceM: number } => {
    if (bypassLocation) return { allowed: true, distanceM: 0 }
    if (!driverCoord) return { allowed: false, distanceM: -1 }
    const d = haversine(driverCoord.latitude, driverCoord.longitude, stop.lat, stop.lng)
    return { allowed: d <= GEOFENCE_RADIUS_M, distanceM: d }
  }

  const handleComplete = async () => {
    const stop = stops[currentIdx]
    if (!stop || busy) return
    const { allowed, distanceM } = checkGeofence(stop)
    if (!allowed) {
      const dKm = distanceM > 0 ? `${(distanceM / 1000).toFixed(1)} km` : 'necunoscută'
      Alert.alert(
        'Nu ești la adresă',
        `Distanța până la client: ${dKm}.\n\nDacă ești la altă adresă la cererea clientului, activează "Sunt la altă adresă" și încearcă din nou.`,
      )
      return
    }
    setBusy(true)
    await supabase.from('livra_route_stops').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', stop.id)
    logEvent({
      driverId, routeId, eventType: 'stop_completed',
      lat: driverCoord?.latitude, lng: driverCoord?.longitude,
      metadata: {
        stop_id: stop.id, customer: stop.client_name, address: stop.address,
        distance_to_address_m: Math.round(distanceM),
        bypass_used: bypassLocation,
      },
    })
    if (bypassLocation) {
      logEvent({
        driverId, routeId, eventType: 'geofence_bypass_used',
        lat: driverCoord?.latitude, lng: driverCoord?.longitude,
        metadata: { stop_id: stop.id, distance_m: Math.round(distanceM) },
      })
    }
    setBusy(false)
    setBypassLocation(false)
    advance('completed')
  }

  const handleFailSubmit = async () => {
    const stop = stops[currentIdx]
    if (!stop || busy) return
    const reason = failReason === 'Altă' ? failCustom.trim() : failReason
    if (!reason) {
      Alert.alert('Lipsește motivul', 'Alege un motiv sau scrie unul.')
      return
    }
    setBusy(true)
    await supabase.from('livra_route_stops').update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      fail_reason: reason,
    }).eq('id', stop.id)
    logEvent({
      driverId, routeId, eventType: 'stop_failed',
      lat: driverCoord?.latitude, lng: driverCoord?.longitude,
      metadata: {
        stop_id: stop.id, customer: stop.client_name, address: stop.address,
        fail_reason: reason, bypass_used: bypassLocation,
      },
    })
    setBusy(false)
    setFailModalOpen(false)
    setFailReason('')
    setFailCustom('')
    setBypassLocation(false)
    advance('failed')
  }

  const openFailModal = () => {
    const stop = stops[currentIdx]
    if (!stop) return
    const { allowed, distanceM } = checkGeofence(stop)
    if (!allowed) {
      const dKm = distanceM > 0 ? `${(distanceM / 1000).toFixed(1)} km` : 'necunoscută'
      Alert.alert(
        'Nu ești la adresă',
        `Distanța până la client: ${dKm}.\n\nDacă ești la altă adresă la cererea clientului, activează "Sunt la altă adresă".`,
      )
      return
    }
    setFailReason('')
    setFailCustom('')
    setFailModalOpen(true)
  }

  const advance = (outcome: 'completed' | 'failed') => {
    setStops(prev => {
      const next = [...prev]
      const stop = next[currentIdx]
      if (stop && stop.status === 'pending') {
        next[currentIdx] = { ...stop, status: outcome }
      }
      return next
    })
    // Find next pending DELIVERY — breaks aren't actionable, just info markers.
    const remaining = stops.findIndex(
      (s, i) => i > currentIdx && s.status === 'pending' && s.type === 'delivery',
    )
    if (remaining >= 0) {
      setCurrentIdx(remaining)
    } else {
      navigation.replace('Summary', { routeId, driverId })
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loaderText}>Se încarcă ruta…</Text>
      </SafeAreaView>
    )
  }

  const currentStop = stops[currentIdx]
  // Counters ignore breaks — they're info-only markers, not work units.
  const deliveryStops = stops.filter(s => s.type === 'delivery')
  const doneCount   = deliveryStops.filter(s => s.status === 'completed').length
  const failedCount = deliveryStops.filter(s => s.status === 'failed').length
  const pendingCount = deliveryStops.filter(s => s.status === 'pending').length
  const finishedCount = doneCount + failedCount
  const distance = currentStop && driverCoord
    ? haversine(driverCoord.latitude, driverCoord.longitude, currentStop.lat, currentStop.lng)
    : null
  const inGeofence = distance !== null && distance <= GEOFENCE_RADIUS_M
  const remainingStops = stops.filter((s, i) => !(s.status === 'pending' && i === currentIdx))

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={8}>
          <Feather name="chevron-left" size={26} color={C.textHi} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Ruta de azi</Text>
          <Text style={styles.headerSub}>{finishedCount} din {deliveryStops.length} finalizate</Text>
        </View>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(finishedCount / Math.max(1, deliveryStops.length)) * 100}%` }]} />
      </View>

      {/* On-break banner — shown at the very top so the driver always knows
          they're "clocked out" and the dispatcher sees the same. */}
      {onBreak && (() => {
        const elapsed = Math.floor((Date.now() - onBreak.startedAt) / 1000)
        const mm = Math.floor(elapsed / 60)
        const ss = elapsed % 60
        const isLunch = onBreak.type === 'lunch_break'
        return (
          <View style={styles.breakBanner}>
            <Feather name={isLunch ? 'coffee' : 'droplet'} size={18} color="#92400e" />
            <View style={{ flex: 1 }}>
              <Text style={styles.breakBannerTitle}>
                {isLunch ? 'Pe pauză de masă' : 'Pe pauză de combustibil'}
              </Text>
              <Text style={styles.breakBannerTime}>
                {String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
              </Text>
            </View>
            <TouchableOpacity style={styles.breakBannerBtn} onPress={endBreak} activeOpacity={0.85}>
              <Text style={styles.breakBannerBtnText}>Termină pauza</Text>
            </TouchableOpacity>
          </View>
        )
      })()}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>

        {/* Bulk-route shortcut — small, secondary */}
        {pendingCount > 1 && (
          <TouchableOpacity style={styles.bulkBtn} onPress={openFullRouteInGoogleMaps} activeOpacity={0.7}>
            <Feather name="map" size={16} color={C.primary} />
            <Text style={styles.bulkBtnText}>Vezi toată ruta în Google Maps</Text>
            <Feather name="chevron-right" size={18} color={C.textLow} />
          </TouchableOpacity>
        )}

        {/* Hero card — current stop */}
        {currentStop && currentStop.status === 'pending' && currentStop.type === 'delivery' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberBadgeText}>{currentStop.stop_order}</Text>
              </View>
              <Text style={styles.cardLabel}>OPRIRE {finishedCount + 1} DIN {deliveryStops.length}</Text>
            </View>

            <Text style={styles.clientName}>{currentStop.client_name}</Text>

            <View style={styles.detailsBlock}>
              <DetailRow icon="map-pin" iconColor={C.textMid}>
                {currentStop.address}
              </DetailRow>

              {currentStop.time_window_start && currentStop.time_window_end && (
                <DetailRow icon="clock" iconColor={C.primary}>
                  Disponibil <Text style={styles.detailEmphasis}>{currentStop.time_window_start}–{currentStop.time_window_end}</Text>
                </DetailRow>
              )}

              {currentStop.package_description && (
                <DetailRow icon="package" iconColor={C.textMid} emphasis>
                  {currentStop.package_description}
                </DetailRow>
              )}
            </View>

            {currentStop.delivery_notes && (
              <View style={styles.notesCard}>
                <Feather name="alert-circle" size={14} color={C.warning} style={{ marginTop: 2 }} />
                <Text style={styles.notesText}>{currentStop.delivery_notes}</Text>
              </View>
            )}

            {/* Primary actions — Call + Navigate */}
            <View style={styles.primaryActions}>
              {currentStop.client_phone && (
                <TouchableOpacity style={styles.callBtn} onPress={handleCallClient} activeOpacity={0.85}>
                  <Feather name="phone" size={18} color={C.successBg === '#dcfce7' ? '#15803d' : C.success} />
                  <Text style={styles.callBtnText}>Sună</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.navBtn} onPress={handleNavigate} activeOpacity={0.85}>
                <Feather name="navigation" size={16} color={C.primaryFg} />
                <Text style={styles.navBtnText}>Pornește navigarea</Text>
              </TouchableOpacity>
            </View>

            {/* Distance indicator */}
            {distance !== null && (
              <View style={[styles.distancePill, inGeofence && styles.distancePillClose]}>
                <Feather
                  name={inGeofence ? 'check-circle' : 'navigation-2'}
                  size={12}
                  color={inGeofence ? C.success : C.textMid}
                />
                <Text style={[styles.distanceText, inGeofence && styles.distanceTextClose]}>
                  {inGeofence
                    ? 'Ești la adresa clientului'
                    : `${formatDistance(distance)} de adresa clientului`}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Status actions */}
        {currentStop && currentStop.status === 'pending' && currentStop.type === 'delivery' && (
          <View style={styles.statusActions}>
            <TouchableOpacity
              style={[styles.failActionBtn, busy && styles.btnDisabled]}
              onPress={openFailModal}
              disabled={busy}
              activeOpacity={0.85}
            >
              <Feather name="x" size={20} color={C.danger} />
              <Text style={styles.failActionText}>Eșuat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.completeActionBtn, busy && styles.btnDisabled]}
              onPress={handleComplete}
              disabled={busy}
              activeOpacity={0.9}
            >
              <Feather name="check" size={22} color={C.primaryFg} />
              <Text style={styles.completeActionText}>Livrat</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bypass toggle */}
        {currentStop && currentStop.status === 'pending' && currentStop.type === 'delivery' && (
          <Pressable
            style={({ pressed }) => [styles.bypassRow, pressed && { opacity: 0.6 }]}
            onPress={() => setBypassLocation(b => !b)}
          >
            <View style={[styles.bypassCheck, bypassLocation && styles.bypassCheckOn]}>
              {bypassLocation && <Feather name="check" size={12} color={C.primaryFg} />}
            </View>
            <Text style={styles.bypassText}>Sunt la altă adresă (la cererea clientului)</Text>
          </Pressable>
        )}

        {/* On-demand break — driver can pause anytime, even between scheduled
            stops. Disabled while a break is already running. */}
        {!onBreak && (
          <TouchableOpacity
            style={styles.takeBreakBtn}
            onPress={() => setBreakPickerOpen(true)}
            activeOpacity={0.85}
          >
            <Feather name="pause-circle" size={18} color={C.warning} />
            <Text style={styles.takeBreakText}>Ia o pauză</Text>
          </TouchableOpacity>
        )}

        {/* Queue */}
        {remainingStops.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Toate opririle</Text>
            <View style={styles.queueList}>
              {stops.map((stop, i) => {
                if (stop.status === 'pending' && i === currentIdx) return null

                // Break rows render differently: info-only, no number/status,
                // amber tint, lunch fork or fuel pump icon. They sit between
                // delivery rows so the driver sees where they're meant to stop.
                if (stop.type === 'lunch_break' || stop.type === 'fuel_break') {
                  const isLunch = stop.type === 'lunch_break'
                  return (
                    <View key={stop.id} style={[styles.queueRow, styles.queueRowBreak]}>
                      <View style={[styles.queueIcon, styles.queueIconBreak]}>
                        <Feather name={isLunch ? 'coffee' : 'droplet'} size={14} color={C.warning} />
                      </View>
                      <View style={styles.queueBody}>
                        <Text style={styles.queueBreakLabel}>
                          {isLunch ? 'Pauză de masă' : 'Pauză combustibil'}
                          {stop.break_duration_min ? ` · ${stop.break_duration_min} min` : ''}
                        </Text>
                        <Text style={styles.queueAddr} numberOfLines={1}>{stop.address}</Text>
                      </View>
                    </View>
                  )
                }

                const isDone   = stop.status === 'completed'
                const isFailed = stop.status === 'failed'
                return (
                  <View
                    key={stop.id}
                    style={[
                      styles.queueRow,
                      isDone   && styles.queueRowDone,
                      isFailed && styles.queueRowFailed,
                    ]}
                  >
                    <View style={[
                      styles.queueIcon,
                      isDone   && { backgroundColor: C.successBg },
                      isFailed && { backgroundColor: C.dangerBg },
                    ]}>
                      {isDone   ? <Feather name="check"  size={14} color={C.success} />
                       : isFailed ? <Feather name="x"      size={14} color={C.danger} />
                       :            <Text style={styles.queueNumberText}>{stop.stop_order}</Text>}
                    </View>
                    <View style={styles.queueBody}>
                      <Text style={styles.queueClient} numberOfLines={1}>{stop.client_name}</Text>
                      <Text style={styles.queueAddr} numberOfLines={1}>{stop.address}</Text>
                    </View>
                    {stop.time_window_start && (
                      <Text style={styles.queueWindow}>{stop.time_window_start}</Text>
                    )}
                  </View>
                )
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* Failure reason modal */}
      <Modal
        visible={failModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFailModalOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setFailModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
            <View style={styles.modalGrabHandle} />
            <Text style={styles.modalTitle}>De ce a eșuat livrarea?</Text>
            <View style={{ height: 8 }} />
            {FAIL_REASONS.map(reason => {
              const active = failReason === reason
              return (
                <Pressable
                  key={reason}
                  style={({ pressed }) => [
                    styles.reasonOption,
                    active && styles.reasonOptionActive,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => setFailReason(reason)}
                >
                  <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                    {active && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.reasonText, active && styles.reasonTextActive]}>
                    {reason}
                  </Text>
                </Pressable>
              )
            })}
            {failReason === 'Altă' && (
              <TextInput
                style={styles.customInput}
                placeholder="Detaliază motivul…"
                placeholderTextColor={C.textLow}
                value={failCustom}
                onChangeText={setFailCustom}
                multiline
                numberOfLines={3}
                autoFocus
              />
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setFailModalOpen(false)} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Anulează</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFailSubmit}
                style={[
                  styles.modalConfirm,
                  (!failReason || (failReason === 'Altă' && !failCustom.trim()) || busy) && styles.btnDisabled,
                ]}
                disabled={!failReason || (failReason === 'Altă' && !failCustom.trim()) || busy}
              >
                <Text style={styles.modalConfirmText}>Marchează eșuat</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Break picker modal */}
      <Modal
        visible={breakPickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setBreakPickerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setBreakPickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
            <View style={styles.modalGrabHandle} />
            <Text style={styles.modalTitle}>Ce fel de pauză?</Text>
            <View style={{ height: 12 }} />
            <TouchableOpacity
              style={styles.breakOption}
              onPress={() => startBreak('lunch_break')}
              activeOpacity={0.85}
            >
              <View style={styles.breakOptionIcon}>
                <Feather name="coffee" size={22} color={C.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.breakOptionTitle}>Pauză de masă</Text>
                <Text style={styles.breakOptionSub}>Pauză pentru a mânca, ~30 min</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.breakOption}
              onPress={() => startBreak('fuel_break')}
              activeOpacity={0.85}
            >
              <View style={styles.breakOptionIcon}>
                <Feather name="droplet" size={22} color={C.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.breakOptionTitle}>Pauză combustibil</Text>
                <Text style={styles.breakOptionSub}>Pentru a alimenta sau a face o pauză scurtă</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setBreakPickerOpen(false)}
              style={[styles.modalCancel, { marginTop: 14 }]}
            >
              <Text style={styles.modalCancelText}>Anulează</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function DetailRow({
  icon,
  iconColor,
  emphasis,
  children,
}: {
  icon: React.ComponentProps<typeof Feather>['name']
  iconColor?: string
  emphasis?: boolean
  children: React.ReactNode
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIconWrap}>
        <Feather name={icon} size={16} color={iconColor ?? C.textMid} />
      </View>
      <Text style={[styles.detailText, emphasis && styles.detailTextEmphasis]}>
        {children}
      </Text>
    </View>
  )
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`
  return `${(m / 1000).toFixed(1)} km`
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, backgroundColor: C.bg },
  loaderText: { color: C.textMid, fontSize: 14 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 14,
    backgroundColor: C.card,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: C.textHi, letterSpacing: -0.2 },
  headerSub: { fontSize: 12, color: C.textMid, marginTop: 2 },

  progressTrack: { height: 3, backgroundColor: C.divider },
  progressFill: { height: '100%', backgroundColor: C.primary },

  scrollContent: { padding: 16, paddingBottom: 60 },

  // Bulk button — secondary action, low visual weight
  bulkBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.card,
    paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1, borderColor: C.border,
    marginBottom: 16,
  },
  bulkBtnText: { flex: 1, color: C.textHi, fontSize: 13, fontWeight: '600' },

  // Hero card
  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1, borderColor: C.border,
    // softer shadow, more modern
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 12,
  },
  numberBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  numberBadgeText: { color: C.primaryFg, fontSize: 13, fontWeight: '700' },
  cardLabel: { color: C.textLow, fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },

  clientName: {
    fontSize: 24, fontWeight: '700', color: C.textHi,
    letterSpacing: -0.3,
    marginBottom: 14,
  },

  detailsBlock: { gap: 2 },
  detailRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 7,
  },
  detailIconWrap: {
    width: 26, height: 22, alignItems: 'flex-start', justifyContent: 'center',
  },
  detailText: { flex: 1, fontSize: 14, color: C.textMid, lineHeight: 22 },
  detailTextEmphasis: { color: C.textHi, fontWeight: '600' },
  detailEmphasis: { color: C.textHi, fontWeight: '700' },

  notesCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: C.warningBg,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3, borderLeftColor: C.warning,
  },
  notesText: { flex: 1, fontSize: 13, color: '#92400e', lineHeight: 19 },

  // Primary action row
  primaryActions: {
    flexDirection: 'row', gap: 8, marginTop: 16,
  },
  callBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.successBg,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12,
  },
  callBtnText: { color: '#15803d', fontWeight: '600', fontSize: 14 },
  navBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.primary,
    paddingVertical: 12, borderRadius: 12,
  },
  navBtnText: { color: C.primaryFg, fontWeight: '700', fontSize: 14 },

  // Distance pill
  distancePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.divider,
    paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginTop: 14,
  },
  distancePillClose: { backgroundColor: C.successBg },
  distanceText: { fontSize: 12, color: C.textMid, fontWeight: '600' },
  distanceTextClose: { color: '#15803d' },

  // Status actions
  statusActions: {
    flexDirection: 'row', gap: 10,
    marginTop: 4, marginBottom: 14,
  },
  failActionBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.dangerBg,
    borderWidth: 1, borderColor: '#fecaca',
    paddingVertical: 16, borderRadius: 14,
  },
  failActionText: { color: C.danger, fontWeight: '700', fontSize: 16 },
  completeActionBtn: {
    flex: 2,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.success,
    paddingVertical: 16, borderRadius: 14,
  },
  completeActionText: { color: C.primaryFg, fontWeight: '700', fontSize: 16 },
  btnDisabled: { opacity: 0.5 },

  // Bypass toggle
  bypassRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  bypassCheck: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: '#cbd5e1',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.card,
  },
  bypassCheckOn: { backgroundColor: C.primary, borderColor: C.primary },
  bypassText: { color: C.textMid, fontSize: 13, flex: 1 },

  // On-demand break trigger button (sits between bypass and queue)
  takeBreakBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.warningBg,
    borderWidth: 1, borderColor: '#fde68a',
    borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 16,
    marginBottom: 16,
  },
  takeBreakText: { color: '#92400e', fontWeight: '700', fontSize: 14 },

  // Sticky banner shown at top of screen while on a break
  breakBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.warningBg,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#fde68a',
  },
  breakBannerTitle: { color: '#92400e', fontSize: 13, fontWeight: '700' },
  breakBannerTime: { color: '#92400e', fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
  breakBannerBtn: {
    backgroundColor: '#92400e',
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10,
  },
  breakBannerBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Break-picker modal options
  breakOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.warningBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1, borderColor: '#fde68a',
  },
  breakOptionIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fef3c7',
    alignItems: 'center', justifyContent: 'center',
  },
  breakOptionTitle: { color: '#92400e', fontSize: 16, fontWeight: '700' },
  breakOptionSub: { color: C.textMid, fontSize: 12, marginTop: 2 },

  // Queue
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.textLow,
    letterSpacing: 1.2, textTransform: 'uppercase',
    marginBottom: 10, marginTop: 8,
  },
  queueList: { gap: 6 },
  queueRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.card,
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1, borderColor: C.border,
  },
  queueRowDone: { opacity: 0.55 },
  queueRowFailed: { opacity: 0.7, borderColor: '#fecaca' },
  queueRowBreak: {
    backgroundColor: C.warningBg,
    borderColor: '#fde68a',
  },
  queueIconBreak: { backgroundColor: '#fef3c7' },
  queueBreakLabel: { fontSize: 13, fontWeight: '700', color: '#92400e', letterSpacing: -0.1 },
  queueIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.divider,
    alignItems: 'center', justifyContent: 'center',
  },
  queueNumberText: { color: C.textMid, fontSize: 12, fontWeight: '700' },
  queueBody: { flex: 1, minWidth: 0 },
  queueClient: { fontSize: 14, fontWeight: '600', color: C.textHi },
  queueAddr: { fontSize: 12, color: C.textMid, marginTop: 1 },
  queueWindow: { fontSize: 11, color: C.primary, fontWeight: '700' },

  // Modal
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingTop: 12, paddingBottom: 40,
  },
  modalGrabHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18, fontWeight: '700', color: C.textHi,
    letterSpacing: -0.2,
  },
  reasonOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 14,
    borderRadius: 12, marginBottom: 4,
  },
  reasonOptionActive: { backgroundColor: C.primaryBg },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#cbd5e1',
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterActive: { borderColor: C.primary },
  radioInner: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: C.primary,
  },
  reasonText: { fontSize: 15, color: C.textMid, flex: 1 },
  reasonTextActive: { color: C.textHi, fontWeight: '600' },
  customInput: {
    backgroundColor: C.divider,
    borderRadius: 12, padding: 14,
    minHeight: 70, textAlignVertical: 'top',
    fontSize: 14, color: C.textHi,
    marginTop: 10,
  },
  modalActions: {
    flexDirection: 'row', gap: 10, marginTop: 18,
  },
  modalCancel: {
    flex: 1, paddingVertical: 15,
    borderRadius: 12, alignItems: 'center',
    backgroundColor: C.divider,
  },
  modalCancelText: { color: C.textMid, fontWeight: '600', fontSize: 15 },
  modalConfirm: {
    flex: 2, paddingVertical: 15,
    borderRadius: 12, alignItems: 'center',
    backgroundColor: C.danger,
  },
  modalConfirmText: { color: C.primaryFg, fontWeight: '700', fontSize: 15 },
})
