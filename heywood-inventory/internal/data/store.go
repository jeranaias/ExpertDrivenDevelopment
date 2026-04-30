// Module 4 — Data Layer
// The DataStore interface is the most important conceptual move of the day.
// Define WHAT the data layer does (list, get, create, update, delete) before
// you decide HOW it stores anything. Today: JSON. Tomorrow: SQLite. Same code.
package data

import (
	"errors"
	"time"
)

// Status values used by the seed data and the Items table chip.
const (
	StatusOpen       = "open"
	StatusInProgress = "in_progress"
	StatusBlocked    = "blocked"
	StatusDone       = "done"
)

// Priority values used by the Items table chip and the lookup_items tool.
const (
	PriorityLow      = "low"
	PriorityMedium   = "medium"
	PriorityHigh     = "high"
	PriorityCritical = "critical"
)

// ErrNotFound is returned by Store implementations when a record is missing.
var ErrNotFound = errors.New("data: not found")

// Item is the canonical inventory record. JSON tags are camelCase so the React
// frontend can consume the wire format without an adapter layer.
type Item struct {
	ID         int       `json:"id"`
	Title      string    `json:"title"`
	Status     string    `json:"status"`
	Priority   string    `json:"priority"`
	AssigneeID string    `json:"assigneeId"`
	Notes      string    `json:"notes"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// ListFilter narrows a List() query. Empty fields are ignored.
// The lookup_items chat tool also lands here, so it doubles as the single
// place to evolve query semantics.
type ListFilter struct {
	Status     string
	Priority   string
	AssigneeID string
	Query      string // case-insensitive substring match against Title and Notes
}

// Store is the contract every backend (JSONStore, SQLiteStore, future Postgres,
// future hybrid) must satisfy. The router and handlers depend only on this
// interface — never on a concrete implementation.
type Store interface {
	List(filter ListFilter) ([]Item, error)
	Get(id int) (Item, error)
	Create(item Item) (Item, error)
	Update(item Item) (Item, error)
	Delete(id int) error
	Stats() (Stats, error)
	Close() error
}

// Stats is the dashboard payload — kept on the store so SQLite can compute it
// in-engine when the dataset grows past what we want to scan in Go.
type Stats struct {
	Total      int            `json:"total"`
	ByStatus   map[string]int `json:"byStatus"`
	ByPriority map[string]int `json:"byPriority"`
	Recent     []Item         `json:"recent"`
}
