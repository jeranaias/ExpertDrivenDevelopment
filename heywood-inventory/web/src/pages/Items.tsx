// Module 5 — Items table (initial render).
// Module 6 — Title clicks through to /items/:id; status/priority chips.
// Module 8 — Filter dropdowns hit the backend; results respect role-based filtering.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, Item, Priority, Status } from '../api/client'
import { PriorityChip, StatusChip } from '../components/StatusChip'

export default function Items() {
  const [items, setItems] = useState<Item[]>([])
  const [status, setStatus] = useState<Status | ''>('')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [q, setQ] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .listItems({
        status: status || undefined,
        priority: priority || undefined,
        q: q || undefined,
      })
      .then((d) => {
        setItems(d)
        setError(null)
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [status, priority, q])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Items</h1>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or notes…"
            className="border border-slate-300 rounded px-3 py-1.5 text-sm w-64"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status | '')}
            className="border border-slate-300 rounded px-2 py-1.5 text-sm"
          >
            <option value="">All status</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority | '')}
            className="border border-slate-300 rounded px-2 py-1.5 text-sm"
          >
            <option value="">All priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded p-3 text-sm">{error}</div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
            <tr>
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Priority</th>
              <th className="text-left px-4 py-2">Assignee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  No items match your filters.
                </td>
              </tr>
            )}
            {items.map((it) => (
              <tr key={it.id} className="hover:bg-slate-50">
                <td className="px-4 py-2 text-slate-500">#{it.id}</td>
                <td className="px-4 py-2">
                  <Link to={`/items/${it.id}`} className="text-blue-700 hover:underline">
                    {it.title}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <StatusChip status={it.status} />
                </td>
                <td className="px-4 py-2">
                  <PriorityChip priority={it.priority} />
                </td>
                <td className="px-4 py-2 text-slate-600">{it.assigneeId || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
