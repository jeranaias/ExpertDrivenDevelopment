// Module 6 — Dashboard: stat cards + recent items.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, Stats } from '../api/client'
import { PriorityChip, StatusChip } from '../components/StatusChip'

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.stats().then(setStats).catch((e) => setError(String(e)))
  }, [])

  if (error) return <Failure message={error} />
  if (!stats) return <Loading />

  const card = (label: string, value: number) => (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="text-xs text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-3xl font-semibold mt-1">{value}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {card('Total items', stats.total)}
        {card('Open', stats.byStatus['open'] ?? 0)}
        {card('In progress', stats.byStatus['in_progress'] ?? 0)}
        {card('Blocked', stats.byStatus['blocked'] ?? 0)}
      </div>

      <section className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-700">Recent activity</h2>
          <Link to="/items" className="text-sm text-blue-600 hover:underline">
            View all items →
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {stats.recent.map((it) => (
            <li key={it.id} className="px-4 py-3 flex items-center justify-between">
              <Link to={`/items/${it.id}`} className="font-medium text-slate-800 hover:text-blue-700">
                {it.title}
              </Link>
              <div className="flex items-center gap-2">
                <StatusChip status={it.status} />
                <PriorityChip priority={it.priority} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Loading() {
  return <div className="text-slate-500">Loading…</div>
}

function Failure({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 rounded p-4">
      <strong>Couldn’t load dashboard.</strong>
      <pre className="mt-2 text-xs whitespace-pre-wrap">{message}</pre>
    </div>
  )
}
