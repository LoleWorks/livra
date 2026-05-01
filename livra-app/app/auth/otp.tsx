import React, { useRef, useState } from 'react'
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { tokens as T } from '../../src/theme/tokens'
import ScreenHeader from '../../src/components/ScreenHeader'
import Button from '../../src/components/Button'
import { supabase } from '../../src/lib/supabase'
import { useAuth } from '../../src/context/AuthContext'

export default function AuthOTP() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { phone } = useLocalSearchParams<{ phone: string }>()
  const { refreshCustomer, customer } = useAuth()
  const [code,    setCode]    = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const inputs = useRef<(TextInput | null)[]>([])

  const handleChange = (val: string, i: number) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next  = [...code]
    next[i]     = digit
    setCode(next)
    if (digit && i < 5) inputs.current[i + 1]?.focus()
    if (!digit && i > 0) inputs.current[i - 1]?.focus()
  }

  const handlePaste = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 6).split('')
    const next   = [...code]
    digits.forEach((d, i) => { next[i] = d })
    setCode(next)
    inputs.current[Math.min(digits.length, 5)]?.focus()
  }

  const handleVerify = async () => {
    const token = code.join('')
    if (token.length < 6) { Alert.alert('Cod incomplet', 'Introdu toate cele 6 cifre.'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.verifyOtp({ phone: phone!, token, type: 'sms' })
    setLoading(false)
    if (error) { Alert.alert('Cod incorect', error.message); return }
    // Check if customer profile exists
    const uid = data.user?.id
    if (!uid) return
    const { data: existing } = await supabase.from('livra_customers').select('id').eq('id', uid).single()
    if (existing) {
      router.replace('/(tabs)/home')
    } else {
      router.replace('/onboarding/name')
    }
  }

  const resend = async () => {
    const { error } = await supabase.auth.signInWithOtp({ phone: phone! })
    if (!error) Alert.alert('Cod retrimis', 'Verifică SMS-ul.')
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScreenHeader leftIcon="back" transparent />
        <View style={styles.content}>
          <Text style={styles.title}>Introdu codul</Text>
          <Text style={styles.sub}>Codul de 6 cifre trimis pe {phone}</Text>

          <View style={styles.boxes}>
            {code.map((digit, i) => (
              <TextInput
                key={i}
                ref={r => { inputs.current[i] = r }}
                style={[styles.box, digit ? styles.boxFilled : null]}
                value={digit}
                onChangeText={v => {
                  if (v.length > 1) { handlePaste(v); return }
                  handleChange(v, i)
                }}
                keyboardType="number-pad"
                maxLength={6}
                selectTextOnFocus
                autoFocus={i === 0}
              />
            ))}
          </View>

          <Button
            label={loading ? 'Se verifică…' : 'Confirmă'}
            variant="accent"
            onPress={handleVerify}
            disabled={loading}
          />

          <TouchableOpacity onPress={resend} style={styles.resend}>
            <Text style={styles.resendText}>Nu ai primit codul? <Text style={styles.resendLink}>Retrimite</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: T.color.bg },
  content:    { flex: 1, padding: T.space.lg, paddingTop: T.space.xl },
  title:      { fontFamily: T.font.display, fontSize: 32, fontWeight: T.weight.bold, color: T.color.ink, letterSpacing: -1, marginBottom: T.space.xs },
  sub:        { fontSize: T.size.body, color: T.color.inkMuted, marginBottom: T.space.xxl, lineHeight: 22 },
  boxes:      { flexDirection: 'row', gap: T.space.sm, marginBottom: T.space.xl, justifyContent: 'center' },
  box:        { width: 48, height: 56, borderRadius: T.radius.md, borderWidth: 1.5, borderColor: T.color.border, backgroundColor: T.color.surface, textAlign: 'center', fontSize: T.size.h2, fontWeight: T.weight.bold, color: T.color.ink, fontFamily: T.font.mono },
  boxFilled:  { borderColor: T.color.primary },
  resend:     { alignItems: 'center', marginTop: T.space.lg },
  resendText: { fontSize: T.size.bodySm, color: T.color.inkMuted },
  resendLink: { color: T.color.primary, fontWeight: T.weight.semibold },
})
