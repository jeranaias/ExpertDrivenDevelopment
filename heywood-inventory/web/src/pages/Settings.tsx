// Module 8 — Admin-only settings page. Used to demo "different roles see
// different things." Doesn't need to do anything heavy yet.
//
// Defense in depth: the sidebar already hides this link for non-admins, but
// anyone could still type /settings into the URL. We mirror the server's
// authorization check on the client by redirecting non-admins back to the
// dashboard once we know who they are. The real authorization gate is on
// the server — this just keeps the UX honest.
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api, Me } from '../api/client'

export default function Settings() {
  const [me, setMe] = useState<Me | null>(null)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    api.me()
      .then(setMe)
      .catch(() => setMe(null))
      .finally(() => setLoaded(true))
  }, [])

  if (!loaded) {
    return <p className="text-sm text-slate-500">Loading…</p>
  }
  if (!me?.canAdmin) {
    return <Navigate to="/dashboard" replace />
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="text-sm text-slate-600">
        Admin-only. Switch your role from the header drop-down to see this link disappear from the sidebar — and to be redirected away from this page.
      </p>
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 text-sm">
        <div className="font-medium text-slate-700 mb-2">Current session</div>
        <pre className="bg-slate-50 rounded p-3 text-xs">{JSON.stringify(me, null, 2)}</pre>
      </div>
    </div>
  )
}
