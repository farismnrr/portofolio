package server

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"time"

	_ "github.com/farismnrr/portfolio-backend-service/api/docs"
	"github.com/farismnrr/portfolio-backend-service/internal/config"
	"github.com/farismnrr/portfolio-backend-service/internal/handler/middleware"
	"github.com/farismnrr/portfolio-backend-service/pkg/logger"
	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
	"go.uber.org/zap"
)

// Server represents the HTTP server
type Server struct {
	echo   *echo.Echo
	config *config.Config
}

// New creates a new server instance
func New(cfg *config.Config) *Server {
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

	return &Server{
		echo:   e,
		config: cfg,
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

	// Register domain routes
	RegisterRoutes(v1, s.config)

	// API Documentation (Swagger UI)
	s.echo.Static("/api", "api")
	s.echo.GET("/swagger/config.js", func(c echo.Context) error {
		configJS := fmt.Sprintf("window.SWAGGER_CONFIG = { apiKey: '%s' };", s.config.Server.SwaggerAPIKey)
		return c.Blob(http.StatusOK, "application/javascript", []byte(configJS))
	})
	// Serve the static files for swagger UI
	s.echo.Static("/swagger", "api")
	// Ensure /swagger and /swagger/ both serve index.html
	s.echo.File("/swagger", "api/index.html")
	s.echo.File("/swagger/", "api/index.html")
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
	return nil
}

// Echo returns the underlying Echo instance
func (s *Server) Echo() *echo.Echo {
	return s.echo
}
