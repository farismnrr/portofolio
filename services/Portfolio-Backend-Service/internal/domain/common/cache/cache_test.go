package cache

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestBadgerCache(t *testing.T) {
	path := "tmp/test_badger"
	defer os.RemoveAll(path)

	c, err := NewBadgerCache(path)
	require.NoError(t, err)
	defer c.Close()

	ctx := context.Background()

	t.Run("Set and Get", func(t *testing.T) {
		key := "test_key"
		val := []byte("test_value")

		err := c.Set(ctx, key, val, 1*time.Minute)
		assert.NoError(t, err)

		got, err := c.Get(ctx, key)
		assert.NoError(t, err)
		assert.Equal(t, val, got)
	})

	t.Run("Get Non-Existent Key", func(t *testing.T) {
		got, err := c.Get(ctx, "non_existent")
		assert.NoError(t, err)
		assert.Nil(t, got)
	})

	t.Run("Delete", func(t *testing.T) {
		key := "delete_key"
		val := []byte("delete_value")

		_ = c.Set(ctx, key, val, 1*time.Minute)

		err := c.Delete(ctx, key)
		assert.NoError(t, err)

		got, err := c.Get(ctx, key)
		assert.NoError(t, err)
		assert.Nil(t, got)
	})

	t.Run("TTL expiration", func(t *testing.T) {
		key := "ttl_key"
		val := []byte("ttl_value")

		// Very short TTL
		err := c.Set(ctx, key, val, 100*time.Millisecond)
		assert.NoError(t, err)

		// Wait for expiration
		time.Sleep(200 * time.Millisecond)

		got, err := c.Get(ctx, key)
		assert.NoError(t, err)
		assert.Nil(t, got)
	})
}
