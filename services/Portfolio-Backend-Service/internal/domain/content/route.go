package content

import (
	"github.com/farismnrr/portfolio-backend-service/internal/domain/content/handler"
	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Group) {
	h := handler.NewHandler()

	ogGroup := e.Group("/og")
	ogGroup.GET("/fetch", h.FetchMetadata)
	ogGroup.GET("/proxy", h.ProxyImage)
}
