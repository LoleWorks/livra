import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'
import { logEvent } from '../lib/events'
import { stopLocationTask } from '../lib/tracking'
import { T } from '../lib/tokens'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../App'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FailureReason'>
  route: RouteProp<RootStackParamList, 'FailureReason'>
}

const REASONS = [
  'Adresă incorectă',
  'Client absent',
  'Refuz primire',
  'Parcel deteriorat',
  'Ușă închisă cu clanță de siguranță',
  'Doar coletul de pe ușă',
  'Altul',
]

export default function FailureReasonScreen({ navigation, route: navRoute }: Props) {
  const { routeId, driverId, driverName, stopId, stopNum, totalStops } = navRoute.params
  const insets = useSafeAreaInsets()
  const [selected, setSelected] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)

  const handleConfirm = async () => {
    if (!selected || busy) return
    setBusy(true)

    await supabase
      .from('livra_route_stops')
      .update({
        status: 'failed',
        fail_reason: selected,
        notes: notes.trim() || null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', stopId)

    // Create attention item for the dispatcher
    const { data: stopData } = await supabase
      .from('livra_route_stops')
      .select('client_name, client_phone, address')
      .eq('id', stopId)
      .single()

    if (stopData) {
      await supabase.from('livra_attention_items').insert({
        stop_id:     stopId,
        customer:    stopData.client_name,
        phone:       stopData.client_phone,
        address:     stopData.address,
        driver_name: driverName,
        fail_reason: selected,
        status:      'open',
        failed_at:   new Date().toISOString(),
      })
    }

    logEvent({ driverId, routeId, eventType: 'stop_failed', metadata: { stop_id: stopId, fail_reason: selected, customer: stopData?.client_name ?? null } })

    // Navigate to next stop
    const { data: stopRow } = await supabase
      .from('livra_route_stops')
      .select('stop_order')
      .eq('id', stopId)
      .single()

    const { data: nextStops } = await supabase
      .from('livra_route_stops')
      .select('id, stop_order')
      .eq('route_id', routeId)
      .eq('type', 'delivery')
      .eq('status', 'pending')
      .gt('stop_order', stopRow?.stop_order ?? 0)
      .order('stop_order')
      .limit(1)

    setBusy(false)

    if (nextStops?.length) {
      navigation.replace('DeliveryDetail', {
        routeId,
        driverId,
        driverName,
        stopId: nextStops[0].id,
        stopNum: stopNum + 1,
        totalStops,
      })
    } else {
      await supabase.from('livra_routes').update({ status: 'completed' }).eq('id', routeId)
      await supabase.from('livra_drivers').update({ status: 'done' }).eq('id', driverId)
      logEvent({ driverId, routeId, eventType: 'route_completed' })
      await stopLocationTask()
      navigation.replace('Home', { driverId, driverName })
    }
  }

  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} accessibilityLabel="Înapoi">
          <Feather name="chevron-left" size={22} color={T.color.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerSub}>Oprire {stopNum} din {totalStops}</Text>
          <Text style={s.headerTitle}>De ce nereușită?</Text>
        </View>
      </View>

      <ScrollView style={s.body} contentContainerStyle={s.bodyContent} keyboardShouldPersistTaps="handled">
        <Text style={s.sectionLabel}>ALEGE MOTIVUL</Text>

        <View style={s.reasonList}>
          {REASONS.map(r => (
            <TouchableOpacity
              key={r}
              style={[s.reasonBtn, selected === r && s.reasonBtnSelected]}
              onPress={() => setSelected(r)}
              activeOpacity={0.8}
            >
              <Text style={[s.reasonText, selected === r && s.reasonTextSelected]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.notesLabel}>NOTE SUPLIMENTARE (OPȚIONAL)</Text>
        <TextInput
          style={s.notesInput}
          multiline
          numberOfLines={4}
          placeholder="Descriere detaliată a problemei…"
          placeholderTextColor={T.color.inkSubtle}
          value={notes}
          onChangeText={setNotes}
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
        <TouchableOpacity
          style={[s.btnDanger, (!selected || busy) && s.btnDisabled]}
          onPress={handleConfirm}
          disabled={!selected || busy}
          activeOpacity={0.85}
        >
          {busy
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnDangerText}>Confirmă nereușită</Text>
          }
        </TouchableOpacity>
        <TouchableOpacity style={s.btnCancel} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={s.btnCancelText}>Anulează</Text>
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
  headerTitle: { fontSize: 16, fontWeight: '700', color: T.color.ink },
  body: { flex: 1 },
  bodyContent: { padding: 20 },
  sectionLabel: {
    fontFamily: T.font.mono,
    fontSize: 11,
    color: T.color.inkSubtle,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  reasonList: { gap: 8, marginBottom: 20 },
  reasonBtn: {
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: T.color.surface,
    borderWidth: 1.5,
    borderColor: T.color.border,
    borderRadius: T.radius.lg,
    justifyContent: 'center',
  },
  reasonBtnSelected: {
    backgroundColor: T.color.danger,
    borderColor: T.color.danger,
  },
  reasonText: { fontSize: 15, fontWeight: '600', color: T.color.ink },
  reasonTextSelected: { color: '#fff' },
  notesLabel: {
    fontFamily: T.font.mono,
    fontSize: 11,
    color: T.color.inkSubtle,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  notesInput: {
    height: 80,
    padding: 12,
    backgroundColor: T.color.surface,
    borderWidth: 1,
    borderColor: T.color.border,
    borderRadius: T.radius.md,
    fontSize: 14,
    color: T.color.ink,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: T.color.surface,
    borderTopWidth: 1,
    borderTopColor: T.color.border,
    gap: 8,
  },
  btnDanger: {
    height: 64,
    backgroundColor: T.color.danger,
    borderRadius: T.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDangerText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  btnDisabled: { opacity: 0.5 },
  btnCancel: {
    height: 48,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: T.color.borderStrong,
    borderRadius: T.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelText: { fontSize: 15, fontWeight: '600', color: T.color.ink },
})
