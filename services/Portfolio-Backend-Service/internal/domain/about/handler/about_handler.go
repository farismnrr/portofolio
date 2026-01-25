package handler

import (
	"net/http"
	"strings"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/usecase"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/logger"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/response"
	"github.com/labstack/echo/v4"
	"go.uber.org/zap"
)

type AboutHandler struct {
	usecase usecase.AboutUsecase
}

func NewAboutHandler(u usecase.AboutUsecase) *AboutHandler {
	return &AboutHandler{usecase: u}
}

// GET retrieves basic profile information
// @Summary Get basic profile
// @Description Fetch name, role, description, and avatar URL
// @Tags About
// @Accept json
// @Produce json
// @Success 200 {object} response.SuccessResponse{data=map[string]AboutResponse}
// @Failure 401 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about [get]
func (h *AboutHandler) GetAbout(c echo.Context) error {
	about, err := h.usecase.GetAbout(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}

	if about == nil {
		return response.Success(c, http.StatusOK, "About information is empty", map[string]interface{}{"about": nil})
	}

	res := AboutResponse{
		ID:          about.ID,
		Name:        about.Name,
		Role:        about.Role,
		Description: about.Description,
		Avatar:      about.Avatar,
	}

	return response.Success(c, http.StatusOK, "About information retrieved successfully", map[string]interface{}{"about": res})
}

// UpdateAbout updates text-based profile
// @Summary Update profile
// @Description Update name, role, and description
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body UpdateAboutRequest true "Profile Data"
// @Success 200 {object} response.SuccessResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 422 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about [patch]
func (h *AboutHandler) UpdateAbout(c echo.Context) error {
	var req UpdateAboutRequest
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request payload format")
	}

	// Validation
	var details []map[string]string
	if req.Name == "" {
		details = append(details, map[string]string{"field": "name", "message": "Name is required"})
	}
	if req.Role == "" {
		details = append(details, map[string]string{"field": "role", "message": "Role is required"})
	}
	if req.Description == "" {
		details = append(details, map[string]string{"field": "description", "message": "Description is required"})
	}

	if len(details) > 0 {
		return response.ValidationError(c, "Validation failed", details)
	}

	about := &entity.About{
		Name:        req.Name,
		Role:        req.Role,
		Description: req.Description,
		Avatar:      req.Avatar,
	}

	if err := h.usecase.UpdateAbout(c.Request().Context(), about); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}

	return response.SuccessNoData(c, http.StatusOK, "About profile updated successfully")
}

// UpdateAvatar uploads a new avatar
// @Summary Update avatar
// @Description Upload image to GCS and update profile
// @Tags About
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param avatar formData file true "Avatar image file"
// @Success 200 {object} response.SuccessResponse{data=map[string]map[string]string}
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 413 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/avatar [patch]
func (h *AboutHandler) UpdateAvatar(c echo.Context) error {
	// Source
	file, err := c.FormFile("avatar")
	if err != nil {
		return response.Error(c, http.StatusBadRequest, "Avatar file is required")
	}

	// 1. Validation: File Size (max 2MB)
	if file.Size > 2*1024*1024 {
		return response.Error(c, http.StatusRequestEntityTooLarge, "File size exceeds the 2MB limit")
	}

	// 2. Validation: File Type (Only images)
	contentType := file.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		return response.Error(c, http.StatusBadRequest, "Invalid file type: Only images are allowed")
	}

	src, err := file.Open()
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to open avatar file")
	}
	defer src.Close()

	url, err := h.usecase.UpdateAvatar(c.Request().Context(), src, file.Filename)
	if err != nil {
		logger.Error("Failed to update avatar", zap.Error(err))
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}

	res := map[string]interface{}{
		"about": map[string]string{
			"avatar": url,
		},
	}

	return response.Success(c, http.StatusOK, "Avatar updated successfully", res)
}
