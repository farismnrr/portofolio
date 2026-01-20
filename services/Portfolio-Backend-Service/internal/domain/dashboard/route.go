package dashboard

import (
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/config"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/dashboard/handler"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/middleware"
	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Group, cfg *config.Config) {
	h := handler.NewHandler()

	// Protected routes
	dashboardGroup := e.Group("/dashboard", middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	dashboardGroup.GET("", h.GetDashboard)
}
