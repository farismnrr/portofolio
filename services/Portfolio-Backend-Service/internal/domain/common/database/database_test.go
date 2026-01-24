package database

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/config"
	"github.com/stretchr/testify/assert"
)

func TestInitialize_SQLite(t *testing.T) {
	t.Run("In-Memory", func(t *testing.T) {
		cfg := &config.DatabaseConfig{
			Type: "sqlite",
			Name: ":memory:",
		}
		db, err := Initialize(cfg)
		assert.NoError(t, err)
		assert.NotNil(t, db)

		sqlDB, err := db.DB()
		assert.NoError(t, err)
		assert.NoError(t, sqlDB.Ping())
	})

	t.Run("Create Directory", func(t *testing.T) {
		tempDir := t.TempDir()
		dbPath := filepath.Join(tempDir, "subdir", "test.sqlite")

		cfg := &config.DatabaseConfig{
			Type: "sqlite",
			Name: dbPath,
		}
		db, err := Initialize(cfg)
		assert.NoError(t, err)
		assert.NotNil(t, db)

		// Check if file exists
		_, err = os.Stat(dbPath)
		assert.NoError(t, err)
	})
}

func TestInitialize_Unsupported(t *testing.T) {
	cfg := &config.DatabaseConfig{
		Type: "unknown",
	}
	db, err := Initialize(cfg)
	assert.Error(t, err)
	assert.Nil(t, db)
	assert.Contains(t, err.Error(), "unsupported database type")
}
