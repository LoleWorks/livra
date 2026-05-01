import React from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { clearDriverId } from '../lib/storage'
import { logEvent } from '../lib/events'
import { stopTracking } from '../lib/tracking'
import { T } from '../lib/tokens'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../App'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>
  route: RouteProp<RootStackParamList, 'Profile'>
}

const SETTINGS_ITEMS = [
  { label: 'Datele mele', icon: 'user' as const },
  { label: 'Setări notificări', icon: 'bell' as const },
  { label: 'Ajutor', icon: 'help-circle' as const },
]

function shortName(full: string): string {
  const parts = full.trim().split(' ')
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0]
}

export default function ProfileScreen({ navigation, route: navRoute }: Props) {
  const { driverId, driverName } = navRoute.params
  const insets = useSafeAreaInsets()

  const handleLogout = () => {
    Alert.alert('Ieși din cont', 'Ești sigur că vrei să te deconectezi?', [
      { text: 'Anulează', style: 'cancel' },
      {
        text: 'Ieși',
        style: 'destructive',
        onPress: async () => {
          logEvent({ driverId, eventType: 'logout' })
          await stopTracking(driverId)
          await clearDriverId()
          navigation.replace('Login')
        },
      },
    ])
  }

  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} accessibilityLabel="Înapoi">
          <Feather name="chevron-left" size={22} color={T.color.ink} />
        </TouchableOpacity>
        <View>
          <Text style={s.headerSub}>ȘOFER LIVRA</Text>
          <Text style={s.headerTitle}>{shortName(driverName)}</Text>
        </View>
      </View>

      <View style={s.body}>
        {/* Settings list */}
        <View style={s.settingsList}>
          {SETTINGS_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[s.settingsRow, i < SETTINGS_ITEMS.length - 1 && s.settingsRowBorder]}
              activeOpacity={0.7}
            >
              <Text style={s.settingsLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={18} color={T.color.inkSubtle} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <View style={[s.settingsList, { marginTop: 12 }]}>
          <TouchableOpacity style={s.settingsRow} onPress={handleLogout} activeOpacity={0.7}>
            <Text style={[s.settingsLabel, { color: T.color.danger }]}>Ieși din cont</Text>
            <Feather name="log-out" size={18} color={T.color.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.color.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: T.font.display,
    fontSize: 28,
    fontWeight: '700',
    color: T.color.ink,
    letterSpacing: -0.5,
  },
  body: { flex: 1, padding: 20 },
  settingsList: {
    backgroundColor: T.color.surface,
    borderRadius: T.radius.lg,
    borderWidth: 1,
    borderColor: T.color.border,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: T.color.border,
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: T.color.ink,
  },
})
