import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../lib/colors'

type RowProps = {
  icon: string
  label: string
  value?: string
  onPress?: () => void
  rightElement?: React.ReactNode
}

function SettingRow({ icon, label, value, onPress, rightElement }: RowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon as any} size={18} color={colors.orange} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {rightElement}
        {onPress && !rightElement && (
          <Ionicons name="chevron-forward" size={16} color={colors.gray400} />
        )}
      </View>
    </TouchableOpacity>
  )
}

export default function ProfileScreen() {
  const [notifDelivery, setNotifDelivery] = useState(true)
  const [notif10min, setNotif10min] = useState(true)
  const [notifETA, setNotifETA] = useState(false)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AP</Text>
        </View>
        <Text style={styles.name}>Andrei Popescu</Text>
        <Text style={styles.phone}>+373 79 000 000</Text>
      </View>

      {/* Account */}
      <Text style={styles.groupTitle}>Cont</Text>
      <View style={styles.group}>
        <SettingRow icon="person-outline" label="Nume" value="Andrei Popescu" onPress={() => {}} />
        <SettingRow icon="call-outline" label="Telefon" value="+373 79 000 000" onPress={() => {}} />
      </View>

      {/* Notifications */}
      <Text style={styles.groupTitle}>Notificări</Text>
      <View style={styles.group}>
        <SettingRow
          icon="notifications-outline"
          label="Comandă expediată"
          rightElement={<Switch value={notifDelivery} onValueChange={setNotifDelivery} trackColor={{ true: colors.orange }} />}
        />
        <SettingRow
          icon="alarm-outline"
          label="Curier la 10 minute"
          rightElement={<Switch value={notif10min} onValueChange={setNotif10min} trackColor={{ true: colors.orange }} />}
        />
        <SettingRow
          icon="time-outline"
          label="Actualizări ETA"
          rightElement={<Switch value={notifETA} onValueChange={setNotifETA} trackColor={{ true: colors.orange }} />}
        />
      </View>

      {/* About */}
      <Text style={styles.groupTitle}>Aplicație</Text>
      <View style={styles.group}>
        <SettingRow icon="shield-checkmark-outline" label="Politică de confidențialitate" onPress={() => {}} />
        <SettingRow icon="document-text-outline" label="Termeni și condiții" onPress={() => {}} />
        <SettingRow icon="information-circle-outline" label="Versiune" value="1.0.0" />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn}>
        <Ionicons name="log-out-outline" size={18} color={colors.red} />
        <Text style={styles.logoutText}>Deconectare</Text>
      </TouchableOpacity>

      {/* Brand footer */}
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: colors.white },
  name: { fontSize: 20, fontWeight: '700', color: colors.black, marginBottom: 4 },
  phone: { fontSize: 14, color: colors.gray400 },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  group: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    gap: 12,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#fff0eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 15, color: colors.black, fontWeight: '500' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 14, color: colors.gray400 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: '#fee2e2',
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: colors.red },
  brandFooter: { alignItems: 'center', gap: 4 },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: 4,
  },
  brandLine: {
    width: 48,
    height: 3,
    backgroundColor: colors.orange,
    borderRadius: 2,
  },
})
