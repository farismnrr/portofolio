package site

import (
	"github.com/farismnrr/portfolio-backend-service/internal/config"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/site/handler"
	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Group, cfg *config.Config) {
	h := handler.NewHandler(cfg)

	pageAuthGroup := e.Group("/page-auth")
	pageAuthGroup.POST("/authenticate", h.Authenticate)
	pageAuthGroup.GET("/check", h.CheckAuth)
}
