import { useState } from 'react'
import { NavLink, Outlet, Link, Navigate } from 'react-router-dom'
import { LayoutDashboard, Plus, Package, RotateCcw, Sun, Moon, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { getUser, clearUser } from '../../lib/auth'

const nav = [
  { to: '/sales',          icon: LayoutDashboard, label: 'Prezentare',   end: true },
  { to: '/sales/comenzi',  icon: Package,          label: 'Comenzi' },
  { to: '/sales/nou',      icon: Plus,             label: 'Comandă nouă' },
  { to: '/sales/retururi', icon: RotateCcw,        label: 'Retururi' },
]

export default function SalesLayout() {
  const { theme, toggle } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const user = getUser()

  if (!user) return <Navigate to="/login" replace />
  if (user.must_change_password) return <Navigate to="/change-password" replace />
  if (user.role !== 'sales') return <Navigate to="/dashboard" replace />

  return (
    <div className="flex h-screen min-h-0 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <aside className={`flex-shrink-0 flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-200 ${collapsed ? 'w-14' : 'w-52'}`}>

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
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-[#161513] dark:text-white tracking-widest uppercase">Livra</span>
                  <span className="text-[10px] font-medium text-brand-orange bg-orange-50 dark:bg-orange-950/20 px-1.5 py-0.5 rounded-full">Sales</span>
                </div>
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
          {nav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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
                  <Icon size={14} className={isActive ? 'text-violet-600 dark:text-violet-400' : ''} />
                  {!collapsed && label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 space-y-0.5">
          {/* Switch to admin */}
          {!collapsed && (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <LayoutDashboard size={13} />
              Panou Admin
            </Link>
          )}

          {/* User identity */}
          {collapsed ? (
            <div className="flex justify-center py-2" title={user.name}>
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-brand-orange flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-white">{user.initials}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-brand-orange flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-white">{user.initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium text-zinc-800 dark:text-zinc-200 truncate">{user.name}</div>
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{user.email}</div>
              </div>
              <button
                onClick={() => { clearUser(); window.location.href = '/login' }}
                title="Deconectare"
                className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
              >
                <LogOut size={12} />
              </button>
            </div>
          )}

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
  )
}
