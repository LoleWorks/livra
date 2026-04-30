import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { saveDriverId } from '../lib/storage'
import { registerPushToken } from '../lib/notifications'
import { logEvent } from '../lib/events'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../App'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', '✓']

export default function LoginScreen({ navigation }: Props) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)

  const handleKey = (key: string) => {
    if (key === '←') {
      setPin(p => p.slice(0, -1))
    } else if (key === '✓') {
      handleLogin()
    } else if (pin.length < 6) {
      setPin(p => p + key)
    }
  }

  const handleLogin = async () => {
    if (pin.length < 4) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('livra_drivers')
        .select('id, name, pin')
        .eq('pin', pin)
        .single()

      if (error || !data) {
        Alert.alert('PIN incorect', 'Verificați PIN-ul și încercați din nou.')
        setPin('')
        return
      }

      await saveDriverId(data.id)
      // Fire-and-forget: ask for notification permission and save the push token.
      registerPushToken(data.id).catch(err => console.warn('[push]', err))
      // Activity log: PIN login event for the dispatcher's audit trail
      logEvent({ driverId: data.id, eventType: 'login' })
      navigation.replace('Home', { driverId: data.id, driverName: data.name })
    } catch {
      Alert.alert('Eroare', 'Conexiune eșuată. Verificați internetul.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.logo}>Livra</Text>
          <Text style={styles.subtitle}>Introduceți PIN-ul șoferului</Text>
          <View style={styles.dots}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
            ))}
          </View>
        </View>

        <View style={styles.pad}>
          {DIGITS.map(key => (
            <TouchableOpacity
              key={key}
              style={[
                styles.key,
                key === '✓' && styles.keyConfirm,
                key === '←' && styles.keyBack,
              ]}
              onPress={() => handleKey(key)}
              disabled={loading}
            >
              {loading && key === '✓' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[
                  styles.keyText,
                  key === '✓' && styles.keyConfirmText,
                ]}>
                  {key}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  top: {
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#2563eb',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
  },
  dots: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#2563eb',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#2563eb',
  },
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  key: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#111827',
  },
  keyConfirm: {
    backgroundColor: '#2563eb',
  },
  keyConfirmText: {
    color: '#fff',
    fontSize: 22,
  },
  keyBack: {
    backgroundColor: '#f3f4f6',
  },
})
