import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase, Customer } from '../lib/supabase'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

const isExpoGo = Constants.appOwnership === 'expo'

interface AuthContextValue {
  session:  Session | null
  user:     User | null
  customer: Customer | null
  loading:  boolean
  signOut:  () => Promise<void>
  refreshCustomer: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  session:  null,
  user:     null,
  customer: null,
  loading:  true,
  signOut:  async () => {},
  refreshCustomer: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session,  setSession]  = useState<Session | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) loadCustomer(data.session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s) loadCustomer(s.user.id)
      else { setCustomer(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadCustomer = async (uid: string) => {
    const { data } = await supabase
      .from('livra_customers')
      .select('*')
      .eq('id', uid)
      .single()
    setCustomer(data ?? null)
    setLoading(false)
    if (data) registerPushToken(uid)
  }

  const registerPushToken = async (uid: string) => {
    if (Platform.OS === 'web' || isExpoGo) return
    try {
      const Notifications = await import('expo-notifications')
      const { status: existing } = await Notifications.getPermissionsAsync()
      let finalStatus = existing
      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }
      if (finalStatus !== 'granted') return
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId
      if (!projectId) return
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data
      await supabase.from('livra_customers').update({ push_token: token }).eq('id', uid)
    } catch {
      // push registration is non-critical — never block auth flow
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const refreshCustomer = async () => {
    if (!session?.user.id) return
    await loadCustomer(session.user.id)
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, customer, loading, signOut, refreshCustomer }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
