import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Clipboard, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { tokens as T } from '../src/theme/tokens'
import {
  ALL_EVENT_KEYS, FALLBACK_VARIANTS, NOTIF_VARIANTS,
  getExpoPushToken, pickNotification, sendLocalNotif, simpleHash,
} from '../src/lib/notifications'

const TEST_AWB   = 'TEST000000001'
const TEST_DATE  = '2026-01-01'
const TEST_LABEL = 'Tricou Nike'

export default function DevNotificationsScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const [token,      setToken]      = useState<string | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [copied,     setCopied]     = useState(false)
  const [sent,    setSent]    = useState<Record<string, boolean>>({})
  // variant index per event — lets user cycle through all variants
  const [variantIdx, setVariantIdx] = useState<Record<string, number>>({})

  useEffect(() => {
    getExpoPushToken().then(({ token, error }) => {
      setToken(token)
      setTokenError(error)
    })
  }, [])

  async function fire(event: string) {
    const idx  = variantIdx[event] ?? 0
    const pool = NOTIF_VARIANTS[event] ?? FALLBACK_VARIANTS
    // pin to specific variant index instead of hash so we can cycle
    const rawTitle = pool[idx % pool.length].title
    const rawBody  = pool[idx % pool.length].body
    const title = rawTitle.replace(/\[label\]/g, TEST_LABEL)
    const body  = rawBody.replace(/\[label\]/g, TEST_LABEL)

    await sendLocalNotif(title, body, { awb: TEST_AWB, carrier: 'Nova Post' })
    setSent(prev => ({ ...prev, [event]: true }))
    setTimeout(() => setSent(prev => ({ ...prev, [event]: false })), 1500)
  }

  function nextVariant(event: string) {
    const pool = NOTIF_VARIANTS[event] ?? FALLBACK_VARIANTS
    setVariantIdx(prev => ({
      ...prev,
      [event]: ((prev[event] ?? 0) + 1) % pool.length,
    }))
  }

  function copyToken() {
    if (!token) return
    Clipboard.setString(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fallbackEvent = '__fallback__'

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={T.color.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Notificări — Dev</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: Math.max(T.space.xl, insets.bottom + T.space.md) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Push token */}
        <View style={styles.tokenCard}>
          <Text style={styles.sectionLabel}>EXPO PUSH TOKEN</Text>
          <Text style={styles.tokenText} selectable numberOfLines={token ? 2 : undefined}>
            {token ?? tokenError ?? 'Se încarcă...'}
          </Text>
          {token && (
            <TouchableOpacity style={styles.copyBtn} onPress={copyToken}>
              <Feather name={copied ? 'check' : 'copy'} size={14} color={copied ? T.color.success : T.color.primary} />
              <Text style={[styles.copyBtnText, copied && { color: T.color.success }]}>
                {copied ? 'Copiat!' : 'Copiază'}
              </Text>
            </TouchableOpacity>
          )}
          <Text style={styles.tokenHint}>
            Pastează la expo.dev/notifications pentru a testa push-uri remote.
          </Text>
        </View>

        {/* Event rows */}
        <Text style={styles.sectionLabel}>EVENIMENTE CUNOSCUTE ({ALL_EVENT_KEYS.length})</Text>
        <View style={styles.card}>
          {ALL_EVENT_KEYS.map((event, i) => {
            const pool = NOTIF_VARIANTS[event]
            const idx  = variantIdx[event] ?? 0
            const preview = pool[idx % pool.length]
            return (
              <View key={event} style={[styles.row, i < ALL_EVENT_KEYS.length - 1 && styles.rowBorder]}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.eventKey}>{event}</Text>
                  <Text style={styles.preview} numberOfLines={1}>
                    {preview.title.replace(/\[label\]/g, TEST_LABEL)}
                  </Text>
                  <Text style={styles.previewBody} numberOfLines={2}>
                    {preview.body.replace(/\[label\]/g, TEST_LABEL)}
                  </Text>
                  <Text style={styles.variantHint}>
                    Variantă {(idx % pool.length) + 1} / {pool.length}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.cycleBtn} onPress={() => nextVariant(event)}>
                    <Feather name="refresh-cw" size={14} color={T.color.inkMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sendBtn, sent[event] && styles.sendBtnSent]}
                    onPress={() => fire(event)}
                  >
                    <Feather name={sent[event] ? 'check' : 'send'} size={14} color={sent[event] ? T.color.success : '#fff'} />
                    <Text style={[styles.sendBtnText, sent[event] && { color: T.color.success }]}>
                      {sent[event] ? 'Trimis' : 'Test'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          })}
        </View>

        {/* Fallback row */}
        <Text style={[styles.sectionLabel, { marginTop: T.space.lg }]}>FALLBACK (EVENIMENT NECUNOSCUT)</Text>
        <View style={styles.card}>
          {FALLBACK_VARIANTS.map((v, i) => (
            <View key={i} style={[styles.row, i < FALLBACK_VARIANTS.length - 1 && styles.rowBorder]}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.preview} numberOfLines={1}>
                  {v.title.replace(/\[label\]/g, TEST_LABEL)}
                </Text>
                <Text style={styles.previewBody} numberOfLines={2}>
                  {v.body.replace(/\[label\]/g, TEST_LABEL)}: StatusNecunoscut
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.sendBtn, sent[`fb${i}`] && styles.sendBtnSent]}
                onPress={async () => {
                  const title = v.title.replace(/\[label\]/g, TEST_LABEL)
                  const body  = v.body.replace(/\[label\]/g, TEST_LABEL) + ': StatusNecunoscut'
                  await sendLocalNotif(title, body, { awb: TEST_AWB, carrier: 'Nova Post' })
                  setSent(prev => ({ ...prev, [`fb${i}`]: true }))
                  setTimeout(() => setSent(prev => ({ ...prev, [`fb${i}`]: false })), 1500)
                }}
              >
                <Feather name={sent[`fb${i}`] ? 'check' : 'send'} size={14} color={sent[`fb${i}`] ? T.color.success : '#fff'} />
                <Text style={[styles.sendBtnText, sent[`fb${i}`] && { color: T.color.success }]}>
                  {sent[`fb${i}`] ? 'Trimis' : 'Test'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Text style={styles.footerNote}>
          Notificările locale apar imediat. Testele remote necesită token + expo.dev/notifications.
        </Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: T.color.bg },
  header:       { flexDirection: 'row', alignItems: 'center', gap: T.space.sm, paddingHorizontal: T.space.lg, paddingTop: T.space.sm, paddingBottom: T.space.md },
  back:         { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title:        { fontFamily: T.font.display, fontSize: 22, fontWeight: T.weight.bold, color: T.color.ink },
  list:         { paddingHorizontal: T.space.lg, paddingTop: T.space.sm, gap: T.space.sm },
  sectionLabel: { fontFamily: T.font.mono, fontSize: T.size.micro, color: T.color.inkSubtle, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: T.space.sm, marginBottom: T.space.xs },
  tokenCard:    { backgroundColor: T.color.surface, borderRadius: T.radius.lg, borderWidth: 1, borderColor: T.color.border, padding: T.space.md, gap: T.space.xs },
  tokenText:    { fontFamily: T.font.mono, fontSize: T.size.caption, color: T.color.ink, lineHeight: 18 },
  copyBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: T.space.xs },
  copyBtnText:  { fontSize: T.size.caption, fontWeight: T.weight.semibold, color: T.color.primary },
  tokenHint:    { fontSize: T.size.caption, color: T.color.inkMuted, lineHeight: 16 },
  card:         { backgroundColor: T.color.surface, borderRadius: T.radius.lg, borderWidth: 1, borderColor: T.color.border, overflow: 'hidden' },
  row:          { flexDirection: 'row', alignItems: 'flex-start', gap: T.space.sm, padding: T.space.md },
  rowBorder:    { borderBottomWidth: 1, borderBottomColor: T.color.border },
  eventKey:     { fontFamily: T.font.mono, fontSize: T.size.micro, color: T.color.primary, letterSpacing: 0.3, marginBottom: 2 },
  preview:      { fontSize: T.size.bodySm, fontWeight: T.weight.semibold, color: T.color.ink },
  previewBody:  { fontSize: T.size.caption, color: T.color.inkMuted, lineHeight: 16, marginTop: 1 },
  variantHint:  { fontSize: T.size.micro, color: T.color.inkSubtle, marginTop: 3 },
  actions:      { flexDirection: 'row', alignItems: 'center', gap: T.space.xs, flexShrink: 0 },
  cycleBtn:     { width: 32, height: 32, borderRadius: T.radius.sm, backgroundColor: T.color.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.color.border },
  sendBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, height: 32, borderRadius: T.radius.sm, backgroundColor: T.color.primary },
  sendBtnSent:  { backgroundColor: T.color.successBg },
  sendBtnText:  { fontSize: T.size.caption, fontWeight: T.weight.semibold, color: '#fff' },
  footerNote:   { fontSize: T.size.caption, color: T.color.inkSubtle, textAlign: 'center', lineHeight: 18, marginTop: T.space.md },
})
