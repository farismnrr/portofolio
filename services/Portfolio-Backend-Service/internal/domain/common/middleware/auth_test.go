package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

// MockSSOClient needs to be defined if we want to mock ssoRepo.NewSSOClient logic.
// However, since RequireAuth calls ssoRepo.NewSSOClient internally which returns a struct,
// we might face difficulty mocking it without dependency injection.
// The current RequireAuth implementation instantiates the client inside the function: `ssoClient := ssoRepo.NewSSOClient(cfg)`
// This makes it hard to test without integration/mocking at the network level or refactoring.
// For now, let's test RequireRole as it relies on Context set by RequireAuth.

func TestRequireRole_Success(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	// Simulate authenticated user with role in context
	c.Set("role", "admin")

	// Middleware
	mw := RequireRole("admin")
	h := mw(func(c echo.Context) error {
		return c.String(http.StatusOK, "allowed")
	})

	err := h(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
}

func TestRequireRole_Forbidden(t *testing.T) {
	e := echo.New()
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	c := e.NewContext(req, rec)

	// Simulate authenticated user with wrong role
	c.Set("role", "user")

	mw := RequireRole("admin")
	h := mw(func(c echo.Context) error {
		return c.String(http.StatusOK, "allowed")
	})

	err := h(c)
	assert.NoError(t, err) // Handler returns error wrapped in response
	assert.Equal(t, http.StatusForbidden, rec.Code)
	assert.Contains(t, rec.Body.String(), "Forbidden: Insufficient permissions")
}

func TestRequireRole_NoContext(t *testing.T) {
	e := echo.New()
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	c := e.NewContext(req, rec)

	// No role in context (e.g. RequireAuth not called or failed)
	mw := RequireRole("admin")
	h := mw(func(c echo.Context) error {
		return c.String(http.StatusOK, "allowed")
	})

	err := h(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusForbidden, rec.Code)
}
