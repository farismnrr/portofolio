package page_auth

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	appConfig "github.com/farismnrr/portfolio-backend-service/internal/config"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestAuthenticate_Success(t *testing.T) {
	// Setup
	e := echo.New()
	reqBody := `{"password":"test-password"}`
	req := httptest.NewRequest(http.MethodPost, "/v1/page-auth/authenticate", strings.NewReader(reqBody))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	cfg := &appConfig.Config{
		PageAuth: appConfig.PageAuthConfig{
			Password: "test-password",
		},
		Server: appConfig.ServerConfig{
			Env: "development",
		},
	}

	handler := NewHandler(cfg)

	// Test
	if assert.NoError(t, handler.Authenticate(c)) {
		assert.Equal(t, http.StatusOK, rec.Code)

		var response struct {
			Success bool   `json:"success"`
			Message string `json:"message"`
		}
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.True(t, response.Success)
		assert.Equal(t, "Authentication successful", response.Message)

		// Check cookie is set
		cookies := rec.Result().Cookies()
		assert.Len(t, cookies, 1)
		assert.Equal(t, "authToken", cookies[0].Name)
		assert.Equal(t, "authenticated", cookies[0].Value)
	}
}

func TestAuthenticate_WrongPassword(t *testing.T) {
	// Setup
	e := echo.New()
	reqBody := `{"password":"wrong-password"}`
	req := httptest.NewRequest(http.MethodPost, "/v1/page-auth/authenticate", strings.NewReader(reqBody))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	cfg := &appConfig.Config{
		PageAuth: appConfig.PageAuthConfig{
			Password: "correct-password",
		},
	}

	handler := NewHandler(cfg)

	// Test
	if assert.NoError(t, handler.Authenticate(c)) {
		assert.Equal(t, http.StatusUnauthorized, rec.Code)

		var response struct {
			Status  bool   `json:"status"`
			Message string `json:"message"`
		}
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.False(t, response.Status)
		assert.Equal(t, "Incorrect password", response.Message)
	}
}

func TestCheckAuth_Authenticated(t *testing.T) {
	// Setup
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/v1/page-auth/check", nil)
	req.AddCookie(&http.Cookie{
		Name:  "authToken",
		Value: "authenticated",
	})
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	cfg := &appConfig.Config{}
	handler := NewHandler(cfg)

	// Test
	if assert.NoError(t, handler.CheckAuth(c)) {
		assert.Equal(t, http.StatusOK, rec.Code)

		var response struct {
			Success bool   `json:"success"`
			Message string `json:"message"`
			Data    struct {
				Authenticated bool `json:"authenticated"`
			} `json:"data"`
		}
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.True(t, response.Success)
		assert.True(t, response.Data.Authenticated)
	}
}

func TestCheckAuth_NotAuthenticated(t *testing.T) {
	// Setup
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/v1/page-auth/check", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	cfg := &appConfig.Config{}
	handler := NewHandler(cfg)

	// Test
	if assert.NoError(t, handler.CheckAuth(c)) {
		assert.Equal(t, http.StatusUnauthorized, rec.Code)

		var response struct {
			Status  bool   `json:"status"`
			Message string `json:"message"`
		}
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.False(t, response.Status)
		assert.Equal(t, "Not authenticated", response.Message)
	}
}
