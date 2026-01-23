package database

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/config"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Initialize sets up the database connection based on configuration
func Initialize(cfg *config.DatabaseConfig) (*gorm.DB, error) {
	var dialector gorm.Dialector

	switch strings.ToLower(cfg.Type) {
	case "postgres":
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
			cfg.Host, cfg.User, cfg.Password, cfg.Name, cfg.Port)
		dialector = postgres.Open(dsn)
	case "sqlite":
		// Ensure directory exists if path is provided
		dbPath := cfg.Name
		if dbPath == "" {
			dbPath = "portfolio.sqlite"
		}

		// Create directory if it contains a path separator
		if dir := filepath.Dir(dbPath); dir != "." {
			if err := os.MkdirAll(dir, 0755); err != nil {
				return nil, fmt.Errorf("failed to create database directory: %w", err)
			}
		}

		dialector = sqlite.Open(dbPath)
	default:
		return nil, fmt.Errorf("unsupported database type: %s", cfg.Type)
	}

	db, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	return db, nil
}
