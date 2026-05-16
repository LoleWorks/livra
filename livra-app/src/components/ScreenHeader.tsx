import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { tokens as T } from '../theme/tokens'

interface Props {
  title?:       string
  leftIcon?:    'back' | 'close'
  rightSlot?:   React.ReactNode
  transparent?: boolean
  onBack?:      () => void
}

export default function ScreenHeader({ title, leftIcon, rightSlot, transparent, onBack }: Props) {
  const router = useRouter()
  const handleBack = onBack ?? (() => router.back())

  return (
    <View style={[styles.header, transparent && styles.transparent]}>
      <View style={styles.side}>
        {leftIcon === 'back' && (
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn} hitSlop={8}>
            <Feather name="chevron-left" size={24} color={T.color.ink} />
          </TouchableOpacity>
        )}
        {leftIcon === 'close' && (
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn} hitSlop={8}>
            <Feather name="x" size={22} color={T.color.ink} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>{title ?? ''}</Text>
      <View style={[styles.side, styles.sideRight]}>{rightSlot}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: T.space.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: T.color.border,
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  side:      { width: 44, alignItems: 'flex-start', justifyContent: 'center' },
  sideRight: { alignItems: 'flex-end' },
  iconBtn:   { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: T.size.h3,
    fontFamily: T.font.body,
    fontWeight: T.weight.semibold,
    color: T.color.ink,
    letterSpacing: -0.2,
  },
})
