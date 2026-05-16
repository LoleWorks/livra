import React from 'react'
import Svg, { Text, Line, Polygon } from 'react-native-svg'
import { tokens as T } from '../theme/tokens'

interface Props {
  color?:  string
  accent?: string
  size?:   number
}

export default function LivraLogo({ color = T.color.ink, accent = T.color.primary, size = 22 }: Props) {
  const w = size * 4.2
  return (
    <Svg viewBox="0 0 120 36" width={w} height={size}>
      <Text
        x="0" y="26"
        fontFamily={T.font.display}
        fontSize="24"
        fontWeight="700"
        fill={color}
        letterSpacing="-1"
      >
        LIVRA
      </Text>
      <Line x1="0" y1="31" x2="80" y2="31" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
      <Polygon points="80,31 73,27.5 73,34.5" fill={accent} />
    </Svg>
  )
}
