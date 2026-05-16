import { useRef, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { WebView, WebViewMessageEvent } from 'react-native-webview'

const DEFAULT_LAT = 47.026
const DEFAULT_LNG = 28.838

interface Props {
  driverLat?: number | null
  driverLng?: number | null
  destLat?:   number | null
  destLng?:   number | null
  pickupLat?: number | null
  pickupLng?: number | null
}

function buildHtml(
  driverLat?: number | null, 
  driverLng?: number | null, 
  destLat?: number | null, 
  destLng?: number | null,
  pickupLat?: number | null,
  pickupLng?: number | null
) {
  const centerLat = driverLat ?? pickupLat ?? destLat ?? DEFAULT_LAT
  const centerLng = driverLng ?? pickupLng ?? destLng ?? DEFAULT_LNG

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { crs: L.CRS.EPSG3395, zoomControl: false, attributionControl: false })
      .setView([${centerLat}, ${centerLng}], 15);

    L.tileLayer(
      'https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&scale=1&lang=ru_RU',
      { maxZoom: 19 }
    ).addTo(map);

    var vanSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 24" width="40" height="24"><rect x="1" y="6" width="30" height="16" rx="2" fill="#FF5C2C"/><rect x="31" y="10" width="8" height="10" rx="1" fill="#FF5C2C"/><rect x="32" y="11" width="6" height="6" rx="1" fill="#fff" opacity="0.7"/><circle cx="8" cy="22" r="3" fill="#1a1a1a"/><circle cx="26" cy="22" r="3" fill="#1a1a1a"/><rect x="2" y="8" width="14" height="8" rx="1" fill="#fff" opacity="0.2"/></svg>';
    var vanIcon = L.divIcon({ html: vanSvg, iconSize: [40,24], iconAnchor: [20,12], className: '' });

    var destSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="38"><path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20S24 20 24 12C24 5.373 18.627 0 12 0z" fill="#FF5C2C"/><circle cx="12" cy="12" r="5" fill="white"/></svg>';
    var destIcon = L.divIcon({ html: destSvg, iconSize: [28,38], iconAnchor: [14,38], className: '' });

    var pickupSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="38"><path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20S24 20 24 12C24 5.373 18.627 0 12 0z" fill="#000"/><circle cx="12" cy="12" r="5" fill="white"/></svg>';
    var pickupIcon = L.divIcon({ html: pickupSvg, iconSize: [28,38], iconAnchor: [14,38], className: '' });

    var driverMarker = null;
    var destMarker   = null;
    var pickupMarker = null;

    ${driverLat != null && driverLng != null ? `
    driverMarker = L.marker([${driverLat}, ${driverLng}], { icon: vanIcon }).addTo(map);
    ` : ''}

    ${destLat != null && destLng != null ? `
    destMarker = L.marker([${destLat}, ${destLng}], { icon: destIcon }).addTo(map);
    ` : ''}

    ${pickupLat != null && pickupLng != null ? `
    pickupMarker = L.marker([${pickupLat}, ${pickupLng}], { icon: pickupIcon }).addTo(map);
    ` : ''}

    if (destMarker && pickupMarker) {
      var route = L.polyline([pickupMarker.getLatLng(), destMarker.getLatLng()], { color: '#000', weight: 2, dashArray: '5, 10', opacity: 0.5 }).addTo(map);
      map.fitBounds(L.featureGroup([pickupMarker, destMarker]).getBounds(), { padding: [50, 50] });
    }

    document.addEventListener('message', handleMsg);
    window.addEventListener('message', handleMsg);

    function handleMsg(e) {
      try {
        var msg = JSON.parse(e.data);
        if (msg.type === 'updateDriver' && msg.lat != null) {
          var pos = [msg.lat, msg.lng];
          if (driverMarker) driverMarker.setLatLng(pos);
          else driverMarker = L.marker(pos, { icon: vanIcon }).addTo(map);
          // Only pan if we aren't showing a full route already
          if (!pickupMarker) map.panTo(pos);
        }
      } catch(err) {}
    }
  </script>
</body>
</html>`
}

export default function TrackMap({ driverLat, driverLng, destLat, destLng, pickupLat, pickupLng }: Props) {
  const webRef = useRef<WebView>(null)

  useEffect(() => {
    if (!webRef.current || driverLat == null || driverLng == null) return
    webRef.current.postMessage(JSON.stringify({ type: 'updateDriver', lat: driverLat, lng: driverLng }))
  }, [driverLat, driverLng])

  return (
    <View style={styles.root}>
      <WebView
        ref={webRef}
        source={{ html: buildHtml(driverLat, driverLng, destLat, destLng, pickupLat, pickupLng) }}
        style={StyleSheet.absoluteFillObject}
        scrollEnabled={false}
        originWhitelist={['*']}
        javaScriptEnabled
      />
    </View>
  )
}

const styles = StyleSheet.create({ root: { flex: 1 } })
