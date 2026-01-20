package middleware

import (
	"time"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/logger"
	"github.com/labstack/echo/v4"
	"go.uber.org/zap"
)

// Logger returns a logging middleware
func Logger() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			start := time.Now()

			// Process request
			err := next(c)

			// Log request details
			req := c.Request()
			res := c.Response()

			logger.Info("HTTP request",
				zap.String("method", req.Method),
				zap.String("uri", req.RequestURI),
				zap.String("remote_ip", c.RealIP()),
				zap.Int("status", res.Status),
				zap.Int64("bytes_out", res.Size),
				zap.Duration("latency", time.Since(start)),
				zap.String("user_agent", req.UserAgent()),
			)

			if err != nil {
				logger.Error("Request error",
					zap.Error(err),
					zap.String("method", req.Method),
					zap.String("uri", req.RequestURI),
				)
			}

			return err
		}
	}
}
