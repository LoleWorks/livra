// ─── Types ────────────────────────────────────────────────────────────────────

export interface TrackingEvent {
  date: string
  event: string
  event_name: string
  event_status: 'passed' | 'now' | 'future'
  country_code: string
  settlement_name: string
  division_name: string
  division_coordinates: { latitude: number | null; longitude: number | null }
  is_synthetic?: boolean
}

export interface TrackingData {
  number: string
  carrier?: string
  sender:    { country_code: string; settlement: string }
  recipient: { country_code: string; settlement: string }
  scheduled_delivery_date: string
  tracking: TrackingEvent[]
  total_weight: number
  parcels: Array<{
    parcel_description: string
    actual_weight: number
    length: number
    width: number
    height: number
  }>
}

// ─── CourierManager carrier registry ─────────────────────────────────────────
// Adding a new carrier = one line here

export const CM_CARRIERS: Record<string, { name: string; base: string; appcont: number }> = {
  'curier-rapid': { name: 'Curier Rapid', base: 'https://app.curierrapid.md/curierrapid', appcont: 2998 },
  'fan-curier':   { name: 'Fan Curier',   base: 'https://app.fancourier.md/fan',          appcont: 3895 },
}

// ─── Carrier detection ────────────────────────────────────────────────────────

function detectSource(awb: string): 'novapost' | 'couriermanager' {
  const a = awb.trim()
  // Pure 14-digit format (e.g. 59001234567890)
  if (/^\d{14}$/.test(a)) return 'novapost'
  // International format: NP + 2-letter country + digits + suffix (e.g. NPMD00000000051596NPG)
  if (/^NP[A-Z]{2}\d+[A-Z]+$/.test(a)) return 'novapost'
  return 'couriermanager'
}

// ─── NovaPost adapter ─────────────────────────────────────────────────────────

async function fetchNovaPost(awb: string): Promise<TrackingData> {
  const res = await fetch(`https://api.novapost.com/site/v.1.0/shipments/tracking/${awb}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  return { ...json, carrier: 'Nova Post' }
}

// ─── CourierManager HTML parser ───────────────────────────────────────────────
// NOTE: regex validated against CSS class structure. Verify field positions
// against a real response when first real AWB is available.

function parseCMHtml(html: string, awb: string, carrierName: string): TrackingData | null {
  if (!html.includes('delivery-status')) return null

  const events: TrackingEvent[] = []

  // Split HTML into one segment per delivery-status div
  const segments = html.split(/(?=<div[^>]*class="[^"]*delivery-status)/)

  for (const seg of segments) {
    const classMatch = seg.match(/class="([^"]*)"/)
    if (!classMatch || !classMatch[1].includes('delivery-status')) continue

    const isCurrent = classMatch[1].includes('active')

    // Strip scripts, styles, tags — leave readable text
    const raw = seg
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!raw || raw.length < 3) continue

    // Extract date (dd.mm.yyyy hh:mm or yyyy-mm-dd hh:mm)
    const dateMatch = raw.match(
      /\d{2}[./-]\d{2}[./-]\d{4}(?:[,\s]+\d{2}:\d{2}(?::\d{2})?)?|\d{4}[./-]\d{2}[./-]\d{2}(?:\s+\d{2}:\d{2}(?::\d{2})?)?/
    )
    const date      = dateMatch?.[0] ?? ''
    const statusText = raw.replace(date, '').trim()

    if (!statusText) continue

    events.push({
      date,
      event:        statusText,   // Romanian text used directly as key
      event_name:   statusText,
      event_status: isCurrent ? 'now' : 'passed',
      country_code:        '',
      settlement_name:     '',
      division_name:       '',
      division_coordinates: { latitude: null, longitude: null },
      is_synthetic: false,
    })
  }

  if (!events.length) return null

  return {
    number:    awb,
    carrier:   carrierName,
    sender:    { country_code: '', settlement: '' },
    recipient: { country_code: '', settlement: '' },
    scheduled_delivery_date: '',
    tracking:  events,
    total_weight: 0,
    parcels:   [],
  }
}

// ─── CourierManager adapter ───────────────────────────────────────────────────

async function fetchCMCarrier(
  awb: string,
  config: { name: string; base: string; appcont: number },
): Promise<TrackingData | null> {
  try {
    const res = await fetch(
      `${config.base}/Main?tracking=true&appcont=${config.appcont}&onlyCodes=false`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `awbno=${encodeURIComponent(awb)}`,
      }
    )
    if (!res.ok) return null
    const html = await res.text()
    return parseCMHtml(html, awb, config.name)
  } catch {
    return null
  }
}

async function fetchCourierManager(awb: string): Promise<TrackingData> {
  // Try all registered CM carriers in parallel — first hit wins
  const results = await Promise.all(
    Object.values(CM_CARRIERS).map(config => fetchCMCarrier(awb, config))
  )
  const found = results.find(r => r !== null)
  if (!found) throw new Error('AWB-ul nu a fost gasit la niciun transportator suportat.')
  return found
}

// ─── Public API ───────────────────────────────────────────────────────────────

// carrierHint: stored carrier name from SavedParcel — skips auto-detection and
// routes directly, which avoids mis-routing previously-tracked AWBs.
export async function fetchTracking(awb: string, carrierHint?: string): Promise<TrackingData> {
  const clean = awb.trim().toUpperCase()

  if (carrierHint === 'Nova Post') return fetchNovaPost(clean)

  // Match hint against a registered CM carrier name
  const cmEntry = carrierHint
    ? Object.values(CM_CARRIERS).find(c => c.name === carrierHint)
    : undefined
  if (cmEntry) {
    const result = await fetchCMCarrier(clean, cmEntry)
    if (result) return result
    throw new Error('AWB-ul nu a fost gasit la acest transportator.')
  }

  // No carrier hint — last-resort auto-detection (legacy saves without stored carrier)
  const source = detectSource(clean)
  if (source === 'novapost') return fetchNovaPost(clean)
  return fetchCourierManager(clean)
}
