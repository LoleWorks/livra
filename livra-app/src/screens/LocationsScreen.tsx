import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../lib/colors'
import type { RootStackParamList, SavedLocation } from '../types'

type Nav = NativeStackNavigationProp<RootStackParamList>

const MOCK_LOCATIONS: SavedLocation[] = [
  {
    id: 'l1',
    name: 'Acasă',
    lat: 47.026,
    lng: 28.838,
    address: 'Str. Albișoara 34, ap. 7, Chișinău',
    isDefault: true,
  },
  {
    id: 'l2',
    name: 'Birou',
    lat: 47.019,
    lng: 28.831,
    address: 'Bd. Ștefan cel Mare 65, Chișinău',
    isDefault: false,
  },
]

const ICON_MAP: Record<string, 'home' | 'briefcase' | 'location'> = {
  'Acasă': 'home',
  'Birou': 'briefcase',
}

export default function LocationsScreen() {
  const navigation = useNavigation<Nav>()
  const [locations, setLocations] = useState<SavedLocation[]>(MOCK_LOCATIONS)

  function deleteLocation(id: string) {
    Alert.alert('Șterge locația', 'Ești sigur că vrei să ștergi această locație?', [
      { text: 'Anulează', style: 'cancel' },
      {
        text: 'Șterge',
        style: 'destructive',
        onPress: () => setLocations(prev => prev.filter(l => l.id !== id)),
      },
    ])
  }

  function setDefault(id: string) {
    setLocations(prev => prev.map(l => ({ ...l, isDefault: l.id === id })))
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Info banner */}
      <View style={styles.banner}>
        <Ionicons name="information-circle" size={20} color={colors.orange} />
        <Text style={styles.bannerText}>
          Locațiile salvate ajung automat la toți curierii. Nu mai trebuie să explici unde ești.
        </Text>
      </View>

      {/* Locations list */}
      <View style={styles.section}>
        {locations.map(loc => {
          const iconName = ICON_MAP[loc.name] ?? 'location'
          return (
            <View key={loc.id} style={styles.locationCard}>
              <View style={[styles.iconBox, loc.isDefault && styles.iconBoxActive]}>
                <Ionicons
                  name={iconName}
                  size={20}
                  color={loc.isDefault ? colors.orange : colors.gray400}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.locationName}>{loc.name}</Text>
                  {loc.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Implicit</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.locationAddress} numberOfLines={2}>{loc.address}</Text>
              </View>
              <View style={styles.actions}>
                {!loc.isDefault && (
                  <TouchableOpacity onPress={() => setDefault(loc.id)} style={styles.actionBtn}>
                    <Ionicons name="checkmark-circle-outline" size={20} color={colors.gray400} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => navigation.navigate('SetLocation', { locationId: loc.id })}
                  style={styles.actionBtn}
                >
                  <Ionicons name="pencil-outline" size={20} color={colors.gray400} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteLocation(loc.id)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={20} color={colors.red} />
                </TouchableOpacity>
              </View>
            </View>
          )
        })}
      </View>

      {/* Add new */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate('SetLocation', {})}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle" size={22} color={colors.white} />
        <Text style={styles.addBtnText}>Adaugă locație nouă</Text>
      </TouchableOpacity>

      {/* Tip */}
      <Text style={styles.tip}>
        Pui pin-ul o singură dată. Fiecare curier ajunge acolo direct, fără să te mai sune.
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, paddingBottom: 40 },
  banner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#fff0eb',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: colors.black,
    lineHeight: 18,
  },
  section: { gap: 10, marginBottom: 20 },
  locationCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: {
    backgroundColor: '#fff0eb',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  defaultBadge: {
    backgroundColor: '#fff0eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultBadgeText: {
    fontSize: 11,
    color: colors.orange,
    fontWeight: '600',
  },
  locationAddress: {
    fontSize: 13,
    color: colors.gray500,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'column',
    gap: 4,
  },
  actionBtn: {
    padding: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.orange,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  tip: {
    fontSize: 13,
    color: colors.gray400,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
})
