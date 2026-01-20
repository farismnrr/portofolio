package handler

// LoginRequest represents the login request with refresh token
type LoginRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// RefreshResponse represents the refresh token response
type RefreshResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int    `json:"expires_in"`
}

// UserResponse represents the user data response
type UserResponse struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	TenantID string `json:"tenant_id"`
}
