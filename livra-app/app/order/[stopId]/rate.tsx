import React, { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { tokens as T } from '../../../src/theme/tokens'
import { supabase } from '../../../src/lib/supabase'
import ScreenHeader from '../../../src/components/ScreenHeader'
import Button from '../../../src/components/Button'

const TAGS = ['La timp', 'Politicos', 'Atent cu coletul', 'Recomand', 'Rapid']

export default function RateScreen() {
  const { stopId } = useLocalSearchParams<{ stopId: string }>()
  const router     = useRouter()
  const insets     = useSafeAreaInsets()
  const [stars,    setStars]    = useState(5)
  const [tags,     setTags]     = useState<string[]>(['La timp', 'Politicos', 'Atent cu coletul'])
  const [comment,  setComment]  = useState('')
  const [loading,  setLoading]  = useState(false)

  const toggleTag = (t: string) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const submit = async () => {
    setLoading(true)
    await supabase.from('livra_delivery_ratings').upsert(
      { stop_id: stopId, stars, tags, comment: comment.trim() || null },
      { onConflict: 'stop_id' },
    )
    setLoading(false)
    Alert.alert('Mulțumim!', 'Evaluarea ta a fost înregistrată.', [
      { text: 'OK', onPress: () => router.back() }
    ])
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScreenHeader leftIcon="close" transparent />
      <View style={styles.content}>
        <View style={styles.avatar}><Text style={styles.avatarText}>Ș</Text></View>
        <Text style={styles.title}>Cum a fost cu șoferul?</Text>
        <Text style={styles.sub}>Comanda #{stopId?.slice(0, 8).toUpperCase()}</Text>

        {/* Stars */}
        <View style={styles.stars}>
          {[1,2,3,4,5].map(s => (
            <TouchableOpacity key={s} onPress={() => setStars(s)} hitSlop={8}>
              <Text style={[styles.star, s <= stars && styles.starActive]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tags */}
        <View style={styles.tags}>
          {TAGS.map(t => (
            <TouchableOpacity key={t} onPress={() => toggleTag(t)}
              style={[styles.tag, tags.includes(t) && styles.tagActive]}>
              <Text style={[styles.tagText, tags.includes(t) && styles.tagTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.textarea}
          placeholder="Vrei să adaugi un comentariu? (opțional)"
          placeholderTextColor={T.color.inkSubtle}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <View style={[styles.btnWrap, { paddingBottom: Math.max(T.space.xl, insets.bottom + T.space.md) }]}>
          <Button label={loading ? 'Se trimite…' : 'Trimite evaluarea'} variant="accent" onPress={submit} disabled={loading} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: T.color.bg },
  content:       { flex: 1, paddingHorizontal: T.space.xl, alignItems: 'center', paddingTop: T.space.md },
  avatar:        { width: 80, height: 80, borderRadius: 40, backgroundColor: T.color.ink, alignItems: 'center', justifyContent: 'center', marginBottom: T.space.md },
  avatarText:    { fontFamily: T.font.display, fontSize: 32, fontWeight: T.weight.bold, color: '#fff' },
  title:         { fontFamily: T.font.display, fontSize: T.size.h1, fontWeight: T.weight.bold, color: T.color.ink, letterSpacing: -0.5, textAlign: 'center' },
  sub:           { fontSize: T.size.bodySm, color: T.color.inkMuted, marginTop: T.space.xs, marginBottom: T.space.xl },
  stars:         { flexDirection: 'row', gap: T.space.xs, marginBottom: T.space.xl },
  star:          { fontSize: 40, color: T.color.borderStrong },
  starActive:    { color: T.color.primary },
  tags:          { flexDirection: 'row', flexWrap: 'wrap', gap: T.space.xs, justifyContent: 'center', marginBottom: T.space.lg },
  tag:           { paddingHorizontal: T.space.md, paddingVertical: T.space.xs, backgroundColor: T.color.surface, borderWidth: 1, borderColor: T.color.borderStrong, borderRadius: T.radius.pill },
  tagActive:     { backgroundColor: T.color.primary, borderColor: T.color.primary },
  tagText:       { fontSize: T.size.bodySm, fontWeight: T.weight.medium, color: T.color.ink },
  tagTextActive: { color: '#fff' },
  textarea:      { width: '100%', minHeight: 80, backgroundColor: T.color.surface, borderWidth: 1, borderColor: T.color.border, borderRadius: T.radius.md, padding: T.space.md, fontSize: T.size.bodySm, color: T.color.ink, marginBottom: T.space.lg },
  btnWrap:       { width: '100%', marginTop: 'auto', paddingBottom: T.space.xl },
})
