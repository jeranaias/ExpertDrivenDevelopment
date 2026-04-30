# Student Guide — Using This Repo as an Answer Key

This repo is the **finished version** of the application you build during the
Week 6 Capstone. You don't need to read it before class — half the day's
value is in *not* reading it. Build first. Reference second.

## When to look at this repo

| Stuck? | Action |
|---|---|
| You hit an error and the 3-Minute Rule has fired once. | Paste the error into your AI chat. |
| You hit an error and the 3-Minute Rule has fired *twice* on the same prompt. | Open the matching reference file from the table below and compare with your AI's output. Read the difference out loud — usually the AI is one import away. |
| The module is "complete" but yours doesn't match the architecture diagram on the deck. | Walk the corresponding reference file top to bottom. Spot the gap. Re-prompt the AI to add it. |
| You finished early and want to extend. | The reference has more endpoints, more roles, and more polish than the seed target. Pick a feature, study how it's wired, then add it to your build with prompts. |

## Where each module lives in this repo

| Module | What you built | Reference file(s) |
|---|---|---|
| 3 — Backend | Server + router | [`cmd/server/main.go`](../cmd/server/main.go), [`internal/api/router.go`](../internal/api/router.go) |
| 4 — Data Layer | Interface + JSON store + seed | [`internal/data/store.go`](../internal/data/store.go), [`internal/data/json_store.go`](../internal/data/json_store.go), [`data/items.json`](../data/items.json) |
| 5 — Frontend | Vite proxy, API client, items table | [`web/vite.config.ts`](../web/vite.config.ts), [`web/src/api/client.ts`](../web/src/api/client.ts), [`web/src/pages/Items.tsx`](../web/src/pages/Items.tsx) |
| 6 — Pages & Nav | Sidebar, dashboard, detail | [`web/src/App.tsx`](../web/src/App.tsx), [`web/src/layouts/Layout.tsx`](../web/src/layouts/Layout.tsx), [`web/src/pages/Dashboard.tsx`](../web/src/pages/Dashboard.tsx), [`web/src/pages/ItemDetail.tsx`](../web/src/pages/ItemDetail.tsx) |
| 7 — AI Chat | Chat service + tool + chat page | [`internal/ai/chat.go`](../internal/ai/chat.go), [`web/src/pages/ChatPage.tsx`](../web/src/pages/ChatPage.tsx) |
| 8 — Auth & Middleware | Middleware, role picker, role filtering | [`internal/middleware/middleware.go`](../internal/middleware/middleware.go), [`web/src/components/RolePicker.tsx`](../web/src/components/RolePicker.tsx), role checks in [`internal/api/handlers.go`](../internal/api/handlers.go) |
| 9 — Integrations | SQLite (Path A) or Graph (Path B) | [`internal/data/sqlite_store.go`](../internal/data/sqlite_store.go), [`internal/integrations/graph.go`](../internal/integrations/graph.go) |
| 10 — Docker | Multi-stage build + SPA fallback | [`Dockerfile`](../Dockerfile), SPA section of [`internal/api/router.go`](../internal/api/router.go) |

## Targets

You are aiming for the deck's "seed" target, not the reference:

- ~5 endpoints (`/health`, `/items`, `/items/{id}`, `/chat`, `/auth/me` is plenty)
- 3–4 pages (Dashboard, Items, ItemDetail, Chat)
- Working chat with **one** tool (`lookup_items`)
- A container that runs your build on `localhost:8080`

The reference has 13 endpoints, 5 pages, and Path A + Path B. **You don't
need to match it.** You're proving you can drive an AI to a deployable
full-stack app in a day. Quality of the four-layer diagram > volume of code.

## Reading order if you want to study after class

1. `docs/ARCHITECTURE.md` — the four layers in long form.
2. `internal/data/store.go` — the interface that makes everything else swappable.
3. `internal/ai/chat.go` — tool use is short; this is what unlocks "AI calls your code."
4. `internal/middleware/middleware.go` — the gate-guard pattern in 100 lines.
5. `Dockerfile` — multi-stage build trick: tiny final image, no toolchain.

That's the lever set you'll reach for on every internal tool you build after
this week.
