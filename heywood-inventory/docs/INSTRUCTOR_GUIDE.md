# Instructor Guide — Live Rebuilding the Reference

This guide maps the 10 modules of `docs/decks/week-6-fullstack.html` onto
the files in this repo. Use it as your safety net before and during the
8-hour capstone session.

> **The 3-Minute Rule:** if the AI's output doesn't work in 3 minutes, paste
> the error back. Don't manually debug AI code. Demonstrate this discipline
> visibly the first time you hit an error in Module 3.

## Before the day starts (the night before)

1. Pull this repo. From `heywood-inventory/`:
   ```bash
   go run ./cmd/server -dev
   cd web && npm install && npm run dev
   ```
   Confirm:
   - `curl localhost:8080/api/v1/health` returns `{"status":"ok",…}`.
   - `localhost:5173` loads the dashboard with 20 items in the recent table.
2. Set `OPENAI_API_KEY` in your shell. Restart the backend. Open `/chat` and
   ask "how many high-priority items?". Watch the terminal for the tool call
   log line.
3. (Optional) Build and run the container:
   ```bash
   docker build -t heywood-inventory .
   docker run -p 8080:8080 -e OPENAI_API_KEY=$OPENAI_API_KEY heywood-inventory
   ```
4. Have `docs/PROMPTS.md` open in a side window. You'll paste from it during
   each "switch to editor" segment.

## The 10 modules — what to point at, where it lives in this repo

### Module 1 · The Full-Stack Frontier  (no code)
Use slide 0.6 to walk Heywood (this app) → Dashboard → Chat ("morning brief")
→ Settings → role picker. Two minutes, wide-angle, no editor.

### Module 2 · Environment Setup
Reference: nothing in this repo to demo. Use the install prompt from the deck;
verify Go, Node, Git, VS Code, Docker. Create the `my-staff-app/` skeleton.

### Module 3 · Backend from Scratch (Build · 45 min)
Three prompts → produce `cmd/server/main.go` and `internal/api/router.go`.
- Prompt 1 → single-file server with `/api/v1/health`, `-port` and `-dev` flags.
- Prompt 2 → extract `SetupRouter` into `internal/api/router.go`; add
  `writeJSON` and `writeError` helpers.
- Prompt 3 → hardcoded `/api/v1/items` with five military-flavored items.

Reference files: [`cmd/server/main.go`](../cmd/server/main.go),
[`internal/api/router.go`](../internal/api/router.go).

Common errors to demo: port collision (switch to 8081), `go.mod` module name
mismatch, missing `go.sum` (`go mod tidy`).

### Module 4 · Data Layer (Build · 45 min)
Three prompts → produce the `DataStore` interface, the JSON store, the seed
file, and the rewired endpoint.

Reference files: [`internal/data/store.go`](../internal/data/store.go),
[`internal/data/json_store.go`](../internal/data/json_store.go),
[`data/items.json`](../data/items.json), and the items handlers in
[`internal/api/handlers.go`](../internal/api/handlers.go).

Stop and read the interface aloud. The whole "interfaces are the lever"
moment lives in `store.go`.

### Module 5 · Frontend from Scratch (Build · 45 min)
Two terminals: backend in one, `npm run dev` in the other. Configure Tailwind,
set up the Vite proxy, build the API client, render the items table at
`localhost:5173`.

Reference files: [`web/vite.config.ts`](../web/vite.config.ts),
[`web/tailwind.config.ts`](../web/tailwind.config.ts),
[`web/src/api/client.ts`](../web/src/api/client.ts),
[`web/src/pages/Items.tsx`](../web/src/pages/Items.tsx).

Common error to demo: CORS error → fix is the proxy in `vite.config.ts`,
not CORS middleware on the backend.

### Module 6 · Pages & Navigation (Build · 45 min)
Three prompts → routing + sidebar layout, item detail page, dashboard.

Reference files: [`web/src/App.tsx`](../web/src/App.tsx),
[`web/src/layouts/Layout.tsx`](../web/src/layouts/Layout.tsx),
[`web/src/pages/Dashboard.tsx`](../web/src/pages/Dashboard.tsx),
[`web/src/pages/ItemDetail.tsx`](../web/src/pages/ItemDetail.tsx).

### Module 7 · AI Chat Integration (Build · 45 min) — the apex
Three prompts → chat service against OpenAI; `lookup_items` tool definition;
chat page with markdown rendering.

Reference files: [`internal/ai/chat.go`](../internal/ai/chat.go),
[`web/src/pages/ChatPage.tsx`](../web/src/pages/ChatPage.tsx). The chat
endpoint is wired in [`internal/api/handlers.go`](../internal/api/handlers.go).

End-of-module check: ask "what are my high-priority items?" and watch the
server log a tool call before the answer comes back. That's the moment.

### Module 8 · Auth & Middleware (Build · 45 min)
Three prompts → middleware package; auth endpoints + frontend role picker;
role-based filtering across existing endpoints.

Reference files: [`internal/middleware/middleware.go`](../internal/middleware/middleware.go),
auth handlers in [`internal/api/handlers.go`](../internal/api/handlers.go),
[`web/src/components/RolePicker.tsx`](../web/src/components/RolePicker.tsx).

Demo flow: switch to User → fewer items, no Settings link. Switch to Admin →
everything. Open dev tools → Application → Cookies → show the role cookie.

### Module 9 · External Integrations (Build · 45 min)
Pacing valve. Default to Path A unless the room is fluent.

- Path A: SQLite store. File [`internal/data/sqlite_store.go`](../internal/data/sqlite_store.go).
  Build with `-tags sqlite` after `go get modernc.org/sqlite`. Run with `-db sqlite`.
- Path B: Microsoft Graph. File [`internal/integrations/graph.go`](../internal/integrations/graph.go).
  Set `GRAPH_TENANT_ID`, `GRAPH_CLIENT_ID`, `GRAPH_CLIENT_SECRET`, `GRAPH_USER`,
  optionally `GRAPH_CLOUD=gcchigh`.

Whichever path you take, the rest of the application stays untouched. That's
the receipt for Module 4's interface.

### Module 10 · Docker & Deployment (Build · 45 min) — third victory
Generate the multi-stage `Dockerfile`. Build, run, open `localhost:8080`,
stop the local dev servers, prove the container is the whole app.

Reference file: [`Dockerfile`](../Dockerfile). The SPA fallback is the second
half of [`internal/api/router.go`](../internal/api/router.go).

```bash
docker build -t my-staff-app .
docker run -p 8080:8080 -e OPENAI_API_KEY=$OPENAI_API_KEY my-staff-app
```

Optional Azure deploy: `az acr build`, then `az containerapp create --image …`.

## How to use this repo *during* the live build

You are not pasting from this repo. The students paste prompts from
`docs/PROMPTS.md`; the AI generates code module by module. **This repo is the
shape that code should converge to.** When a student is stuck and the
3-Minute Rule has fired twice, open the matching reference file silently in
your editor on a second monitor and either:

- read the differences out loud as a hint, or
- (last resort) paste the missing block in.

Never start by reading the reference. The whole point of the day is the
prompt → AI → debug loop. The reference exists to recover, not to lead.
