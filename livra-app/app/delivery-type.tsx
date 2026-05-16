import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { tokens as T } from '../src/theme/tokens'

type IconName = React.ComponentProps<typeof Feather>['name']

const TYPES: { id: string; title: string; sub: string; icon: IconName; color: string }[] = [
  {
    id: 'store',
    title: 'De la magazin',
    sub: 'Ai cumpărat mobilă, electrocasnice sau altele și vrei livrare rapidă.',
    icon: 'shopping-bag',
    color: T.color.primary
  },
  {
    id: 'p2p',
    title: 'Adresă la Adresă',
    sub: 'Trimite ceva unui prieten, sau mută obiecte între locații.',
    icon: 'map-pin',
    color: '#007AFF'
  },
  {
    id: 'baggage',
    title: 'Bagaj peste hotare',
    sub: 'Transmite coletul la autocar/gara auto pentru a fi trimis în străinătate.',
    icon: 'globe',
    color: '#5856D6'
  }
]

export default function DeliveryType() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={T.color.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Alege tipul livrării</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Cum te putem ajuta astăzi?</Text>
        
        <View style={styles.list}>
          {TYPES.map((type) => (
            <TouchableOpacity 
              key={type.id} 
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => router.push({
                pathname: '/request-delivery',
                params: { type: type.id }
              })}
            >
              <View style={[styles.iconWrap, { backgroundColor: type.color + '15' }]}>
                <Feather name={type.icon} size={28} color={type.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{type.title}</Text>
                <Text style={styles.cardSub}>{type.sub}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={T.color.inkSubtle} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.info}>
          <Feather name="info" size={16} color={T.color.inkSubtle} />
          <Text style={styles.infoText}>
            Indiferent de alegere, un curier Livra va prelua coletul și se va asigura că ajunge la destinație în cel mai scurt timp.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.color.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: T.space.lg, paddingVertical: T.space.md },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: T.size.h3, fontWeight: T.weight.bold, color: T.color.ink },
  scroll: { padding: T.space.lg },
  intro: { fontSize: T.size.body, color: T.color.inkMuted, marginBottom: T.space.xl },
  list: { gap: T.space.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: T.space.lg,
    backgroundColor: T.color.surface,
    borderRadius: T.radius.xl,
    borderWidth: 1,
    borderColor: T.color.border,
    gap: T.space.md,
    ...T.shadow.sm
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: T.radius.lg,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitle: { fontSize: T.size.body, fontWeight: T.weight.bold, color: T.color.ink, marginBottom: 4 },
  cardSub: { fontSize: T.size.caption, color: T.color.inkSubtle, lineHeight: 18 },
  info: { flexDirection: 'row', gap: 10, marginTop: T.space.xxl, padding: T.space.md, backgroundColor: T.color.surface, borderRadius: T.radius.lg, borderStyle: 'dashed', borderWidth: 1, borderColor: T.color.border },
  infoText: { flex: 1, fontSize: T.size.micro, color: T.color.inkSubtle, lineHeight: 16 }
})
