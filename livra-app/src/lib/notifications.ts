import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotifVariant {
  title: string
  body:  string
}

// ─── Known event variants ─────────────────────────────────────────────────────
// [label] is replaced with customLabel or "coletul tău"

export const NOTIF_VARIANTS: Record<string, NotifVariant[]> = {
  ReceivedFromSender: [
    { title: 'Aventura incepe!',        body: '[label] a pornit la drum' },
    { title: 'Cineva ti-a trimis ceva', body: '[label] e in sistem' },
    { title: 'Urmarim fiecare pas',     body: '[label] a intrat in joc. Suntem pe fir' },
    { title: 'Misiune acceptata',       body: 'Livrare [label] confirmata' },
    { title: 'Tic-tac!',               body: '[label] e procesata. Suntem pe fir' },
  ],
  DepartureOriginDepot: [
    { title: 'A scapat din depou!',     body: '[label] e libera si vine spre tine' },
    { title: 'Breaking news',           body: '[label] a iesit din depou. Povestea incepe' },
    { title: 'Saci, camioane, drumuri', body: '[label] e in miscare' },
    { title: 'S-a urcat in camion!',    body: '[label] si-a inceput calatoria' },
    { title: 'Hai ca pleaca!',          body: '[label] a pornit. Numaram km impreuna' },
  ],
  ArrivalTransitDepot: [
    { title: 'Scurta pauza',           body: '[label] face un popas in tranzit' },
    { title: 'Checkpoint!',            body: '[label] e la jumatatea drumului' },
    { title: 'Pauza de drum',          body: '[label] trage sufletul la un depou de tranzit' },
    { title: 'O mica oprire',          body: '[label] nu uita de tine. Ne intoarcem in curand' },
    { title: 'Normal, si ea oboseste', body: '[label] face o pauza de drum' },
  ],
  DepartureTransitDepot: [
    { title: 'Pauza s-a terminat!',    body: '[label] e din nou pe drum' },
    { title: 'Etapa 2!',               body: '[label] a iesit din tranzit si vine spre tine' },
    { title: 'Destinatie: TU',         body: '[label] a pornit motorul din nou' },
    { title: 'Hai ca a plecat iar!',   body: 'Fiecare km aduce [label] mai aproape' },
    { title: 'Nimic nu o opreste!',    body: '[label] continua spre tine' },
  ],
  ArrivalDestinationDepot: [
    { title: 'E in orasul tau!',       body: '[label] a ajuns. Maine dimineata e la usa ta' },
    { title: 'BREAKING',               body: '[label] e in Chisinau. Maine e ziua ta' },
    { title: 'Cea mai buna veste',     body: '[label] e deja in zona ta' },
    { title: 'Deja la depoul din cartier!', body: '[label] te asteapta de maine' },
    { title: 'Aproape acasa',          body: '[label] a terminat calatoria lunga. Mai e un pas' },
    { title: 'Apropo',                 body: '[label] doarme la depou. Maine vine la tine' },
  ],
  OutForDelivery: [
    { title: 'EL VINE!',               body: 'Curierul cu [label] e pe drum chiar acum' },
    { title: 'Azi e ZIUA',             body: '[label] e la curier. Nu pleca de acasa!' },
    { title: 'Alerta livrare finala',  body: '[label] e in livrare. Fii pregatit' },
    { title: 'Suna la usa in curand!', body: '[label] e la cativa km distanta' },
    { title: 'Telefonul aproape',      body: 'Curierul suna cand ajunge cu [label]' },
    { title: 'Nu raspunde la apeluri necunoscute...', body: '...de fapt raspunde, e curierul cu [label]!' },
  ],
  AtCustoms: [
    { title: 'Mic hop',                body: '[label] negociaza cu vama. Ii tinem pumnii' },
    { title: 'Suspans total',          body: '[label] a ajuns la vama' },
    { title: 'Intermission vamal',     body: '[label] e la control. Dureaza 1-3 zile' },
    { title: 'Vama, vama...',          body: '[label] e acolo. Te tinem la curent' },
    { title: 'A intalnit vamesul',     body: '[label] e la control. Totul e ok, dar dureaza putin' },
  ],
  CustomsCleared: [
    { title: 'LIBER!',                 body: 'Vama a dat drumul la [label]. Nimic nu o mai opreste' },
    { title: 'A trecut vama!',         body: '[label] e din nou in miscare' },
    { title: 'Plot twist',             body: 'Vama a fost rapida! [label] continua spre tine' },
    { title: 'Vama a zis DA!',         body: '[label] vine direct spre tine' },
    { title: 'A scapat de la vama',    body: '[label] continua povestea' },
  ],
  DeliveryFailed: [
    { title: 'Curier 1 - Tu 0',        body: 'Maine revansa! [label] mai incearca o data' },
    { title: 'Ne-am ratat de putin',   body: 'Curierul a trecut dar nu te-a gasit pentru [label]' },
    { title: 'Nimeni acasa?',          body: '[label] se intoarce la depou. Programam din nou' },
    { title: 'Se mai intampla',        body: '[label] a asteptat, tu n-ai fost. Ne intoarcem' },
    { title: 'Nu totul e pierdut!',    body: 'Apasa sa vezi optiunile pentru [label]' },
  ],
  Delivered: [
    { title: 'A AJUNS!',               body: '[label] te asteapta la usa chiar acum!' },
    { title: 'Ding dong!',             body: '[label] a sosit. Deschide usa' },
    { title: 'Misiune indeplinita!',   body: '[label] e acasa. Felicitari ca ai asteptat' },
    { title: 'Cineva a lasat ceva...', body: '[label] a ajuns!' },
    { title: 'Plot final',             body: '[label] e livrat! Si toti au trait fericiti' },
    { title: 'BOOM!',                  body: 'Ai un pachet. [label] e la tine acum' },
  ],
}

// ─── Fallback pool for unknown events ────────────────────────────────────────
// event_name is appended automatically by pickNotification

export const FALLBACK_VARIANTS: NotifVariant[] = [
  { title: 'Noutati!',            body: 'Apasa sa vezi ce s-a intamplat cu [label]' },
  { title: 'Update pe traseu',    body: '[label] - ceva s-a schimbat. Apasa sa afli' },
  { title: '[label] e in miscare', body: 'Apasa pentru ultimul status' },
  { title: 'Curiozitate?',        body: 'Ai un update nou pentru [label]' },
  { title: 'Ceva s-a intamplat', body: 'Deschide sa vezi tot despre [label]' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function simpleHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function applyLabel(text: string, customLabel?: string): string {
  return text.replace(/\[label\]/g, customLabel || 'coletul tău')
}

export function pickNotification(
  event:       string,
  awb:         string,
  date:        string,
  customLabel?: string,
  eventName?:  string,
): { title: string; body: string } {
  const seed    = simpleHash(awb + date + event)
  const pool    = NOTIF_VARIANTS[event]

  if (pool) {
    const variant = pool[seed % pool.length]
    return {
      title: applyLabel(variant.title, customLabel),
      body:  applyLabel(variant.body,  customLabel),
    }
  }

  // Unknown event — use fallback + append real event name
  const fallback = FALLBACK_VARIANTS[seed % FALLBACK_VARIANTS.length]
  const suffix   = eventName && eventName !== event ? `: ${eventName}` : ''
  return {
    title: applyLabel(fallback.title, customLabel),
    body:  applyLabel(fallback.body,  customLabel) + suffix,
  }
}

// ─── Permission + push token ──────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function getExpoPushToken(): Promise<{ token: string | null; error: string | null }> {
  const projectId: string | undefined =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId

  if (!projectId) {
    return { token: null, error: 'Lipsește projectId EAS. Rulează: npx eas init' }
  }

  try {
    const result = await Notifications.getExpoPushTokenAsync({ projectId })
    return { token: result.data, error: null }
  } catch (e) {
    return { token: null, error: e instanceof Error ? e.message : 'Eroare necunoscută' }
  }
}

// ─── Send a local notification immediately (Expo Go compatible) ───────────────

export async function sendLocalNotif(title: string, body: string, data?: Record<string, string>): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data: data ?? {} },
    trigger: null,
  })
}

// ─── All event keys for dev screen ───────────────────────────────────────────

export const ALL_EVENT_KEYS = Object.keys(NOTIF_VARIANTS)
