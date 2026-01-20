package middleware

import (
	"fmt"
	"runtime"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/logger"
	"github.com/labstack/echo/v4"
	"go.uber.org/zap"
)

// Recovery returns a recovery middleware that recovers from panics
func Recovery() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			defer func() {
				if r := recover(); r != nil {
					err, ok := r.(error)
					if !ok {
						err = fmt.Errorf("%v", r)
					}

					// Get stack trace
					stack := make([]byte, 4096)
					length := runtime.Stack(stack, false)

					logger.Error("Panic recovered",
						zap.Error(err),
						zap.String("method", c.Request().Method),
						zap.String("uri", c.Request().RequestURI),
						zap.String("stack", string(stack[:length])),
					)

					// Return 500 error
					if jsonErr := c.JSON(500, map[string]string{
						"error":   "internal_server_error",
						"message": "An unexpected error occurred",
					}); jsonErr != nil {
						logger.Error("Failed to send error response after panic", zap.Error(jsonErr))
					}
				}
			}()
			return next(c)
		}
	}
}
