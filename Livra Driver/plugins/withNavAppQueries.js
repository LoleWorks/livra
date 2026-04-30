// Expo config plugin: registers outgoing-intent <queries> in AndroidManifest
// for Waze, Google Navigation, and Google Maps. Required so canOpenURL()
// can detect these nav apps on Android 11+ (package visibility model).
const { withAndroidManifest } = require('expo/config-plugins')

const SCHEMES = ['waze', 'google.navigation', 'comgooglemaps']

module.exports = function withNavAppQueries(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest
    manifest.queries = manifest.queries || []
    if (manifest.queries.length === 0) manifest.queries.push({ intent: [] })
    const queries = manifest.queries[0]
    queries.intent = queries.intent || []

    for (const scheme of SCHEMES) {
      const exists = queries.intent.some(intent =>
        intent.data?.some(d => d.$['android:scheme'] === scheme)
      )
      if (!exists) {
        queries.intent.push({
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ $: { 'android:scheme': scheme } }],
        })
      }
    }
    return cfg
  })
}
