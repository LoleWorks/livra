import { useRef, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

const DEFAULT_LAT = 47.026
const DEFAULT_LNG = 28.838

interface Props {
  flyTo?:          { lat: number; lng: number } | null
  onCenterChange?: (lat: number, lng: number) => void
  staticMarkers?:  { lat: number; lng: number; title: string }[]
}

const MAP_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; }
    .store-label {
      background: white;
      border: 1px solid #FF5C2C;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 10px;
      font-weight: bold;
      color: #FF5C2C;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      crs: L.CRS.EPSG3395,
      zoomControl: false,
      attributionControl: false
    }).setView([${DEFAULT_LAT}, ${DEFAULT_LNG}], 14);

    L.tileLayer(
      'https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&scale=1&lang=ru_RU',
      { maxZoom: 19 }
    ).addTo(map);

    var markersLayer = L.layerGroup().addTo(map);

    map.on('moveend', function() {
      var c = map.getCenter();
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'center', lat: c.lat, lng: c.lng }));
    });

    document.addEventListener('message', function(e) { handleMsg(e.data); });
    window.addEventListener('message',   function(e) { handleMsg(e.data); });

    function handleMsg(raw) {
      try {
        var msg = JSON.parse(raw);
        if (msg.type === 'flyTo') {
          map.flyTo([msg.lat, msg.lng], 17, { duration: 1.2 });
        }
        if (msg.type === 'markers') {
          markersLayer.clearLayers();
          var icon = L.divIcon({
            html: '<svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="#FF5C2C" stroke-width="2" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3))"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
            className: '',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          msg.markers.forEach(function(m) {
            L.marker([m.lat, m.lng], { icon: icon }).addTo(markersLayer)
             .bindTooltip(m.title, { 
               permanent: true, 
               direction: 'top', 
               className: 'store-label',
               offset: [0, -10]
             });
          });
        }
      } catch(e) {}
    }
  </script>
</body>
</html>`

export default function PinMap({ flyTo, onCenterChange, staticMarkers }: Props) {
  const webRef = useRef<WebView>(null)

  useEffect(() => {
    if (!flyTo || !webRef.current) return
    webRef.current.postMessage(JSON.stringify({ type: 'flyTo', lat: flyTo.lat, lng: flyTo.lng }))
  }, [flyTo])

  useEffect(() => {
    if (!webRef.current || !staticMarkers) return
    webRef.current.postMessage(JSON.stringify({ type: 'markers', markers: staticMarkers }))
  }, [staticMarkers])

  function onMessage(e: any) {
    try {
      const msg = JSON.parse(e.nativeEvent.data)
      if (msg.type === 'center') onCenterChange?.(msg.lat, msg.lng)
    } catch (err) {
      console.error('WebView message error:', err)
    }
  }

  return (
    <View style={styles.root}>
      <WebView
        ref={webRef}
        source={{ html: MAP_HTML }}
        style={StyleSheet.absoluteFillObject}
        scrollEnabled={false}
        onMessage={onMessage}
        originWhitelist={['*']}
        javaScriptEnabled
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
})
