// Re-export unified auth for backward compatibility
export { API, getUser as getSalesUser, setUser as setSalesUser, clearUser as clearSalesUser } from './auth'
export type { AppUser as SalesUser } from './auth'
