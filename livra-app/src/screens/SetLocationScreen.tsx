import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../lib/colors'
import type { RootStackParamList } from '../types'

type Props = NativeStackScreenProps<RootStackParamList, 'SetLocation'>

const SUGGESTIONS = ['Acasă', 'Birou', 'La Mama', 'Alt loc']

export default function SetLocationScreen({ route }: Props) {
  const navigation = useNavigation()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  function save() {
    if (!name.trim() || !address.trim()) return
    // TODO: save to API / local storage
    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Map placeholder */}
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={48} color={colors.gray400} />
          <Text style={styles.mapNote}>Selectarea pe hartă disponibilă în versiunea completă</Text>
        </View>

        {/* Address */}
        <Text style={styles.label}>Adresă</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Bd. Dacia 18, ap. 3, Chișinău"
          placeholderTextColor={colors.gray400}
          value={address}
          onChangeText={setAddress}
        />

        {/* Name */}
        <Text style={styles.label}>Numește locația</Text>
        <View style={styles.suggestions}>
          {SUGGESTIONS.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, name === s && styles.chipActive]}
              onPress={() => setName(s)}
            >
              <Text style={[styles.chipText, name === s && styles.chipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Sau scrie un nume..."
          placeholderTextColor={colors.gray400}
          value={name}
          onChangeText={setName}
        />

        <TouchableOpacity
          style={[styles.saveBtn, (!name.trim() || !address.trim()) && styles.saveBtnDisabled]}
          onPress={save}
          disabled={!name.trim() || !address.trim()}
        >
          <Text style={styles.saveBtnText}>Salvează locația</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, paddingBottom: 40 },
  mapPlaceholder: {
    height: 180,
    backgroundColor: colors.white,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    borderStyle: 'dashed',
  },
  mapNote: { fontSize: 13, color: colors.gray400, textAlign: 'center', paddingHorizontal: 24 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.gray200,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.black,
    backgroundColor: colors.white,
    marginBottom: 20,
  },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.gray100 },
  chipActive: { backgroundColor: colors.orange },
  chipText: { fontSize: 14, color: colors.gray700, fontWeight: '500' },
  chipTextActive: { color: colors.white, fontWeight: '700' },
  saveBtn: { backgroundColor: colors.orange, borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: colors.gray200 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
})
