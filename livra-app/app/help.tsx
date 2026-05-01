import React from 'react'
import { View, Text, ScrollView, Linking, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { tokens as T } from '../src/theme/tokens'
import ScreenHeader from '../src/components/ScreenHeader'

const FAQ = [
  {
    q: 'Cum urmăresc comanda mea?',
    a: 'Din ecranul principal apasă "Urmărește live" pentru a vedea poziția șoferului în timp real.',
  },
  {
    q: 'Cum schimb fereastra de livrare?',
    a: 'Mergi la Profil → Fereastră preferată și selectează intervalul orar care ți se potrivește.',
  },
  {
    q: 'Ce fac dacă nu am primit comanda?',
    a: 'Contactează-ne la ajutor@livra.md sau folosește butonul de mai jos.',
  },
  {
    q: 'Pot salva mai multe adrese?',
    a: 'Da! Din tab-ul Locații poți adăuga oricâte adrese dorești.',
  },
]

export default function HelpScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScreenHeader leftIcon="back" title="Ajutor" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>ÎNTREBĂRI FRECVENTE</Text>
        {FAQ.map((item, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.question}>{item.q}</Text>
            <Text style={styles.answer}>{item.a}</Text>
          </View>
        ))}
        <Text style={styles.sectionLabel}>CONTACT</Text>
        <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('mailto:ajutor@livra.md')}>
          <View style={styles.contactIcon}><Feather name="mail" size={18} color={T.color.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactVal}>ajutor@livra.md</Text>
          </View>
          <Feather name="chevron-right" size={16} color={T.color.inkSubtle} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('tel:+37322000000')}>
          <View style={styles.contactIcon}><Feather name="phone" size={18} color={T.color.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactLabel}>Telefon</Text>
            <Text style={styles.contactVal}>+373 22 000 000</Text>
          </View>
          <Feather name="chevron-right" size={16} color={T.color.inkSubtle} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: T.color.bg },
  scroll:       { padding: T.space.lg, gap: T.space.sm, paddingBottom: T.space.xl },
  sectionLabel: { fontFamily: T.font.mono, fontSize: T.size.micro, color: T.color.inkSubtle, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: T.space.sm, marginBottom: T.space.xs },
  card:         { backgroundColor: T.color.surface, borderRadius: T.radius.lg, borderWidth: 1, borderColor: T.color.border, padding: T.space.md, gap: T.space.xs },
  question:     { fontSize: T.size.bodySm, fontWeight: T.weight.semibold, color: T.color.ink },
  answer:       { fontSize: T.size.caption, color: T.color.inkMuted, lineHeight: 18 },
  contactRow:   { flexDirection: 'row', alignItems: 'center', gap: T.space.sm, backgroundColor: T.color.surface, borderRadius: T.radius.lg, borderWidth: 1, borderColor: T.color.border, padding: T.space.md },
  contactIcon:  { width: 36, height: 36, borderRadius: T.radius.sm, backgroundColor: T.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontSize: T.size.caption, color: T.color.inkMuted },
  contactVal:   { fontSize: T.size.bodySm, fontWeight: T.weight.medium, color: T.color.ink },
})
