import { Linking, Platform, Alert } from 'react-native'
import type { NavApp } from './storage'

// Open a single stop in the driver's nav app of choice.
//
// On Android we send a standard `geo:` URI — Android's package manager then
// shows the user the system "Open with" chooser listing every nav app they
// have installed (Waze, Google Maps, Yandex Maps, Sygic, etc.) with a one-tap
// "Always / Just once" toggle. We don't need to maintain our own app picker.
//
// On iOS `geo:` isn't a thing, so we fall back to the universal Apple Maps
// link, which iOS routes to the user's preferred app via Universal Links.
export async function openExternalNav(
  lat: number,
  lng: number,
  label: string,
): Promise<void> {
  const enc = encodeURIComponent(label)

  if (Platform.OS === 'android') {
    // `q=` lets the chooser see the destination & label (some apps use it).
    // The leading `0,0` ensures the chooser-friendly form even when the user
    // doesn't yet have a default nav app set.
    const geoUrl = `geo:0,0?q=${lat},${lng}(${enc})`
    const ok = await Linking.canOpenURL(geoUrl).catch(() => false)
    if (ok) { await Linking.openURL(geoUrl); return }
  } else {
    // iOS: Apple Maps universal link (works whether Apple Maps is installed
    // or the user has set Google Maps / Waze as default via iOS settings).
    const appleUrl = `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
    const ok = await Linking.canOpenURL(appleUrl).catch(() => false)
    if (ok) { await Linking.openURL(appleUrl); return }
  }

  // Cross-platform fallback: the universal Google Maps web URL. Opens the
  // installed Google Maps app on either OS, or the web map in a browser.
  const webFallback = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
  const ok = await Linking.canOpenURL(webFallback).catch(() => false)
  if (ok) { await Linking.openURL(webFallback); return }

  Alert.alert(
    'Aplicație lipsă',
    'Instalează Waze, Google Maps sau o altă aplicație de navigare.',
  )
}

function buildUrlChain(lat: number, lng: number, label: string, app: NavApp): string[] {
  const enc = encodeURIComponent(label)
  switch (app) {
    case 'waze':
      // Native scheme first, web fallback (which Waze app catches via Universal Link on iOS)
      return [
        `waze://?ll=${lat},${lng}&navigate=yes`,
        `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
      ]
    case 'google':
      // google.navigation:// triggers turn-by-turn directly on Android.
      // comgooglemaps:// is the iOS scheme. Universal URL is the final fallback
      // and opens the installed Google Maps app via Universal Links on both OSes,
      // or the web map in a browser if Google Maps isn't installed.
      return [
        Platform.OS === 'android'
          ? `google.navigation:q=${lat},${lng}`
          : `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`,
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
      ]
    case 'apple':
      // Apple Maps — only useful on iOS, but the URL works on macOS too.
      return [
        `maps://?daddr=${lat},${lng}&dirflg=d`,
        `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`,
      ]
  }
}

// Build the multi-stop Google Maps URL (max 9 waypoints + 1 destination = 10 stops).
// Returns null if too many stops to fit in the URL.
export function buildBulkGoogleMapsUrl(
  origin: { lat: number; lng: number },
  stops: { lat: number; lng: number }[],
): string | null {
  if (stops.length === 0) return null
  if (stops.length > 10) return null  // Google's hard limit
  const dest = stops[stops.length - 1]
  const waypoints = stops.slice(0, -1).map(s => `${s.lat},${s.lng}`).join('|')
  const params = [
    `api=1`,
    `origin=${origin.lat},${origin.lng}`,
    `destination=${dest.lat},${dest.lng}`,
    waypoints ? `waypoints=${encodeURIComponent(waypoints)}` : '',
    `travelmode=driving`,
  ].filter(Boolean).join('&')
  return `https://www.google.com/maps/dir/?${params}`
}

export function appName(app: NavApp): string {
  switch (app) {
    case 'waze':   return 'Waze'
    case 'google': return 'Google Maps'
    case 'apple':  return 'Apple Maps'
  }
}
