// Module 6 — Sidebar layout shell. Active link highlight via NavLink className fn.
// Module 8 — Settings link conditionally rendered based on /auth/me role.
import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import RolePicker from '../components/RolePicker'
import { api, Me } from '../api/client'

const nav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/items', label: 'Items' },
  { to: '/chat', label: 'Chat' },
]

export default function Layout() {
  const [me, setMe] = useState<Me | null>(null)
  const refresh = () => api.me().then(setMe).catch(() => setMe(null))

  useEffect(() => {
    refresh()
  }, [])

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-sidebar text-slate-100 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="text-lg font-semibold tracking-tight">Heywood</div>
          <div className="text-xs text-slate-400">Inventory · reference build</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-sidebarHover text-white font-medium'
                    : 'text-slate-300 hover:bg-sidebarHover hover:text-white'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
          {me?.canAdmin && (
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-sidebarHover text-white font-medium'
                    : 'text-slate-300 hover:bg-sidebarHover hover:text-white'
                }`
              }
            >
              Settings
            </NavLink>
          )}
        </nav>
        <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-400">
          v1.0 · Week 6 reference
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-slate-500">DoW · Expert-Driven Development</div>
          <RolePicker me={me} onChange={refresh} />
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
