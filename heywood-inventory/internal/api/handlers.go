// Module 3-8 — Concrete handlers for items, auth, and chat.
package api

import (
        "encoding/json"
        "net/http"
        "sort"
        "strconv"

        "heywood-inventory/internal/data"
        "heywood-inventory/internal/middleware"
)

type handlers struct{ d Deps }

// ---- Items (Modules 3, 4, 8) ----

func (h *handlers) listItems(w http.ResponseWriter, r *http.Request) {
        q := r.URL.Query()
        f := data.ListFilter{
                Status:     q.Get("status"),
                Priority:   q.Get("priority"),
                AssigneeID: q.Get("assigneeId"),
                Query:      q.Get("q"),
        }
        // Module 8: role-based filtering at the handler. Users see only their items.
        if role := middleware.RoleFrom(r); role == middleware.RoleUser {
                f.AssigneeID = role
        }
        items, err := h.d.Store.List(f)
        if err != nil {
                mapStoreError(w, err)
                return
        }
        writeJSON(w, http.StatusOK, items)
}

func (h *handlers) getItem(w http.ResponseWriter, r *http.Request) {
        id, err := strconv.Atoi(r.PathValue("id"))
        if err != nil {
                writeError(w, http.StatusBadRequest, "invalid id")
                return
        }
        item, err := h.d.Store.Get(id)
        if err != nil {
                mapStoreError(w, err)
                return
        }
        if role := middleware.RoleFrom(r); role == middleware.RoleUser && item.AssigneeID != role {
                // Don't leak existence to a User who isn't assigned.
                writeError(w, http.StatusNotFound, "not found")
                return
        }
        writeJSON(w, http.StatusOK, item)
}

func (h *handlers) createItem(w http.ResponseWriter, r *http.Request) {
        if role := middleware.RoleFrom(r); role == middleware.RoleUser {
                writeError(w, http.StatusForbidden, "users cannot create items")
                return
        }
        var in data.Item
        if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
                writeError(w, http.StatusBadRequest, "invalid json: "+err.Error())
                return
        }
        if in.Title == "" {
                writeError(w, http.StatusBadRequest, "title is required")
                return
        }
        if in.Status == "" {
                in.Status = data.StatusOpen
        }
        if in.Priority == "" {
                in.Priority = data.PriorityMedium
        }
        out, err := h.d.Store.Create(in)
        if err != nil {
                mapStoreError(w, err)
                return
        }
        writeJSON(w, http.StatusCreated, out)
}

func (h *handlers) updateItem(w http.ResponseWriter, r *http.Request) {
        id, err := strconv.Atoi(r.PathValue("id"))
        if err != nil {
                writeError(w, http.StatusBadRequest, "invalid id")
                return
        }
        role := middleware.RoleFrom(r)
        cur, err := h.d.Store.Get(id)
        if err != nil {
                mapStoreError(w, err)
                return
        }
        if role == middleware.RoleUser && cur.AssigneeID != role {
                writeError(w, http.StatusForbidden, "not your item")
                return
        }
        var in data.Item
        if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
                writeError(w, http.StatusBadRequest, "invalid json: "+err.Error())
                return
        }
        in.ID = id
        out, err := h.d.Store.Update(in)
        if err != nil {
                mapStoreError(w, err)
                return
        }
        writeJSON(w, http.StatusOK, out)
}

func (h *handlers) deleteItem(w http.ResponseWriter, r *http.Request) {
        if middleware.RoleFrom(r) != middleware.RoleAdmin {
                writeError(w, http.StatusForbidden, "admin only")
                return
        }
        id, err := strconv.Atoi(r.PathValue("id"))
        if err != nil {
                writeError(w, http.StatusBadRequest, "invalid id")
                return
        }
        if err := h.d.Store.Delete(id); err != nil {
                mapStoreError(w, err)
                return
        }
        w.WriteHeader(http.StatusNoContent)
}

func (h *handlers) stats(w http.ResponseWriter, r *http.Request) {
        // Module 8: dashboard counts must respect the same RBAC filter as the
        // items list and the chat tool. Otherwise a User would see "20 total"
        // in the header card but only 5 rows in the table — confusing, and
        // subtly leaks how many items exist that they can't see.
        if role := middleware.RoleFrom(r); role == middleware.RoleUser {
                items, err := h.d.Store.List(data.ListFilter{AssigneeID: role})
                if err != nil {
                        mapStoreError(w, err)
                        return
                }
                writeJSON(w, http.StatusOK, computeStats(items))
                return
        }
        st, err := h.d.Store.Stats()
        if err != nil {
                mapStoreError(w, err)
                return
        }
        writeJSON(w, http.StatusOK, st)
}

// computeStats derives the dashboard payload from an arbitrary slice of items.
// Used for role-narrowed stats so admins still get the in-engine Store.Stats()
// fast path while users get a view consistent with their list/chat results.
func computeStats(items []data.Item) data.Stats {
        st := data.Stats{
                Total:      len(items),
                ByStatus:   map[string]int{},
                ByPriority: map[string]int{},
        }
        for _, it := range items {
                st.ByStatus[it.Status]++
                st.ByPriority[it.Priority]++
        }
        sorted := make([]data.Item, len(items))
        copy(sorted, items)
        sort.Slice(sorted, func(i, j int) bool {
                return sorted[i].UpdatedAt.After(sorted[j].UpdatedAt)
        })
        if len(sorted) > 5 {
                sorted = sorted[:5]
        }
        st.Recent = sorted
        return st
}

// ---- Auth (Module 8) ----

func (h *handlers) authMe(w http.ResponseWriter, r *http.Request) {
        role := middleware.RoleFrom(r)
        writeJSON(w, http.StatusOK, map[string]any{
                "role":      role,
                "canAdmin":  role == middleware.RoleAdmin,
                "canCreate": role != middleware.RoleUser,
        })
}

func (h *handlers) authSwitch(w http.ResponseWriter, r *http.Request) {
        var in struct {
                Role string `json:"role"`
        }
        if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
                writeError(w, http.StatusBadRequest, "invalid json")
                return
        }
        switch in.Role {
        case middleware.RoleAdmin, middleware.RoleStaff, middleware.RoleUser:
        default:
                writeError(w, http.StatusBadRequest, "role must be admin, staff, or user")
                return
        }
        http.SetCookie(w, &http.Cookie{
                Name:     middleware.CookieRole,
                Value:    in.Role,
                Path:     "/",
                HttpOnly: false, // Frontend role picker reads this for display; still scoped to same-origin in prod.
                SameSite: http.SameSiteLaxMode,
                MaxAge:   60 * 60 * 24 * 7,
        })
        writeJSON(w, http.StatusOK, map[string]string{"role": in.Role})
}

// ---- Chat (Module 7) ----

func (h *handlers) chat(w http.ResponseWriter, r *http.Request) {
        var in struct {
                Message string `json:"message"`
        }
        if err := json.NewDecoder(r.Body).Decode(&in); err != nil || in.Message == "" {
                writeError(w, http.StatusBadRequest, "message required")
                return
        }
        role := middleware.RoleFrom(r)
        reply, err := h.d.Chat.Reply(r.Context(), in.Message, role)
        if err != nil {
                writeError(w, http.StatusBadGateway, err.Error())
                return
        }
        writeJSON(w, http.StatusOK, map[string]string{"reply": reply})
}

// ---- Path B integrations (Module 9) ----

func (h *handlers) calendarToday(w http.ResponseWriter, r *http.Request) {
        events, err := h.d.Graph.CalendarToday(r.Context())
        if err != nil {
                writeError(w, http.StatusBadGateway, err.Error())
                return
        }
        writeJSON(w, http.StatusOK, events)
}

func (h *handlers) mailSummary(w http.ResponseWriter, r *http.Request) {
        summary, err := h.d.Graph.MailSummary(r.Context())
        if err != nil {
                writeError(w, http.StatusBadGateway, err.Error())
                return
        }
        writeJSON(w, http.StatusOK, summary)
}
