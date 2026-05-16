import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, Keyboard, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { tokens as T } from '../../src/theme/tokens'
import ScreenHeader from '../../src/components/ScreenHeader'
import Button from '../../src/components/Button'
import PinMap from '../../src/components/PinMap'
import { supabase } from '../../src/lib/supabase'
import { useAuth } from '../../src/context/AuthContext'
import { Pin } from '../../src/lib/supabase'

const presets = ['Acasă', 'Birou', 'Bunica', 'Casa de la țară']

interface Suggestion {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address: {
    house_number?: string
    road?: string
    pedestrian?: string
    city?: string
    town?: string
    village?: string
    county?: string
  }
}

function formatSuggestion(s: Suggestion): { main: string; secondary: string } {
  const a      = s.address
  const road   = a.road ?? a.pedestrian ?? ''
  const number = a.house_number ?? ''
  const street = road && number ? `${road} ${number}` : road
  const city   = a.city ?? a.town ?? a.village ?? a.county ?? ''
  if (street && city) return { main: street, secondary: city }
  const parts  = s.display_name.split(', ')
  return { main: parts[0], secondary: parts.slice(1, 3).join(', ') }
}

export default function AddPin() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { user, customer, refreshCustomer } = useAuth()

  const [name,        setName]        = useState('Acasă')
  const [search,      setSearch]      = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [searching,   setSearching]   = useState(false)
  const [pinnedAddr,  setPinnedAddr]  = useState('')
  const [flyTo,       setFlyTo]       = useState<{ lat: number; lng: number } | null>(null)
  const [pinLat,      setPinLat]      = useState<number | null>(null)
  const [pinLng,      setPinLng]      = useState<number | null>(null)
  const [loading,     setLoading]     = useState(false)
  const debounceRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const revDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suppressFetch  = useRef(false)
  const pinnedAddrRef  = useRef('')
  useEffect(() => { pinnedAddrRef.current = pinnedAddr }, [pinnedAddr])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 3) { setSuggestions([]); return }
    setSearching(true)
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=md&limit=6&addressdetails=1`
      const res  = await fetch(url, { headers: { 'Accept-Language': 'ro', 'User-Agent': 'Livra/1.0' } })
      const data: Suggestion[] = await res.json()
      setSuggestions(data)
    } catch {
      setSuggestions([])
    } finally {
      setSearching(false)
    }
  }, [])

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      const res  = await fetch(url, { headers: { 'Accept-Language': 'ro', 'User-Agent': 'Livra/1.0' } })
      const data = await res.json()
      if (!data.address) return
      const a      = data.address
      const road   = a.road ?? a.pedestrian ?? ''
      const number = a.house_number ?? ''
      const street = road && number ? `${road} ${number}` : road
      const city   = a.city ?? a.town ?? a.village ?? a.county ?? ''
      const full   = street && city ? `${street}, ${city}` : street || city || ''
      if (!full) return
      suppressFetch.current = true
      setSearch(full)
    } catch {}
  }, [])

  useEffect(() => {
    if (suppressFetch.current) { suppressFetch.current = false; return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(search), 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  const selectSuggestion = (s: Suggestion) => {
    const { main, secondary } = formatSuggestion(s)
    const full = secondary ? `${main}, ${secondary}` : main
    const lat  = parseFloat(s.lat)
    const lng  = parseFloat(s.lon)
    setSearch(full)
    setPinnedAddr(full)
    setFlyTo({ lat, lng })
    setPinLat(lat)
    setPinLng(lng)
    setSuggestions([])
    Keyboard.dismiss()
  }

  const clearSearch = () => {
    setSearch('')
    setPinnedAddr('')
    setFlyTo(null)
    setPinLat(null)
    setPinLng(null)
    setSuggestions([])
  }

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Adaugă un nume'); return }
    setLoading(true)
    const addr = pinnedAddr || search.trim() || null
    const newPin: Pin = {
      id:      Date.now().toString(),
      name:    name.trim(),
      address: addr,
      lat:     pinLat,
      lng:     pinLng,
      primary: (customer?.pins?.length ?? 0) === 0,
    }
    const pins = [...(customer?.pins ?? []), newPin]
    await supabase.from('livra_customers').update({ pins }).eq('id', user!.id)
    await refreshCustomer()
    setLoading(false)
    router.back()
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScreenHeader leftIcon="close" title="Locație nouă" />

      <View style={styles.map}>
        <PinMap
          flyTo={flyTo}
          onCenterChange={(lat, lng) => {
            setPinLat(lat); setPinLng(lng)
            if (pinnedAddrRef.current) return
            if (revDebounceRef.current) clearTimeout(revDebounceRef.current)
            revDebounceRef.current = setTimeout(() => reverseGeocode(lat, lng), 600)
          }}
        />

        {/* Search bar */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            {searching
              ? <ActivityIndicator size="small" color={T.color.primary} />
              : <Feather name="search" size={16} color={T.color.inkMuted} />
            }
            <TextInput
              style={styles.searchInput}
              placeholder="Caută strada, numărul, orașul…"
              placeholderTextColor={T.color.inkSubtle}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              onSubmitEditing={() => suggestions.length && selectSuggestion(suggestions[0])}
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={clearSearch} hitSlop={8}>
                <Feather name="x" size={16} color={T.color.inkMuted} />
              </TouchableOpacity>
            )}
          </View>

          {suggestions.length > 0 && (
            <FlatList
              style={styles.suggestions}
              data={suggestions}
              keyExtractor={i => String(i.place_id)}
              keyboardShouldPersistTaps="always"
              renderItem={({ item, index }) => {
                const { main, secondary } = formatSuggestion(item)
                return (
                  <TouchableOpacity
                    style={[styles.suggestion, index < suggestions.length - 1 && styles.suggestionBorder]}
                    onPress={() => selectSuggestion(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.suggestionPin}>
                      <Feather name="map-pin" size={14} color={T.color.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.suggMain} numberOfLines={1}>{main}</Text>
                      {secondary ? <Text style={styles.suggSub} numberOfLines={1}>{secondary}</Text> : null}
                    </View>
                  </TouchableOpacity>
                )
              }}
            />
          )}
        </View>

        {pinnedAddr && suggestions.length === 0 && (
          <View style={styles.addrBubble}>
            <Feather name="map-pin" size={12} color={T.color.primary} />
            <Text style={styles.addrBubbleText} numberOfLines={1}>{pinnedAddr}</Text>
          </View>
        )}
        {!pinnedAddr && suggestions.length === 0 && (
          <View style={styles.hint}>
            <Text style={styles.hintText}>Caută adresa sau ajustează pin-ul manual</Text>
          </View>
        )}

        <View style={styles.centerPin}>
          <Feather name="map-pin" size={36} color={T.color.primary} />
        </View>
      </View>

      <View style={[styles.sheet, { paddingBottom: Math.max(T.space.xl, insets.bottom + T.space.md) }]}>
        <View style={styles.handle} />
        <Text style={styles.label}>NUMEȘTE ACEASTĂ LOCAȚIE</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Acasă"
          placeholderTextColor={T.color.inkSubtle}
        />
        <View style={styles.presets}>
          {presets.map(p => (
            <TouchableOpacity key={p} onPress={() => setName(p)} style={[styles.preset, name === p && styles.presetActive]}>
              <Text style={[styles.presetText, name === p && styles.presetTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button label={loading ? 'Se salvează…' : 'Salvează locația'} variant="accent" onPress={handleSave} disabled={loading} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: T.color.bg },
  map:             { flex: 1, position: 'relative' },

  searchWrap:      { position: 'absolute', top: T.space.sm, left: T.space.md, right: T.space.md, zIndex: 10 },
  searchBar:       {
    flexDirection: 'row', alignItems: 'center', gap: T.space.xs,
    backgroundColor: T.color.surface, borderRadius: T.radius.pill,
    paddingHorizontal: T.space.md, paddingVertical: 10,
    ...T.shadow.md,
  },
  searchInput:     { flex: 1, fontSize: T.size.bodySm, color: T.color.ink },

  suggestions:     {
    backgroundColor: T.color.surface, borderRadius: T.radius.lg,
    marginTop: 6, maxHeight: 260,
    ...T.shadow.md,
  },
  suggestion:      { flexDirection: 'row', alignItems: 'center', gap: T.space.sm, paddingHorizontal: T.space.md, paddingVertical: T.space.sm },
  suggestionBorder:{ borderBottomWidth: 1, borderBottomColor: T.color.border },
  suggestionPin:   { width: 28, height: 28, borderRadius: 14, backgroundColor: T.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  suggMain:        { fontSize: T.size.bodySm, fontWeight: T.weight.semibold, color: T.color.ink },
  suggSub:         { fontSize: T.size.caption, color: T.color.inkMuted, marginTop: 1 },

  hint:            {
    position: 'absolute', bottom: T.space.lg, alignSelf: 'center',
    backgroundColor: T.color.ink, paddingHorizontal: T.space.md,
    paddingVertical: T.space.xs, borderRadius: T.radius.pill,
  },
  hintText:        { color: '#fff', fontSize: T.size.caption, fontWeight: T.weight.medium },

  addrBubble:      {
    position: 'absolute', bottom: T.space.lg, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: T.color.surface, borderRadius: T.radius.pill,
    paddingHorizontal: T.space.md, paddingVertical: T.space.xs,
    maxWidth: '80%', ...T.shadow.md,
  },
  addrBubbleText:  { fontSize: T.size.caption, color: T.color.ink, fontWeight: T.weight.medium, flexShrink: 1 },

  centerPin:       { position: 'absolute', top: '45%', left: '50%', marginLeft: -18, marginTop: -36 },

  sheet:           { backgroundColor: T.color.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: T.space.lg, gap: T.space.sm, ...T.shadow.sheet },
  handle:          { width: 36, height: 4, borderRadius: 2, backgroundColor: T.color.borderStrong, alignSelf: 'center', marginBottom: T.space.xs },
  label:           { fontFamily: T.font.mono, fontSize: T.size.micro, color: T.color.inkSubtle, letterSpacing: 0.4, textTransform: 'uppercase' },
  input:           { height: 48, backgroundColor: T.color.bg, borderWidth: 1, borderColor: T.color.border, borderRadius: T.radius.md, paddingHorizontal: T.space.md, fontSize: T.size.body, fontWeight: T.weight.medium, color: T.color.ink },
  presets:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preset:          { paddingHorizontal: T.space.sm, paddingVertical: 6, backgroundColor: T.color.surface, borderWidth: 1, borderColor: T.color.borderStrong, borderRadius: T.radius.pill },
  presetActive:    { backgroundColor: T.color.ink, borderColor: T.color.ink },
  presetText:      { fontSize: T.size.caption, fontWeight: T.weight.medium, color: T.color.ink },
  presetTextActive:{ color: '#fff' },
})
