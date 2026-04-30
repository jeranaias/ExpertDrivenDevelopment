// Module 4 — JSONStore is the first DataStore implementation.
// It reads on startup, writes on every mutation, and is safe for concurrent
// access from a single Go process. Good enough for the live demo and the
// in-class build; swap to SQLite in Module 9 (Path A) when you need persistence
// guarantees across restarts under load.
package data

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

type JSONStore struct {
	path string
	mu   sync.RWMutex
	rows map[int]Item
	next int
}

// NewJSONStore loads the items file from disk. If the file does not exist, the
// store starts empty (so a fresh checkout boots cleanly even before seeding).
func NewJSONStore(path string) (*JSONStore, error) {
	s := &JSONStore{path: path, rows: map[int]Item{}, next: 1}
	if err := s.load(); err != nil {
		return nil, err
	}
	return s, nil
}

func (s *JSONStore) load() error {
	b, err := os.ReadFile(s.path)
	if os.IsNotExist(err) {
		return nil
	}
	if err != nil {
		return fmt.Errorf("read %s: %w", s.path, err)
	}
	var items []Item
	if err := json.Unmarshal(b, &items); err != nil {
		return fmt.Errorf("parse %s: %w", s.path, err)
	}
	for _, it := range items {
		s.rows[it.ID] = it
		if it.ID >= s.next {
			s.next = it.ID + 1
		}
	}
	return nil
}

func (s *JSONStore) flush() error {
	all := make([]Item, 0, len(s.rows))
	for _, it := range s.rows {
		all = append(all, it)
	}
	sort.Slice(all, func(i, j int) bool { return all[i].ID < all[j].ID })

	if err := os.MkdirAll(filepath.Dir(s.path), 0o755); err != nil {
		return err
	}
	tmp := s.path + ".tmp"
	b, err := json.MarshalIndent(all, "", "  ")
	if err != nil {
		return err
	}
	if err := os.WriteFile(tmp, b, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, s.path)
}

func (s *JSONStore) List(f ListFilter) ([]Item, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]Item, 0, len(s.rows))
	q := strings.ToLower(strings.TrimSpace(f.Query))
	for _, it := range s.rows {
		if f.Status != "" && it.Status != f.Status {
			continue
		}
		if f.Priority != "" && it.Priority != f.Priority {
			continue
		}
		if f.AssigneeID != "" && it.AssigneeID != f.AssigneeID {
			continue
		}
		if q != "" && !strings.Contains(strings.ToLower(it.Title), q) && !strings.Contains(strings.ToLower(it.Notes), q) {
			continue
		}
		out = append(out, it)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID < out[j].ID })
	return out, nil
}

func (s *JSONStore) Get(id int) (Item, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	it, ok := s.rows[id]
	if !ok {
		return Item{}, ErrNotFound
	}
	return it, nil
}

func (s *JSONStore) Create(in Item) (Item, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now().UTC()
	in.ID = s.next
	s.next++
	in.CreatedAt = now
	in.UpdatedAt = now
	s.rows[in.ID] = in
	if err := s.flush(); err != nil {
		return Item{}, err
	}
	return in, nil
}

func (s *JSONStore) Update(in Item) (Item, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	cur, ok := s.rows[in.ID]
	if !ok {
		return Item{}, ErrNotFound
	}
	in.CreatedAt = cur.CreatedAt
	in.UpdatedAt = time.Now().UTC()
	s.rows[in.ID] = in
	if err := s.flush(); err != nil {
		return Item{}, err
	}
	return in, nil
}

func (s *JSONStore) Delete(id int) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.rows[id]; !ok {
		return ErrNotFound
	}
	delete(s.rows, id)
	return s.flush()
}

func (s *JSONStore) Stats() (Stats, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	st := Stats{
		ByStatus:   map[string]int{},
		ByPriority: map[string]int{},
	}
	all := make([]Item, 0, len(s.rows))
	for _, it := range s.rows {
		st.Total++
		st.ByStatus[it.Status]++
		st.ByPriority[it.Priority]++
		all = append(all, it)
	}
	sort.Slice(all, func(i, j int) bool { return all[i].UpdatedAt.After(all[j].UpdatedAt) })
	if len(all) > 5 {
		all = all[:5]
	}
	st.Recent = all
	return st, nil
}

func (s *JSONStore) Close() error { return nil }
