import React, { createContext, useContext, useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'

type UserContextType = {
  phone: string | null
  name: string | null
  setUser: (phone: string, name: string) => Promise<void>
  clearUser: () => Promise<void>
  loading: boolean
}

const UserContext = createContext<UserContextType>({
  phone: null, name: null,
  setUser: async () => {}, clearUser: async () => {}, loading: true,
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [phone, setPhone] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    SecureStore.getItemAsync('user_phone').then(p => {
      if (p) setPhone(p)
    })
    SecureStore.getItemAsync('user_name').then(n => {
      if (n) setName(n)
    }).finally(() => setLoading(false))
  }, [])

  const setUser = async (p: string, n: string) => {
    await SecureStore.setItemAsync('user_phone', p)
    await SecureStore.setItemAsync('user_name', n)
    setPhone(p)
    setName(n)
  }

  const clearUser = async () => {
    await SecureStore.deleteItemAsync('user_phone')
    await SecureStore.deleteItemAsync('user_name')
    setPhone(null)
    setName(null)
  }

  return (
    <UserContext.Provider value={{ phone, name, setUser, clearUser, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
