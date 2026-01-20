package page_auth

// AuthenticateRequest represents the authentication request
type AuthenticateRequest struct {
	Password string `json:"password" validate:"required" example:"your-strong-password"`
}

// AuthenticateResponse represents the authentication response
type AuthenticateResponse struct {
	Success bool `json:"success" example:"true"`
}

// CheckAuthResponse represents the check auth response
type CheckAuthResponse struct {
	Authenticated bool `json:"authenticated" example:"true"`
}
