import React from 'react'
import Svg, { Path, Circle, Ellipse, G } from 'react-native-svg'

export function GoogleMapsIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Pin body */}
      <Path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="#EA4335"
      />
      {/* White inner circle */}
      <Circle cx={12} cy={9} r={3.2} fill="white" />
    </Svg>
  )
}

export function WazeIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Body */}
      <Path
        d="M12 2C7 2 3.5 5.8 3.5 10.2c0 2.5 1.1 4.7 2.8 6.2l-.3 3.1 3-1.5c.9.3 1.9.5 3 .5 5 0 8.5-3.8 8.5-8.3C20.5 5.8 17 2 12 2z"
        fill="#29D1E3"
      />
      {/* Left eye */}
      <Circle cx={9.5} cy={10} r={1.1} fill="white" />
      <Circle cx={9.5} cy={10} r={0.55} fill="#1A1A2E" />
      {/* Right eye */}
      <Circle cx={14.5} cy={10} r={1.1} fill="white" />
      <Circle cx={14.5} cy={10} r={0.55} fill="#1A1A2E" />
      {/* Smile */}
      <Path
        d="M9.5 13.5 Q12 15.5 14.5 13.5"
        stroke="#1A1A2E"
        strokeWidth={1.2}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  )
}
