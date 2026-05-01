import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Linking, ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'
import { openGoogleMaps, openWaze } from '../lib/nav'
import { T } from '../lib/tokens'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../App'
import type { RouteStop } from '../lib/types'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DeliveryDetail'>
  route: RouteProp<RootStackParamList, 'DeliveryDetail'>
}

export default function DeliveryDetailScreen({ navigation, route: navRoute }: Props) {
  const { routeId, driverId, driverName, stopId, stopNum, totalStops } = navRoute.params
  const insets = useSafeAreaInsets()
  const [stop, setStop] = useState<RouteStop | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('livra_route_stops')
      .select('*')
      .eq('id', stopId)
      .single()
      .then(({ data }) => {
        setStop(data as RouteStop)
        setLoading(false)
      })
  }, [stopId])

  const goAfterNav = async (via: 'google' | 'waze') => {
    if (!stop) return
    // Open the nav app first, then go to AfterNavigation screen
    if (via === 'google') {
      await openGoogleMaps(stop.lat, stop.lng, stop.address)
    } else {
      await openWaze(stop.lat, stop.lng)
    }
    navigation.replace('AfterNavigation', { routeId, driverId, driverName, stopId, stopNum, totalStops })
  }

  if (loading || !stop) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.color.bg }}>
        <ActivityIndicator size="large" color={T.color.primary} />
      </View>
    )
  }

  const addressLine = stop.address
  const notes = stop.delivery_notes

  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
      {/* Compact back-header */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Înapoi"
        >
          <Feather name="chevron-left" size={22} color={T.color.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerSub}>Oprire {stopNum} din {totalStops}</Text>
          <Text style={s.headerTitle}>{stop.client_name}</Text>
        </View>
      </View>

      <ScrollView style={s.body} contentContainerStyle={s.bodyContent}>
        {/* Destination card */}
        <View style={s.destCard}>
          <Text style={s.destLabel}>DESTINAȚIA</Text>
          <View style={s.destAddressRow}>
            <Feather name="map-pin" size={18} color="rgba(255,255,255,0.9)" style={{ marginTop: 3 }} />
            <Text style={s.destAddress}>{addressLine}</Text>
          </View>
          <View style={s.destDivider} />
          <View style={s.destMeta}>
            <View style={{ flex: 1 }}>
              <Text style={s.metaLabel}>RECIPIENT</Text>
              <Text style={s.metaValue}>{stop.client_name}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.metaLabel}>TELEFON</Text>
              <Text
                style={[s.metaValue, { color: '#fff', textDecorationLine: 'none' }]}
                onPress={() => stop.client_phone && Linking.openURL(`tel:${stop.client_phone}`)}
              >
                {stop.client_phone ?? '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {notes ? (
          <View style={s.notesCard}>
            <Text style={s.notesLabel}>NOTE</Text>
            <Text style={s.notesText}>{notes}</Text>
          </View>
        ) : null}

        {/* Phone + SMS buttons */}
        <View style={s.actionRow}>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => stop.client_phone && Linking.openURL(`tel:${stop.client_phone}`)}
            accessibilityLabel="Sună clientul"
          >
            <Feather name="phone" size={18} color={T.color.ink} />
            <Text style={s.actionBtnText}>Sună</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => stop.client_phone && Linking.openURL(`sms:${stop.client_phone}`)}
            accessibilityLabel="Trimite SMS"
          >
            <Feather name="message-square" size={18} color={T.color.ink} />
            <Text style={s.actionBtnText}>SMS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>


      <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
        <TouchableOpacity style={s.btnAccent} onPress={() => goAfterNav('google')} activeOpacity={0.85}>
          <MaterialCommunityIcons name="google-maps" size={22} color="#fff" />
          <Text style={s.btnAccentText}>Deschide Google Maps</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnSecondary} onPress={() => goAfterNav('waze')} activeOpacity={0.85}>
          <FontAwesome5 name="waze" size={20} color={T.color.ink} />
          <Text style={s.btnSecondaryText}>Deschide Waze</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.color.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: T.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: T.color.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: T.color.bg,
    borderWidth: 1,
    borderColor: T.color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSub: {
    fontFamily: T.font.mono,
    fontSize: 11,
    color: T.color.inkSubtle,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: T.color.ink,
  },
  body: { flex: 1 },
  bodyContent: { padding: 20 },
  destCard: {
    backgroundColor: T.color.primary,
    borderRadius: T.radius.lg,
    padding: 20,
    marginBottom: 16,
  },
  destLabel: {
    fontFamily: T.font.mono,
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  destAddressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  destAddress: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 32,
  },
  destDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 12,
  },
  destMeta: { flexDirection: 'row', gap: 12 },
  metaLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  metaValue: { fontSize: 16, fontWeight: '700', color: '#fff' },
  notesCard: {
    backgroundColor: T.color.surface,
    borderRadius: T.radius.lg,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: T.color.border,
  },
  notesLabel: {
    fontFamily: T.font.mono,
    fontSize: 11,
    color: T.color.inkSubtle,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  notesText: { fontSize: 15, color: T.color.ink, lineHeight: 24 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    height: 52,
    backgroundColor: T.color.surface,
    borderWidth: 1.5,
    borderColor: T.color.borderStrong,
    borderRadius: T.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnText: { fontSize: 15, fontWeight: '700', color: T.color.ink },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: T.color.surface,
    borderTopWidth: 1,
    borderTopColor: T.color.border,
    gap: 10,
  },
  btnAccent: {
    height: 64,
    backgroundColor: T.color.primary,
    borderRadius: T.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  btnAccentText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  btnSecondary: {
    height: 64,
    backgroundColor: T.color.surface,
    borderWidth: 1.5,
    borderColor: T.color.borderStrong,
    borderRadius: T.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  btnSecondaryText: { fontSize: 16, fontWeight: '700', color: T.color.ink },
})
