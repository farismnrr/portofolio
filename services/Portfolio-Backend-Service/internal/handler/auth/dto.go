package auth

// LoginRequest represents the login request with refresh token
type LoginRequest struct {
	RefreshToken string `json:"refreshToken" validate:"required" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
}

// LoginResponse represents the login response
type LoginResponse struct {
	Message string `json:"message" example:"Login successful"`
}

// RefreshResponse represents the refresh token response
type RefreshResponse struct {
	AccessToken string `json:"access_token" example:"eyJhbGciOiJIUzI1NiIs..."`
	ExpiresIn   int    `json:"expires_in" example:"3600"`
}

// UserResponse represents the user data response
type UserResponse struct {
	ID       string `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Username string `json:"username" example:"johndoe"`
	Email    string `json:"email" example:"john@example.com"`
	Role     string `json:"role" example:"user"`
	TenantID string `json:"tenant_id" example:"770e8400-e29b-41d4-a716-446655440001"`
}
