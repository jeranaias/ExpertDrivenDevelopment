// Module 6 — color-coded status + priority chips for the items table.
import { Priority, Status } from '../api/client'

const statusColors: Record<Status, string> = {
  open: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-800',
  blocked: 'bg-amber-100 text-amber-800',
  done: 'bg-emerald-100 text-emerald-800',
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

export function StatusChip({ status }: { status: Status }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColors[status]}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

export function PriorityChip({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${priorityColors[priority]}`}>
      {priority}
    </span>
  )
}
