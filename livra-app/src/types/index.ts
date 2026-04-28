export type DeliveryStatus =
  | 'pending'
  | 'dispatched'
  | 'en_route'
  | 'nearby'
  | 'delivered'
  | 'failed'

export type Delivery = {
  id: string
  orderId: string
  storeName: string
  storeLogo?: string
  address: string
  status: DeliveryStatus
  stopOrder: number
  totalStops: number
  timeWindowStart: string
  timeWindowEnd: string
  notes?: string
  driverName?: string
  driverInitials: string
  driverLocation?: { lat: number; lng: number; updatedAt: string }
  destinationLat: number
  destinationLng: number
  createdAt: string
  deliveredAt?: string
  proofPhoto?: string
}

export type SavedLocation = {
  id: string
  name: string
  lat: number
  lng: number
  address: string
  isDefault: boolean
}

export type User = {
  id: string
  name: string
  phone: string
  defaultLocationId?: string
}

export type RootStackParamList = {
  Main: undefined
  Track: { deliveryId: string; token?: string }
  SetLocation: { locationId?: string }
  DeliveryDetail: { deliveryId: string }
}

export type MainTabParamList = {
  Home: undefined
  Orders: undefined
  Locations: undefined
  Profile: undefined
}
