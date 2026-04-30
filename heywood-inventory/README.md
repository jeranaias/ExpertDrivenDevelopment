# Heywood Inventory — Week 6 Reference Build

A reference full-stack application for the **Week 6 Capstone — Full-Stack
AI-Assisted Development** session of the Expert-Driven Development training.

This is the canonical "answer key" version of the app the deck
(`docs/decks/week-6-fullstack.html`) walks instructors and students through
building live in 8 hours. It mirrors the Heywood TBS concept: a single domain
expert directs an AI to build a real, deployable internal tool.

> **Architecture (4 layers, the spine of the day):**
> - **L1 · Frontend** — Vite + React + TypeScript + Tailwind, dark sidebar layout, client-side routing.
> - **L2 · Backend** — Go 1.22 HTTP server (`net/http` only, Go 1.22 routing).
> - **L3 · Data** — `DataStore` interface with JSON store (default) and SQLite store (Path A, build-tagged).
> - **L4 · External** — OpenAI `gpt-4o` chat with **tool use** against the live data store. Optional Microsoft Graph integration (Path B).

---

## Quick start

```bash
# 1. Backend — defaults to JSON data store, dev mode, port 8080
go run ./cmd/server -dev

# 2. Frontend — second terminal
cd web && npm install && npm run dev
# open http://localhost:5173

# 3. Chat — set the API key first
export OPENAI_API_KEY=sk-...
# (restart the backend so the env var is picked up)
```

For the production single-container build:

```bash
docker build -t heywood-inventory .
docker run -p 8080:8080 -e OPENAI_API_KEY=sk-... heywood-inventory
# open http://localhost:8080
```

---

## Who this repository is for

| Audience | How to use it |
|---|---|
| **Instructors** | Open `docs/INSTRUCTOR_GUIDE.md`. It maps the 10 modules of the Week 6 deck to the files and prompts in this repo. Use it as your safety net during the live build. |
| **Students** | Open `docs/STUDENT_GUIDE.md` first, then `docs/PROMPTS.md`. The prompts are exactly the ones called out in the deck's "switch to editor" slides — they're validated to produce code shaped like this repo. |
| **Future curriculum work** | Open `docs/ARCHITECTURE.md` for the per-layer breakdown and the full endpoint list. |

The full set of validated copy/paste prompts (Modules 2 → 10) is in
`docs/PROMPTS.md`.

---

## Repo layout (mirrors the module sequence)

```
heywood-inventory/
├── cmd/server/main.go              # Module 3 — entry point
├── internal/
│   ├── api/router.go               # Module 3 — router, writeJSON/writeError
│   ├── api/handlers.go             # Modules 3, 4, 7, 8 — items, chat, auth handlers
│   ├── data/store.go               # Module 4 — DataStore interface + Item
│   ├── data/json_store.go          # Module 4 — JSONStore implementation
│   ├── data/sqlite_store.go        # Module 9 Path A — SQLite store (build-tagged)
│   ├── ai/chat.go                  # Module 7 — OpenAI chat with lookup_items tool
│   ├── middleware/middleware.go    # Module 8 — CORS, security headers, role-aware auth
│   └── integrations/graph.go       # Module 9 Path B — Microsoft Graph client
├── data/items.json                 # Module 4 — 20 seed items
├── web/                            # Modules 5, 6, 7, 8 — React + Vite + TS frontend
│   ├── package.json, vite.config.ts, tailwind.config.ts, …
│   └── src/
│       ├── api/client.ts           # Module 5 — typed API client
│       ├── layouts/Layout.tsx      # Module 6 — sidebar shell, role-aware
│       ├── pages/                  # Modules 6, 7, 8 — Dashboard, Items, ItemDetail, ChatPage, Settings
│       └── components/             # StatusChip, RolePicker
├── Dockerfile                      # Module 10 — multi-stage build
├── .dockerignore
└── docs/
    ├── ARCHITECTURE.md
    ├── INSTRUCTOR_GUIDE.md
    └── STUDENT_GUIDE.md
```

---

## Endpoints

The student "seed" target is ~5 endpoints. The reference exposes the full set
called out in the Week 6 deck:

| Method | Path | Module | Notes |
|---|---|---|---|
| `GET`    | `/api/v1/health`           | 3 | Liveness probe |
| `GET`    | `/api/v1/version`          | 3 | Build identity |
| `GET`    | `/api/v1/items`            | 4 | Filterable; Users see their assigned items only |
| `GET`    | `/api/v1/items/{id}`       | 4 | 404 hides existence from non-assignee Users |
| `POST`   | `/api/v1/items`            | 4 | Staff/Admin only |
| `PUT`    | `/api/v1/items/{id}`       | 4 | Users may only update their own |
| `DELETE` | `/api/v1/items/{id}`       | 4 | Admin only |
| `GET`    | `/api/v1/stats`            | 6 | Dashboard payload |
| `GET`    | `/api/v1/auth/me`          | 8 | Returns role + capability flags |
| `POST`   | `/api/v1/auth/switch`      | 8 | Sets the role cookie |
| `POST`   | `/api/v1/chat`             | 7 | OpenAI chat with `lookup_items` tool |
| `GET`    | `/api/v1/calendar/today`   | 9B | Optional — Microsoft Graph |
| `GET`    | `/api/v1/mail/summary`     | 9B | Optional — Microsoft Graph |

---

## Validation

This is the canonical answer key. Each "switch to editor" prompt in the Week 6
deck has been validated against this build:

- Module 3 (3 prompts) → `cmd/server/main.go`, `internal/api/router.go`, items handler
- Module 4 (3 prompts) → `internal/data/store.go`, `data/items.json`, items endpoint rewired
- Module 5 → `web/vite.config.ts`, `web/src/api/client.ts`, `web/src/pages/Items.tsx`
- Module 6 (3 prompts) → `web/src/App.tsx`, `web/src/layouts/Layout.tsx`, `web/src/pages/{Dashboard,ItemDetail}.tsx`
- Module 7 (3 prompts) → `internal/ai/chat.go`, `lookup_items` tool definition, `web/src/pages/ChatPage.tsx`
- Module 8 (3 prompts) → `internal/middleware/middleware.go`, `/auth/me` + `/auth/switch`, role filtering in `internal/api/handlers.go`
- Module 9 Path A → `internal/data/sqlite_store.go` (build-tag `sqlite`)
- Module 9 Path B → `internal/integrations/graph.go`
- Module 10 → `Dockerfile`, SPA fallback in `internal/api/router.go`

See `docs/PROMPTS.md` for the validated prompt text and `docs/INSTRUCTOR_GUIDE.md`
for the live-build choreography.

---

## What this is **not**

This is a teaching reference, not a production system. The auth is a cookie,
not CAC. The data layer is a JSON file. The chat key lives in an env var. Each
of these is the pattern you would harden in a real deployment — exactly the
point Module 8's "scaffold, then layer" framing makes.
