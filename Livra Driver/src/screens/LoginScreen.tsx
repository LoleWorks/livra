import React, { useState } from 'react'
import {
  View, Text, StyleSheet,
  ActivityIndicator, SafeAreaView, Pressable,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { supabase } from '../lib/supabase'
import { saveDriverId } from '../lib/storage'
import { registerPushToken } from '../lib/notifications'
import { logEvent } from '../lib/events'
import { T } from '../lib/tokens'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../App'

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'> }

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function LoginScreen({ navigation }: Props) {
  const [digits, setDigits] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const insets = useSafeAreaInsets()

  const filledCount = digits.length

  const handleKey = (key: string) => {
    if (loading) return
    if (key === '⌫') {
      setDigits(d => d.slice(0, -1))
      setError('')
    } else if (key === '') {
      // blank key — do nothing
    } else if (digits.length < 4) {
      const next = [...digits, key]
      setDigits(next)
      setError('')
      if (next.length === 4) handleLogin(next.join(''))
    }
  }

  const handleLogin = async (pin?: string) => {
    const code = pin ?? digits.join('')
    if (code.length < 4) return
    setLoading(true)
    setError('')
    try {
      const { data, error: dbErr } = await supabase
        .from('livra_drivers')
        .select('id, name, pin')
        .eq('pin', code)
        .single()

      if (dbErr || !data) {
        setError('Cod incorect. Verificați și încercați din nou.')
        setDigits([])
        return
      }

      await saveDriverId(data.id)
      registerPushToken(data.id).catch(err => console.warn('[push]', err))
      logEvent({ driverId: data.id, eventType: 'login' })

      supabase.from('livra_drivers').update({
        device_name:        Device.brand ?? null,
        device_model:       Device.modelName ?? null,
        device_os:          Device.osName ?? null,
        device_os_version:  Device.osVersion ?? null,
        device_app_version: Constants.expoConfig?.version ?? null,
        last_login:         new Date().toISOString(),
      }).eq('id', data.id).then(() => {})

      navigation.replace('Home', { driverId: data.id, driverName: data.name })
    } catch {
      setError('Conexiune eșuată. Verificați internetul.')
      setDigits([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={[s.container, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
        {/* Brand header */}
        <View style={s.brand}>
          <Text style={s.brandTitle}>Livra Șofer</Text>
          <Text style={s.brandSub}>Versiunea 1.0</Text>
        </View>

        {/* Code input */}
        <View style={s.inputSection}>
          <Text style={s.inputLabel}>CODUL ȘOFERULUI</Text>
          <Text style={s.inputHelper}>Cele 4 cifre primite de la managerul tău.</Text>
          {error ? <Text style={s.errorText}>{error}</Text> : null}
          <View style={s.cells}>
            {[0,1,2,3].map(i => (
              <View key={i} style={[
                s.cell,
                i === filledCount && !loading ? s.cellActive : null,
                i < filledCount ? s.cellFilled : null,
              ]}>
                <Text style={s.cellText}>{digits[i] ?? ''}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {/* Keypad */}
        <View style={s.keypad}>
          {KEYS.map((key, idx) => {
            if (key === '') {
              return <View key={idx} style={s.keyEmpty} />
            }
            if (key === '⌫') {
              return (
                <Pressable
                  key={idx}
                  style={s.keyBackspace}
                  onPress={() => handleKey('⌫')}
                  accessibilityLabel="Șterge ultima cifră"
                >
                  <Feather name="delete" size={26} color={T.color.ink} />
                </Pressable>
              )
            }
            return (
              <Pressable
                key={idx}
                style={({ pressed }) => [s.key, pressed && s.keyPressed]}
                onPress={() => handleKey(key)}
              >
                <Text style={s.keyText}>{key}</Text>
              </Pressable>
            )
          })}
        </View>

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [s.cta, pressed && s.ctaPressed, loading && s.ctaDisabled]}
          onPress={() => handleLogin()}
          disabled={loading || digits.length < 4}
          accessibilityLabel="Intră în cont"
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.ctaText}>Intră în cont</Text>
          }
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: T.color.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  brand: {
    marginBottom: 32,
  },
  brandTitle: {
    fontFamily: T.font.display,
    fontSize: 28,
    fontWeight: '700',
    color: T.color.ink,
    letterSpacing: -1,
  },
  brandSub: {
    fontSize: 13,
    color: T.color.inkMuted,
    marginTop: 4,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: T.font.mono,
    fontSize: 11,
    color: T.color.inkSubtle,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  inputHelper: {
    fontSize: 13,
    color: T.color.inkMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: T.color.danger,
    marginBottom: 12,
  },
  cells: {
    flexDirection: 'row',
    gap: 8,
  },
  cell: {
    flex: 1,
    height: 64,
    backgroundColor: T.color.surface,
    borderWidth: 1.5,
    borderColor: T.color.border,
    borderRadius: T.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: {
    borderColor: T.color.primary,
  },
  cellFilled: {
    borderColor: T.color.border,
  },
  cellText: {
    fontFamily: T.font.mono,
    fontSize: 28,
    fontWeight: '700',
    color: T.color.ink,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  key: {
    width: '30%',
    flexGrow: 1,
    height: 64,
    backgroundColor: T.color.surface,
    borderWidth: 1,
    borderColor: T.color.border,
    borderRadius: T.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    backgroundColor: T.color.surfaceAlt,
  },
  keyEmpty: {
    width: '30%',
    flexGrow: 1,
    height: 64,
  },
  keyBackspace: {
    width: '30%',
    flexGrow: 1,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 26,
    fontWeight: '600',
    color: T.color.ink,
  },
  cta: {
    height: 64,
    backgroundColor: T.color.ink,
    borderRadius: T.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
})
