package server

import (
	"github.com/farismnrr/portfolio-backend-service/internal/config"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/content"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/dashboard"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/site"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/sso"
	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Group, cfg *config.Config) {

	// Site/Page Auth Domain
	site.RegisterRoutes(e, cfg)

	// Content Domain (OG)
	content.RegisterRoutes(e)

	// SSO Domain (Auth)
	sso.RegisterRoutes(e, cfg)

	// Dashboard Domain (Admin)
	dashboard.RegisterRoutes(e, cfg)

	// Status endpoint
	e.GET("/status", func(c echo.Context) error {
		return c.JSON(200, map[string]interface{}{
			"status":  true,
			"message": "API v1 is running",
		})
	})
}
