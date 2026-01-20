package auth

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

func TestLogin_Success(t *testing.T) {
	// Setup
	e := echo.New()
	reqBody := `{"refreshToken":"test-refresh-token"}`
	req := httptest.NewRequest(http.MethodPost, "/v1/auth/login", strings.NewReader(reqBody))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	cfg := &appConfig.Config{
		Server: appConfig.ServerConfig{
			Env: "development",
		},
	}

	handler := NewHandler(cfg)

	// Test
	if assert.NoError(t, handler.Login(c)) {
		assert.Equal(t, http.StatusOK, rec.Code)

		var response struct {
			Success bool   `json:"success"`
			Message string `json:"message"`
		}
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.True(t, response.Success)
		assert.Equal(t, "Login successful", response.Message)

		// Check cookie is set
		cookies := rec.Result().Cookies()
		assert.Len(t, cookies, 1)
		assert.Equal(t, "refresh_token", cookies[0].Name)
		assert.Equal(t, "test-refresh-token", cookies[0].Value)
	}
}

func TestLogin_MissingToken(t *testing.T) {
	// Setup
	e := echo.New()
	reqBody := `{"refreshToken":""}`
	req := httptest.NewRequest(http.MethodPost, "/v1/auth/login", strings.NewReader(reqBody))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	cfg := &appConfig.Config{}
	handler := NewHandler(cfg)

	// Test
	if assert.NoError(t, handler.Login(c)) {
		assert.Equal(t, http.StatusBadRequest, rec.Code)

		var response struct {
			Status  bool   `json:"status"`
			Message string `json:"message"`
		}
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.False(t, response.Status)
		assert.Equal(t, "Refresh token is required", response.Message)
	}
}

func TestRefreshToken_NoCookie(t *testing.T) {
	// Setup
	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/v1/auth/refresh", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	cfg := &appConfig.Config{}
	handler := NewHandler(cfg)

	// Test
	if assert.NoError(t, handler.RefreshToken(c)) {
		assert.Equal(t, http.StatusUnauthorized, rec.Code)

		var response struct {
			Status  bool   `json:"status"`
			Message string `json:"message"`
		}
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.False(t, response.Status)
		assert.Equal(t, "No refresh token found", response.Message)
	}
}

func TestGetUser_NoAuthHeader(t *testing.T) {
	// Setup
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/v1/auth/user", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	cfg := &appConfig.Config{}
	handler := NewHandler(cfg)

	// Test
	if assert.NoError(t, handler.GetUser(c)) {
		assert.Equal(t, http.StatusUnauthorized, rec.Code)

		var response struct {
			Status  bool   `json:"status"`
			Message string `json:"message"`
		}
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.False(t, response.Status)
		assert.Equal(t, "No authorization header found", response.Message)
	}
}

func TestGetUser_InvalidAuthHeader(t *testing.T) {
	// Setup
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/v1/auth/user", nil)
	req.Header.Set("Authorization", "InvalidFormat")
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	cfg := &appConfig.Config{}
	handler := NewHandler(cfg)

	// Test
	if assert.NoError(t, handler.GetUser(c)) {
		assert.Equal(t, http.StatusUnauthorized, rec.Code)

		var response struct {
			Status  bool   `json:"status"`
			Message string `json:"message"`
		}
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.False(t, response.Status)
		assert.Equal(t, "Invalid authorization header format", response.Message)
	}
}
