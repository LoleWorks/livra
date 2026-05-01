import React, { useRef, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { PanResponder } from 'react-native'

interface Props {
  onSave: (svgString: string) => void
  onCancel: () => void
}

interface Point {
  x: number
  y: number
}

export default function SignaturePad({ onSave, onCancel }: Props) {
  const [paths, setPaths] = useState<string[]>([])
  const currentPath = useRef<string>('')
  const isDrawing = useRef(false)

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (e) => {
      const { locationX: x, locationY: y } = e.nativeEvent
      currentPath.current = `M${x.toFixed(1)},${y.toFixed(1)}`
      isDrawing.current = true
    },

    onPanResponderMove: (e) => {
      if (!isDrawing.current) return
      const { locationX: x, locationY: y } = e.nativeEvent
      currentPath.current += ` L${x.toFixed(1)},${y.toFixed(1)}`
      setPaths(prev => [...prev.slice(0, -1), currentPath.current])
    },

    onPanResponderRelease: () => {
      if (currentPath.current) {
        setPaths(prev => {
          const next = [...prev]
          if (next[next.length - 1] !== currentPath.current) {
            next.push(currentPath.current)
          }
          return next
        })
      }
      currentPath.current = ''
      isDrawing.current = false
    },
  })

  const handleClear = () => {
    setPaths([])
    currentPath.current = ''
  }

  const handleSave = () => {
    if (paths.length === 0) return
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150">${paths.map(d => `<path d="${d}" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`
    onSave(svgString)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Semnătura clientului</Text>
      <View style={styles.canvas} {...panResponder.panHandlers}>
        <Svg width="300" height="150">
          {paths.map((d, i) => (
            <Path
              key={i}
              d={d}
              stroke="#1a1a1a"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.btnSecondary} onPress={handleClear}>
          <Text style={styles.btnSecondaryText}>Șterge</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={onCancel}>
          <Text style={styles.btnSecondaryText}>Anulează</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnPrimary, paths.length === 0 && styles.btnDisabled]}
          onPress={handleSave}
          disabled={paths.length === 0}
        >
          <Text style={styles.btnPrimaryText}>Salvează</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  canvas: {
    width: 300,
    height: 150,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  btnSecondary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  btnSecondaryText: {
    fontSize: 14,
    color: '#374151',
  },
  btnPrimary: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  btnPrimaryText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  btnDisabled: {
    backgroundColor: '#93c5fd',
  },
})
