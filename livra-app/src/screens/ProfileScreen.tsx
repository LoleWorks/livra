import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../lib/colors'
import { useUser } from '../lib/context'

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function ProfileScreen() {
  const { phone, name, clearUser } = useUser()
  const [notifDelivery, setNotifDelivery] = useState(true)
  const [notif10min, setNotif10min] = useState(true)
  const [notifETA, setNotifETA] = useState(false)

  const handleLogout = () => {
    Alert.alert('Deconectare', 'Ești sigur că vrei să te deconectezi?', [
      { text: 'Anulează', style: 'cancel' },
      { text: 'Deconectare', style: 'destructive', onPress: clearUser },
    ])
  }

  const userInitials = name ? initials(name) : '??'

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userInitials}</Text>
        </View>
        <Text style={styles.name}>{name ?? '—'}</Text>
        <Text style={styles.phone}>{phone ?? '—'}</Text>
      </View>

      <Text style={styles.groupTitle}>Cont</Text>
      <View style={styles.group}>
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="person-outline" size={18} color={colors.orange} />
          </View>
          <Text style={styles.rowLabel}>Nume</Text>
          <Text style={styles.rowValue}>{name ?? '—'}</Text>
        </View>
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <View style={styles.rowIcon}>
            <Ionicons name="call-outline" size={18} color={colors.orange} />
          </View>
          <Text style={styles.rowLabel}>Telefon</Text>
          <Text style={styles.rowValue}>{phone ?? '—'}</Text>
        </View>
      </View>

      <Text style={styles.groupTitle}>Notificări</Text>
      <View style={styles.group}>
        {[
          { icon: 'notifications-outline', label: 'Comandă expediată', val: notifDelivery, set: setNotifDelivery },
          { icon: 'alarm-outline', label: 'Curier la 10 minute', val: notif10min, set: setNotif10min },
          { icon: 'time-outline', label: 'Actualizări ETA', val: notifETA, set: setNotifETA },
        ].map((item, i, arr) => (
          <View key={item.label} style={[styles.row, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={styles.rowIcon}>
              <Ionicons name={item.icon as any} size={18} color={colors.orange} />
            </View>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Switch value={item.val} onValueChange={item.set} trackColor={{ true: colors.orange }} />
          </View>
        ))}
      </View>

      <Text style={styles.groupTitle}>Aplicație</Text>
      <View style={styles.group}>
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.orange} />
          </View>
          <Text style={styles.rowLabel}>Politică de confidențialitate</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.gray400} />
        </View>
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <View style={styles.rowIcon}>
            <Ionicons name="information-circle-outline" size={18} color={colors.orange} />
          </View>
          <Text style={styles.rowLabel}>Versiune</Text>
          <Text style={styles.rowValue}>1.0.0</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color={colors.red} />
        <Text style={styles.logoutText}>Deconectare</Text>
      </TouchableOpacity>

      <View style={styles.brandFooter}>
        <Text style={styles.brandName}>LIVRA</Text>
        <View style={styles.brandLine} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, paddingBottom: 48 },
  avatarSection: { alignItems: 'center', marginBottom: 28, paddingTop: 8 },
  avatar: {
    width: 72, height: 72, borderRadius: 24, backgroundColor: colors.orange,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: colors.white },
  name: { fontSize: 20, fontWeight: '700', color: colors.black, marginBottom: 4 },
  phone: { fontSize: 14, color: colors.gray400 },
  groupTitle: {
    fontSize: 12, fontWeight: '700', color: colors.gray400,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 8, marginTop: 4, paddingHorizontal: 4,
  },
  group: {
    backgroundColor: colors.white, borderRadius: 16, marginBottom: 20,
    overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: 1, borderBottomColor: colors.gray100, gap: 12,
  },
  rowIcon: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: '#fff0eb',
    alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 15, color: colors.black, fontWeight: '500' },
  rowValue: { fontSize: 14, color: colors.gray400 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 28,
    borderWidth: 1.5, borderColor: '#fee2e2',
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: colors.red },
  brandFooter: { alignItems: 'center', gap: 4 },
  brandName: { fontSize: 18, fontWeight: '700', color: colors.black, letterSpacing: 4 },
  brandLine: { width: 48, height: 3, backgroundColor: colors.orange, borderRadius: 2 },
})
