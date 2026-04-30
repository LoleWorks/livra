import React, { useCallback, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Linking,
  ScrollView,
} from 'react-native'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import SignaturePad from './SignaturePad'
import { openExternalNav } from '../lib/nav'
import { saveNavApp, type NavApp } from '../lib/storage'
import type { RouteStop } from '../lib/types'

interface Props {
  stop: RouteStop
  stopNumber: number
  totalStops: number
  onComplete: (stop: RouteStop, notes: string, signature: string | null) => void
  onFail: (stop: RouteStop, notes: string) => void
  onNavigate: () => void   // primary button — uses driver's saved preference
}

export default function StopSheet({
  stop,
  stopNumber,
  totalStops,
  onComplete,
  onFail,
  onNavigate,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null)
  const [notes, setNotes] = useState('')
  const [showSignature, setShowSignature] = useState(false)
  const snapPoints = ['35%', '80%']

  const handleCall = () => {
    if (stop.client_phone) Linking.openURL(`tel:${stop.client_phone}`)
  }

  const handleComplete = () => {
    setShowSignature(true)
    sheetRef.current?.snapToIndex(1)
  }

  const handleSignatureSave = (svg: string) => {
    setShowSignature(false)
    onComplete(stop, notes, svg)
  }

  const handleSignatureCancel = () => {
    setShowSignature(false)
    sheetRef.current?.snapToIndex(0)
  }

  const handleSkipSignature = () => {
    onComplete(stop, notes, null)
  }

  const handleFail = () => {
    onFail(stop, notes)
  }

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={styles.sheet}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{stopNumber}/{totalStops}</Text>
            </View>
            <Text style={styles.name}>{stop.client_name}</Text>
            {stop.client_phone && (
              <TouchableOpacity onPress={handleCall} style={styles.phone}>
                <Text style={styles.phoneText}>{stop.client_phone}</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.address}>{stop.address}</Text>

          <TouchableOpacity style={styles.navBtn} onPress={onNavigate}>
            <Text style={styles.navBtnText}>Pornește navigarea</Text>
          </TouchableOpacity>

          {/* Driver can pick a specific nav app — first tap saves it as preference */}
          <View style={styles.navPicker}>
            {([
              { key: 'waze',   label: 'Waze',        bg: '#33ccff' },
              { key: 'google', label: 'Google Maps', bg: '#4285f4' },
              { key: 'apple',  label: 'Apple Maps',  bg: '#1f1f1f' },
            ] as { key: NavApp; label: string; bg: string }[]).map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.navPickerBtn, { backgroundColor: opt.bg }]}
                onPress={async () => {
                  await saveNavApp(opt.key)
                  await openExternalNav(stop.lat, stop.lng, stop.address, opt.key)
                }}
              >
                <Text style={styles.navPickerBtnText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.notes}
            placeholder="Note (opțional)..."
            placeholderTextColor="#9ca3af"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />

          {showSignature ? (
            <View style={styles.sigWrap}>
              <SignaturePad
                onSave={handleSignatureSave}
                onCancel={handleSignatureCancel}
              />
              <TouchableOpacity style={styles.skipSig} onPress={handleSkipSignature}>
                <Text style={styles.skipSigText}>Continuă fără semnătură</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.failBtn} onPress={handleFail}>
                <Text style={styles.failBtnText}>Eșuat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
                <Text style={styles.completeBtnText}>Livrat</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handle: {
    backgroundColor: '#d1d5db',
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  phone: {
    padding: 4,
  },
  phoneText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  address: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 14,
    lineHeight: 20,
  },
  navBtn: {
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  navBtnText: {
    color: '#0369a1',
    fontWeight: '600',
    fontSize: 15,
  },
  navPicker: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  navPickerBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  navPickerBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  notes: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#111827',
    minHeight: 56,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  failBtn: {
    flex: 1,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  failBtnText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 16,
  },
  completeBtn: {
    flex: 2,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  completeBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  sigWrap: {
    alignItems: 'center',
    gap: 12,
  },
  skipSig: {
    paddingVertical: 8,
  },
  skipSigText: {
    color: '#6b7280',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
})
