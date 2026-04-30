// Module 5 — single typed client for every backend call.
// Adding a new endpoint = adding a method here so the rest of the app stays
// HTTP-free and the wire types stay close to the data models.

export type Status = 'open' | 'in_progress' | 'blocked' | 'done'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type Role = 'admin' | 'staff' | 'user'

export interface Item {
  id: number
  title: string
  status: Status
  priority: Priority
  assigneeId: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Stats {
  total: number
  byStatus: Record<string, number>
  byPriority: Record<string, number>
  recent: Item[]
}

export interface Me {
  role: Role
  canAdmin: boolean
  canCreate: boolean
}

const BASE = '/api/v1'

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const j = await res.json()
      if (j?.error) detail = j.error
    } catch {
      // body wasn't json; keep statusText
    }
    throw new Error(`${res.status} ${detail}`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  health: () => request<{ status: string; timestamp: string }>('GET', '/health'),
  listItems: (params: Partial<{ status: Status; priority: Priority; q: string }> = {}) => {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v) qs.set(k, String(v))
    }
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return request<Item[]>('GET', `/items${suffix}`)
  },
  getItem: (id: number) => request<Item>('GET', `/items/${id}`),
  createItem: (body: Partial<Item>) => request<Item>('POST', '/items', body),
  updateItem: (id: number, body: Partial<Item>) => request<Item>('PUT', `/items/${id}`, body),
  deleteItem: (id: number) => request<void>('DELETE', `/items/${id}`),
  stats: () => request<Stats>('GET', '/stats'),
  me: () => request<Me>('GET', '/auth/me'),
  switchRole: (role: Role) => request<{ role: Role }>('POST', '/auth/switch', { role }),
  chat: (message: string) => request<{ reply: string }>('POST', '/chat', { message }),
}
