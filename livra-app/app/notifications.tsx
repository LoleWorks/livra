import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { tokens as T } from '../src/theme/tokens'
import ScreenHeader from '../src/components/ScreenHeader'

const MOCK = [
  { title: 'Șoferul e la 10 minute',  body: 'Pregătește-te, livrarea ta e aproape.', time: 'Acum',      isNew: true,  icon: 'truck' },
  { title: 'Comandă trimisă spre tine', body: 'Șoferul a preluat coletul. Urmărește pe hartă.', time: 'Acum 12 min', isNew: true,  icon: 'package' },
  { title: 'Livrare confirmată',      body: 'Comanda ta a ajuns cu succes.',          time: 'Ieri, 17:20', isNew: false, icon: 'check-circle' },
  { title: 'Evaluează livrarea',      body: 'Cum a fost experiența ta?',              time: 'Ieri, 14:08', isNew: false, icon: 'star' },
]

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScreenHeader leftIcon="back" title="Notificări" />
      <ScrollView contentContainerStyle={[styles.list, { paddingBottom: Math.max(T.space.xl, insets.bottom + T.space.md) }]} showsVerticalScrollIndicator={false}>
        {MOCK.map((n, i) => (
          <View key={i} style={[styles.card, n.isNew && styles.cardNew]}>
            {n.isNew && <View style={styles.newDot} />}
            <View style={styles.iconBox}>
              <Feather name={n.icon as any} size={20} color={T.color.primary} />
            </View>
            <View style={styles.body}>
              <Text style={styles.title}>{n.title}</Text>
              <Text style={styles.bodyText}>{n.body}</Text>
              <Text style={styles.time}>{n.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.color.bg },
  list:    { padding: T.space.lg, gap: T.space.xs, paddingBottom: T.space.xl },
  card:    { flexDirection: 'row', gap: T.space.sm, backgroundColor: T.color.surface, borderRadius: T.radius.lg, borderWidth: 1, borderColor: T.color.border, padding: T.space.md, position: 'relative' },
  cardNew: { borderColor: T.color.primary },
  newDot:  { position: 'absolute', top: T.space.md, right: T.space.md, width: 8, height: 8, borderRadius: 4, backgroundColor: T.color.primary },
  iconBox: { width: 40, height: 40, borderRadius: T.radius.sm, backgroundColor: T.color.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  body:    { flex: 1, paddingRight: T.space.sm },
  title:   { fontSize: T.size.bodySm, fontWeight: T.weight.semibold, color: T.color.ink, marginBottom: 2 },
  bodyText:{ fontSize: T.size.caption, color: T.color.inkMuted, lineHeight: 18 },
  time:    { fontSize: T.size.micro, fontFamily: T.font.mono, color: T.color.inkSubtle, marginTop: 6, letterSpacing: 0.3 },
})
