package handler

import (
	"net/http"

	appConfig "github.com/farismnrr/portfolio-backend-service/internal/config"
	"github.com/farismnrr/portfolio-backend-service/pkg/response"
	"github.com/labstack/echo/v4"
)

const (
	authCookieName  = "authToken"
	authCookieValue = "authenticated"
)

// Handler handles page authentication requests
type Handler struct {
	config *appConfig.Config
}

// NewHandler creates a new page auth handler
func NewHandler(cfg *appConfig.Config) *Handler {
	return &Handler{
		config: cfg,
	}
}

// Authenticate verifies the password and sets an authentication cookie
// @Summary Authenticate user
// @Description Verify the password and set an authentication cookie for page access.
// @Tags Page Auth
// @Accept json
// @Produce json
// @Param request body AuthenticateRequest true "Authentication request"
// @Success 200 {object} response.SuccessResponse{data=AuthenticateResponse} "Authentication successful"
// @Failure 400 {object} response.ErrorResponse "Invalid request body"
// @Failure 401 {object} response.ErrorResponse "Incorrect password"
// @Router /v1/page-auth/authenticate [post]
func (h *Handler) Authenticate(c echo.Context) error {
	var req AuthenticateRequest
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request body")
	}

	// Validate password
	if req.Password != h.config.PageAuth.Password {
		return response.Error(c, http.StatusUnauthorized, "Incorrect password")
	}

	// Set authentication cookie
	cookie := &http.Cookie{
		Name:     authCookieName,
		Value:    authCookieValue,
		Path:     "/",
		HttpOnly: true,
		Secure:   h.config.IsProduction(),
		SameSite: http.SameSiteStrictMode,
		MaxAge:   60 * 60, // 1 hour
	}
	c.SetCookie(cookie)

	return response.SuccessNoData(c, http.StatusOK, "Authentication successful")
}

// CheckAuth checks if the user is authenticated via cookie
// @Summary Check authentication status
// @Description Check if the user is authenticated via the authentication cookie.
// @Tags Page Auth
// @Produce json
// @Success 200 {object} response.SuccessResponse{data=CheckAuthResponse} "Authenticated"
// @Failure 401 {object} response.ErrorResponse "Not authenticated"
// @Router /v1/page-auth/check [get]
func (h *Handler) CheckAuth(c echo.Context) error {
	cookie, err := c.Cookie(authCookieName)

	if err != nil || cookie.Value != authCookieValue {
		return response.Error(c, http.StatusUnauthorized, "Not authenticated")
	}

	data := CheckAuthResponse{
		Authenticated: true,
	}
	return response.Success(c, http.StatusOK, "Authenticated", data)
}
