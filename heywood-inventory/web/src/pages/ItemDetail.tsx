// Module 6 — Item detail page at /items/:id.
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, Item } from '../api/client'
import { PriorityChip, StatusChip } from '../components/StatusChip'

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<Item | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    api
      .getItem(parseInt(id, 10))
      .then(setItem)
      .catch((e) => setError(String(e)))
  }, [id])

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded p-4 text-sm">{error}</div>
    )
  if (!item) return <div className="text-slate-500">Loading…</div>

  return (
    <div className="space-y-4">
      <Link to="/items" className="text-sm text-blue-600 hover:underline">
        ← Back to items
      </Link>
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">Item #{item.id}</div>
            <h1 className="text-2xl font-semibold mt-1">{item.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <StatusChip status={item.status} />
            <PriorityChip priority={item.priority} />
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-slate-500">Assignee</dt>
            <dd className="font-medium">{item.assigneeId || '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Updated</dt>
            <dd className="font-medium">{new Date(item.updatedAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Created</dt>
            <dd className="font-medium">{new Date(item.createdAt).toLocaleString()}</dd>
          </div>
        </dl>
        <div>
          <h2 className="text-sm font-medium text-slate-700 mb-1">Notes</h2>
          <p className="text-sm whitespace-pre-wrap">{item.notes || <em className="text-slate-400">No notes recorded.</em>}</p>
        </div>
      </div>
    </div>
  )
}
