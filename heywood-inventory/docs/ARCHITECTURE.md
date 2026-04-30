# Heywood Inventory — Architecture

This is the longer-form architecture note that complements the 4-layer diagram
in the Week 6 deck. Read it once before your first instructor run-through.

## The four layers

```
   ┌───────────────────────── L1 · React Frontend ─────────────────────────┐
   │ Vite dev server (5173) · React 18 · TypeScript · Tailwind ·          │
   │ react-router-dom · Sidebar layout · role-aware nav · markdown chat   │
   └────────────────────────────────┬─────────────────────────────────────┘
                                    │  (Vite proxy in dev / same origin in prod)
   ┌────────────────────────────────▼─────────────────────────────────────┐
   │                    L2 · Go HTTP Server (8080)                        │
   │ net/http (Go 1.22 routing) · middleware chain · /api/v1/*            │
   └───┬──────────────────────────────────┬───────────────────────────┬───┘
       │                                  │                           │
   ┌───▼──── L3 · Data Layer ────┐  ┌─────▼──── L4 · External ───────┐│
   │ DataStore interface         │  │ OpenAI gpt-4o (chat completions)││
   │   ├─ JSONStore (default)    │  │   + lookup_items tool           ││
   │   └─ SQLiteStore (Path A)   │  │ Microsoft Graph (Path B)        ││
   └─────────────────────────────┘  └─────────────────────────────────┘│
```

## Why the layers exist as they do

- **L1 ↔ L2 talk JSON over the same origin.** In dev, Vite proxies `/api/*`
  to the Go server so there is no CORS dance. In prod, the Go binary serves
  the React bundle from the same port, so there is no proxy at all.
- **L2 → L3 goes through an interface.** Handlers depend on `data.Store`,
  never on `JSONStore` or `SQLiteStore` directly. This is the lever Module 4
  earns — Module 9 cashes it in.
- **L4 is environmental, not architectural.** OpenAI and Graph are accessed
  via env vars (`OPENAI_API_KEY`, `GRAPH_*`). They light up automatically when
  the keys are present and stay dark when they aren't. The container build
  doesn't bake credentials.

## Endpoint surface

See the table in [`README.md`](../README.md#endpoints). Reference build:
**13 endpoints** (vs Heywood TBS's 35) — sized to fit the live demo while
mapping cleanly onto every concept the deck introduces.

Student "seed" target from the deck: **5 endpoints** (`/health`, `/items`,
`/items/{id}`, `/chat`, `/auth/me`). Hitting that target is enough to ship
the architecture diagram with all four layers lit.

## Role-based authorization

Implemented in two places:

1. `internal/middleware/middleware.go` — reads the `heywood_role` cookie and
   stamps the role onto the request context. Defaults to `user`.
2. `internal/api/handlers.go` — each handler queries `middleware.RoleFrom(r)`
   and either filters the response (`/items`) or rejects the request
   (`POST /items`, `DELETE /items/{id}`).

The chat handler propagates the same role into `ChatService.Reply`, which
forwards it to `lookup_items`, so AI-driven queries respect the same
boundary.

| Role  | List behavior                              | Write capability                 |
|-------|--------------------------------------------|----------------------------------|
| admin | All items                                  | Create / update / delete         |
| staff | All items                                  | Create / update                  |
| user  | Only items where `assigneeId == "user"`    | Update own items only            |

In production this becomes CAC + OIDC + a real session store. The pattern
(read credential → set context → handlers filter) is identical.

## Tool use round trip

Module 7's centerpiece. When the user asks *"how many high-priority items?"*:

1. `web/src/pages/ChatPage.tsx` POSTs to `/api/v1/chat`.
2. `internal/ai/chat.go` calls OpenAI Chat Completions with the message and
   the `lookup_items` tool definition.
3. OpenAI returns a `tool_call` requesting `lookup_items(priority="high")`.
4. The Go server runs the lookup against the `DataStore` (with the user's
   role applied).
5. The Go server appends the tool result to the conversation and calls
   OpenAI again.
6. OpenAI writes the final sentence using the real numbers.
7. Go returns the sentence to the frontend; React renders the markdown.

The reference loops up to 4 times so a follow-up tool call (e.g. checking
status after priority) still terminates.

## Production packaging

The multi-stage `Dockerfile`:

- Stage 1 (`node:20-alpine`) — `npm install` and `npm run build` in `web/`.
- Stage 2 (`golang:1.22-alpine`) — `go build` a static binary (CGO disabled).
- Stage 3 (`alpine:3.20`) — runtime image with the binary, the React `dist/`,
  the seed JSON, and a non-root user.

`-web=/app/web/dist` tells the Go server to serve the SPA bundle from disk;
the SPA fallback in `router.go` makes direct loads of `/items/14` work
without 404ing.
