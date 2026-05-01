import { useRef, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { WebView, WebViewMessageEvent } from 'react-native-webview'

const DEFAULT_LAT = 47.026
const DEFAULT_LNG = 28.838

interface Props {
  flyTo?:          { lat: number; lng: number } | null
  onCenterChange?: (lat: number, lng: number) => void
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
      } catch(e) {}
    }
  </script>
</body>
</html>`

export default function PinMap({ flyTo, onCenterChange }: Props) {
  const webRef = useRef<WebView>(null)

  useEffect(() => {
    if (!flyTo || !webRef.current) return
    webRef.current.postMessage(JSON.stringify({ type: 'flyTo', lat: flyTo.lat, lng: flyTo.lng }))
  }, [flyTo?.lat, flyTo?.lng])

  function onMessage(e: WebViewMessageEvent) {
    try {
      const msg = JSON.parse(e.nativeEvent.data)
      if (msg.type === 'center') onCenterChange?.(msg.lat, msg.lng)
    } catch {}
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
