package middleware

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/config"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestRequireAuth(t *testing.T) {
	// 1. Setup Mock SSO Server
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("Authorization")
		if token == "Bearer valid-token" {
			w.WriteHeader(http.StatusOK)
			err := json.NewEncoder(w).Encode(map[string]interface{}{
				"status": true,
				"data": map[string]interface{}{
					"id":        "user-123",
					"username":  "testuser",
					"email":     "test@example.com",
					"role":      "admin",
					"tenant_id": "tenant-abc",
				},
			})
			if err != nil {
				panic(err)
			}
			return
		}
		w.WriteHeader(http.StatusUnauthorized)
		err := json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  false,
			"message": "Invalid token",
		})
		if err != nil {
			panic(err)
		}
	}))
	defer ts.Close()

	cfg := &config.Config{
		SSO: config.SSOConfig{
			URL: ts.URL,
		},
	}

	e := echo.New()
	handler := func(c echo.Context) error {
		return c.String(http.StatusOK, "OK")
	}
	middleware := RequireAuth(cfg)(handler)

	t.Run("Valid Token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("Authorization", "Bearer valid-token")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := middleware(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Equal(t, "user-123", c.Get("user_id"))
		assert.Equal(t, "admin", c.Get("role"))
	})

	t.Run("Missing Token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := middleware(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
	})

	t.Run("Invalid Token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("Authorization", "Bearer invalid-token")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := middleware(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
	})
}

func TestRequireRole(t *testing.T) {
	e := echo.New()
	handler := func(c echo.Context) error {
		return c.String(http.StatusOK, "OK")
	}

	t.Run("Authorized Role", func(t *testing.T) {
		middleware := RequireRole("admin")(handler)
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.Set("role", "admin")

		err := middleware(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("Unauthorized Role", func(t *testing.T) {
		middleware := RequireRole("admin")(handler)
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.Set("role", "user")

		err := middleware(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
	})

	t.Run("Missing Role Context", func(t *testing.T) {
		middleware := RequireRole("admin")(handler)
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := middleware(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
	})
}
