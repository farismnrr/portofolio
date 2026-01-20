package main

import (
	"log"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/config"
	"github.com/farismnrr/portfolio-backend-service/pkg/logger"
	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

// @title Portfolio Backend API
// @version 1.0
// @description Interactive API documentation for the Portfolio Backend Service.
// @termsOfService http://swagger.io/terms/

// @contact.name Faris M.
// @contact.url https://farismnrr.com
// @contact.email hello@farismnrr.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /
// @schemes http

// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name X-API-Key

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and then your token.

func main() {
	// Load .env file if exists (development only)
	_ = godotenv.Load()

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize logger
	if err := logger.Init(cfg.Logging.Level); err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer logger.Sync()

	logger.Info("Configuration loaded successfully",
		zap.String("env", cfg.Server.Env),
		zap.String("port", cfg.Server.Port),
	)

	// Create server
	srv := New(cfg)

	// Setup routes
	srv.SetupRoutes()

	// Start server
	if err := srv.Start(); err != nil {
		logger.Fatal("Server error", zap.Error(err))
	}
}
