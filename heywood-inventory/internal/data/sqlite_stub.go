// Default build (no `sqlite` tag): SQLite is not compiled in, so the binary
// has zero non-stdlib dependencies and a fresh checkout works with just
// `go run ./cmd/server -dev`. To enable the real SQLite store, add the
// modernc.org/sqlite dependency and rebuild with `-tags sqlite`:
//
//	go get modernc.org/sqlite
//	go build -tags sqlite ./cmd/server
//
//go:build !sqlite

package data

import "errors"

// Stub type so the rest of the package can refer to *SQLiteStore in code paths
// that compile under either build tag (currently none, but kept for symmetry).
type SQLiteStore struct{}

func (*SQLiteStore) List(ListFilter) ([]Item, error) { return nil, errors.New("sqlite not built") }
func (*SQLiteStore) Get(int) (Item, error)           { return Item{}, errors.New("sqlite not built") }
func (*SQLiteStore) Create(Item) (Item, error)       { return Item{}, errors.New("sqlite not built") }
func (*SQLiteStore) Update(Item) (Item, error)       { return Item{}, errors.New("sqlite not built") }
func (*SQLiteStore) Delete(int) error                { return errors.New("sqlite not built") }
func (*SQLiteStore) Stats() (Stats, error)           { return Stats{}, errors.New("sqlite not built") }
func (*SQLiteStore) Close() error                    { return nil }

func NewSQLiteStore(string) (*SQLiteStore, error) {
	return nil, errors.New("sqlite store not compiled in: rebuild with `-tags sqlite` after `go get modernc.org/sqlite`")
}
