package cache

import (
	"context"
	"time"

	"github.com/dgraph-io/badger/v4"
)

type Cache interface {
	Set(ctx context.Context, key string, value []byte, ttl time.Duration) error
	Get(ctx context.Context, key string) ([]byte, error)
	Delete(ctx context.Context, key string) error
	Close() error
}

type badgerCache struct {
	db *badger.DB
}

func NewBadgerCache(path string) (Cache, error) {
	opts := badger.DefaultOptions(path).WithLogger(nil)
	db, err := badger.Open(opts)
	if err != nil {
		return nil, err
	}

	return &badgerCache{db: db}, nil
}

func (c *badgerCache) Set(ctx context.Context, key string, value []byte, ttl time.Duration) error {
	return c.db.Update(func(tx *badger.Txn) error {
		e := badger.NewEntry([]byte(key), value).WithTTL(ttl)
		return tx.SetEntry(e)
	})
}

func (c *badgerCache) Get(ctx context.Context, key string) ([]byte, error) {
	var val []byte
	err := c.db.View(func(tx *badger.Txn) error {
		item, err := tx.Get([]byte(key))
		if err != nil {
			return err
		}
		return item.Value(func(v []byte) error {
			val = append([]byte{}, v...)
			return nil
		})
	})

	if err == badger.ErrKeyNotFound {
		return nil, nil
	}

	return val, err
}

func (c *badgerCache) Delete(ctx context.Context, key string) error {
	return c.db.Update(func(tx *badger.Txn) error {
		return tx.Delete([]byte(key))
	})
}

func (c *badgerCache) Close() error {
	return c.db.Close()
}
