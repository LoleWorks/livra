import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import MapView, { Region } from 'react-native-maps'
import * as Location from 'expo-location'
import { colors } from '../lib/colors'
import type { RootStackParamList } from '../types'

type Props = NativeStackScreenProps<RootStackParamList, 'SetLocation'>

const CHISINAU: Region = { latitude: 47.0245, longitude: 28.8322, latitudeDelta: 0.02, longitudeDelta: 0.02 }
const SUGGESTIONS = ['Acasă', 'Birou', 'La Mama', 'Alt loc']

export default function SetLocationScreen({ route }: Props) {
  const navigation = useNavigation()
  const mapRef = useRef<MapView>(null)
  const [region, setRegion] = useState<Region>(CHISINAU)
  const [address, setAddress] = useState('')
  const [name, setName] = useState('')
  const [locating, setLocating] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)

  // On mount: get current position
  useEffect(() => {
    goToCurrentLocation()
  }, [])

  async function goToCurrentLocation() {
    setLocating(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setPermissionDenied(true)
        setLocating(false)
        return
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      const newRegion: Region = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
      setRegion(newRegion)
      mapRef.current?.animateToRegion(newRegion, 600)
      await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
    } catch {
      // fall back to Chișinău
    }
    setLocating(false)
  }

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
      if (results.length > 0) {
        const r = results[0]
        const parts = [r.street, r.streetNumber, r.city].filter(Boolean)
        setAddress(parts.join(', '))
      }
    } catch {
      // ignore
    }
  }

  async function onRegionChangeComplete(r: Region) {
    setRegion(r)
    await reverseGeocode(r.latitude, r.longitude)
  }

  function save() {
    if (!name.trim()) return
    // TODO: persist to API / SecureStore
    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Map */}
      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={CHISINAU}
          onRegionChangeComplete={onRegionChangeComplete}
          showsUserLocation={true}
          showsCompass={false}
          toolbarEnabled={false}
        />
        {/* Center pin */}
        <View pointerEvents="none" style={styles.pinWrapper}>
          <View style={styles.pinDot}>
            <Ionicons name="location" size={28} color={colors.orange} />
          </View>
          <View style={styles.pinShadow} />
        </View>
        {/* GPS button */}
        <TouchableOpacity style={styles.gpsBtn} onPress={goToCurrentLocation} disabled={locating}>
          {locating
            ? <ActivityIndicator size="small" color={colors.orange} />
            : <Ionicons name="locate" size={20} color={colors.orange} />}
        </TouchableOpacity>
        {permissionDenied && (
          <View style={styles.permBanner}>
            <Ionicons name="warning-outline" size={14} color={colors.amber} />
            <Text style={styles.permText}>Activați locația din setări</Text>
          </View>
        )}
      </View>

      {/* Form */}
      <ScrollView style={styles.form} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
        {/* Address display */}
        <Text style={styles.label}>Adresă detectată</Text>
        <TextInput
          style={styles.input}
          placeholder="Mutați harta pentru a alege locul exact"
          placeholderTextColor={colors.gray400}
          value={address}
          onChangeText={setAddress}
        />

        {/* Name chips */}
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
          style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
          onPress={save}
          disabled={!name.trim()}
        >
          <Ionicons name="checkmark-circle" size={20} color={colors.white} />
          <Text style={styles.saveBtnText}>Salvează locația</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  mapWrapper: { height: 280, position: 'relative' },
  pinWrapper: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    // pin appears above the shadow, which sits on the map surface
  },
  pinDot: {
    marginBottom: -4, // drop shadow baseline
  },
  pinShadow: {
    width: 10, height: 4, borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  gpsBtn: {
    position: 'absolute', bottom: 12, right: 12,
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  permBanner: {
    position: 'absolute', bottom: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.white, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  permText: { fontSize: 12, color: colors.gray700 },
  form: { flex: 1, backgroundColor: colors.cream },
  formContent: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 12, fontWeight: '700', color: colors.gray400,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8,
  },
  input: {
    borderWidth: 1.5, borderColor: colors.gray200, borderRadius: 12,
    padding: 14, fontSize: 15, color: colors.black,
    backgroundColor: colors.white, marginBottom: 20,
  },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.gray100 },
  chipActive: { backgroundColor: colors.orange },
  chipText: { fontSize: 14, color: colors.gray700, fontWeight: '500' },
  chipTextActive: { color: colors.white, fontWeight: '700' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.orange, borderRadius: 14, padding: 16,
  },
  saveBtnDisabled: { backgroundColor: colors.gray200 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
})
