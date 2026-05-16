import React, { useRef, useState } from 'react'
import { View, Text, ScrollView, Dimensions, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { tokens as T } from '../../src/theme/tokens'
import Button from '../../src/components/Button'
import LivraLogo from '../../src/components/LivraLogo'

const { width } = Dimensions.get('window')

const slides = [
  {
    title: 'Livrare\nla ușa ta',
    body:  'Urmărești comanda live pe hartă. Știi exact când ajunge șoferul.',
    icon:  'map-pin' as const,
  },
  {
    title: 'Un pin,\norice adresă',
    body:  'Pune un pin o singură dată, chiar și în sate fără număr de stradă.',
    icon:  'navigation' as const,
  },
  {
    title: 'Toate comenzile,\nîntr-un singur loc',
    body:  'Fiecare magazin partener Livra livrează direct în aplicație.',
    icon:  'package' as const,
  },
]

export default function Onboarding() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const scrollRef = useRef<ScrollView>(null)
  const [page, setPage] = useState(0)

  const goNext = () => {
    if (page < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (page + 1) * width, animated: true })
      setPage(p => p + 1)
    } else {
      router.replace('/auth/phone')
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.logo}>
        <LivraLogo size={24} />
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={{ flex: 1 }}
      >
        {slides.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={styles.iconWrap}>
              <Feather name={slide.icon} size={52} color={T.color.primary} />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
        <View style={styles.btnWrap}>
          <Button
            label={page < slides.length - 1 ? 'Continuă' : 'Începe'}
            variant="accent"
            onPress={goNext}
          />
        </View>
        {page < slides.length - 1 && (
          <TouchableOpacity onPress={() => router.replace('/auth/phone')} style={styles.skip}>
            <Text style={styles.skipText}>Sari peste</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.color.bg },
  logo:    { paddingHorizontal: T.space.lg, paddingTop: T.space.md },
  slide:   { flex: 1, paddingHorizontal: T.space.xl, justifyContent: 'center', alignItems: 'flex-start', paddingBottom: T.space.xxl },
  iconWrap:{ width: 88, height: 88, borderRadius: T.radius.xl, backgroundColor: T.color.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: T.space.xxl },
  title:   { fontFamily: T.font.display, fontSize: 36, fontWeight: T.weight.bold, color: T.color.ink, letterSpacing: -1, lineHeight: 42, marginBottom: T.space.md },
  body:    { fontSize: T.size.body, color: T.color.inkMuted, lineHeight: 22 },
  footer:  { paddingHorizontal: T.space.lg, paddingBottom: T.space.lg, gap: T.space.md },
  dots:    { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot:     { width: 6, height: 6, borderRadius: 3, backgroundColor: T.color.borderStrong },
  dotActive:{ backgroundColor: T.color.primary, width: 20 },
  btnWrap: {},
  skip:    { alignItems: 'center', paddingVertical: T.space.xs },
  skipText:{ fontSize: T.size.bodySm, color: T.color.inkSubtle, fontWeight: T.weight.medium },
})
