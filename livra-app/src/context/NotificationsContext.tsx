import React, { createContext, useContext, useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'

const KEY    = 'livra_notifs_v1'
const MAX    = 50
const OPTS   = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK }

export interface StoredNotif {
  id:      string
  title:   string
  body:    string
  time:    string   // ISO date
  read:    boolean
  awb?:    string
  carrier?: string
}

interface NotificationsCtx {
  notifs:     StoredNotif[]
  unreadCount: number
  addNotif:   (n: Omit<StoredNotif, 'id' | 'read'>) => void
  markAllRead: () => void
  markRead:   (id: string) => void
}

const Ctx = createContext<NotificationsCtx>({
  notifs:      [],
  unreadCount: 0,
  addNotif:    () => {},
  markAllRead: () => {},
  markRead:    () => {},
})

function persist(list: StoredNotif[]) {
  SecureStore.setItemAsync(KEY, JSON.stringify(list), OPTS).catch(() => {})
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifs, setNotifs] = useState<StoredNotif[]>([])

  useEffect(() => {
    SecureStore.getItemAsync(KEY, OPTS).then(raw => {
      if (!raw) return
      try { setNotifs(JSON.parse(raw)) } catch {}
    })
  }, [])

  function addNotif(n: Omit<StoredNotif, 'id' | 'read'>) {
    setNotifs(prev => {
      const next = [
        { ...n, id: Date.now().toString(), read: false },
        ...prev,
      ].slice(0, MAX)
      persist(next)
      return next
    })
  }

  function markRead(id: string) {
    setNotifs(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n)
      persist(next)
      return next
    })
  }

  function markAllRead() {
    setNotifs(prev => {
      const next = prev.map(n => ({ ...n, read: true }))
      persist(next)
      return next
    })
  }

  const unreadCount = notifs.filter(n => !n.read).length

  return (
    <Ctx.Provider value={{ notifs, unreadCount, addNotif, markAllRead, markRead }}>
      {children}
    </Ctx.Provider>
  )
}

export const useNotifications = () => useContext(Ctx)
