import { supabase } from './supabase'
import type { Delivery, DeliveryStatus } from '../types'

type StopRow = {
  id: string
  stop_order: number
  status: string
  address: string
  lat: number
  lng: number
  time_window_start: string | null
  time_window_end: string | null
  delivery_notes: string | null
  package_description: string | null
  completed_at: string | null
  fail_reason: string | null
  created_at: string
  livra_routes: {
    id: string
    date: string
    status: string
    admin_id: string
    livra_drivers: {
      name: string
      initials: string
      pos_lat: number | null
      pos_lng: number | null
    }
    livra_admins: { name: string }
    // total delivery stops in this route
    total_count: { count: number }[]
  }
}

function mapStatus(stopStatus: string, routeStatus: string): DeliveryStatus {
  if (stopStatus === 'completed') return 'delivered'
  if (stopStatus === 'failed') return 'failed'
  if (routeStatus === 'active') return 'en_route'
  return 'dispatched'
}

function mapRow(row: StopRow, totalStops: number): Delivery {
  const r = row.livra_routes
  const d = r.livra_drivers
  const status = mapStatus(row.status, r.status)

  return {
    id: row.id,
    orderId: row.id.slice(0, 6).toUpperCase(),
    storeName: r.livra_admins?.name ?? 'Livra',
    address: row.address,
    status,
    stopOrder: row.stop_order,
    totalStops,
    timeWindowStart: row.time_window_start ?? new Date().toISOString(),
    timeWindowEnd: row.time_window_end ?? new Date().toISOString(),
    notes: row.delivery_notes ?? undefined,
    driverName: d?.name ?? undefined,
    driverInitials: d?.initials ?? '??',
    driverLocation: d?.pos_lat && d?.pos_lng ? {
      lat: d.pos_lat,
      lng: d.pos_lng,
      updatedAt: new Date().toISOString(),
    } : undefined,
    destinationLat: row.lat,
    destinationLng: row.lng,
    createdAt: row.created_at ?? new Date().toISOString(),
    deliveredAt: row.completed_at ?? undefined,
  }
}

export async function getMyDeliveries(phone: string): Promise<Delivery[]> {
  const { data, error } = await supabase
    .from('livra_route_stops')
    .select(`
      id, stop_order, status, address, lat, lng,
      time_window_start, time_window_end, delivery_notes,
      package_description, completed_at, fail_reason, created_at,
      livra_routes!inner(
        id, date, status, admin_id,
        livra_drivers(name, initials, pos_lat, pos_lng),
        livra_admins(name)
      )
    `)
    .eq('client_phone', phone)
    .eq('type', 'delivery')
    .order('created_at', { ascending: false })

  if (error || !data) return []

  // compute total delivery stops per route
  const routeIds = [...new Set((data as any[]).map(r => r.livra_routes?.id).filter(Boolean))]
  const totalsMap: Record<string, number> = {}
  if (routeIds.length) {
    const { data: counts } = await supabase
      .from('livra_route_stops')
      .select('route_id')
      .in('route_id', routeIds)
      .eq('type', 'delivery')
    if (counts) {
      for (const c of counts) {
        totalsMap[c.route_id] = (totalsMap[c.route_id] ?? 0) + 1
      }
    }
  }

  return (data as any[]).map(row =>
    mapRow(row, totalsMap[row.livra_routes?.id] ?? 1)
  )
}

export async function getDeliveryById(id: string): Promise<Delivery | null> {
  const { data, error } = await supabase
    .from('livra_route_stops')
    .select(`
      id, stop_order, status, address, lat, lng,
      time_window_start, time_window_end, delivery_notes,
      package_description, completed_at, fail_reason, created_at,
      livra_routes!inner(
        id, date, status, admin_id,
        livra_drivers(name, initials, pos_lat, pos_lng),
        livra_admins(name)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null

  const { data: counts } = await supabase
    .from('livra_route_stops')
    .select('route_id')
    .eq('route_id', (data as any).livra_routes?.id)
    .eq('type', 'delivery')

  return mapRow(data as any, counts?.length ?? 1)
}

export function subscribeToDelivery(
  stopId: string,
  routeId: string,
  driverId: string,
  onUpdate: () => void,
) {
  const ch = supabase.channel(`track-${stopId}`)
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'livra_route_stops',
      filter: `id=eq.${stopId}`,
    }, onUpdate)
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'livra_drivers',
      filter: `id=eq.${driverId}`,
    }, onUpdate)
    .subscribe()
  return () => supabase.removeChannel(ch)
}
