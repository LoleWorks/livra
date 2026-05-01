import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { tokens as T } from '../../../src/theme/tokens'
import { supabase, RouteStop, Delivery } from '../../../src/lib/supabase'
import ScreenHeader from '../../../src/components/ScreenHeader'
import Button from '../../../src/components/Button'

export default function OrderDetail() {
  const { stopId } = useLocalSearchParams<{ stopId: string }>()
  const router     = useRouter()
  const insets     = useSafeAreaInsets()
  const [stop,     setStop]     = useState<RouteStop | null>(null)
  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: s } = await supabase.from('livra_route_stops').select('*').eq('id', stopId).single()
      setStop(s)
      if (s?.delivery_id) {
        const { data: d } = await supabase.from('livra_deliveries').select('id,customer,phone,address,order_items,order_items_json,order_value,shipping_cost,package_description,notes,status').eq('id', s.delivery_id).single()
        setDelivery(d)
      }
      setLoading(false)
    }
    load()
  }, [stopId])

  if (loading) return <View style={styles.loader}><ActivityIndicator color={T.color.primary} /></View>
  if (!stop)   return <View style={styles.loader}><Text style={{ color: T.color.inkMuted }}>Comandă negăsită.</Text></View>

  const isDelivered = stop.status === 'completed'
  const isFailed    = stop.status === 'failed'

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScreenHeader leftIcon="back" title={`Comanda #${stop.id.slice(0, 8).toUpperCase()}`} />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(T.space.xl, insets.bottom + T.space.md) }]} showsVerticalScrollIndicator={false}>

        {/* Status banner */}
        {isDelivered && (
          <View style={styles.successBanner}>
            <View style={styles.successIcon}><Feather name="check" size={20} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.successTitle}>Livrată cu succes</Text>
              <Text style={styles.successSub}>{stop.completed_at ? new Date(stop.completed_at).toLocaleString('ro-MD') : ''}</Text>
            </View>
          </View>
        )}
        {isFailed && (
          <View style={styles.failBanner}>
            <Feather name="x-circle" size={20} color={T.color.danger} />
            <View style={{ flex: 1 }}>
              <Text style={styles.failTitle}>Livrare eșuată</Text>
              <Text style={styles.failSub}>{stop.fail_reason ?? ''}</Text>
            </View>
          </View>
        )}

        {/* Package info */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>DETALII COMANDĂ</Text>
          {stop.shop_name && (
            <View style={styles.shopRow}>
              <Feather name="shopping-bag" size={14} color={T.color.primary} />
              <Text style={styles.shopName}>{stop.shop_name}</Text>
            </View>
          )}
          <Text style={styles.packageDesc}>{stop.package_description ?? 'Colet'}</Text>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Feather name="map-pin" size={14} color={T.color.inkMuted} />
            <Text style={styles.detailText}>{stop.address}</Text>
          </View>
          {stop.time_window_start && (
            <View style={styles.detailRow}>
              <Feather name="clock" size={14} color={T.color.inkMuted} />
              <Text style={styles.detailText}>{stop.time_window_start} – {stop.time_window_end}</Text>
            </View>
          )}
          {stop.delivery_notes && (
            <View style={styles.notesBox}>
              <Feather name="alert-circle" size={14} color={T.color.warning} />
              <Text style={styles.notesText}>{stop.delivery_notes}</Text>
            </View>
          )}
        </View>

        {/* Order items + cost */}
        {delivery && (delivery.order_items_json?.length || delivery.order_value != null) && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>PRODUSE ȘI COST</Text>
            {delivery.order_items_json && delivery.order_items_json.length > 0
              ? delivery.order_items_json.map((item, i) => (
                  <View key={i} style={styles.itemRow}>
                    <View style={styles.itemQtyBadge}>
                      <Text style={styles.itemQty}>{item.qty ?? 1}x</Text>
                    </View>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name ?? item.sku ?? '—'}</Text>
                  </View>
                ))
              : delivery.order_items
                ? <Text style={styles.detailText}>{delivery.order_items}</Text>
                : null
            }
            {(delivery.order_value != null || delivery.shipping_cost != null) && (
              <>
                <View style={styles.divider} />
                {delivery.shipping_cost != null && delivery.shipping_cost > 0 && (
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Livrare</Text>
                    <Text style={styles.costValue}>{delivery.shipping_cost.toFixed(2)} MDL</Text>
                  </View>
                )}
                {delivery.order_value != null && (
                  <View style={[styles.costRow, styles.costTotal]}>
                    <Text style={styles.costTotalLabel}>Total</Text>
                    <Text style={styles.costTotalValue}>{delivery.order_value.toFixed(2)} MDL</Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* Delivery lifecycle timeline */}
        {(() => {
          const isFailed    = stop.status === 'failed'
          const isCompleted = stop.status === 'completed'
          const isPending   = stop.status === 'pending'
          const completedAt = stop.completed_at
            ? new Date(stop.completed_at).toLocaleTimeString('ro-MD', { hour: '2-digit', minute: '2-digit' })
            : null

          const steps: { label: string; sub?: string; done: boolean; current: boolean; danger?: boolean }[] = [
            { label: 'Comandată',       done: true,                     current: false },
            { label: 'Preluată de șofer', done: !isPending,             current: false },
            { label: 'În drum',         done: !isPending,               current: isPending },
            isFailed
              ? { label: 'Livrare eșuată', sub: stop.fail_reason ?? undefined, done: true, current: false, danger: true }
              : { label: 'Livrată',     sub: completedAt ?? undefined,  done: isCompleted, current: isCompleted },
          ]

          return (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>CRONOLOGIE</Text>
              {steps.map((step, i) => (
                <View key={i} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.dot,
                      step.done  && (step.danger ? styles.dotFail : styles.dotDone),
                      step.current && !step.done && styles.dotCurrent,
                    ]} />
                    {i < steps.length - 1 && <View style={styles.lineV} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.tlLabel,
                      step.done  && { fontWeight: T.weight.semibold, color: step.danger ? T.color.danger : T.color.ink },
                      !step.done && !step.current && { color: T.color.inkSubtle },
                    ]}>
                      {step.label}
                    </Text>
                    {step.sub && (
                      <Text style={[styles.tlTime, step.danger && { color: T.color.danger }]}>{step.sub}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )
        })()}

        {isDelivered && (
          <Button label="Evaluează livrarea" variant="accent" onPress={() => router.push(`/order/${stopId}/rate`)} />
        )}
        {!isDelivered && stop.status === 'pending' && (
          <Button label="Urmărește live" variant="primary" onPress={() => router.push(`/track/${stopId}`)} />
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: T.color.bg },
  loader:        { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.color.bg },
  scroll:        { padding: T.space.lg, gap: T.space.sm, paddingBottom: T.space.xl },
  successBanner: { flexDirection: 'row', alignItems: 'center', gap: T.space.sm, backgroundColor: T.color.successBg, borderRadius: T.radius.lg, padding: T.space.md },
  successIcon:   { width: 40, height: 40, borderRadius: 20, backgroundColor: T.color.success, alignItems: 'center', justifyContent: 'center' },
  successTitle:  { fontSize: T.size.body, fontWeight: T.weight.bold, color: T.color.ink },
  successSub:    { fontSize: T.size.caption, color: T.color.inkMuted, marginTop: 2 },
  failBanner:    { flexDirection: 'row', alignItems: 'center', gap: T.space.sm, backgroundColor: T.color.dangerBg, borderRadius: T.radius.lg, padding: T.space.md },
  failTitle:     { fontSize: T.size.body, fontWeight: T.weight.bold, color: T.color.danger },
  failSub:       { fontSize: T.size.caption, color: T.color.inkMuted, marginTop: 2 },
  card:          { backgroundColor: T.color.surface, borderRadius: T.radius.lg, borderWidth: 1, borderColor: T.color.border, padding: T.space.md, gap: T.space.xs },
  cardLabel:     { fontFamily: T.font.mono, fontSize: T.size.micro, color: T.color.inkSubtle, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 },
  shopRow:       { flexDirection: 'row', alignItems: 'center', gap: T.space.xs, marginBottom: 2 },
  shopName:      { fontSize: T.size.caption, fontWeight: T.weight.bold, color: T.color.primary, textTransform: 'uppercase', letterSpacing: 0.4 },
  packageDesc:   { fontSize: T.size.body, fontWeight: T.weight.semibold, color: T.color.ink },
  divider:       { height: 1, backgroundColor: T.color.border },
  detailRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: T.space.xs },
  detailText:    { fontSize: T.size.bodySm, color: T.color.inkMuted, flex: 1, lineHeight: 20 },
  notesBox:      { flexDirection: 'row', gap: T.space.xs, backgroundColor: T.color.warningBg, borderRadius: T.radius.sm, padding: T.space.sm, borderLeftWidth: 3, borderLeftColor: T.color.warning },
  notesText:     { flex: 1, fontSize: T.size.caption, color: '#92400e', lineHeight: 18 },
  timelineRow:    { flexDirection: 'row', gap: T.space.sm },
  timelineLeft:   { alignItems: 'center', width: 20 },
  dot:            { width: 11, height: 11, borderRadius: 6, backgroundColor: T.color.borderStrong, marginTop: 4 },
  dotDone:        { backgroundColor: T.color.primary },
  dotFail:        { backgroundColor: T.color.danger },
  dotCurrent:     { backgroundColor: T.color.primary, width: 13, height: 13, borderRadius: 7, borderWidth: 3, borderColor: T.color.primaryLight },
  lineV:          { width: 1, flex: 1, backgroundColor: T.color.border, marginTop: 2 },
  timelineContent:{ flex: 1, flexDirection: 'column', paddingBottom: T.space.md },
  tlLabel:        { fontSize: T.size.bodySm, color: T.color.inkMuted, fontWeight: T.weight.regular },
  tlTime:         { fontSize: T.size.caption, fontFamily: T.font.mono, color: T.color.inkMuted, marginTop: 2 },
  itemRow:       { flexDirection: 'row', alignItems: 'center', gap: T.space.sm, paddingVertical: 4 },
  itemQtyBadge:  { minWidth: 28, height: 22, borderRadius: T.radius.sm, backgroundColor: T.color.bg, borderWidth: 1, borderColor: T.color.border, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  itemQty:       { fontSize: T.size.caption, fontFamily: T.font.mono, fontWeight: T.weight.bold, color: T.color.inkMuted },
  itemName:      { flex: 1, fontSize: T.size.bodySm, color: T.color.ink },
  costRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  costLabel:     { fontSize: T.size.bodySm, color: T.color.inkMuted },
  costValue:     { fontSize: T.size.bodySm, color: T.color.ink, fontFamily: T.font.mono },
  costTotal:     { marginTop: 4 },
  costTotalLabel:{ fontSize: T.size.body, fontWeight: T.weight.bold, color: T.color.ink },
  costTotalValue:{ fontSize: T.size.body, fontWeight: T.weight.bold, color: T.color.primary, fontFamily: T.font.mono },
})
