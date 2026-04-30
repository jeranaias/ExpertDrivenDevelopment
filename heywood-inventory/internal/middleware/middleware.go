// Module 8 — Auth & Middleware.
// Middleware = the gate guard that runs before every request reaches your
// handler. Today we wire CORS, security headers, request logging, and a
// role-aware auth check. The auth piece reads a cookie set by /auth/switch
// in the API package; in production this becomes CAC / OIDC / a real session
// store, but the *pattern* is the same.
package middleware

import (
	"context"
	"log"
	"net/http"
	"strings"
	"time"
)

// Role values. Reference matches the Module 8 demo: the role picker writes
// one of these into a cookie; middleware reads it and stamps the request
// context so handlers can filter responses without re-parsing cookies.
const (
	RoleAdmin = "admin"
	RoleStaff = "staff"
	RoleUser  = "user"

	CookieRole = "heywood_role"
)

type ctxKey string

const ctxRoleKey ctxKey = "role"

// RoleFrom returns the role recorded by Auth() on this request, or RoleUser
// if no cookie was present (fail-closed: least privilege).
func RoleFrom(r *http.Request) string {
	if v, ok := r.Context().Value(ctxRoleKey).(string); ok && v != "" {
		return v
	}
	return RoleUser
}

// Middleware is the standard net/http wrapper signature.
type Middleware func(http.Handler) http.Handler

// Chain composes middlewares left-to-right: Chain(h, A, B, C) gives A(B(C(h))),
// which means A runs first on the way in.
func Chain(h http.Handler, mws ...Middleware) http.Handler {
	for i := len(mws) - 1; i >= 0; i-- {
		h = mws[i](h)
	}
	return h
}

// RequestLogger logs each request's method, path, status, and duration in dev.
func RequestLogger(dev bool) Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			rw := &statusRecorder{ResponseWriter: w, status: 200}
			next.ServeHTTP(rw, r)
			if dev {
				log.Printf("%-4s %s -> %d in %s", r.Method, r.URL.Path, rw.status, time.Since(start))
			}
		})
	}
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (s *statusRecorder) WriteHeader(code int) {
	s.status = code
	s.ResponseWriter.WriteHeader(code)
}

// SecurityHeaders sets a baseline set of headers expected on any internal app.
func SecurityHeaders() Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			h := w.Header()
			h.Set("X-Content-Type-Options", "nosniff")
			h.Set("X-Frame-Options", "DENY")
			h.Set("Referrer-Policy", "strict-origin-when-cross-origin")
			h.Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
			next.ServeHTTP(w, r)
		})
	}
}

// CORS allows the Vite dev server to call the API directly. In production the
// Go binary serves the React bundle from the same origin, so the only origin
// that ever needs CORS is localhost:5173 during development.
func CORS(dev bool) Middleware {
	allowedOrigin := ""
	if dev {
		allowedOrigin = "http://localhost:5173"
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if dev && origin == allowedOrigin {
				h := w.Header()
				h.Set("Access-Control-Allow-Origin", allowedOrigin)
				h.Set("Access-Control-Allow-Credentials", "true")
				h.Set("Access-Control-Allow-Headers", "Content-Type")
				h.Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
				h.Set("Vary", "Origin")
			}
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// Auth reads the role cookie and stamps the request context.
// This is demo auth, not production auth. The pattern (read credential -> set
// context -> let handlers query the context) is the same in production; only
// the credential source changes (CAC / OIDC / JWT).
func Auth() Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role := RoleUser
			if c, err := r.Cookie(CookieRole); err == nil {
				switch strings.ToLower(c.Value) {
				case RoleAdmin, RoleStaff, RoleUser:
					role = strings.ToLower(c.Value)
				}
			}
			ctx := context.WithValue(r.Context(), ctxRoleKey, role)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireRole is a route-level guard for endpoints that should reject lower
// privilege levels outright (used on /auth/admin demo endpoint).
func RequireRole(min string) Middleware {
	level := func(role string) int {
		switch role {
		case RoleAdmin:
			return 3
		case RoleStaff:
			return 2
		default:
			return 1
		}
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if level(RoleFrom(r)) < level(min) {
				http.Error(w, "forbidden", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
