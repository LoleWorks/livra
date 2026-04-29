import { supabase } from './supabase'


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
  company_id: string
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

export async function signIn(email: string, password: string): Promise<AppUser> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)

  const { data: admin } = await supabase
    .from('livra_admins')
    .select('*')
    .eq('email', email)
    .single()

  if (admin) {
    const user: AppUser = {
      id: admin.id,
      name: admin.name ?? '',
      email: admin.email,
      phone: admin.phone ?? '',
      status: admin.status ?? 'activ',
      initials: admin.initials ?? '',
      color: admin.color ?? '#7c3aed',
      must_change_password: admin.must_change_password ?? false,
      role: 'admin',
      company_id: admin.id,
    }
    setUser(user)
    return user
  }

  const { data: sales } = await supabase
    .from('livra_sales_managers')
    .select('*')
    .eq('email', email)
    .single()

  if (sales) {
    if (sales.status === 'inactiv') {
      await supabase.auth.signOut()
      throw new Error('Contul tău este inactiv. Contactează administratorul.')
    }
    const user: AppUser = {
      id: sales.id,
      name: sales.name ?? '',
      email: sales.email,
      phone: sales.phone ?? '',
      status: sales.status ?? 'activ',
      initials: sales.initials ?? '',
      color: sales.color ?? '#7c3aed',
      must_change_password: sales.must_change_password ?? false,
      role: 'sales',
      company_id: sales.admin_id,
    }
    setUser(user)
    return user
  }

  await supabase.auth.signOut()
  throw new Error('Contul nu a fost găsit.')
}

export async function signOut() {
  clearUser()
  await supabase.auth.signOut()
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)

  const user = getUser()
  if (user) {
    const table = user.role === 'admin' ? 'livra_admins' : 'livra_sales_managers'
    await supabase.from(table).update({ must_change_password: false }).eq('id', user.id)
    setUser({ ...user, must_change_password: false })
  }
}
