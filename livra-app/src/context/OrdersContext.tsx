import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
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

  const fetchStops = useCallback(async () => {
    if (!phone) { setAllStops([]); setLoading(false); return }
    
    // Demo Mode check
    if ((supabase as any).supabaseUrl.includes('placeholder')) {
      console.log('SUPABASE_BYPASS: Fetching stops (Demo Mode)')
      setAllStops([
        {
          id: 'demo-stop-1',
          status: 'pending',
          address: 'Str. Ștefan cel Mare 1, Chișinău',
          package_description: 'Colet H&M',
          time_window_start: '14:00',
          time_window_end: '16:00',
          lat: 47.0245,
          lng: 28.8322,
          created_at: new Date().toISOString(),
          customer_phone: phone
        },
        {
          id: 'demo-stop-2',
          status: 'completed',
          address: 'Str. Pușkin 22, Chișinău',
          package_description: 'ZARA Order',
          time_window_start: '10:00',
          time_window_end: '12:00',
          lat: 47.0270,
          lng: 28.8350,
          created_at: new Date().toISOString(),
          customer_phone: phone
        }
      ] as any)
      setLoading(false)
      return
    }

    const { data } = await supabase.rpc('get_stops_for_customer', { p_phone: phone })
    setAllStops((data as RouteStop[]) ?? [])
    setLoading(false)
  }, [phone])

  useEffect(() => {
    if (!phone) {
      if (loading) setLoading(false)
      return
    }
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
  }, [phone, fetchStops])

  const activeStops = allStops.filter(s => ['pending', 'dispatched', 'transit', 'arriving', 'preparing'].includes(s.status))

  return (
    <OrdersContext.Provider value={{ activeStops, allStops, loading, refresh: fetchStops }}>
      {children}
    </OrdersContext.Provider>
  )
}

export const useOrders = () => useContext(OrdersContext)
