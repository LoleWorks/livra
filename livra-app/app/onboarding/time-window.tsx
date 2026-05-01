import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { tokens as T } from '../../src/theme/tokens'
import ScreenHeader from '../../src/components/ScreenHeader'
import Button from '../../src/components/Button'
import { supabase } from '../../src/lib/supabase'
import { useAuth } from '../../src/context/AuthContext'

const PRESETS = [
  { label: 'Dimineața',   range: '09:00 – 12:00', start: '09:00', end: '12:00', icon: 'sunrise' },
  { label: 'După-amiaza', range: '12:00 – 16:00', start: '12:00', end: '16:00', icon: 'sun' },
  { label: 'Spre seară',  range: '16:00 – 19:00', start: '16:00', end: '19:00', icon: 'sunset' },
]
const CUSTOM_IDX = 3

function toDate(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

function toHHMM(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export default function OnboardingTimeWindow() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()

  const [selected,    setSelected]    = useState(2)
  const [customStart, setCustomStart] = useState(toDate('08:00'))
  const [customEnd,   setCustomEnd]   = useState(toDate('20:00'))
  const [picker,      setPicker]      = useState<'start' | 'end' | null>(null)
  const [loading,     setLoading]     = useState(false)

  const handlePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setPicker(null)
    if (event.type === 'dismissed' || !date) return
    if (picker === 'start') setCustomStart(date)
    else if (picker === 'end') setCustomEnd(date)
  }

  const handleContinue = async () => {
    let start: string, end: string
    if (selected === CUSTOM_IDX) {
      start = toHHMM(customStart)
      end   = toHHMM(customEnd)
      if (start >= end) {
        Alert.alert('Interval invalid', 'Ora de sfârșit trebuie să fie după ora de început.')
        return
      }
    } else {
      start = PRESETS[selected].start
      end   = PRESETS[selected].end
    }
    setLoading(true)
    await supabase.from('livra_customers').update({
      preferred_time_window_start: start,
      preferred_time_window_end:   end,
    }).eq('id', user!.id)
    setLoading(false)
    router.push('/onboarding/pin')
  }

  const customStartLabel = toHHMM(customStart)
  const customEndLabel   = toHHMM(customEnd)

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScreenHeader leftIcon="back" transparent rightSlot={
        <TouchableOpacity onPress={() => router.push('/onboarding/pin')}>
          <Text style={styles.skip}>Sari peste</Text>
        </TouchableOpacity>
      } />
      <View style={styles.content}>
        <View style={styles.progress}>
          {[1,2,3,4].map(s => <View key={s} style={[styles.bar, s <= 3 && styles.barActive]} />)}
        </View>
        <Text style={styles.step}>Pasul 3 din 4</Text>
        <Text style={styles.title}>Când ești de obicei acasă?</Text>
        <Text style={styles.sub}>Toți partenerii Livra vor folosi această fereastră ca preferință. O poți schimba oricând.</Text>

        <View style={styles.options}>
          {PRESETS.map((w, i) => (
            <TouchableOpacity key={i} onPress={() => setSelected(i)} activeOpacity={0.8}
              style={[styles.option, i === selected && styles.optionActive]}>
              <View style={[styles.iconBox, i === selected && styles.iconBoxActive]}>
                <Feather name={w.icon as any} size={22} color={i === selected ? '#fff' : T.color.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optLabel}>{w.label}</Text>
                <Text style={styles.optRange}>{w.range}</Text>
              </View>
              <View style={[styles.radio, i === selected && styles.radioActive]}>
                {i === selected && <Feather name="check" size={12} color="#fff" />}
              </View>
            </TouchableOpacity>
          ))}

          {/* Custom option */}
          <TouchableOpacity onPress={() => setSelected(CUSTOM_IDX)} activeOpacity={0.8}
            style={[styles.option, selected === CUSTOM_IDX && styles.optionActive]}>
            <View style={[styles.iconBox, selected === CUSTOM_IDX && styles.iconBoxActive]}>
              <Feather name="sliders" size={22} color={selected === CUSTOM_IDX ? '#fff' : T.color.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optLabel}>Personalizat</Text>
              {selected === CUSTOM_IDX ? (
                <View style={styles.timePickers}>
                  <TouchableOpacity style={styles.timePill} onPress={() => setPicker('start')}>
                    <Feather name="clock" size={12} color={T.color.primary} />
                    <Text style={styles.timePillText}>{customStartLabel}</Text>
                  </TouchableOpacity>
                  <Text style={styles.dash}>–</Text>
                  <TouchableOpacity style={styles.timePill} onPress={() => setPicker('end')}>
                    <Feather name="clock" size={12} color={T.color.primary} />
                    <Text style={styles.timePillText}>{customEndLabel}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.optRange}>Alege ora ta</Text>
              )}
            </View>
            <View style={[styles.radio, selected === CUSTOM_IDX && styles.radioActive]}>
              {selected === CUSTOM_IDX && <Feather name="check" size={12} color="#fff" />}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.btnWrap}>
          <Button label={loading ? 'Se salvează…' : 'Continuă'} variant="primary" onPress={handleContinue} disabled={loading} />
        </View>
      </View>

      {/* Android: renders inline when picker != null */}
      {Platform.OS === 'android' && picker !== null && (
        <DateTimePicker
          value={picker === 'start' ? customStart : customEnd}
          mode="time"
          is24Hour
          onChange={handlePickerChange}
        />
      )}

      {/* iOS: wrap in modal so it doesn't push content */}
      {Platform.OS === 'ios' && picker !== null && (
        <Modal transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {picker === 'start' ? 'Ora de început' : 'Ora de sfârșit'}
                </Text>
                <TouchableOpacity onPress={() => setPicker(null)} style={styles.modalDone}>
                  <Text style={styles.modalDoneText}>Gata</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={picker === 'start' ? customStart : customEnd}
                mode="time"
                is24Hour
                display="spinner"
                onChange={handlePickerChange}
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: T.color.bg },
  content:       { flex: 1, padding: T.space.lg },
  progress:      { flexDirection: 'row', gap: 6, marginBottom: T.space.xl },
  bar:           { flex: 1, height: 4, borderRadius: 2, backgroundColor: T.color.borderStrong },
  barActive:     { backgroundColor: T.color.primary },
  step:          { fontFamily: T.font.mono, fontSize: T.size.micro, color: T.color.inkSubtle, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: T.space.xs },
  title:         { fontFamily: T.font.display, fontSize: 28, fontWeight: T.weight.bold, color: T.color.ink, letterSpacing: -0.5, marginBottom: T.space.xs },
  sub:           { fontSize: T.size.bodySm, color: T.color.inkMuted, marginBottom: T.space.xl, lineHeight: 20 },
  options:       { gap: T.space.sm },
  option:        { backgroundColor: T.color.surface, borderWidth: 1.5, borderColor: T.color.border, borderRadius: T.radius.lg, padding: T.space.md, flexDirection: 'row', alignItems: 'center', gap: T.space.md },
  optionActive:  { borderColor: T.color.primary },
  iconBox:       { width: 44, height: 44, borderRadius: T.radius.sm, backgroundColor: T.color.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconBoxActive: { backgroundColor: T.color.primary },
  optLabel:      { fontSize: T.size.body, fontWeight: T.weight.semibold, color: T.color.ink },
  optRange:      { fontSize: T.size.caption, color: T.color.inkMuted, fontFamily: T.font.mono, marginTop: 2 },
  radio:         { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: T.color.borderStrong, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioActive:   { backgroundColor: T.color.primary, borderColor: T.color.primary },
  timePickers:   { flexDirection: 'row', alignItems: 'center', gap: T.space.xs, marginTop: T.space.xs },
  timePill:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: T.color.primaryLight, borderRadius: T.radius.pill, paddingHorizontal: T.space.sm, paddingVertical: 5 },
  timePillText:  { fontSize: T.size.caption, fontFamily: T.font.mono, fontWeight: T.weight.semibold, color: T.color.primary },
  dash:          { fontSize: T.size.bodySm, color: T.color.inkMuted, fontFamily: T.font.mono },
  btnWrap:       { marginTop: 'auto', paddingBottom: T.space.lg },
  skip:          { fontSize: T.size.bodySm, color: T.color.inkMuted, fontWeight: T.weight.medium },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet:    { backgroundColor: T.color.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32 },
  modalHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: T.space.lg, borderBottomWidth: 1, borderBottomColor: T.color.border },
  modalTitle:    { fontSize: T.size.body, fontWeight: T.weight.semibold, color: T.color.ink },
  modalDone:     { paddingHorizontal: T.space.md, paddingVertical: T.space.xs, backgroundColor: T.color.primary, borderRadius: T.radius.pill },
  modalDoneText: { fontSize: T.size.bodySm, fontWeight: T.weight.bold, color: '#fff' },
})
