package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestGetDashboard(t *testing.T) {
	e := echo.New()

	t.Run("Success", func(t *testing.T) {
		h := NewHandler()

		req := httptest.NewRequest(http.MethodGet, "/v1/dashboard", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		// Simulate Middleware context injection
		c.Set("username", "admin_user")
		c.Set("role", "admin")

		if assert.NoError(t, h.GetDashboard(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)

			var response struct {
				Status  bool   `json:"status"`
				Message string `json:"message"`
				Data    struct {
					Username string `json:"username"`
					Role     string `json:"role"`
				} `json:"data"`
			}
			err := json.Unmarshal(rec.Body.Bytes(), &response)
			assert.NoError(t, err)
			assert.True(t, response.Status)
			assert.Equal(t, "admin_user", response.Data.Username)
			assert.Equal(t, "admin", response.Data.Role)
		}
	})
}
