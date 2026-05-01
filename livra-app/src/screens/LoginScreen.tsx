import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useUser } from '../lib/context'
import { colors } from '../lib/colors'

export default function LoginScreen() {
  const { setUser } = useUser()
  const insets = useSafeAreaInsets()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const valid = name.trim().length >= 2 && phone.replace(/\D/g, '').length >= 8

  const handleContinue = async () => {
    if (!valid || loading) return
    setLoading(true)
    setError('')
    try {
      await setUser(phone.trim(), name.trim())
    } catch {
      setError('A apărut o eroare. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={[s.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[s.container, { paddingBottom: Math.max(insets.bottom + 16, 32) }]}>
        {/* Brand */}
        <View style={s.brand}>
          <Text style={s.brandName}>LIVRA</Text>
          <View style={s.brandLine} />
          <Text style={s.brandSub}>Urmărire livrări</Text>
        </View>

        {/* Form */}
        <View style={s.form}>
          <Text style={s.label}>NUMELE TĂU</Text>
          <TextInput
            style={s.input}
            placeholder="Ex: Ion Popescu"
            placeholderTextColor={colors.gray400}
            value={name}
            onChangeText={t => { setName(t); setError('') }}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Text style={[s.label, { marginTop: 16 }]}>NUMĂR DE TELEFON</Text>
          <TextInput
            style={s.input}
            placeholder="+373 79 000 000"
            placeholderTextColor={colors.gray400}
            value={phone}
            onChangeText={t => { setPhone(t); setError('') }}
            keyboardType="phone-pad"
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />

          {error ? <Text style={s.error}>{error}</Text> : null}

          <Text style={s.hint}>
            Vom folosi numărul tău pentru a găsi coletele tale active și istoricul livrărilor.
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[s.btn, (!valid || loading) && s.btnDisabled]}
          onPress={handleContinue}
          disabled={!valid || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Continuă</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  brand: { alignItems: 'center', marginBottom: 48 },
  brandName: { fontSize: 32, fontWeight: '700', color: colors.black, letterSpacing: 6 },
  brandLine: { width: 40, height: 3, backgroundColor: colors.orange, borderRadius: 2, marginTop: 6, marginBottom: 10 },
  brandSub: { fontSize: 14, color: colors.gray500 },
  form: {},
  label: {
    fontSize: 11, fontWeight: '700', color: colors.gray400,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
  },
  input: {
    height: 52, backgroundColor: colors.white, borderRadius: 14,
    paddingHorizontal: 16, fontSize: 16, color: colors.black,
    borderWidth: 1.5, borderColor: colors.gray100,
  },
  hint: { fontSize: 13, color: colors.gray400, lineHeight: 20, marginTop: 14 },
  error: { fontSize: 13, color: colors.red, marginTop: 8 },
  btn: {
    height: 56, backgroundColor: colors.black, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 16, fontWeight: '700', color: colors.white },
})
