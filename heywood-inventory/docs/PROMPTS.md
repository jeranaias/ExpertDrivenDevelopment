# Validated Prompts — Week 6 "Switch to Editor" Sequences

Copy/paste-ready prompts that the deck's "switch to editor" slides reference.
Each one was validated against this reference repository — running it against
GPT-5 / Claude Sonnet 4.5 with `my-staff-app/` as the working directory
produces code shaped like the matching reference file.

> **The 3-Minute Rule.** Run a prompt. If the output doesn't work in 3 minutes,
> paste the error back into the same chat. Don't manually debug AI code.

---

## Module 2 · Environment Setup

**Install + verify** (paste into the AI in your terminal):
```
I'm on <Windows / macOS / Ubuntu>. Walk me through installing the latest stable
versions of Go, Node.js (LTS), Git, and VS Code, in that order. After each
install, give me the one-liner that prints the version. Stop after each step
and wait for me to paste the version output back before moving on.
```

**Scaffold the project skeleton** (run in a fresh shell once installs verify):
```bash
mkdir my-staff-app && cd my-staff-app
go mod init my-staff-app
mkdir -p cmd/server internal data
npm create vite@latest web -- --template react-ts
cd web && npm install && cd ..
```

---

## Module 3 · Backend from Scratch (3 prompts)

**Prompt 1 — single-file server with health endpoint:**
```
I'm building a Go HTTP server in `cmd/server/main.go`. Use only the standard
library (net/http, flag, log, time). Add:

  - A `-port` string flag (default "8080") and a `-dev` bool flag (default false).
  - A `GET /api/v1/health` handler that returns JSON `{"status":"ok","timestamp":"..."}`.
  - Start the server with reasonable read/write timeouts.
  - Log the listen address and dev flag at startup.

Give me the entire file as one block I can paste, then the exact `go run`
command to start it and the curl to verify.
```

**Prompt 2 — extract the router and add helpers:**
```
Refactor `cmd/server/main.go` so route registration lives in a new file
`internal/api/router.go`. The new file should:

  - Export a `SetupRouter() *http.ServeMux` function that takes any deps it
    needs in a `Deps` struct.
  - Export `writeJSON(w http.ResponseWriter, status int, body any)` and
    `writeError(w http.ResponseWriter, status int, msg string)` helpers.
  - Move the health handler to use `writeJSON`.

In `cmd/server/main.go`, import the new package, build a `Deps`, call
`SetupRouter`, and pass the result to `http.Server`. Show me both files
in full.
```

**Prompt 3 — hardcoded items endpoint:**
```
Add a `GET /api/v1/items` endpoint to `internal/api/router.go` that returns a
hardcoded array of five military-flavored inventory items. Each item has:
id (int), title, status ("open"/"in_progress"/"blocked"/"done"),
priority ("low"/"medium"/"high"/"critical"), assigneeId, notes,
createdAt, updatedAt.

Use `writeJSON`. Hit it with curl after starting the server.
```

---

## Module 4 · Data Layer (3 prompts)

**Prompt 1 — DataStore interface + JSONStore:**
```
Create `internal/data/store.go` defining:
  - An `Item` struct with id, title, status, priority, assigneeId, notes,
    createdAt, updatedAt (camelCase JSON tags, time.Time for timestamps).
  - A `ListFilter` struct with Status, Priority, AssigneeID, Query.
  - A `Store` interface with List, Get, Create, Update, Delete, Stats, Close.
  - A `Stats` struct with Total, ByStatus, ByPriority, Recent (last 5 items).
  - Const Status* and Priority* values; an exported `ErrNotFound`.

Then create `internal/data/json_store.go` implementing `Store` against a JSON
file. Read the file on `NewJSONStore(path)`, write the file on every mutation,
guard with sync.RWMutex. Use atomic rename (write to .tmp then rename) for
durability.

Give me both files in full.
```

**Prompt 2 — seed data:**
```
Generate `data/items.json` containing 20 realistic military-flavored
inventory items as a JSON array using the schema in store.go. Mix all four
statuses and all four priorities. Distribute assigneeId across "admin",
"staff", and "user". Use timestamps in April 2026.
```

**Prompt 3 — rewire the items endpoint and add /items/{id}:**
```
Update `internal/api/router.go`:
  - Add `Store data.Store` to the `Deps` struct.
  - Replace the hardcoded `/api/v1/items` handler with one that calls
    `Store.List({})` and returns the result.
  - Add `GET /api/v1/items/{id}` (use Go 1.22 path values + strconv.Atoi)
    that calls `Store.Get(id)` and 404s on `data.ErrNotFound`.

Update `cmd/server/main.go` to construct a `data.NewJSONStore("data/items.json")`
and pass it via Deps. `defer store.Close()`.

Show me both files in full.
```

---

## Module 5 · Frontend from Scratch

**Single prompt — Tailwind + proxy + items table:**
```
In `web/`, set up Tailwind CSS (init config, content globs, autoprefixer,
postcss.config.cjs). Add a `server.proxy` block to `vite.config.ts` that
proxies `/api` to `http://localhost:8080` with `changeOrigin: true`.

Create `web/src/api/client.ts` with a typed `Item` interface matching the Go
struct, and an `api.listItems()` function using fetch.

Replace `web/src/App.tsx` with a component that calls `api.listItems()` on
mount and renders the items as a Tailwind-styled table with columns: ID,
Title, Status, Priority, Assignee. Color-code status and priority chips.
Use fetch with `credentials: "include"`.

Run both servers and show me the page at localhost:5173.
```

---

## Module 6 · Pages & Navigation (3 prompts)

**Prompt 1 — routing + sidebar layout:**
```
Install `react-router-dom`. Wrap `<App />` in `<BrowserRouter>` in
`main.tsx`. Create `web/src/layouts/Layout.tsx` with:

  - A 240px dark sidebar (`bg-[#1a1f36]`) on the left.
  - Sidebar links via `NavLink`: Dashboard, Items, Chat (Settings will come
    later, conditionally).
  - Active-link styling using NavLink's className-as-function.
  - A header bar across the right column.
  - `<Outlet />` for nested routes.

Then update `App.tsx` to declare routes: index → /dashboard, /dashboard,
/items, /items/:id, /chat, /settings. Use Tailwind defaults; do not pick
fonts or icons.
```

**Prompt 2 — item detail page:**
```
Create `web/src/pages/ItemDetail.tsx` rendered at `/items/:id`. It should:

  - useParams to read the id.
  - Fetch via `api.getItem(id)` (add this method to client.ts).
  - Show the title, ID, status chip, priority chip, assignee, dates, and notes.
  - Have a "← Back to items" link to `/items`.

In the items table, make every title cell a `<Link to={`/items/${id}`}>`.
```

**Prompt 3 — dashboard:**
```
Add a `GET /api/v1/stats` endpoint on the backend that calls Store.Stats().
Add `api.stats()` to client.ts.

Create `web/src/pages/Dashboard.tsx` with four stat cards (Total, Open,
In progress, Blocked) and a "Recent activity" section listing the 5 recent
items with status and priority chips, each linking to its detail page.
Use Tailwind defaults.
```

---

## Module 7 · AI Chat Integration (3 prompts)

**Prompt 1 — chat service against OpenAI:**
```
Create `internal/ai/chat.go` exposing:

  type ChatService struct { ... }
  func NewChatService(apiKey string, store data.Store) *ChatService
  func (c *ChatService) Reply(ctx context.Context, userMessage, role string) (string, error)

Use net/http to POST to `https://api.openai.com/v1/chat/completions` with
model "gpt-4o". The system prompt instructs the AI to call tools rather than
guess. Loop up to 4 times so multi-step tool calls terminate. Return the
final assistant message content as markdown-ready text.

Wire it into the router as `POST /api/v1/chat` taking `{"message":"..."}`
and returning `{"reply":"..."}`. Init the service in main.go from
`os.Getenv("OPENAI_API_KEY")`.
```

**Prompt 2 — `lookup_items` tool definition:**
```
In `internal/ai/chat.go`, define the OpenAI tools array with one tool:

  Name: "lookup_items"
  Description: "Query the inventory items database. Use this any time the
    user asks about counts, statuses, priorities, or specific items.
    Returns matching items and the total count."
  Parameters: object with optional `status` (enum: open/in_progress/blocked/done),
    `priority` (enum: low/medium/high/critical), `query` (string substring).

Implement `runTool(call, role)` that parses the function arguments, builds a
`data.ListFilter` (apply role-based filtering: if role == "user", set
AssigneeID to "user"), calls `store.List(filter)`, and returns a JSON string
of `{ count, items: [...] }` to send back to OpenAI.
```

**Prompt 3 — chat page with markdown rendering:**
```
Install react-markdown. Create `web/src/pages/ChatPage.tsx` with:

  - A scrollable transcript area; assistant turns rendered through
    <ReactMarkdown>, user turns plain.
  - An input + Send button at the bottom.
  - "Thinking…" placeholder while waiting on the response.
  - An error banner above the input on failure.

Add `api.chat(message)` to client.ts. End by asking "what are my
high-priority items?" — confirm the answer cites real items from the
database, and watch the server log a tool call.
```

---

## Module 8 · Auth & Middleware (3 prompts)

**Prompt 1 — middleware package:**
```
Create `internal/middleware/middleware.go` exporting:

  - `Middleware = func(http.Handler) http.Handler`
  - `Chain(h http.Handler, mws ...Middleware) http.Handler`
  - `RequestLogger(dev bool)`, `SecurityHeaders()`, `CORS(dev bool)` (allow
    http://localhost:5173 with credentials when dev=true), `Auth()` (reads a
    "heywood_role" cookie, defaults to "user", stamps the role into request
    context).
  - A `RoleFrom(*http.Request) string` helper.
  - Const RoleAdmin/RoleStaff/RoleUser and CookieRole.

In main.go, wrap the mux with `middleware.Chain(mux, RequestLogger, SecurityHeaders,
CORS, Auth)`.
```

**Prompt 2 — auth endpoints + frontend role picker:**
```
Add two routes:
  - `GET /api/v1/auth/me` returns `{ role, canAdmin, canCreate }`.
  - `POST /api/v1/auth/switch` takes `{"role":"admin|staff|user"}`, validates,
    sets the heywood_role cookie (Path=/, SameSite=Lax, MaxAge=7d).

On the frontend, add `api.me()` and `api.switchRole(role)` to client.ts.
Create `web/src/components/RolePicker.tsx` — a select bound to the current
role; on change, call switchRole then `window.location.reload()`. Render it
in the Layout header. Conditionally render the Settings sidebar link when
`me.canAdmin` is true.
```

**Prompt 3 — role-based filtering across endpoints:**
```
In every items handler, call `middleware.RoleFrom(r)`:
  - List: if role == "user", force ListFilter.AssigneeID = "user".
  - Get: if role == "user" and item.AssigneeID != "user", return 404 (don't
    leak existence).
  - Create: forbid User entirely (403).
  - Update: User can only update items where assigneeId == "user".
  - Delete: Admin only.
  - Stats: if role == "user", build the dashboard payload from
    `Store.List({AssigneeID: "user"})` so the four stat cards and the
    "Recent activity" feed match the table the User actually sees. Admins
    keep the existing `Store.Stats()` fast path.

In ai/chat.go's runTool, apply the same filter so the chat respects RBAC.
Verify by switching to User in the role picker and watching the items list,
the dashboard counts, and the chat answers all narrow together.
```

---

## Module 9 · External Integrations

### Path A — SQLite (default for the room)
```
Create `internal/data/sqlite_store.go` (build tag `sqlite`) implementing the
same Store interface against `database/sql` + the pure-Go `modernc.org/sqlite`
driver. Auto-create the `items` table on startup with indexes on status,
priority, assignee_id. Use parameterized queries.

Add a stub `sqlite_stub.go` (build tag `!sqlite`) so the default build still
compiles when modernc.org/sqlite is absent. Stub returns "sqlite store not
compiled in" from NewSQLiteStore.

Add a `-db` flag to main.go (default "json", accepts "sqlite"). Build with
`go get modernc.org/sqlite && go build -tags sqlite ./cmd/server`. Run with
`./server -db sqlite -dev`. POST a new item, restart, GET to confirm
persistence.
```

### Path B — Microsoft Graph
```
Create `internal/integrations/graph.go`:
  - Read GRAPH_TENANT_ID, GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET, GRAPH_USER
    from env. Return nil from `New()` when env vars are absent.
  - Support GRAPH_CLOUD = "commercial" (default) | "gcchigh" with the right
    login + graph base URLs for each.
  - OAuth2 client-credentials flow with token caching (refresh 1 minute
    before expiry).
  - Methods: `CalendarToday(ctx) ([]CalendarEvent, error)` and
    `MailSummary(ctx) (MailSummary, error)`.

In main.go, call integrations.New(); if non-nil, pass to Deps.Graph. In the
router, register `/calendar/today` and `/mail/summary` only when Graph != nil.
```

---

## Module 10 · Docker & Deployment

**Single prompt — multi-stage Dockerfile + SPA fallback:**
```
Add a SPA fallback to `internal/api/router.go`: when `Deps.WebDir` is set,
register a "/" handler that serves files from WebDir if they exist on disk,
otherwise serves WebDir/index.html. Refuse to serve anything under /api/.

Add a `-web` flag to main.go (default "web/dist") wired into Deps.WebDir.

Create a multi-stage `Dockerfile` and `.dockerignore`:
  - Stage 1 `node:20-alpine`: COPY web/, npm install, npm run build.
  - Stage 2 `golang:1.22-alpine`: COPY ., go build with CGO_ENABLED=0.
  - Stage 3 `alpine:3.20`: ca-certificates, non-root user, COPY the binary,
    the dist/ from stage 1, and data/ from stage 2. EXPOSE 8080.
    ENTRYPOINT ["/app/server", "-port=8080", "-web=/app/web/dist", "-data=/app/data/items.json"].

Show me both files. Then:

  docker build -t my-staff-app .
  docker run -p 8080:8080 -e OPENAI_API_KEY=$OPENAI_API_KEY my-staff-app

Open localhost:8080 — the whole app should work from one container. Stop
your local dev servers and reload to prove it.
```

**Optional — Azure Container Apps:**
```bash
az login
az acr build -r <your-acr> -t my-staff-app:latest .
az containerapp create \
  --name my-staff-app \
  --resource-group <rg> \
  --environment <env> \
  --image <your-acr>.azurecr.io/my-staff-app:latest \
  --target-port 8080 \
  --ingress external \
  --secrets openai-key=$OPENAI_API_KEY \
  --env-vars OPENAI_API_KEY=secretref:openai-key
```
