import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { tokens as T } from '../../src/theme/tokens'
import Button from '../../src/components/Button'
import ScreenHeader from '../../src/components/ScreenHeader'
import { supabase } from '../../src/lib/supabase'

export default function AuthPhone() {
  const router   = useRouter()
  const insets   = useSafeAreaInsets()
  const [phone,   setPhone]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 8) {
      Alert.alert('Număr invalid', 'Introdu 8 cifre (ex: 69 123 456).')
      return
    }
    const full = `+373${digits}`
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ phone: full })
    setLoading(false)
    if (error) {
      Alert.alert('Eroare', error.message)
      return
    }
    router.push({ pathname: '/auth/otp', params: { phone: full } })
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScreenHeader leftIcon="back" transparent />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Numărul tău{'\n'}de telefon</Text>
          <Text style={styles.sub}>Îți trimitem un cod de confirmare prin SMS.</Text>

          <View style={styles.inputRow}>
            <View style={styles.prefix}>
              <Text style={styles.prefixFlag}>🇲🇩</Text>
              <Text style={styles.prefixCode}>+373</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="79 123 456"
              placeholderTextColor={T.color.inkSubtle}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={12}
              autoFocus
            />
          </View>

          <View style={styles.btnWrap}>
            <Button label={loading ? 'Se trimite…' : 'Trimite codul'} variant="accent" onPress={handleSend} disabled={loading} />
          </View>

          <Text style={styles.legal}>
            Continuând, ești de acord cu{' '}
            <Text style={styles.link}>Termenii și condițiile</Text> Livra.
          </Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: T.color.bg },
  content:    { padding: T.space.lg, paddingTop: T.space.xl },
  title:      { fontFamily: T.font.display, fontSize: 32, fontWeight: T.weight.bold, color: T.color.ink, letterSpacing: -1, lineHeight: 38, marginBottom: T.space.sm },
  sub:        { fontSize: T.size.body, color: T.color.inkMuted, marginBottom: T.space.xxl, lineHeight: 22 },
  inputRow:   { flexDirection: 'row', backgroundColor: T.color.surface, borderRadius: T.radius.md, borderWidth: 1.5, borderColor: T.color.primary, overflow: 'hidden', marginBottom: T.space.lg },
  prefix:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: T.space.md, borderRightWidth: 1, borderRightColor: T.color.border, paddingVertical: T.space.md },
  prefixFlag: { fontSize: 20 },
  prefixCode: { fontSize: T.size.body, fontWeight: T.weight.semibold, color: T.color.ink, fontFamily: T.font.mono },
  input:      { flex: 1, fontSize: T.size.h3, fontWeight: T.weight.medium, color: T.color.ink, paddingHorizontal: T.space.md, paddingVertical: T.space.md, fontFamily: T.font.mono, letterSpacing: 1 },
  btnWrap:    { marginBottom: T.space.lg },
  legal:      { fontSize: T.size.caption, color: T.color.inkSubtle, textAlign: 'center', lineHeight: 18 },
  link:       { color: T.color.primary, fontWeight: T.weight.medium },
})
