package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/config"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/sso/repository"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockSSOUsecase
type MockSSOUsecase struct {
	mock.Mock
}

func (m *MockSSOUsecase) RefreshToken(ctx context.Context, refreshToken string) (*repository.TokenResponse, error) {
	args := m.Called(ctx, refreshToken)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*repository.TokenResponse), args.Error(1)
}

func (m *MockSSOUsecase) VerifyUser(ctx context.Context, accessToken string) (*repository.UserData, error) {
	args := m.Called(ctx, accessToken)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*repository.UserData), args.Error(1)
}

func (m *MockSSOUsecase) Logout(ctx context.Context, accessToken string) error {
	args := m.Called(ctx, accessToken)
	return args.Error(0)
}

func TestLogin(t *testing.T) {
	e := echo.New()
	cfg := &config.Config{
		Server: config.ServerConfig{Env: "test"},
	}

	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockSSOUsecase)
		h := NewHandler(cfg, mockUC)

		reqBody := `{"refresh_token": "valid_refresh_token"}`
		req := httptest.NewRequest(http.MethodPost, "/v1/auth/login", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.Login(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)
			// Check Cookie
			cookies := rec.Result().Cookies()
			assert.NotEmpty(t, cookies)
			assert.Equal(t, "refresh_token", cookies[0].Name)
			assert.Equal(t, "valid_refresh_token", cookies[0].Value)
			assert.True(t, cookies[0].HttpOnly)
		}
	})

	t.Run("Fail - Invalid Body", func(t *testing.T) {
		mockUC := new(MockSSOUsecase)
		h := NewHandler(cfg, mockUC)

		reqBody := `{"invalid": "json"`
		req := httptest.NewRequest(http.MethodPost, "/v1/auth/login", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.Login(c)) {
			assert.Equal(t, http.StatusBadRequest, rec.Code)
		}
	})

	t.Run("Fail - Empty Token", func(t *testing.T) {
		mockUC := new(MockSSOUsecase)
		h := NewHandler(cfg, mockUC)

		reqBody := `{"refresh_token": ""}`
		req := httptest.NewRequest(http.MethodPost, "/v1/auth/login", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.Login(c)) {
			assert.Equal(t, http.StatusBadRequest, rec.Code)
		}
	})
}

func TestRefreshToken(t *testing.T) {
	e := echo.New()
	cfg := &config.Config{}

	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockSSOUsecase)
		h := NewHandler(cfg, mockUC)

		mockUC.On("RefreshToken", mock.Anything, "valid_cookie").Return(&repository.TokenResponse{AccessToken: "new_access_token"}, nil)

		req := httptest.NewRequest(http.MethodPost, "/v1/auth/refresh", nil)
		req.AddCookie(&http.Cookie{Name: "refresh_token", Value: "valid_cookie"})
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.RefreshToken(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)

			var resBody struct {
				Data struct {
					AccessToken string `json:"access_token"`
				} `json:"data"`
			}
			json.Unmarshal(rec.Body.Bytes(), &resBody)
			assert.Equal(t, "new_access_token", resBody.Data.AccessToken)
		}
	})

	t.Run("Fail - No Cookie", func(t *testing.T) {
		mockUC := new(MockSSOUsecase)
		h := NewHandler(cfg, mockUC)

		req := httptest.NewRequest(http.MethodPost, "/v1/auth/refresh", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.RefreshToken(c)) {
			assert.Equal(t, http.StatusUnauthorized, rec.Code)
		}
	})

	t.Run("Fail - Usecase Error", func(t *testing.T) {
		mockUC := new(MockSSOUsecase)
		h := NewHandler(cfg, mockUC)

		mockUC.On("RefreshToken", mock.Anything, "invalid_cookie").Return(nil, errors.New("invalid token"))

		req := httptest.NewRequest(http.MethodPost, "/v1/auth/refresh", nil)
		req.AddCookie(&http.Cookie{Name: "refresh_token", Value: "invalid_cookie"})
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.RefreshToken(c)) {
			assert.Equal(t, http.StatusUnauthorized, rec.Code)
			// Ensure cookie is cleared
			cookies := rec.Result().Cookies()
			assert.NotEmpty(t, cookies)
			assert.Equal(t, "", cookies[0].Value)
			assert.True(t, cookies[0].MaxAge < 0)
		}
	})
}

func TestGetUser(t *testing.T) {
	e := echo.New()
	cfg := &config.Config{}

	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockSSOUsecase)
		h := NewHandler(cfg, mockUC)

		user := &repository.UserData{ID: "1", Username: "admin", Role: "admin"}
		mockUC.On("VerifyUser", mock.Anything, "valid_token").Return(user, nil)

		req := httptest.NewRequest(http.MethodGet, "/v1/auth/user", nil)
		req.Header.Set("Authorization", "Bearer valid_token")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.GetUser(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)
		}
	})

	t.Run("Fail - Non Admin", func(t *testing.T) {
		mockUC := new(MockSSOUsecase)
		h := NewHandler(cfg, mockUC)

		user := &repository.UserData{ID: "2", Username: "user", Role: "user"}
		mockUC.On("VerifyUser", mock.Anything, "user_token").Return(user, nil)

		req := httptest.NewRequest(http.MethodGet, "/v1/auth/user", nil)
		req.Header.Set("Authorization", "Bearer user_token")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.GetUser(c)) {
			assert.Equal(t, http.StatusUnauthorized, rec.Code)
		}
	})

	t.Run("Fail - Verify Error", func(t *testing.T) {
		mockUC := new(MockSSOUsecase)
		h := NewHandler(cfg, mockUC)

		mockUC.On("VerifyUser", mock.Anything, "bad_token").Return(nil, errors.New("verify failed"))

		req := httptest.NewRequest(http.MethodGet, "/v1/auth/user", nil)
		req.Header.Set("Authorization", "Bearer bad_token")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.GetUser(c)) {
			assert.Equal(t, http.StatusUnauthorized, rec.Code)
		}
	})
}

func TestLogout(t *testing.T) {
	e := echo.New()
	cfg := &config.Config{}

	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockSSOUsecase)
		h := NewHandler(cfg, mockUC)

		mockUC.On("Logout", mock.Anything, "token").Return(nil)

		req := httptest.NewRequest(http.MethodPost, "/v1/auth/logout", nil)
		req.Header.Set("Authorization", "Bearer token")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.Logout(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)
			// Ensure cookie is cleared
			cookies := rec.Result().Cookies()
			assert.NotEmpty(t, cookies)
			assert.Equal(t, "", cookies[0].Value)
		}
	})
}
