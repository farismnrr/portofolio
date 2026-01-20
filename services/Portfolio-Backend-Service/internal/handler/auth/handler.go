package auth

import (
	"net/http"
	"strings"

	appConfig "github.com/farismnrr/portfolio-backend-service/internal/config"
	ssoRepo "github.com/farismnrr/portfolio-backend-service/internal/repository/http"
	"github.com/farismnrr/portfolio-backend-service/pkg/logger"
	"github.com/farismnrr/portfolio-backend-service/pkg/response"
	"github.com/labstack/echo/v4"
	"go.uber.org/zap"
)

const (
	refreshTokenCookie = "refresh_token"
	cookieMaxAge       = 30 * 24 * 60 * 60 // 30 days
)

// Handler handles authentication requests
type Handler struct {
	config    *appConfig.Config
	ssoClient *ssoRepo.SSOClient
}

// NewHandler creates a new auth handler
func NewHandler(cfg *appConfig.Config) *Handler {
	return &Handler{
		config:    cfg,
		ssoClient: ssoRepo.NewSSOClient(cfg),
	}
}

// Login accepts a refresh token from frontend and sets it as HttpOnly cookie
// @Summary SSO Login Proxy
// @Description Receive a refresh token from the frontend and store it in a secure HttpOnly cookie.
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Login request"
// @Success 200 {object} response.SuccessResponse "Login successful"
// @Failure 400 {object} response.ErrorResponse "Invalid request body"
// @Router /v1/auth/login [post]
func (h *Handler) Login(c echo.Context) error {
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request body")
	}

	if req.RefreshToken == "" {
		return response.Error(c, http.StatusBadRequest, "Refresh token is required")
	}

	// Set HttpOnly cookie
	cookie := &http.Cookie{
		Name:     refreshTokenCookie,
		Value:    req.RefreshToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   h.config.IsProduction(),
		SameSite: http.SameSiteLaxMode,
		MaxAge:   cookieMaxAge,
	}
	c.SetCookie(cookie)

	return response.SuccessNoData(c, http.StatusOK, "Login successful")
}

// RefreshToken reads refresh token from cookie and gets new access token from SSO
// @Summary Refresh Access Token
// @Description Use the stored refresh token cookie to obtain a new access token from the SSO service.
// @Tags Auth
// @Produce json
// @Success 200 {object} response.SuccessResponse{data=RefreshResponse} "Token refreshed successfully"
// @Failure 401 {object} response.ErrorResponse "No refresh token found or failed to refresh"
// @Router /v1/auth/refresh [post]
func (h *Handler) RefreshToken(c echo.Context) error {
	// Get refresh token from cookie
	cookie, err := c.Cookie(refreshTokenCookie)
	if err != nil {
		logger.Warn("No refresh token cookie found", zap.Error(err))
		return response.Error(c, http.StatusUnauthorized, "No refresh token found")
	}

	// Call SSO service to refresh token
	tokenResp, err := h.ssoClient.RefreshToken(c.Request().Context(), cookie.Value)
	if err != nil {
		logger.Error("Failed to refresh token", zap.Error(err))

		// Clear invalid refresh token cookie
		// Must match the original cookie settings for deletion to work
		clearCookie := &http.Cookie{
			Name:     refreshTokenCookie,
			Value:    "",
			Path:     "/",
			MaxAge:   -1,
			HttpOnly: true,
			Secure:   true,                  // Always true for cross-domain cookies
			SameSite: http.SameSiteNoneMode, // Must be None for cross-domain
		}
		c.SetCookie(clearCookie)

		return response.Error(c, http.StatusUnauthorized, "Failed to refresh token")
	}

	data := RefreshResponse{
		AccessToken: tokenResp.AccessToken,
		ExpiresIn:   tokenResp.ExpiresIn,
	}
	return response.Success(c, http.StatusOK, "Token refreshed successfully", data)
}

// GetUser validates access token with SSO and returns user info
// @Summary Get User Information
// @Description Validate the Bearer token with the SSO service and return detailed user information.
// @Tags Auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.SuccessResponse{data=UserResponse} "User data retrieved successfully"
// @Failure 401 {object} response.ErrorResponse "No authorization header or failed to fetch user"
// @Router /v1/auth/user [get]
func (h *Handler) GetUser(c echo.Context) error {
	// Get authorization header
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return response.Error(c, http.StatusUnauthorized, "No authorization header found")
	}

	// Extract token from "Bearer <token>"
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return response.Error(c, http.StatusUnauthorized, "Invalid authorization header format")
	}
	accessToken := parts[1]

	// Verify user with SSO
	userData, err := h.ssoClient.VerifyUser(c.Request().Context(), accessToken)
	if err != nil {
		logger.Error("Failed to verify user", zap.Error(err))
		return response.Error(c, http.StatusUnauthorized, "Failed to fetch user")
	}

	// RBAC: Only allow admin role
	if userData.Role != "admin" {
		logger.Warn("Non-admin user attempted to access admin-only application",
			zap.String("user_id", userData.ID),
			zap.String("username", userData.Username),
			zap.String("role", userData.Role),
		)
		return response.Error(c, http.StatusForbidden, "Access denied: admin role required")
	}

	data := UserResponse{
		ID:       userData.ID,
		Username: userData.Username,
		Email:    userData.Email,
		Role:     userData.Role,
		TenantID: userData.TenantID,
	}
	return response.Success(c, http.StatusOK, "User data retrieved successfully", data)
}

// Logout logs out the user by calling SSO and clearing cookies
// @Summary Logout
// @Description Logout user by invalidating SSO session and clearing refresh token cookie
// @Tags Auth
// @Produce json
// @Success 200 {object} response.SuccessResponse "Logout successful"
// @Router /v1/auth/logout [post]
func (h *Handler) Logout(c echo.Context) error {
	// Get access token from header (optional - for SSO logout)
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader != "" {
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && parts[0] == "Bearer" {
			accessToken := parts[1]
			// Call SSO logout (best effort - don't fail if it errors)
			_ = h.ssoClient.Logout(c.Request().Context(), accessToken)
		}
	}

	// Clear refresh token cookie
	cookie := &http.Cookie{
		Name:     refreshTokenCookie,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	}
	c.SetCookie(cookie)

	return response.Success(c, http.StatusOK, "Logout successful", nil)
}
