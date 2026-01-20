package server

import (
	"github.com/farismnrr/portfolio-backend-service/internal/config"
	authHandler "github.com/farismnrr/portfolio-backend-service/internal/handler/auth"
	dashboardHandler "github.com/farismnrr/portfolio-backend-service/internal/handler/dashboard"
	"github.com/farismnrr/portfolio-backend-service/internal/handler/middleware"
	ogHandler "github.com/farismnrr/portfolio-backend-service/internal/handler/og"
	pageAuthHandler "github.com/farismnrr/portfolio-backend-service/internal/handler/page_auth"
	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Group, cfg *config.Config) {

	// Page Auth routes
	pageAuthH := pageAuthHandler.NewHandler(cfg)
	pageAuthGroup := e.Group("/page-auth")
	pageAuthGroup.POST("/authenticate", pageAuthH.Authenticate)
	pageAuthGroup.GET("/check", pageAuthH.CheckAuth)

	// Open Graph routes
	ogH := ogHandler.NewHandler()
	ogGroup := e.Group("/og")
	ogGroup.GET("/fetch", ogH.FetchMetadata)
	ogGroup.GET("/proxy", ogH.ProxyImage)

	// Auth routes (SSO proxy)
	authH := authHandler.NewHandler(cfg)
	authGroup := e.Group("/auth")
	authGroup.POST("/login", authH.Login)
	authGroup.POST("/refresh", authH.RefreshToken)
	authGroup.GET("/user", authH.GetUser)
	authGroup.POST("/logout", authH.Logout)

	// Dashboard routes (protected, admin only)
	dashboardH := dashboardHandler.NewHandler()
	dashboardGroup := e.Group("/dashboard", middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	dashboardGroup.GET("", dashboardH.GetDashboard)

	// Status endpoint
	e.GET("/status", func(c echo.Context) error {
		return c.JSON(200, map[string]interface{}{
			"status":  true,
			"message": "API v1 is running",
		})
	})
}
