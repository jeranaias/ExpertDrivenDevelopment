// Module 7 — Chat with markdown rendering. Loading states. Tool use is invisible
// from the user's perspective: they ask "how many high-priority items?" and the
// answer comes back grounded in their real data.
import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { api } from '../api/client'

type Turn = { role: 'user' | 'assistant'; content: string }

export default function ChatPage() {
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: 'assistant',
      content:
        "Ask me about your inventory. Try: **how many high-priority items do I have?** or **what's blocked right now?**",
    },
  ])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const message = draft.trim()
    if (!message || busy) return
    setTurns((t) => [...t, { role: 'user', content: message }])
    setDraft('')
    setBusy(true)
    setError(null)
    try {
      const { reply } = await api.chat(message)
      setTurns((t) => [...t, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(String(err))
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Chat</h1>
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-[60vh]">
        <ol className="flex-1 overflow-y-auto p-4 space-y-3">
          {turns.map((t, i) => (
            <li
              key={i}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                t.role === 'user'
                  ? 'bg-blue-600 text-white ml-auto'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {t.role === 'assistant' ? (
                <div className="markdown">
                  <ReactMarkdown>{t.content}</ReactMarkdown>
                </div>
              ) : (
                t.content
              )}
            </li>
          ))}
          {busy && (
            <li className="bg-slate-100 text-slate-500 text-sm rounded-lg px-3 py-2 max-w-[85%]">
              Thinking…
            </li>
          )}
        </ol>
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-sm text-red-800">{error}</div>
        )}
        <form onSubmit={send} className="p-3 border-t border-slate-200 flex gap-2">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about your inventory…"
            className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
