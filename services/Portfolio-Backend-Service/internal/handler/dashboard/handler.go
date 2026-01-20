package dashboard

import (
	"net/http"

	"github.com/farismnrr/portfolio-backend-service/pkg/response"
	"github.com/labstack/echo/v4"
)

// Handler handles dashboard requests
type Handler struct{}

// NewHandler creates a new dashboard handler
func NewHandler() *Handler {
	return &Handler{}
}

// GetDashboard returns dashboard data
// This endpoint requires admin role
func (h *Handler) GetDashboard(c echo.Context) error {
	// Get user info from context (set by RequireAuth middleware)
	username := c.Get("username").(string)
	role := c.Get("role").(string)

	data := map[string]interface{}{
		"message":  "Welcome to admin dashboard",
		"username": username,
		"role":     role,
	}

	return response.Success(c, http.StatusOK, "Dashboard data retrieved", data)
}
