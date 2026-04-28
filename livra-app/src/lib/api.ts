const API_BASE = 'https://api.livra.md'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const api = {
  trackDelivery: (token: string) => request<any>(`/track/${token}`),
  getMyDeliveries: (phone: string) => request<any[]>(`/deliveries?phone=${phone}`),
  saveLocation: (data: { name: string; lat: number; lng: number; phone: string }) =>
    request('/locations', { method: 'POST', body: JSON.stringify(data) }),
  rateDelivery: (id: string, rating: number, comment?: string) =>
    request(`/deliveries/${id}/rate`, { method: 'POST', body: JSON.stringify({ rating, comment }) }),
}
