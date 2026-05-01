import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { tokens as T } from '../../src/theme/tokens'
import ScreenHeader from '../../src/components/ScreenHeader'
import Button from '../../src/components/Button'
import { supabase } from '../../src/lib/supabase'
import { useAuth } from '../../src/context/AuthContext'

export default function OnboardingName() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { user } = useAuth()
  const [first,   setFirst]   = useState('')
  const [last,    setLast]    = useState('')
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    if (!first.trim()) { Alert.alert('Lipsește prenumele'); return }
    setLoading(true)
    await supabase.from('livra_customers').upsert({
      id:    user!.id,
      phone: user!.phone!,
      name:  `${first.trim()} ${last.trim()}`.trim(),
      pins:  [],
    })
    setLoading(false)
    router.push('/onboarding/time-window')
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScreenHeader leftIcon="back" transparent />
        <View style={styles.content}>
          <View style={styles.progress}>
            {[1,2,3,4].map(s => <View key={s} style={[styles.bar, s <= 2 && styles.barActive]} />)}
          </View>
          <Text style={styles.step}>Pasul 2 din 4</Text>
          <Text style={styles.title}>Cum te numești?</Text>
          <Text style={styles.sub}>Șoferul vede acest nume când ajunge la tine.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>PRENUME</Text>
            <TextInput style={styles.input} placeholder="Andrei" placeholderTextColor={T.color.inkSubtle} value={first} onChangeText={setFirst} autoFocus autoCapitalize="words" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>NUME DE FAMILIE</Text>
            <TextInput style={styles.input} placeholder="Popescu" placeholderTextColor={T.color.inkSubtle} value={last} onChangeText={setLast} autoCapitalize="words" />
          </View>

          <View style={styles.btnWrap}>
            <Button label={loading ? 'Se salvează…' : 'Continuă'} variant="primary" onPress={handleContinue} disabled={loading} />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root:      { flex: 1, backgroundColor: T.color.bg },
  content:   { flex: 1, padding: T.space.lg },
  progress:  { flexDirection: 'row', gap: 6, marginBottom: T.space.xl },
  bar:       { flex: 1, height: 4, borderRadius: 2, backgroundColor: T.color.borderStrong },
  barActive: { backgroundColor: T.color.primary },
  step:      { fontFamily: T.font.mono, fontSize: T.size.micro, color: T.color.inkSubtle, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: T.space.xs },
  title:     { fontFamily: T.font.display, fontSize: 28, fontWeight: T.weight.bold, color: T.color.ink, letterSpacing: -0.5, marginBottom: T.space.xs },
  sub:       { fontSize: T.size.bodySm, color: T.color.inkMuted, marginBottom: T.space.xl, lineHeight: 20 },
  field:     { marginBottom: T.space.md },
  label:     { fontFamily: T.font.mono, fontSize: T.size.micro, color: T.color.inkSubtle, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 },
  input:     { height: 56, backgroundColor: T.color.surface, borderWidth: 1.5, borderColor: T.color.primary, borderRadius: T.radius.md, paddingHorizontal: T.space.md, fontSize: 18, fontWeight: T.weight.medium, color: T.color.ink },
  btnWrap:   { marginTop: 'auto', paddingBottom: T.space.lg },
})
