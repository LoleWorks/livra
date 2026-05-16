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
  signInDemo: () => void
}

const AuthContext = createContext<AuthContextValue>({
  session:  null,
  user:     null,
  customer: null,
  loading:  true,
  signOut:  async () => {},
  refreshCustomer: async () => {},
  signInDemo: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session,  setSession]  = useState<Session | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading,  setLoading]  = useState(true)

  const signInDemo = () => {
    console.log('SUPABASE_BYPASS: Signing in with Demo User')
    const mockSession = {
      access_token: 'mock',
      refresh_token: 'mock',
      expires_in: 3600,
      token_type: 'bearer',
      user: { id: 'demo-user', email: 'demo@example.com', phone: '+37369000000', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' }
    } as any
    setSession(mockSession)
    setCustomer({
      id: 'demo-user',
      name: 'Demo User',
      phone: '+37369000000',
      created_at: new Date().toISOString(),
      pins: [
        { id: '1', name: 'Acasă', address: 'Bulevardul Ștefan cel Mare și Sfânt 1, Chișinău', type: 'home', primary: true, lat: 47.026, lng: 28.838 },
        { id: '2', name: 'Birou', address: 'Strada Vlaicu Pîrcălab 63, Chișinău', type: 'work', primary: false, lat: 47.024, lng: 28.832 },
      ]
    } as any)
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

  const loadCustomer = async (uid: string) => {
    if ((supabase as any).supabaseUrl.includes('placeholder')) return // Don't fetch if placeholder
    const { data } = await supabase
      .from('livra_customers')
      .select('*')
      .eq('id', uid)
      .single()
    setCustomer(data ?? null)
    setLoading(false)
    if (data) registerPushToken(uid)
  }

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if ((supabase as any).supabaseUrl.includes('placeholder')) {
        setLoading(false)
        return
      }
      setSession(data.session)
      if (data.session) loadCustomer(data.session.user.id)
      else setLoading(false)
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if ((supabase as any).supabaseUrl.includes('placeholder')) return
      setSession(s)
      if (s) loadCustomer(s.user.id)
      else { setCustomer(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const refreshCustomer = async () => {
    if (!session?.user.id) return
    await loadCustomer(session.user.id)
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, customer, loading, signOut, refreshCustomer, signInDemo }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
