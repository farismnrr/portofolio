package response

import (
	"github.com/labstack/echo/v4"
)

// SuccessResponse represents a standardized success API response
type SuccessResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// ErrorResponse represents a standardized error API response
type ErrorResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`    // For additional error data
	Details interface{} `json:"details,omitempty"` // For validation errors
}

// Success sends a success response with data
func Success(c echo.Context, code int, message string, data interface{}) error {
	return c.JSON(code, SuccessResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// SuccessNoData sends a success response without data
func SuccessNoData(c echo.Context, code int, message string) error {
	return c.JSON(code, SuccessResponse{
		Success: true,
		Message: message,
	})
}

// Error sends an error response
func Error(c echo.Context, code int, message string) error {
	return c.JSON(code, ErrorResponse{
		Success: false,
		Message: message,
	})
}

// ErrorWithData sends an error response with additional data
func ErrorWithData(c echo.Context, code int, message string, data interface{}) error {
	return c.JSON(code, ErrorResponse{
		Success: false,
		Message: message,
		Data:    data,
	})
}

// ValidationError sends an error response with validation details
func ValidationError(c echo.Context, message string, details interface{}) error {
	return c.JSON(400, ErrorResponse{
		Success: false,
		Message: message,
		Details: details,
	})
}
