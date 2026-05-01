import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native'
import { tokens as T } from '../theme/tokens'

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost'
type Size    = 'lg' | 'md' | 'sm'

interface Props {
  label:    string
  variant?: Variant
  size?:    Size
  onPress?: () => void
  disabled?: boolean
  style?:   ViewStyle
}

export default function Button({ label, variant = 'primary', size = 'lg', onPress, disabled, style }: Props) {
  const v = variants[variant]
  const s = sizes[size]
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.82}
      style={[styles.base, { height: s.h, backgroundColor: v.bg, borderWidth: v.border ? 1.5 : 0, borderColor: v.border ?? 'transparent' }, disabled && styles.disabled, style]}
    >
      <Text style={[styles.label, { fontSize: s.fs, color: v.color }]}>{label}</Text>
    </TouchableOpacity>
  )
}

const variants: Record<Variant, { bg: string; color: string; border?: string }> = {
  primary:   { bg: T.color.ink,         color: '#fff' },
  accent:    { bg: T.color.primary,     color: '#fff' },
  secondary: { bg: 'transparent',       color: T.color.ink, border: T.color.borderStrong },
  ghost:     { bg: 'transparent',       color: T.color.primary },
}

const sizes: Record<Size, { h: number; fs: number }> = {
  lg: { h: 52, fs: 16 },
  md: { h: 44, fs: 14 },
  sm: { h: 36, fs: 13 },
}

const styles = StyleSheet.create({
  base: {
    borderRadius: T.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  label: {
    fontFamily: T.font.body,
    fontWeight: T.weight.semibold,
    letterSpacing: -0.1,
  },
  disabled: { opacity: 0.45 },
})
