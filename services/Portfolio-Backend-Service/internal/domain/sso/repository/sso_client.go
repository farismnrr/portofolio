package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/farismnrr/portfolio-backend-service/internal/config"
	"github.com/farismnrr/portfolio-backend-service/pkg/httpclient"
	"github.com/farismnrr/portfolio-backend-service/pkg/logger"
	"go.uber.org/zap"
)

// SSOClient is a client for the SSO service
type SSOClient struct {
	config     *config.Config
	httpClient *httpclient.Client
}

// TokenResponse represents the token response from SSO
type TokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int    `json:"expires_in"`
}

// UserData represents user data from SSO
type UserData struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	TenantID string `json:"tenant_id"`
}

// BaseResponse represents the standardized response structure from the SSO service
type BaseResponse struct {
	Status  bool            `json:"status"`
	Message string          `json:"message"`
	Data    json.RawMessage `json:"data"`
}

// NewSSOClient creates a new SSO client
func NewSSOClient(cfg *config.Config) *SSOClient {
	return &SSOClient{
		config:     cfg,
		httpClient: httpclient.New(15 * time.Second),
	}
}

// RefreshToken refreshes the access token using refresh token
func (s *SSOClient) RefreshToken(ctx context.Context, refreshToken string) (*TokenResponse, error) {
	url := fmt.Sprintf("%s/auth/refresh", s.config.SSO.URL)

	logger.Debug("Calling SSO refresh",
		zap.String("url", url),
		zap.String("token_preview", refreshToken[:20]+"..."),
	)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set refresh token cookie and API Key
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", s.config.SSO.APIKey)
	req.Header.Set("Cookie", fmt.Sprintf("refresh_token=%s", refreshToken))

	resp, err := s.httpClient.Do(req)
	if err != nil {
		logger.Error("SSO refresh token request failed", zap.Error(err))
		return nil, fmt.Errorf("SSO request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		logger.Error("SSO refresh token failed",
			zap.Int("status", resp.StatusCode),
			zap.String("body", string(body)),
		)
		return nil, fmt.Errorf("SSO returned status %d", resp.StatusCode)
	}

	var baseResp BaseResponse
	if err := json.NewDecoder(resp.Body).Decode(&baseResp); err != nil {
		return nil, fmt.Errorf("failed to decode base response: %w", err)
	}

	if !baseResp.Status {
		return nil, fmt.Errorf("SSO error: %s", baseResp.Message)
	}

	var tokenResp TokenResponse
	if err := json.Unmarshal(baseResp.Data, &tokenResp); err != nil {
		return nil, fmt.Errorf("failed to decode token response: %w", err)
	}

	return &tokenResp, nil
}

// VerifyUser verifies the access token and returns user data
func (s *SSOClient) VerifyUser(ctx context.Context, accessToken string) (*UserData, error) {
	url := fmt.Sprintf("%s/auth/verify", s.config.SSO.URL)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	req.Header.Set("X-API-Key", s.config.SSO.APIKey)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		logger.Error("SSO verify user request failed", zap.Error(err))
		return nil, fmt.Errorf("SSO request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		logger.Error("SSO verify user failed",
			zap.Int("status", resp.StatusCode),
			zap.String("body", string(body)),
		)
		return nil, fmt.Errorf("SSO returned status %d", resp.StatusCode)
	}

	var baseResp BaseResponse
	if err := json.NewDecoder(resp.Body).Decode(&baseResp); err != nil {
		return nil, fmt.Errorf("failed to decode base response: %w", err)
	}

	if !baseResp.Status {
		return nil, fmt.Errorf("SSO error: %s", baseResp.Message)
	}

	var userData UserData
	if err := json.Unmarshal(baseResp.Data, &userData); err != nil {
		return nil, fmt.Errorf("failed to decode user data: %w", err)
	}

	return &userData, nil
}

// Logout calls SSO logout endpoint to invalidate session
func (s *SSOClient) Logout(ctx context.Context, accessToken string) error {
	url := fmt.Sprintf("%s/auth/logout", s.config.SSO.URL)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	req.Header.Set("X-API-Key", s.config.SSO.APIKey)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		logger.Error("SSO logout request failed", zap.Error(err))
		return fmt.Errorf("SSO request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		logger.Warn("SSO logout failed",
			zap.Int("status", resp.StatusCode),
			zap.String("body", string(body)),
		)
		// Don't return error - logout should succeed even if SSO fails
	}

	return nil
}
