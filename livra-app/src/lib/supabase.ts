import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

const ExpoSecureStoreAdapter = {
  getItem:    (key: string) => SecureStore.getItemAsync(key),
  setItem:    (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage:            ExpoSecureStoreAdapter,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
})

export interface Customer {
  id:                          string
  phone:                       string
  name:                        string | null
  push_token:                  string | null
  preferred_time_window_start: string | null
  preferred_time_window_end:   string | null
  pins:                        Pin[]
  created_at:                  string
}

export interface Pin {
  id:      string
  name:    string
  address: string | null
  lat:     number | null
  lng:     number | null
  primary: boolean
}

export interface RouteStop {
  id:                  string
  route_id:            string
  stop_order:          number
  status:              'pending' | 'completed' | 'failed'
  client_name:         string
  client_phone:        string | null
  address:             string
  lat:                 number
  lng:                 number
  type:                'delivery' | 'lunch_break' | 'fuel_break'
  package_description: string | null
  time_window_start:   string | null
  time_window_end:     string | null
  delivery_notes:      string | null
  fail_reason:         string | null
  completed_at:        string | null
  delivery_id:         string | null | undefined
  shop_name:           string | null | undefined
}

export interface Delivery {
  id:                  string
  customer:            string
  phone:               string | null
  address:             string
  order_items:         string | null
  order_items_json:    { sku?: string | null; name?: string | null; qty?: number | null }[] | null
  order_value:         number | null
  shipping_cost:       number | null
  package_description: string | null
  notes:               string | null
  status:              string
}

export interface DriverLocation {
  driver_id:  string
  lat:        number
  lng:        number
  heading:    number | null
  updated_at: string
}

export interface Route {
  id:        string
  driver_id: string
  date:      string
  status:    'pending' | 'active' | 'completed'
}
