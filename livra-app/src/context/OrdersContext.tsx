import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, RouteStop } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface OrdersContextValue {
  activeStops: RouteStop[]
  allStops:    RouteStop[]
  loading:     boolean
  refresh:     () => Promise<void>
}

const OrdersContext = createContext<OrdersContextValue>({
  activeStops: [],
  allStops:    [],
  loading:     true,
  refresh:     async () => {},
})

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [allStops, setAllStops] = useState<RouteStop[]>([])
  const [loading,  setLoading]  = useState(true)

  const phone = user?.phone

  const fetchStops = async () => {
    if (!phone) { setAllStops([]); setLoading(false); return }
    const { data } = await supabase.rpc('get_stops_for_customer', { p_phone: phone })
    setAllStops((data as RouteStop[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (!phone) { setLoading(false); return }
    fetchStops()

    const channel = supabase
      .channel(`stops:${phone}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'livra_route_stops',
      }, () => fetchStops())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [phone])

  const activeStops = allStops.filter(s => s.status === 'pending')

  return (
    <OrdersContext.Provider value={{ activeStops, allStops, loading, refresh: fetchStops }}>
      {children}
    </OrdersContext.Provider>
  )
}

export const useOrders = () => useContext(OrdersContext)
