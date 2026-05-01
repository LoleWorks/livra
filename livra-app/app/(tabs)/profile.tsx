import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { tokens as T } from '../../src/theme/tokens'
import { useAuth } from '../../src/context/AuthContext'
import { useOrders } from '../../src/context/OrdersContext'

const rows = [
  { icon: 'user',       label: 'Datele mele',        sub: '' },
  { icon: 'map-pin',    label: 'Locațiile mele',      sub: '' },
  { icon: 'clock',      label: 'Fereastră preferată', sub: '' },
  { icon: 'bell',       label: 'Notificări',          sub: 'Toate activate' },
  { icon: 'help-circle',label: 'Ajutor',              sub: '', route: '/help' },
  { icon: 'log-out',    label: 'Ieși din cont',       sub: '', danger: true },
]

export default function ProfileScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { customer, signOut } = useAuth()
  const { allStops } = useOrders()

  const name     = customer?.name ?? '—'
  const phone    = customer?.phone ?? ''
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  const timeWin  = customer?.preferred_time_window_start
    ? `${customer.preferred_time_window_start} – ${customer.preferred_time_window_end}`
    : 'Nesetat'

  const rowsWithSub = rows.map(r => ({
    ...r,
    sub: r.label === 'Locațiile mele'
      ? `${customer?.pins?.length ?? 0} salvate`
      : r.label === 'Fereastră preferată'
      ? timeWin
      : r.sub,
  }))

  const handleRow = (row: typeof rows[0] & { sub: string }) => {
    if (row.danger) {
      Alert.alert('Ieși din cont?', '', [
        { text: 'Anulează', style: 'cancel' },
        { text: 'Ieși', style: 'destructive', onPress: signOut },
      ])
      return
    }
    if (row.label === 'Ajutor') { router.push('/help' as any); return }
    if (row.label === 'Locațiile mele') { router.push('/(tabs)/pins'); return }
    if (row.label === 'Notificări') { router.push('/notifications'); return }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Profil</Text>
      </View>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(T.space.xl, insets.bottom + T.space.md) }]} showsVerticalScrollIndicator={false}>
        <View style={styles.userCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userPhone}>{phone}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          {[
            { n: String(allStops.filter(s => s.status === 'completed').length), l: 'Livrări' },
            { n: String(customer?.pins?.length ?? 0), l: 'Locații' },
          ].map((s, i) => (
            <View key={i} style={styles.stat}>
              <Text style={styles.statN}>{s.n}</Text>
              <Text style={styles.statL}>{s.l}</Text>
            </View>
          ))}
        </View>

        <View style={styles.settingsList}>
          {rowsWithSub.map((row, i) => (
            <TouchableOpacity key={i} onPress={() => handleRow(row)} style={[styles.settingRow, i < rowsWithSub.length - 1 && styles.settingRowBorder]}>
              <View style={styles.settingIcon}>
                <Feather name={row.icon as any} size={18} color={T.color.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, row.danger && { color: T.color.danger }]}>{row.label}</Text>
                {row.sub ? <Text style={styles.settingSub}>{row.sub}</Text> : null}
              </View>
              {!row.danger && <Feather name="chevron-right" size={18} color={T.color.inkSubtle} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: T.color.bg },
  titleRow:        { paddingHorizontal: T.space.lg, paddingTop: T.space.sm, paddingBottom: T.space.md },
  title:           { fontFamily: T.font.display, fontSize: 28, fontWeight: T.weight.bold, color: T.color.ink, letterSpacing: -0.5 },
  scroll:          { paddingHorizontal: T.space.lg, paddingBottom: T.space.xl, gap: T.space.lg },
  userCard:        { backgroundColor: T.color.ink, borderRadius: T.radius.lg, padding: T.space.lg, flexDirection: 'row', alignItems: 'center', gap: T.space.md },
  avatar:          { width: 56, height: 56, borderRadius: 28, backgroundColor: T.color.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText:      { fontFamily: T.font.display, fontSize: 22, fontWeight: T.weight.bold, color: '#fff' },
  userName:        { fontSize: T.size.h3, fontWeight: T.weight.bold, color: '#fff' },
  userPhone:       { fontSize: T.size.bodySm, color: 'rgba(255,255,255,0.6)', fontFamily: T.font.mono, marginTop: 2 },
  stats:           { flexDirection: 'row', gap: T.space.sm },
  stat:            { flex: 1, backgroundColor: T.color.surface, borderRadius: T.radius.md, borderWidth: 1, borderColor: T.color.border, padding: T.space.md, alignItems: 'center' },
  statN:           { fontFamily: T.font.display, fontSize: 22, fontWeight: T.weight.bold, color: T.color.ink },
  statL:           { fontSize: T.size.micro, fontFamily: T.font.mono, color: T.color.inkSubtle, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 2 },
  settingsList:    { backgroundColor: T.color.surface, borderRadius: T.radius.lg, borderWidth: 1, borderColor: T.color.border, overflow: 'hidden' },
  settingRow:      { flexDirection: 'row', alignItems: 'center', gap: T.space.sm, padding: T.space.md },
  settingRowBorder:{ borderBottomWidth: 1, borderBottomColor: T.color.border },
  settingIcon:     { width: 36, height: 36, borderRadius: T.radius.sm, backgroundColor: T.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  settingLabel:    { fontSize: T.size.bodySm, fontWeight: T.weight.medium, color: T.color.ink },
  settingSub:      { fontSize: T.size.caption, color: T.color.inkMuted, marginTop: 1 },
})
