// Module 3 — Router skeleton (extracted from main.go in Prompt 2).
// Module 4 — items endpoints rewired to read from the DataStore.
// Module 6 — SPA fallback hook for production (serves index.html for non-API).
// Module 7 — POST /api/v1/chat added.
// Module 8 — auth endpoints added (/auth/me, /auth/switch).
// Module 9 (optional, Path B) — /calendar/today and /mail/summary added.
// Module 10 — production mode serves the built React bundle from -web dir.
package api

import (
        "encoding/json"
        "errors"
        "net/http"
        "os"
        "path/filepath"
        "strings"
        "time"

        "heywood-inventory/internal/ai"
        "heywood-inventory/internal/data"
        "heywood-inventory/internal/integrations"
)

// Deps is the container of everything the router needs. Bundling them in a
// struct keeps the router signature stable as we add features module by module.
type Deps struct {
        Store   data.Store
        Chat    *ai.ChatService
        Graph   *integrations.GraphClient // nil if Path B not configured
        Dev     bool
        WebDir  string
        Version string
}

// SetupRouter wires every endpoint. The pattern syntax (METHOD + path) is
// Go 1.22's built-in router — no third-party dependency.
func SetupRouter(d Deps) *http.ServeMux {
        mux := http.NewServeMux()
        h := &handlers{d: d}

        // Health
        mux.HandleFunc("GET /api/v1/health", h.health)
        mux.HandleFunc("GET /api/v1/version", h.version)

        // Items (Modules 3-4 + 8 role filtering)
        mux.HandleFunc("GET /api/v1/items", h.listItems)
        mux.HandleFunc("GET /api/v1/items/{id}", h.getItem)
        mux.HandleFunc("POST /api/v1/items", h.createItem)
        mux.HandleFunc("PUT /api/v1/items/{id}", h.updateItem)
        mux.HandleFunc("DELETE /api/v1/items/{id}", h.deleteItem)
        mux.HandleFunc("GET /api/v1/stats", h.stats)

        // Auth (Module 8)
        mux.HandleFunc("GET /api/v1/auth/me", h.authMe)
        mux.HandleFunc("POST /api/v1/auth/switch", h.authSwitch)

        // Chat (Module 7)
        mux.HandleFunc("POST /api/v1/chat", h.chat)

        // External integrations (Module 9 Path B)
        if d.Graph != nil {
                mux.HandleFunc("GET /api/v1/calendar/today", h.calendarToday)
                mux.HandleFunc("GET /api/v1/mail/summary", h.mailSummary)
        }

        // SPA fallback (Module 10): in prod, anything not under /api serves the
        // React bundle so client-side routing works on direct page loads.
        if d.WebDir != "" {
                mux.HandleFunc("/", h.spa)
        }

        return mux
}

// writeJSON / writeError were extracted in Module 3 Prompt 2 and reused by
// every handler we add later. Keeping them in one place is the whole point.
func writeJSON(w http.ResponseWriter, status int, body any) {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(status)
        if err := json.NewEncoder(w).Encode(body); err != nil {
                // Headers are already flushed; we can't recover. Log via stderr only.
                _, _ = os.Stderr.WriteString("writeJSON: " + err.Error() + "\n")
        }
}

func writeError(w http.ResponseWriter, status int, msg string) {
        writeJSON(w, status, map[string]string{"error": msg})
}

func mapStoreError(w http.ResponseWriter, err error) {
        switch {
        case errors.Is(err, data.ErrNotFound):
                writeError(w, http.StatusNotFound, "not found")
        default:
                writeError(w, http.StatusInternalServerError, err.Error())
        }
}

// spa serves the React bundle in production. Any path that doesn't match an
// asset on disk falls back to index.html so react-router-dom can handle it.
//
// Path-traversal hardening: we resolve the WebDir to an absolute path once,
// strip the leading slash from the URL so filepath.Join can't be short-circuited
// by an absolute candidate, Clean() the result, then verify the resolved
// candidate lives under the WebDir root before serving. Anything outside that
// root falls back to index.html (never to disk above WebDir).
func (h *handlers) spa(w http.ResponseWriter, r *http.Request) {
        if strings.HasPrefix(r.URL.Path, "/api/") {
                writeError(w, http.StatusNotFound, "no such route")
                return
        }
        rootAbs, err := filepath.Abs(h.d.WebDir)
        if err != nil {
                writeError(w, http.StatusInternalServerError, "web root unavailable")
                return
        }
        indexPath := filepath.Join(rootAbs, "index.html")

        rel := strings.TrimLeft(r.URL.Path, "/")
        rel = filepath.Clean("/" + rel)        // normalize ../ segments
        rel = strings.TrimLeft(rel, "/")       // back to a relative path
        if rel == "" || rel == "." {
                http.ServeFile(w, r, indexPath)
                return
        }
        candidate := filepath.Join(rootAbs, rel)
        candidateAbs, err := filepath.Abs(candidate)
        if err != nil {
                http.ServeFile(w, r, indexPath)
                return
        }
        // Confine to WebDir. Trailing separator on the prefix avoids matching a
        // sibling directory that happens to share the WebDir name as a prefix.
        if candidateAbs != rootAbs && !strings.HasPrefix(candidateAbs, rootAbs+string(os.PathSeparator)) {
                http.ServeFile(w, r, indexPath)
                return
        }
        if info, err := os.Stat(candidateAbs); err == nil && !info.IsDir() {
                http.ServeFile(w, r, candidateAbs)
                return
        }
        http.ServeFile(w, r, indexPath)
}

// Tiny wrappers that round out the API surface.
func (h *handlers) health(w http.ResponseWriter, r *http.Request) {
        writeJSON(w, http.StatusOK, map[string]any{
                "status":    "ok",
                "timestamp": time.Now().UTC(),
        })
}

func (h *handlers) version(w http.ResponseWriter, r *http.Request) {
        writeJSON(w, http.StatusOK, map[string]string{"version": h.d.Version})
}
