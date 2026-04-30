// Module 8 — Role picker writes the role cookie via /auth/switch.
import { api, Me, Role } from '../api/client'

interface Props {
  me: Me | null
  onChange: () => void
}

export default function RolePicker({ me, onChange }: Props) {
  const handle = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await api.switchRole(e.target.value as Role)
    onChange()
    // Re-fetch happens via parent. Forcing a soft reload of the current page
    // ensures lists re-query with the new role-based filter applied server-side.
    window.location.reload()
  }
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-500">Role</span>
      <select
        value={me?.role ?? 'user'}
        onChange={handle}
        className="border border-slate-300 rounded px-2 py-1 bg-white text-slate-800"
      >
        <option value="admin">Admin</option>
        <option value="staff">Staff</option>
        <option value="user">User</option>
      </select>
    </label>
  )
}
