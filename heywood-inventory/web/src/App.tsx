// Module 6 — react-router-dom routes wired beneath the sidebar layout.
// Module 8 — /settings is admin-only via conditional render in <Layout>.
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './layouts/Layout'
import Dashboard from './pages/Dashboard'
import Items from './pages/Items'
import ItemDetail from './pages/ItemDetail'
import ChatPage from './pages/ChatPage'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/items" element={<Items />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
