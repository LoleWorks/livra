import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Switch, Image, Modal } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { tokens as T } from '../src/theme/tokens'
import { useAuth } from '../src/context/AuthContext'
import { recommendVehicle, calculateEstimation, VehicleType } from '../src/lib/pricing'
import { supabase } from '../src/lib/supabase'
import PinMap from '../src/components/PinMap'

type IconName = React.ComponentProps<typeof Feather>['name']

const VEHICLES: { type: VehicleType; label: string; icon: string; desc: string }[] = [
  { type: 'economy', label: 'Econom', icon: 'zap', desc: 'Moped / Mașină mică (Căști, telefoane, acte)' },
  { type: 'small_van', label: 'Sprinter 1.5t', icon: 'truck', desc: 'TV, Microunde, 14m³ (max 1500kg)' },
  { type: 'large_van', label: 'Camion 2.5t', icon: 'truck', desc: 'Mobilă, Canapea, 20m³ (max 2500kg)' },
  { type: 'truck_5t', label: 'Camion 5t', icon: 'truck', desc: 'Mutări mari, Construcții, 40m³' },
]

interface Suggestion {
  geometry: { coordinates: [number, number] };
  properties: { name?: string; street?: string; city?: string; district?: string };
}

interface Pin {
  id: string;
  name: string;
  address: string | null;
  type?: string;
  primary?: boolean;
  lat: number | null;
  lng: number | null;
}

interface Warehouse {
  lat: number;
  lng: number;
  name: string;
}

export default function RequestDelivery() {
  const router = useRouter()
  const { type = 'store' } = useLocalSearchParams() as { type: 'store' | 'p2p' | 'baggage' }
  const insets = useSafeAreaInsets()
  const { customer } = useAuth()
  
  const [loading, setLoading] = useState(false)
  
  // Dynamic Labels
  const title = type === 'baggage' ? 'Bagaj peste hotare' : type === 'p2p' ? 'Adresă la Adresă' : 'Solicită de la Magazin'
  const pickupLabel = type === 'baggage' ? 'De unde luăm bagajul?' : 'De unde ridicăm?'
  const deliveryLabel = type === 'baggage' ? 'La ce autocar livrăm?' : 'Unde livrăm?'

  // Form State
  const [itemDesc, setItemDesc] = useState('')
  const [weight, setWeight] = useState('')
  const [pickupAddr, setPickupAddr] = useState('')
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [showPickupMap, setShowPickupMap] = useState(false)
  const [deliveryAddr, setDeliveryAddr] = useState('')
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [showDeliveryMap, setShowDeliveryMap] = useState(false)
  const [receiptImage, setReceiptImage] = useState<string | null>(null)
  const [deliveryPinId, setDeliveryPinId] = useState<string | null>(null)
  const [movers, setMovers] = useState(0)
  const [vehicle, setVehicle] = useState<VehicleType>('economy')
  const [isOutside, setIsOutside] = useState(false)

  // Baggage specific state
  const [receiverName, setReceiverName] = useState('')
  const [receiverPhone, setReceiverPhone] = useState('')
  const [transportCompany, setTransportCompany] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  
  // Map Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [flyToCoords, setFlyToCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [reverseSearching, setReverseSearching] = useState(false)
  
  // Data for pins
  const [pins, setPins] = useState<Pin[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [nearbyStores, setNearbyStores] = useState<Warehouse[]>([])
  const [nearbyLoading, setNearbyLoading] = useState(false)

  const fetchPins = useCallback(async () => {
    if (!customer?.id) return
    try {
      // Use pins from customer object which are already loaded in AuthContext
      if (customer.pins) {
        const pData = customer.pins as Pin[]
        setPins(pData)
        // Auto-select primary or home pin if nothing selected
        if (!deliveryPinId && pData.length > 0) {
          const homePin = pData.find((p) => p.type === 'home' || p.primary)
          if (homePin) setDeliveryPinId(homePin.id)
          else setDeliveryPinId(pData[0].id)
        }
      }

      // Also fetch warehouses (stores) to show on map
      const { data: wData } = await supabase.from('livra_warehouses').select('lat, lng, name')
      if (wData) setWarehouses(wData as Warehouse[])
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }, [customer, deliveryPinId])

  const fetchNearbyStores = useCallback(async (lat: number, lng: number) => {
    setNearbyLoading(true)
    try {
      // Overpass API query for shops within 800m
      const query = `
        [out:json][timeout:15];
        (
          node["shop"](around:800, ${lat}, ${lng});
          way["shop"](around:800, ${lat}, ${lng});
          node["amenity"="marketplace"](around:800, ${lat}, ${lng});
        );
        out body center 30;
      `
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
      if (!res.ok) return
      const data = await res.json()
      
      const found = (data.elements || []).map((e: { lat?: number; center?: { lat: number; lon: number }; lon?: number; tags?: { name?: string; brand?: string; shop?: string } }) => ({
        lat: e.lat || e.center?.lat,
        lng: e.lon || e.center?.lon,
        name: e.tags?.name || e.tags?.brand || e.tags?.shop?.replace(/_/g, ' ') || 'Magazin'
      })).filter((s: Warehouse) => s.lat && s.lng && s.name && s.name !== 'Magazin')
      
      setNearbyStores(found as Warehouse[])
    } catch {
      // Non-critical
    } finally {
      setNearbyLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPins()
  }, [fetchPins])

  const storeMarkers = useMemo(() => {
    const combined = [...warehouses]
    
    // Add nearby stores if they aren't already in warehouses (very rough check)
    nearbyStores.forEach(ns => {
      const exists = warehouses.some(w => Math.abs(w.lat - ns.lat) < 0.0001 && Math.abs(w.lng - ns.lng) < 0.0001)
      if (!exists) combined.push(ns)
    })

    return combined.map(w => ({
      lat: w.lat,
      lng: w.lng,
      title: w.name
    }))
  }, [warehouses, nearbyStores])

  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const handleCenterChange = (lat: number, lng: number) => {
    setPickupCoords({ lat, lng })
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      fetchNearbyStores(lat, lng)
      handleReverseGeocode(lat, lng)
    }, 1200) // Debounce heavily to respect Overpass and Photon
  }

  // Weight handler to update vehicle
  const handleWeightChange = (val: string) => {
    setWeight(val)
    const w = parseFloat(val)
    if (!isNaN(w)) {
      const rec = recommendVehicle(w, 0.5)
      setVehicle(rec)
    }
  }

  const estimation = useMemo(() => calculateEstimation({
    vehicleType: vehicle,
    moversCount: movers,
    distanceKm: isOutside ? 30 : 10, // Mock distance for now
    durationHrs: 1.5,
    isOutsideChisinau: isOutside,
  }), [vehicle, movers, isOutside])

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permisiune refuzată', 'Avem nevoie de acces la galerie pentru a atașa bonul.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    })

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri)
    }
  }

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permisiune refuzată', 'Avem nevoie de acces la cameră pentru a poza bonul.')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    })

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri)
    }
  }

  async function handleSearch(query: string) {
    setSearchQuery(query)
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=47.026&lon=28.838&limit=5`)
      const data = await res.json()
      setSuggestions(data.features || [])
    } catch (err) {
      console.error('Search error:', err)
    }
  }

  function selectSuggestion(suggestion: Suggestion) {
    const coords = suggestion.geometry.coordinates
    const [lng, lat] = coords
    setFlyToCoords({ lat, lng })
    if (showPickupMap) {
      setPickupCoords({ lat, lng })
    } else {
      setDeliveryCoords({ lat, lng })
    }
    setSuggestions([])
    setSearchQuery(suggestion.properties.name || suggestion.properties.street || '')
  }

  async function handleReverseGeocode(lat: number, lng: number) {
    setReverseSearching(true)
    try {
      const res = await fetch(`https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`)
      const data = await res.json()
      if (data.features && data.features.length > 0) {
        const feat = data.features[0]
        const addr = feat.properties.name || feat.properties.street || ''
        const city = feat.properties.city || ''
        const full = addr ? (city ? `${addr}, ${city}` : addr) : city
        setSearchQuery(full)
      }
    } catch (err) {
      console.error('Reverse geocode error:', err)
    } finally {
      setReverseSearching(false)
    }
  }

  async function handleSubmit() {
    if (!itemDesc || !pickupAddr) {
      Alert.alert('Câmpuri lipsă', 'Te rugăm să spui ce livrăm și de unde ridicăm.')
      return
    }
    
    const finalDeliveryAddr = deliveryPinId 
      ? pins.find(p => p.id === deliveryPinId)?.address 
      : deliveryAddr
    
    const finalDeliveryLat = deliveryPinId 
      ? pins.find(p => p.id === deliveryPinId)?.lat 
      : deliveryCoords?.lat
      
    const finalDeliveryLng = deliveryPinId 
      ? pins.find(p => p.id === deliveryPinId)?.lng 
      : deliveryCoords?.lng

    if (!finalDeliveryAddr) {
      Alert.alert('Câmpuri lipsă', 'Te rugăm să selectezi o destinație.')
      return
    }

    if (type === 'store' && !receiptImage) {
      Alert.alert('Bon Fiscal Lipsă', 'Te rugăm să încarci o poză cu bonul fiscal sau factura pentru ca șoferul să poată prelua marfa.')
      return
    }

    if (type === 'baggage' && (!transportCompany || !receiverName || !receiverPhone)) {
      Alert.alert('Câmpuri lipsă', 'Te rugăm să completezi detaliile despre transportator și destinatar.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('livra_route_stops').insert({
        customer_id: customer?.id,
        address: finalDeliveryAddr,
        pickup_address: pickupAddr,
        pickup_lat: pickupCoords?.lat,
        pickup_lng: pickupCoords?.lng,
        package_description: itemDesc,
        status: 'pending',
        lat: finalDeliveryLat,
        lng: finalDeliveryLng,
        notes: type === 'baggage' 
          ? `BAGAJ EXTERN. Transport: ${transportCompany}, Ora: ${departureTime}. Destinatar: ${receiverName} (${receiverPhone}). Hamali: ${movers}`
          : `Solicitare on-demand (${type}). Hamali: ${movers}`,
        price_estimation: estimation,
        is_on_demand: true,
        receipt_url: receiptImage ? 'mock_upload_url' : null,
        delivery_type: type,
      })

      if (error) throw error
      
      Alert.alert('Succes', 'Solicitarea ta a fost trimisă. Partenerii noștri vor prelua comanda în curând.')
      router.replace(`/(tabs)/home`)
    } catch (err: unknown) {
      Alert.alert('Eroare', (err as Error).message || 'A apărut o eroare neașteptată.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={T.color.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ce livrăm?</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Canapea, TV Darwin, Bagaj..."
            value={itemDesc}
            onChangeText={setItemDesc}
            placeholderTextColor={T.color.inkSubtle}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Greutate aprox (kg)"
              keyboardType="numeric"
              value={weight}
              onChangeText={handleWeightChange}
              placeholderTextColor={T.color.inkSubtle}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{pickupLabel}</Text>
          <Text style={styles.sectionSub}>
            {type === 'baggage' ? 'Alege adresa ta sau locația unde se află bagajul' : 'Adresa magazinului sau a vînzătorului'}
          </Text>
          <TouchableOpacity 
            style={styles.fakeInput} 
            onPress={() => {
              setSearchQuery(pickupAddr || '')
              setShowPickupMap(true)
            }}
          >
            <Feather name="search" size={20} color={T.color.inkSubtle} />
            <Text style={[styles.fakeInputText, !pickupAddr && { color: T.color.inkSubtle }]}>
              {pickupAddr || (type === 'baggage' ? 'Fixează adresa pe hartă...' : 'Caută magazin sau pune pin pe hartă...')}
            </Text>
            <Feather name="map" size={20} color={T.color.primary} />
          </TouchableOpacity>
        </View>

        {type === 'baggage' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Detalii transport peste hotare</Text>
            <View style={{ gap: 10 }}>
              <TextInput
                style={styles.input}
                placeholder="Nume Companie Transport (ex: Ednateric)"
                value={transportCompany}
                onChangeText={setTransportCompany}
                placeholderTextColor={T.color.inkSubtle}
              />
              <TextInput
                style={styles.input}
                placeholder="Ora plecării autocarului (ex: 14:00)"
                value={departureTime}
                onChangeText={setDepartureTime}
                placeholderTextColor={T.color.inkSubtle}
              />
              <View style={styles.separator} />
              <Text style={styles.sectionSub}>Datele persoanei care va primi coletul în afară:</Text>
              <TextInput
                style={styles.input}
                placeholder="Nume Prenume Destinatar"
                value={receiverName}
                onChangeText={setReceiverName}
                placeholderTextColor={T.color.inkSubtle}
              />
              <TextInput
                style={styles.input}
                placeholder="Telefon Destinatar (cu prefix)"
                value={receiverPhone}
                onChangeText={setReceiverPhone}
                keyboardType="phone-pad"
                placeholderTextColor={T.color.inkSubtle}
              />
            </View>
          </View>
        )}

        {type === 'store' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Dovada achiziției (Bon fiscal / Factură) *</Text>
            <Text style={styles.sectionSub}>Te rugăm să încarci o poză cu bonul pentru ca șoferul să poată prelua marfa.</Text>
            <View style={styles.receiptContainer}>
              {receiptImage ? (
                <View style={styles.receiptPreviewWrap}>
                  <Image source={{ uri: receiptImage }} style={styles.receiptPreview} />
                  <TouchableOpacity style={styles.removeReceipt} onPress={() => setReceiptImage(null)}>
                    <Feather name="x" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.receiptActions}>
                  <TouchableOpacity style={styles.receiptBtn} onPress={takePhoto}>
                    <Feather name="camera" size={24} color={T.color.primary} />
                    <Text style={styles.receiptBtnText}>Fă o poză</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.receiptBtn} onPress={pickImage}>
                    <Feather name="image" size={24} color={T.color.primary} />
                    <Text style={styles.receiptBtnText}>Din galerie</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{deliveryLabel}</Text>
          <Text style={styles.sectionSub}>
            {type === 'baggage' ? 'Unde trebuie să ducem bagajul? (ex: Gara Auto Nord)' : 'Alege una din adresele tale salvate sau pune pinpoint pe hartă.'}
          </Text>
          <View style={{ gap: 12 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
              <TouchableOpacity 
                onPress={() => {
                  setDeliveryPinId(null)
                  setSearchQuery(deliveryAddr || '')
                  setShowDeliveryMap(true)
                }}
                style={[styles.pinCard, !deliveryPinId && deliveryAddr && styles.pinCardActive]}
              >
                <View style={[styles.pinCardIcon, !deliveryPinId && deliveryAddr && styles.pinCardIconActive]}>
                  <Feather name="map" size={20} color={!deliveryPinId && deliveryAddr ? '#fff' : T.color.primary} />
                </View>
                <View>
                  <Text style={[styles.pinCardName, !deliveryPinId && deliveryAddr && styles.pinCardNameActive]}>
                    {!deliveryPinId && deliveryAddr ? 'Locație Hartă' : 'Pune pe hartă'}
                  </Text>
                  <Text style={[styles.pinCardAddr, !deliveryPinId && deliveryAddr && styles.pinCardAddrActive]} numberOfLines={1}>
                    {(!deliveryPinId && deliveryAddr) ? deliveryAddr : 'Click pt mapă'}
                  </Text>
                </View>
              </TouchableOpacity>

              {pins.map((pin) => (
                <TouchableOpacity
                  key={pin.id}
                  onPress={() => {
                    setDeliveryPinId(pin.id)
                    setDeliveryAddr('')
                    setDeliveryCoords(null)
                  }}
                  style={[styles.pinCard, deliveryPinId === pin.id && styles.pinCardActive]}
                >
                  <View style={[styles.pinCardIcon, deliveryPinId === pin.id && styles.pinCardIconActive]}>
                    <Feather name={pin.type === 'home' ? 'home' : 'briefcase'} size={20} color={deliveryPinId === pin.id ? '#fff' : T.color.primary} />
                  </View>
                  <View>
                    <Text style={[styles.pinCardName, deliveryPinId === pin.id && styles.pinCardNameActive]}>{pin.name}</Text>
                    <Text style={[styles.pinCardAddr, deliveryPinId === pin.id && styles.pinCardAddrActive]} numberOfLines={1}>{pin.address || 'Pin GPS'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.addPinCircle} onPress={() => router.push('/pins/add')}>
                <Feather name="plus" size={24} color={T.color.inkSubtle} />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Vehicul recomandat</Text>
          {VEHICLES.map(v => (
            <TouchableOpacity
              key={v.type}
              onPress={() => setVehicle(v.type)}
              style={[styles.vCard, vehicle === v.type && styles.vCardActive]}
            >
              <View style={[styles.vIcon, vehicle === v.type && styles.vIconActive]}>
                <Feather name={v.icon as IconName} size={20} color={vehicle === v.type ? '#fff' : T.color.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.vLabel, vehicle === v.type && styles.vLabelActive]}>{v.label}</Text>
                <Text style={[styles.vDesc, vehicle === v.type && styles.vDescActive]}>{v.desc}</Text>
              </View>
              {vehicle === v.type && <Feather name="check-circle" size={20} color="#fff" />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>În afara Chișinăului?</Text>
              <Text style={styles.switchSub}>Pentru livrări în suburbii sau alte localități</Text>
            </View>
            <Switch
              value={isOutside}
              onValueChange={setIsOutside}
              trackColor={{ false: T.color.border, true: T.color.primary }}
            />
          </View>
          
          <View style={styles.moversRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Hamali (Hamal.md)</Text>
              <Text style={styles.switchSub}>Ai nevoie de ajutor la ridicare/coborâre?</Text>
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity onPress={() => setMovers(Math.max(0, movers - 1))} style={styles.stepBtn}>
                <Feather name="minus" size={16} color={T.color.ink} />
              </TouchableOpacity>
              <Text style={styles.stepVal}>{movers}</Text>
              <TouchableOpacity onPress={() => setMovers(movers + 1)} style={styles.stepBtn}>
                <Feather name="plus" size={16} color={T.color.ink} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Estimare Cost:</Text>
          <Text style={styles.priceVal}>{estimation} MDL</Text>
          <Text style={styles.priceSub}>*Prețul final va fi confirmat de operator</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(T.space.lg, insets.bottom) }]}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Trimite Solicitarea</Text>}
        </TouchableOpacity>
      </View>

      <Modal visible={showPickupMap || showDeliveryMap} animationType="slide">
        <View style={{ flex: 1, backgroundColor: T.color.bg }}>
          <View style={[styles.mapHeader, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={() => { setShowPickupMap(false); setShowDeliveryMap(false); }} style={styles.mapBackBtn}>
              <Feather name="arrow-left" size={24} color={T.color.ink} />
            </TouchableOpacity>
            <Text style={styles.mapTitle}>{showPickupMap ? 'Locație ridicare' : 'Locație livrare'}</Text>
            <TouchableOpacity 
              onPress={() => {
                if (showPickupMap) {
                  setPickupAddr(searchQuery || `Locație fixată (${pickupCoords?.lat.toFixed(4)})`)
                  setShowPickupMap(false)
                } else {
                  setDeliveryAddr(searchQuery || `Locație fixată (${deliveryCoords?.lat.toFixed(4)})`)
                  setDeliveryCoords(deliveryCoords)
                  setShowDeliveryMap(false)
                }
              }} 
              style={styles.mapDoneBtn}
            >
              <Text style={styles.mapDoneText}>Confirmă</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchBarWrapper}>
            <View style={styles.searchBar}>
              {(reverseSearching || nearbyLoading) ? <ActivityIndicator size="small" color={T.color.primary} /> : <Feather name="search" size={18} color={T.color.inkSubtle} />}
              <TextInput
                style={styles.searchInput}
                placeholder="Caută adresa sau magazin..."
                value={searchQuery}
                onChangeText={handleSearch}
                placeholderTextColor={T.color.inkSubtle}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setSuggestions([]); }}>
                  <Feather name="x-circle" size={18} color={T.color.inkSubtle} />
                </TouchableOpacity>
              )}
            </View>
            {suggestions.length > 0 && (
              <View style={styles.suggestionsList}>
                {suggestions.map((s, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={styles.suggestionItem}
                    onPress={() => selectSuggestion(s)}
                  >
                    <View style={styles.suggestionIcon}>
                      <Feather name="map-pin" size={14} color={T.color.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.suggestionTitle}>{s.properties.name || s.properties.street || 'Adresă necunoscută'}</Text>
                      <Text style={styles.suggestionSub}>{s.properties.city}{s.properties.district ? `, ${s.properties.district}` : ''}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <PinMap 
              flyTo={flyToCoords}
              staticMarkers={showPickupMap ? storeMarkers : []}
              onCenterChange={(lat, lng) => {
                if (showPickupMap) {
                  handleCenterChange(lat, lng)
                } else {
                  setDeliveryCoords({ lat, lng })
                  if (debounceTimer.current) clearTimeout(debounceTimer.current)
                  debounceTimer.current = setTimeout(() => handleReverseGeocode(lat, lng), 800)
                }
              }}
            />
            <View style={styles.mapCenterMark} pointerEvents="none">
              <View style={styles.pinDot} />
              <Feather name="map-pin" size={40} color={T.color.primary} style={{ marginTop: -38 }} />
            </View>
            <TouchableOpacity 
              style={styles.recenterBtn} 
              onPress={() => {
                const coords = showPickupMap ? pickupCoords : deliveryCoords
                if (coords) handleReverseGeocode(coords.lat, coords.lng)
              }}
            >
              <Feather name="crosshair" size={20} color={T.color.ink} />
            </TouchableOpacity>
          </View>
          <View style={styles.mapTip}>
            <Text style={styles.mapTipText}>Mişcă harta pentru a centra pinul exact pe punct</Text>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  separator: { height: 1, backgroundColor: T.color.border, marginVertical: T.space.sm },
  root: { flex: 1, backgroundColor: T.color.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: T.space.lg, paddingVertical: T.space.md },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: T.size.h3, fontWeight: T.weight.bold, color: T.color.ink },
  scroll: { padding: T.space.lg, gap: T.space.xl },
  section: { gap: T.space.sm },
  sectionLabel: { fontSize: T.size.caption, fontWeight: T.weight.bold, color: T.color.inkMuted, textTransform: 'uppercase', letterSpacing: 1 },
  sectionSub: { fontSize: T.size.caption, color: T.color.inkSubtle, marginBottom: 8 },
  fakeInput: { flexDirection: 'row', alignItems: 'center', gap: T.space.sm, backgroundColor: T.color.surface, borderWidth: 1, borderColor: T.color.border, borderRadius: T.radius.lg, padding: T.space.md, minHeight: 52 },
  fakeInputText: { flex: 1, fontSize: T.size.body, color: T.color.ink },
  addressContainer: { flexDirection: 'row', gap: T.space.sm },
  mapToggleBtn: { width: 50, height: 50, borderRadius: T.radius.lg, backgroundColor: T.color.primaryLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.color.primary },
  mapToggleBtnActive: { backgroundColor: T.color.primary },
  coordsInfo: { fontSize: T.size.caption, color: T.color.success, fontWeight: T.weight.medium, marginTop: 2 },
  receiptContainer: { backgroundColor: T.color.surface, borderRadius: T.radius.xl, borderWidth: 1, borderColor: T.color.border, overflow: 'hidden' },
  receiptActions: { flexDirection: 'row', padding: T.space.md, gap: T.space.md },
  receiptBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: T.space.lg, backgroundColor: T.color.bg, borderRadius: T.radius.lg, borderStyle: 'dashed', borderWidth: 1, borderColor: T.color.border },
  receiptBtnText: { fontSize: T.size.caption, color: T.color.inkMuted, fontWeight: T.weight.bold },
  receiptPreviewWrap: { width: '100%', height: 200, position: 'relative' },
  receiptPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeReceipt: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  input: { backgroundColor: T.color.surface, borderWidth: 1, borderColor: T.color.border, borderRadius: T.radius.lg, padding: T.space.md, fontSize: T.size.body, color: T.color.ink },
  row: { flexDirection: 'row', gap: T.space.sm },
  addPinBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: T.space.md, backgroundColor: T.color.primaryLight, borderRadius: T.radius.lg },
  addPinText: { color: T.color.primary, fontWeight: T.weight.bold },
  addPinCircle: { width: 44, height: 80, borderRadius: T.radius.lg, borderStyle: 'dashed', borderWidth: 1, borderColor: T.color.border, alignItems: 'center', justifyContent: 'center', backgroundColor: T.color.surface },
  pinCard: { width: 160, padding: T.space.md, backgroundColor: T.color.surface, borderRadius: T.radius.xl, borderWidth: 1, borderColor: T.color.border, gap: 8 },
  pinCardActive: { borderColor: T.color.primary, backgroundColor: T.color.primaryLight },
  pinCardIcon: { width: 36, height: 36, borderRadius: T.radius.sm, backgroundColor: T.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  pinCardIconActive: { backgroundColor: T.color.primary },
  pinCardName: { fontSize: T.size.bodySm, fontWeight: T.weight.bold, color: T.color.ink },
  pinCardNameActive: { color: T.color.primary },
  pinCardAddr: { fontSize: T.size.micro, color: T.color.inkSubtle },
  pinCardAddrActive: { color: T.color.primary },
  pinBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: T.radius.pill, backgroundColor: T.color.surface, borderWidth: 1, borderColor: T.color.border },
  pinBtnActive: { backgroundColor: T.color.primary, borderColor: T.color.primary },
  pinText: { fontSize: T.size.bodySm, fontWeight: T.weight.semibold, color: T.color.ink },
  pinTextActive: { color: '#fff' },
  vCard: { flexDirection: 'row', alignItems: 'center', gap: T.space.md, padding: T.space.md, backgroundColor: T.color.surface, borderRadius: T.radius.xl, borderWidth: 1, borderColor: T.color.border },
  vCardActive: { backgroundColor: T.color.primary, borderColor: T.color.primary },
  vIcon: { width: 44, height: 44, borderRadius: T.radius.lg, backgroundColor: T.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  vIconActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  vLabel: { fontSize: T.size.body, fontWeight: T.weight.bold, color: T.color.ink },
  vLabelActive: { color: '#fff' },
  vDesc: { fontSize: T.size.caption, color: T.color.inkSubtle },
  vDescActive: { color: 'rgba(255,255,255,0.7)' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: T.space.md },
  switchLabel: { fontSize: T.size.body, fontWeight: T.weight.bold, color: T.color.ink },
  switchSub: { fontSize: T.size.caption, color: T.color.inkSubtle },
  moversRow: { flexDirection: 'row', alignItems: 'center', gap: T.space.md, marginTop: T.space.md },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.color.surface, padding: 4, borderRadius: T.radius.pill, borderWidth: 1, borderColor: T.color.border },
  stepBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: T.color.bg, alignItems: 'center', justifyContent: 'center' },
  stepVal: { fontSize: T.size.body, fontWeight: T.weight.bold, minWidth: 20, textAlign: 'center' },
  priceCard: { padding: T.space.xl, backgroundColor: T.color.ink, borderRadius: T.radius.xl, alignItems: 'center', gap: 4 },
  priceLabel: { color: 'rgba(255,255,255,0.6)', fontSize: T.size.caption, fontWeight: T.weight.bold, textTransform: 'uppercase' },
  priceVal: { color: '#fff', fontSize: 32, fontWeight: T.weight.bold },
  priceSub: { color: 'rgba(255,255,255,0.4)', fontSize: T.size.micro, fontStyle: 'italic' },
  footer: { padding: T.space.lg, backgroundColor: T.color.bg },
  submitBtn: { backgroundColor: T.color.primary, borderRadius: T.radius.xl, padding: T.space.lg, alignItems: 'center', ...T.shadow.md },
  submitText: { color: '#fff', fontSize: T.size.body, fontWeight: T.weight.bold },
  mapHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: T.space.md, borderBottomWidth: 1, borderBottomColor: T.color.border },
  mapBackBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  mapTitle: { fontSize: T.size.body, fontWeight: T.weight.bold, color: T.color.ink },
  mapDoneBtn: { paddingHorizontal: T.space.md },
  mapDoneText: { color: T.color.primary, fontWeight: T.weight.bold },
  searchBarWrapper: { position: 'absolute', top: 120, left: T.space.lg, right: T.space.lg, zIndex: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: T.space.sm, backgroundColor: T.color.surface, paddingHorizontal: T.space.md, paddingVertical: T.space.sm, borderRadius: T.radius.lg, ...T.shadow.md, borderWidth: 1, borderColor: T.color.border },
  searchInput: { flex: 1, fontSize: T.size.body, color: T.color.ink, height: 40 },
  suggestionsList: { backgroundColor: T.color.surface, borderRadius: T.radius.lg, marginTop: 4, overflow: 'hidden', ...T.shadow.lg, borderWidth: 1, borderColor: T.color.border },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: T.space.md, borderBottomWidth: 1, borderBottomColor: T.color.border },
  suggestionIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: T.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  suggestionTitle: { fontSize: T.size.bodySm, fontWeight: T.weight.bold, color: T.color.ink },
  suggestionSub: { fontSize: T.size.micro, color: T.color.inkSubtle },
  mapCenterMark: { position: 'absolute', top: '50%', left: '50%', marginLeft: -20, marginTop: -40, alignItems: 'center', justifyContent: 'center' },
  pinDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.2)', position: 'absolute', bottom: 0 },
  recenterBtn: { position: 'absolute', bottom: 100, right: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...T.shadow.md },
  mapTip: { position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.7)', padding: 12, borderRadius: T.radius.lg },
  mapTipText: { color: '#fff', fontSize: T.size.caption, textAlign: 'center' },
})
