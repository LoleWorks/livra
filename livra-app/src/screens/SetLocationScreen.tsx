import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { WebView } from 'react-native-webview'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../lib/colors'
import type { RootStackParamList } from '../types'

type Props = NativeStackScreenProps<RootStackParamList, 'SetLocation'>

const MAP_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    #map { width:100vw; height:100vh; }
    .pin-icon { font-size:32px; line-height:1; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', { zoomControl:true, attributionControl:false });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom:19 }).addTo(map);
  map.setView([47.0245, 28.8322], 14);

  var pinIcon = L.divIcon({ html:'<div class="pin-icon">\\u{1F4CD}</div>', iconSize:[32,32], iconAnchor:[16,32], className:'' });
  var marker = null;

  map.on('click', function(e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng], { icon:pinIcon, draggable:true }).addTo(map);
      marker.on('dragend', function() {
        var pos = marker.getLatLng();
        window.ReactNativeWebView.postMessage(JSON.stringify({ lat: pos.lat, lng: pos.lng }));
      });
    }
    window.ReactNativeWebView.postMessage(JSON.stringify({ lat: lat, lng: lng }));
  });
</script>
</body>
</html>`

export default function SetLocationScreen({ route }: Props) {
  const navigation = useNavigation()
  const [pin, setPin] = useState<{ latitude: number; longitude: number } | null>(null)
  const [name, setName] = useState('')

  function onMessage(event: any) {
    try {
      const { lat, lng } = JSON.parse(event.nativeEvent.data)
      setPin({ latitude: lat, longitude: lng })
    } catch {}
  }

  function save() {
    if (!pin || !name.trim()) return
    // TODO: save to API / local storage
    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <WebView
        style={styles.map}
        originWhitelist={['*']}
        source={{ html: MAP_HTML }}
        onMessage={onMessage}
      />

      {!pin && (
        <View style={styles.instructionOverlay}>
          <Text style={styles.instructionText}>
            Apasă pe hartă exact unde se află intrarea ta
          </Text>
        </View>
      )}

      <View style={styles.panel}>
        <View style={styles.handle} />

        {pin ? (
          <>
            <Text style={styles.panelTitle}>Numește locația</Text>
            <View style={styles.suggestions}>
              {['Acasă', 'Birou', 'La Mama', 'Alt loc'].map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.suggestionChip, name === s && styles.suggestionChipActive]}
                  onPress={() => setName(s)}
                >
                  <Text style={[styles.suggestionText, name === s && styles.suggestionTextActive]}>
                    {s}
                  </Text>
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
              <Text style={styles.saveBtnText}>Salvează locația</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.tapHint}>
            <Ionicons name="finger-print-outline" size={28} color={colors.orange} />
            <Text style={styles.tapHintText}>Atinge harta pentru a pune pin-ul</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  instructionOverlay: {
    position: 'absolute',
    top: 60,
    left: 24,
    right: 24,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionText: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '500',
    textAlign: 'center',
  },
  panel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.gray200,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 14,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray100,
  },
  suggestionChipActive: {
    backgroundColor: colors.orange,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.gray700,
    fontWeight: '500',
  },
  suggestionTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.gray200,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.black,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: colors.orange,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: colors.gray200,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  tapHint: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  tapHintText: {
    fontSize: 15,
    color: colors.gray500,
    fontWeight: '500',
  },
})
