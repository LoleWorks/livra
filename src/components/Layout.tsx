import { useState, useEffect } from 'react'
import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { LayoutDashboard, RouteIcon, UserCog, CreditCard, Sun, Moon, Plug, ChevronLeft, ChevronRight, Activity, LogOut, Warehouse } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { getUser, signOut } from '../lib/auth'
import { supabase } from '../lib/supabase'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/routes',    icon: RouteIcon,        label: 'Rute' },
  { to: '/drivers',   icon: UserCog,          label: 'Utilizatori' },
  { to: '/warehouses', icon: Warehouse,       label: 'Depozite' },
  { to: '/activity',  icon: Activity,         label: 'Activitate' },
  { to: '/integrations', icon: Plug,          label: 'Integrări' },
  { to: '/credits',   icon: CreditCard,       label: 'Credite' },
]

export default function Layout() {
  const { theme, toggle } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [creditBalance, setCreditBalance] = useState<number | null>(null)
  const [user] = useState(() => getUser())

  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('livra_credits')
      .select('balance')
      .eq('company_id', user.company_id)
      .maybeSingle()
      .then(({ data }) => { if (data) setCreditBalance(data.balance ?? 0) })

    const channel = supabase
      .channel('layout_credits')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'livra_credits' }, payload => {
        if (payload.new.company_id === user.company_id) setCreditBalance(payload.new.balance ?? 0)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  if (!user) return <Navigate to="/login" replace />
  if (user.must_change_password) return <Navigate to="/change-password" replace />
  if (user.role !== 'admin') return <Navigate to="/sales" replace />

  return (
    <>
    <div className="flex h-[calc(100dvh-3.5rem)] md:h-screen min-h-0 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <aside className={`hidden md:flex flex-shrink-0 flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-200 ${collapsed ? 'w-14' : 'w-52'}`}>

        {/* Logo */}
        <div className={`flex items-center h-12 border-b border-zinc-100 dark:border-zinc-800 ${collapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
          <div className="flex items-center gap-2 min-w-0">
            {collapsed ? (
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-[#161513] dark:text-white tracking-widest uppercase leading-none">L</span>
                <svg width="10" height="3" viewBox="0 0 10 3"><line x1="0" y1="1.5" x2="7" y2="1.5" stroke="#ff5c2c" strokeWidth="1.5"/><polygon points="7,0 10,1.5 7,3" fill="#ff5c2c"/></svg>
              </div>
            ) : (
              <div className="flex flex-col leading-none">
                <span className="text-[13px] font-bold text-[#161513] dark:text-white tracking-widest uppercase">Livra</span>
                <svg width="32" height="4" viewBox="0 0 32 4"><line x1="0" y1="2" x2="25" y2="2" stroke="#ff5c2c" strokeWidth="1.5"/><polygon points="25,0 32,2 25,4" fill="#ff5c2c"/></svg>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={toggle}
              className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-lg text-[13px] font-medium transition-colors ${collapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-2.5 py-2'} ${
                  isActive
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={14} className={isActive ? 'text-brand-orange dark:text-orange-400' : ''} />
                  {!collapsed && <span className="flex-1">{label}</span>}
                  {!collapsed && to === '/credits' && creditBalance !== null && (
                    <span className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full ${
                      creditBalance < 0
                        ? 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400'
                        : creditBalance < 20
                          ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}>
                      {creditBalance}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 space-y-0.5">
          {collapsed ? (
            <div className="flex justify-center py-2" title={user.name}>
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-white">{user.initials}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-white">{user.initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium text-zinc-800 dark:text-zinc-200 truncate">{user.name}</div>
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{user.email}</div>
              </div>
              <button
                onClick={() => signOut().then(() => { window.location.href = '/login' })}
                title="Deconectare"
                className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
              >
                <LogOut size={12} />
              </button>
            </div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className={`w-full flex items-center rounded-lg py-2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${collapsed ? 'justify-center px-0' : 'gap-2 px-2.5'}`}
          >
            {collapsed ? <ChevronRight size={13} /> : <><ChevronLeft size={13} /><span className="text-[12px]">Restrânge</span></>}
          </button>

          {collapsed && (
            <button
              onClick={toggle}
              title={theme === 'dark' ? 'Mod luminos' : 'Mod întunecat'}
              className="w-full flex justify-center py-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </div>

    {/* Mobile bottom nav */}
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 h-14 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
      <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${nav.length}, 1fr)` }}>
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors ${
                isActive ? 'text-brand-orange' : 'text-zinc-500 dark:text-zinc-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-brand-orange' : ''} />
                <span className="text-[8px] font-medium leading-none truncate w-full text-center px-0.5">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
    </>
  )
}
