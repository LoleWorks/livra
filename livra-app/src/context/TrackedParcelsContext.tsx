import React, { createContext, useContext, useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'

const LIST_KEY = 'livra_parcels_v1'
const MAX      = 20
const SS_OPTS  = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK }

export interface SavedParcel {
  awb:          string
  added:        string   // 'YYYY-MM-DD'
  status:       string   // event key e.g. 'OutForDelivery'
  label:        string   // Romanian status label (auto)
  done:         boolean
  carrier?:     string   // 'Nova Post' | 'Curier Rapid' | 'Fan Curier'
  customLabel?: string   // user-defined display name
}

interface TrackedParcelsCtx {
  parcels:      SavedParcel[]
  upsertParcel: (awb: string, status: string, label: string, done: boolean, carrier?: string) => void
  labelParcel:  (awb: string, customLabel: string) => void
  removeParcel: (awb: string) => void
}

const Ctx = createContext<TrackedParcelsCtx>({
  parcels:      [],
  upsertParcel: () => {},
  labelParcel:  () => {},
  removeParcel: () => {},
})

// Tuple layout: [awb, added, status, label, done, carrier, customLabel]
function compact(list: SavedParcel[]): string {
  return JSON.stringify(list.map(p => [
    p.awb, p.added, p.status, p.label, p.done ? 1 : 0,
    p.carrier ?? '', p.customLabel ?? '',
  ]))
}

function expand(raw: string): SavedParcel[] {
  const arr = JSON.parse(raw) as Array<[string, string, string, string, number, string?, string?]>
  return arr.map(([awb, added, status, label, done, carrier, customLabel]) => ({
    awb, added, status, label, done: done === 1,
    carrier:     carrier     || undefined,
    customLabel: customLabel || undefined,
  }))
}

function save(next: SavedParcel[], set: (v: SavedParcel[]) => void) {
  set(next)
  SecureStore.setItemAsync(LIST_KEY, compact(next), SS_OPTS).catch(() => {
    const trimmed = [
      ...next.filter(p => !p.done),
      ...next.filter(p => p.done).slice(-5),
    ]
    set(trimmed)
    SecureStore.setItemAsync(LIST_KEY, compact(trimmed), SS_OPTS).catch(() => {})
  })
}

export function TrackedParcelsProvider({ children }: { children: React.ReactNode }) {
  const [parcels, setParcels] = useState<SavedParcel[]>([])

  useEffect(() => {
    SecureStore.getItemAsync(LIST_KEY, SS_OPTS).then(raw => {
      if (!raw) return
      try { setParcels(expand(raw)) } catch {}
    })
  }, [])

  function upsertParcel(awb: string, status: string, label: string, done: boolean, carrier?: string) {
    setParcels(prev => {
      const exists = prev.some(p => p.awb === awb)
      const next = exists
        ? prev.map(p => p.awb === awb ? { ...p, status, label, done, ...(carrier ? { carrier } : {}) } : p)
        : [{ awb, added: new Date().toISOString().slice(0, 10), status, label, done, carrier }, ...prev].slice(0, MAX)
      SecureStore.setItemAsync(LIST_KEY, compact(next), SS_OPTS).catch(() => {
        const trimmed = [...next.filter(p => !p.done), ...next.filter(p => p.done).slice(-5)]
        SecureStore.setItemAsync(LIST_KEY, compact(trimmed), SS_OPTS).catch(() => {})
      })
      return next
    })
  }

  function labelParcel(awb: string, customLabel: string) {
    setParcels(prev => {
      const next = prev.map(p => p.awb === awb ? { ...p, customLabel: customLabel || undefined } : p)
      SecureStore.setItemAsync(LIST_KEY, compact(next), SS_OPTS).catch(() => {})
      return next
    })
  }

  function removeParcel(awb: string) {
    setParcels(prev => {
      const next = prev.filter(p => p.awb !== awb)
      SecureStore.setItemAsync(LIST_KEY, compact(next), SS_OPTS).catch(() => {})
      return next
    })
  }

  return (
    <Ctx.Provider value={{ parcels, upsertParcel, labelParcel, removeParcel }}>
      {children}
    </Ctx.Provider>
  )
}

export const useTrackedParcels = () => useContext(Ctx)
