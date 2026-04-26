export const API = 'http://localhost:8000'

export type AppUser = {
  id: string
  name: string
  email: string
  phone: string
  status: string
  initials: string
  color: string
  must_change_password: boolean
  role: 'admin' | 'sales'
}

const KEY = 'livra_user'

export function getUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setUser(user: AppUser) {
  localStorage.setItem(KEY, JSON.stringify(user))
}

export function clearUser() {
  localStorage.removeItem(KEY)
}
