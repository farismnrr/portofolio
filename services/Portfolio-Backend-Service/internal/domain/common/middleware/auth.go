package middleware

import (
	"net/http"
	"strings"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/config"
	ssoRepo "github.com/farismnrr/portfolio-backend-service/internal/domain/sso/repository"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/logger"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/response"
	"github.com/labstack/echo/v4"
	"go.uber.org/zap"
)

// RequireAuth middleware verifies JWT token with SSO service
func RequireAuth(cfg *config.Config) echo.MiddlewareFunc {
	ssoClient := ssoRepo.NewSSOClient(cfg)

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return response.Error(c, http.StatusUnauthorized, "Missing authorization header")
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				return response.Error(c, http.StatusUnauthorized, "Invalid authorization header format")
			}

			accessToken := parts[1]

			// Verify token with SSO
			userData, err := ssoClient.VerifyUser(c.Request().Context(), accessToken)
			if err != nil {
				logger.Warn("Token verification failed", zap.Error(err))
				return response.Error(c, http.StatusUnauthorized, "Invalid or expired token")
			}

			// Store user data in context for downstream handlers
			c.Set("user_id", userData.ID)
			c.Set("username", userData.Username)
			c.Set("email", userData.Email)
			c.Set("role", userData.Role)
			c.Set("tenant_id", userData.TenantID)

			return next(c)
		}
	}
}

// RequireRole middleware enforces role-based access control
// Must be used after RequireAuth middleware
func RequireRole(allowedRoles ...string) echo.MiddlewareFunc {
	roleMap := make(map[string]bool)
	for _, role := range allowedRoles {
		roleMap[role] = true
	}

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			userRole, ok := c.Get("role").(string)
			if !ok {
				logger.Error("Role not found in context - did you forget RequireAuth middleware?")
				return response.Error(c, http.StatusForbidden, "Access denied")
			}

			if !roleMap[userRole] {
				logger.Warn("User role not allowed",
					zap.String("user_role", userRole),
					zap.Strings("allowed_roles", allowedRoles),
				)
				return response.Error(c, http.StatusForbidden, "Insufficient permissions")
			}

			return next(c)
		}
	}
}
