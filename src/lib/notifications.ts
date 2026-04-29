// Browser notifications + audible "ding" for new sales orders.
// Sound is synthesized via Web Audio (no asset needed); browser autoplay
// policies require unlock from a user gesture before audio can play.

let audioCtx: AudioContext | null = null

export function unlockAudio() {
  if (audioCtx) return
  try {
    const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
    audioCtx = new Ctx()
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {})
  } catch {
    audioCtx = null
  }
}

export function playDing() {
  if (!audioCtx) return
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {})
    const now = audioCtx.currentTime
    const tones = [
      { freq: 880,  when: 0,    dur: 0.18 },
      { freq: 1320, when: 0.12, dur: 0.4 },
    ]
    for (const t of tones) {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.value = t.freq
      gain.gain.setValueAtTime(0.0001, now + t.when)
      gain.gain.exponentialRampToValueAtTime(0.35, now + t.when + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t.when + t.dur)
      osc.connect(gain).connect(audioCtx.destination)
      osc.start(now + t.when)
      osc.stop(now + t.when + t.dur + 0.02)
    }
  } catch {}
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission
  }
  try { return await Notification.requestPermission() } catch { return 'denied' }
}

export function showNotification(title: string, body: string) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    new Notification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'livra-order',
      requireInteraction: false,
    })
  } catch {}
}

const STORAGE_KEY = 'livra_notifications_enabled'

export function getNotificationsEnabled(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}

export function setNotificationsEnabled(on: boolean) {
  try {
    if (on) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
