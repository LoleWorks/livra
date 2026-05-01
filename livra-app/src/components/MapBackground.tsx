import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Rect, Path, Circle, Defs, Pattern, Line } from 'react-native-svg'
import { tokens as T } from '../theme/tokens'

interface Props {
  height?:    number | string
  driverPos?: { x: number; y: number }
  destPos?:   { x: number; y: number }
  showRoute?: boolean
}

export default function MapBackground({
  height = '100%',
  driverPos = { x: 60, y: 65 },
  destPos   = { x: 50, y: 30 },
  showRoute = true,
}: Props) {
  const W = 390
  const H = 600

  const dx = driverPos.x * (W / 100)
  const dy = driverPos.y * (H / 100)
  const ex = destPos.x   * (W / 100)
  const ey = destPos.y   * (H / 100)
  const mx = (dx + ex) / 2 + 30

  return (
    <View style={[styles.wrap, { height: height as any }]}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}
      >
        <Rect width={W} height={H} fill="#E8EBE5" />

        {/* Grid */}
        <Path d="M0 40h390M0 80h390M0 120h390M0 160h390M0 200h390M0 240h390M0 280h390M0 320h390M0 360h390M0 400h390M0 440h390M0 480h390M0 520h390M0 560h390M0 600h390"
          stroke="#D4D8D0" strokeWidth={0.5} />
        <Path d="M40 0v600M80 0v600M120 0v600M160 0v600M200 0v600M240 0v600M280 0v600M320 0v600M360 0v600"
          stroke="#D4D8D0" strokeWidth={0.5} />

        {/* Major roads */}
        <Path d="M-20 200 Q150 180 200 220 T420 200" stroke="#fff" strokeWidth={14} fill="none" />
        <Path d="M180 -20 Q200 200 220 400 T200 620" stroke="#fff" strokeWidth={14} fill="none" />
        <Path d="M-20 380 L420 360" stroke="#fff" strokeWidth={10} fill="none" />
        <Path d="M50 -20 L70 620"   stroke="#fff" strokeWidth={8}  fill="none" />
        <Path d="M320 -20 L340 620" stroke="#fff" strokeWidth={8}  fill="none" />

        {/* Buildings */}
        <Rect x={80}  y={80}  width={60} height={50} fill="#DDE0DA" rx={3} />
        <Rect x={240} y={100} width={40} height={60} fill="#DDE0DA" rx={3} />
        <Rect x={60}  y={280} width={80} height={50} fill="#DDE0DA" rx={3} />
        <Rect x={260} y={280} width={50} height={70} fill="#DDE0DA" rx={3} />
        <Rect x={120} y={450} width={70} height={60} fill="#DDE0DA" rx={3} />
        <Rect x={260} y={430} width={50} height={60} fill="#DDE0DA" rx={3} />

        {/* Park */}
        <Circle cx={80} cy={500} r={40} fill="#CFE0C8" />

        {/* Dashed route */}
        {showRoute && (
          <Path
            d={`M ${dx} ${dy} Q ${mx} ${(dy + ey) / 2 - 40} ${ex} ${ey}`}
            stroke={T.color.primary}
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
            strokeDasharray="10,6"
          />
        )}

        {/* Destination pin */}
        <Path
          d={`M ${ex} ${ey - 28} C ${ex - 12} ${ey - 28} ${ex - 12} ${ey - 8} ${ex} ${ey} C ${ex + 12} ${ey - 8} ${ex + 12} ${ey - 28} ${ex} ${ey - 28} Z`}
          fill={T.color.primary}
        />
        <Circle cx={ex} cy={ey - 20} r={5} fill="#fff" />

        {/* Driver dot */}
        <Circle cx={dx} cy={dy} r={20} fill="rgba(255,92,44,0.18)" />
        <Circle cx={dx} cy={dy} r={13} fill={T.color.ink} stroke="#fff" strokeWidth={2.5} />
        {/* Truck icon simplified */}
        <Path
          d={`M ${dx - 5} ${dy - 3} h10 v6 h-10 z M ${dx + 5} ${dy - 3} l3 2 v4 h-3 z`}
          fill="#fff"
          strokeWidth={0}
        />
        <Circle cx={dx - 3} cy={dy + 4} r={1.8} fill={T.color.ink} />
        <Circle cx={dx + 3} cy={dy + 4} r={1.8} fill={T.color.ink} />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EBE5' },
})
