import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { tokens as T } from '../theme/tokens'

const BRANDS: Record<string, { bg: string; fg: string; initials: string; short: string }> = {
  'Nova Post':    { bg: '#FABB00', fg: '#333',  initials: 'NP', short: 'Nova Post'  },
  'Curier Rapid': { bg: '#003DA5', fg: '#fff',  initials: 'CR', short: 'C. Rapid'  },
  'Fan Curier':   { bg: '#F47920', fg: '#fff',  initials: 'FC', short: 'Fan Curier' },
}

// variant="icon"  — 44×44 square, fits the rowIcon slot in orders/home lists
// variant="pill"  — compact horizontal pill, fits card footers
export function CarrierBadge({
  carrier,
  variant = 'pill',
  done    = false,
}: {
  carrier?: string
  variant?: 'pill' | 'icon'
  done?:    boolean
}) {
  const brand = carrier ? (BRANDS[carrier] ?? { bg: '#888', fg: '#fff', initials: carrier.slice(0, 2).toUpperCase(), short: carrier }) : null

  if (variant === 'icon') {
    if (!brand) return null
    const bg = done ? T.color.successBg : brand.bg
    const fg = done ? T.color.success   : brand.fg
    return (
      <View style={[s.icon, { backgroundColor: bg }]}>
        {done
          ? <Feather name="check" size={18} color={fg} />
          : <Text style={[s.iconText, { color: fg }]}>{brand.initials}</Text>
        }
      </View>
    )
  }

  if (!brand) return null
  return (
    <View style={[s.pill, { backgroundColor: brand.bg }]}>
      <Text style={[s.pillText, { color: brand.fg }]}>{brand.short}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  icon:     { width: 44, height: 44, borderRadius: T.radius.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  pill:     { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  pillText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
})
