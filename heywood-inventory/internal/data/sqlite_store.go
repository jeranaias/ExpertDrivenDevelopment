// Module 9 — Path A: SQLite store.
// Same interface as JSONStore. Switching is a one-flag change at startup
// (-db sqlite). The rest of the application does not move.
//
// Build tag: this file is compiled only when the `sqlite` build tag is set.
// Default builds use the JSON store and have zero non-stdlib dependencies.
// Enable SQLite with:  go build -tags sqlite ./cmd/server
// (Add `modernc.org/sqlite` to go.mod first; it is a pure-Go driver, no CGO.)
//go:build sqlite

package data

import (
	"database/sql"
	"fmt"
	"sort"
	"strings"
	"time"

	_ "modernc.org/sqlite"
)

type SQLiteStore struct {
	db *sql.DB
}

func NewSQLiteStore(path string) (*SQLiteStore, error) {
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, fmt.Errorf("open sqlite: %w", err)
	}
	if _, err := db.Exec(schema); err != nil {
		return nil, fmt.Errorf("init schema: %w", err)
	}
	return &SQLiteStore{db: db}, nil
}

const schema = `
CREATE TABLE IF NOT EXISTS items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  status      TEXT NOT NULL,
  priority    TEXT NOT NULL,
  assignee_id TEXT NOT NULL DEFAULT '',
  notes       TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMP NOT NULL,
  updated_at  TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_items_status   ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_priority ON items(priority);
CREATE INDEX IF NOT EXISTS idx_items_assignee ON items(assignee_id);
`

func (s *SQLiteStore) List(f ListFilter) ([]Item, error) {
	var (
		where []string
		args  []any
	)
	if f.Status != "" {
		where = append(where, "status = ?")
		args = append(args, f.Status)
	}
	if f.Priority != "" {
		where = append(where, "priority = ?")
		args = append(args, f.Priority)
	}
	if f.AssigneeID != "" {
		where = append(where, "assignee_id = ?")
		args = append(args, f.AssigneeID)
	}
	if q := strings.TrimSpace(f.Query); q != "" {
		where = append(where, "(LOWER(title) LIKE ? OR LOWER(notes) LIKE ?)")
		like := "%" + strings.ToLower(q) + "%"
		args = append(args, like, like)
	}
	sqlStr := `SELECT id, title, status, priority, assignee_id, notes, created_at, updated_at FROM items`
	if len(where) > 0 {
		sqlStr += " WHERE " + strings.Join(where, " AND ")
	}
	sqlStr += " ORDER BY id ASC"
	rows, err := s.db.Query(sqlStr, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Item{}
	for rows.Next() {
		var it Item
		if err := rows.Scan(&it.ID, &it.Title, &it.Status, &it.Priority, &it.AssigneeID, &it.Notes, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, it)
	}
	return out, rows.Err()
}

func (s *SQLiteStore) Get(id int) (Item, error) {
	row := s.db.QueryRow(`SELECT id, title, status, priority, assignee_id, notes, created_at, updated_at FROM items WHERE id = ?`, id)
	var it Item
	if err := row.Scan(&it.ID, &it.Title, &it.Status, &it.Priority, &it.AssigneeID, &it.Notes, &it.CreatedAt, &it.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return Item{}, ErrNotFound
		}
		return Item{}, err
	}
	return it, nil
}

func (s *SQLiteStore) Create(in Item) (Item, error) {
	now := time.Now().UTC()
	res, err := s.db.Exec(
		`INSERT INTO items (title, status, priority, assignee_id, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		in.Title, in.Status, in.Priority, in.AssigneeID, in.Notes, now, now,
	)
	if err != nil {
		return Item{}, err
	}
	id, _ := res.LastInsertId()
	in.ID = int(id)
	in.CreatedAt = now
	in.UpdatedAt = now
	return in, nil
}

func (s *SQLiteStore) Update(in Item) (Item, error) {
	now := time.Now().UTC()
	res, err := s.db.Exec(
		`UPDATE items SET title=?, status=?, priority=?, assignee_id=?, notes=?, updated_at=? WHERE id = ?`,
		in.Title, in.Status, in.Priority, in.AssigneeID, in.Notes, now, in.ID,
	)
	if err != nil {
		return Item{}, err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return Item{}, ErrNotFound
	}
	in.UpdatedAt = now
	return in, nil
}

func (s *SQLiteStore) Delete(id int) error {
	res, err := s.db.Exec(`DELETE FROM items WHERE id = ?`, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *SQLiteStore) Stats() (Stats, error) {
	st := Stats{ByStatus: map[string]int{}, ByPriority: map[string]int{}}
	if err := s.db.QueryRow(`SELECT COUNT(*) FROM items`).Scan(&st.Total); err != nil {
		return st, err
	}
	rows, err := s.db.Query(`SELECT status, COUNT(*) FROM items GROUP BY status`)
	if err != nil {
		return st, err
	}
	for rows.Next() {
		var k string
		var n int
		if err := rows.Scan(&k, &n); err != nil {
			rows.Close()
			return st, err
		}
		st.ByStatus[k] = n
	}
	rows.Close()
	rows, err = s.db.Query(`SELECT priority, COUNT(*) FROM items GROUP BY priority`)
	if err != nil {
		return st, err
	}
	for rows.Next() {
		var k string
		var n int
		if err := rows.Scan(&k, &n); err != nil {
			rows.Close()
			return st, err
		}
		st.ByPriority[k] = n
	}
	rows.Close()
	recent, err := s.recent(5)
	if err != nil {
		return st, err
	}
	sort.Slice(recent, func(i, j int) bool { return recent[i].UpdatedAt.After(recent[j].UpdatedAt) })
	st.Recent = recent
	return st, nil
}

func (s *SQLiteStore) recent(n int) ([]Item, error) {
	rows, err := s.db.Query(
		`SELECT id, title, status, priority, assignee_id, notes, created_at, updated_at FROM items ORDER BY updated_at DESC LIMIT ?`, n,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Item{}
	for rows.Next() {
		var it Item
		if err := rows.Scan(&it.ID, &it.Title, &it.Status, &it.Priority, &it.AssigneeID, &it.Notes, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, it)
	}
	return out, rows.Err()
}

func (s *SQLiteStore) Close() error { return s.db.Close() }
