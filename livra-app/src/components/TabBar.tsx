import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { tokens as T } from '../theme/tokens'

type TabId = 'home' | 'orders' | 'pins' | 'profile'

const tabs: { id: TabId; label: string; icon: string; route: string }[] = [
  { id: 'home',    label: 'Acasă',   icon: 'home',    route: '/(tabs)/home'    },
  { id: 'orders',  label: 'Comenzi', icon: 'package', route: '/(tabs)/orders'  },
  { id: 'pins',    label: 'Locații', icon: 'map-pin', route: '/(tabs)/pins'    },
  { id: 'profile', label: 'Profil',  icon: 'user',    route: '/(tabs)/profile' },
]

export default function TabBar() {
  const router   = useRouter()
  const pathname = usePathname()
  const insets   = useSafeAreaInsets()

  const activeId = tabs.find(t => pathname.includes(t.id))?.id ?? 'home'

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {tabs.map(tab => {
        const active = tab.id === activeId
        const color  = active ? T.color.primary : T.color.inkSubtle
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => router.replace(tab.route as any)}
            activeOpacity={0.7}
          >
            <Feather name={tab.icon as any} size={22} color={color} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: T.color.border,
    backgroundColor: T.color.surface,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontSize: T.size.micro,
    fontFamily: T.font.body,
    fontWeight: T.weight.semibold,
    letterSpacing: 0.2,
  },
})
