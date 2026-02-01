package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/cache"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/config"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/logger"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/middleware"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/content"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/dashboard"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/site"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/sso"
	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// Server represents the HTTP server
type Server struct {
	echo       *echo.Echo
	config     *config.Config
	db         *gorm.DB
	cacheStore cache.Cache
}

// New creates a new server instance
func New(cfg *config.Config, db *gorm.DB) *Server {
	e := echo.New()

	// Hide Echo banner
	e.HideBanner = true
	e.HidePort = true

	// Set up global middleware
	e.Use(middleware.Recovery())
	e.Use(middleware.Logger())
	e.Use(middleware.CORSDynamic(cfg.CORS.AllowedOrigins))

	// Request ID middleware
	e.Use(echoMiddleware.RequestID())

	// Security headers - Adjusted for Swagger UI
	e.Use(echoMiddleware.SecureWithConfig(echoMiddleware.SecureConfig{
		XSSProtection:         "1; mode=block",
		ContentTypeNosniff:    "nosniff",
		XFrameOptions:         "SAMEORIGIN",
		ContentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' unpkg.com; style-src 'self' 'unsafe-inline' unpkg.com; img-src 'self' data:; connect-src 'self';",
	}))

	// Initialize Cache
	badgerCache, err := cache.NewBadgerCache("tmp/badger")
	if err != nil {
		logger.Fatal("Failed to initialize cache", zap.Error(err))
	}

	return &Server{
		echo:       e,
		config:     cfg,
		db:         db,
		cacheStore: badgerCache,
	}
}

// SetupRoutes sets up all application routes
func (s *Server) SetupRoutes() {
	// Health check endpoint
	s.echo.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"status": "healthy",
		})
	})

	// API v1 routes
	v1 := s.echo.Group("/v1")

	// Register Domain Modules
	site.RegisterRoutes(v1, s.config)
	content.RegisterRoutes(v1)
	sso.RegisterRoutes(v1, s.config)
	dashboard.RegisterRoutes(v1, s.config)
	about.RegisterAboutRoutes(v1, s.db, s.config, s.cacheStore)
	interaction.RegisterRoutes(v1, s.db, s.config)

	// Status endpoint
	v1.GET("/status", func(c echo.Context) error {
		return c.JSON(200, map[string]interface{}{
			"status":  true,
			"message": "API v1 is running",
		})
	})

	// API Documentation (Swagger UI)
	s.echo.GET("/swagger/config.js", func(c echo.Context) error {
		configJS := fmt.Sprintf("window.SWAGGER_CONFIG = { apiKey: '%s' };", s.config.Server.SwaggerAPIKey)
		return c.Blob(http.StatusOK, "application/javascript", []byte(configJS))
	})
	// Serve the static files for swagger UI
	s.echo.Static("/swagger", "docs/swagger")
	// Ensure /swagger and /swagger/ both serve index.html
	s.echo.File("/swagger", "docs/swagger/index.html")
	s.echo.File("/swagger/", "docs/swagger/index.html")
}

// Start starts the HTTP server
func (s *Server) Start() error {
	address := fmt.Sprintf(":%s", s.config.Server.Port)

	logger.Info("Starting server",
		zap.String("address", address),
		zap.String("env", s.config.Server.Env),
	)

	// Start server in a goroutine
	go func() {
		if err := s.echo.Start(address); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Server failed to start", zap.Error(err))
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	logger.Info("Shutting down server...")

	// Graceful shutdown with 10 second timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := s.echo.Shutdown(ctx); err != nil {
		logger.Error("Server forced to shutdown", zap.Error(err))
		return err
	}

	logger.Info("Server stopped gracefully")

	// Close cache
	if s.cacheStore != nil {
		if err := s.cacheStore.Close(); err != nil {
			logger.Error("Failed to close cache", zap.Error(err))
		} else {
			logger.Info("Cache closed successfully")
		}
	}

	return nil
}

// Echo returns the underlying Echo instance
func (s *Server) Echo() *echo.Echo {
	return s.echo
}
