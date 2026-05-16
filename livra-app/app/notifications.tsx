import React, { useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { tokens as T } from '../src/theme/tokens'
import ScreenHeader from '../src/components/ScreenHeader'
import { useNotifications } from '../src/context/NotificationsContext'

function formatTime(iso: string): string {
  const d    = new Date(iso)
  const now  = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60)   return 'Acum'
  if (diff < 3600) return `Acum ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Acum ${Math.floor(diff / 3600)} h`
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString())
    return `Ieri, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export default function NotificationsScreen() {
  const insets             = useSafeAreaInsets()
  const router             = useRouter()
  const { notifs, markRead, markAllRead } = useNotifications()

  useEffect(() => {
    markAllRead()
  }, [])

  function handleTap(n: typeof notifs[0]) {
    markRead(n.id)
    if (n.awb) {
      const url = `/parcel-tracking?awb=${encodeURIComponent(n.awb)}${n.carrier ? `&carrier=${encodeURIComponent(n.carrier)}` : ''}`
      router.push(url as any)
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScreenHeader leftIcon="back" title="Notificari" />
      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: Math.max(T.space.xl, insets.bottom + T.space.md) }]}
        showsVerticalScrollIndicator={false}
      >
        {notifs.length === 0 && (
          <View style={styles.empty}>
            <Feather name="bell-off" size={36} color={T.color.inkSubtle} />
            <Text style={styles.emptyText}>Nicio notificare inca</Text>
          </View>
        )}
        {notifs.map(n => (
          <TouchableOpacity
            key={n.id}
            activeOpacity={n.awb ? 0.7 : 1}
            onPress={() => handleTap(n)}
            style={[styles.card, !n.read && styles.cardNew]}
          >
            {!n.read && <View style={styles.newDot} />}
            <View style={styles.iconBox}>
              <Feather name="package" size={20} color={T.color.primary} />
            </View>
            <View style={styles.body}>
              <Text style={styles.title}>{n.title}</Text>
              <Text style={styles.bodyText}>{n.body}</Text>
              <Text style={styles.time}>{formatTime(n.time)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root:     { flex: 1, backgroundColor: T.color.bg },
  list:     { padding: T.space.lg, gap: T.space.xs, paddingBottom: T.space.xl },
  empty:    { alignItems: 'center', paddingTop: 80, gap: T.space.md },
  emptyText:{ fontSize: T.size.body, color: T.color.inkMuted },
  card:     { flexDirection: 'row', gap: T.space.sm, backgroundColor: T.color.surface, borderRadius: T.radius.lg, borderWidth: 1, borderColor: T.color.border, padding: T.space.md, position: 'relative' },
  cardNew:  { borderColor: T.color.primary },
  newDot:   { position: 'absolute', top: T.space.md, right: T.space.md, width: 8, height: 8, borderRadius: 4, backgroundColor: T.color.primary },
  iconBox:  { width: 40, height: 40, borderRadius: T.radius.sm, backgroundColor: T.color.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  body:     { flex: 1, paddingRight: T.space.sm },
  title:    { fontSize: T.size.bodySm, fontWeight: T.weight.semibold, color: T.color.ink, marginBottom: 2 },
  bodyText: { fontSize: T.size.caption, color: T.color.inkMuted, lineHeight: 18 },
  time:     { fontSize: T.size.micro, fontFamily: T.font.mono, color: T.color.inkSubtle, marginTop: 6, letterSpacing: 0.3 },
})
