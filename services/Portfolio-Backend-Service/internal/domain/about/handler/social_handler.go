package handler

import (
	"net/http"
	"net/url"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/usecase"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/response"
	"github.com/labstack/echo/v4"
)

type SocialHandler struct {
	usecase usecase.SocialUsecase
}

func NewSocialHandler(u usecase.SocialUsecase) *SocialHandler {
	return &SocialHandler{usecase: u}
}

// GetSocialLinks retrieves list of social links
// @Summary Get social links
// @Description Fetch all active social links sorted by order
// @Tags About
// @Accept json
// @Produce json
// @Success 200 {object} response.SuccessResponse{data=map[string][]entity.SocialLink}
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/social-links [get]
func (h *SocialHandler) GetSocialLinks(c echo.Context) error {
	links, err := h.usecase.GetSocialLinks(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}

	return response.Success(c, http.StatusOK, "Social links retrieved successfully", map[string]interface{}{"social_links": links})
}

type CreateSocialLinkRequest struct {
	Name    string `json:"name"`
	Link    string `json:"link"`
	Icon    string `json:"icon"` // Make sure entity has this
	OrderBy *int   `json:"order_by"`
	AboutID string `json:"about_id"` // Assuming we link it to an about profile
}

// CreateSocialLink creates a new social link
// @Summary Create social link
// @Description Add a new social media link
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CreateSocialLinkRequest true "Social Link Data"
// @Success 201 {object} response.SuccessResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 422 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/social-links [post]
func (h *SocialHandler) CreateSocialLink(c echo.Context) error {
	var req CreateSocialLinkRequest
	// Strict Content-Type check
	if c.Request().Header.Get("Content-Type") != "application/json" {
		return response.Error(c, http.StatusUnsupportedMediaType, "Unsupported media type")
	}

	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request payload")
	}

	// Validation
	var details []map[string]string
	if req.Name == "" {
		details = append(details, map[string]string{"field": "name", "message": "Name is required"})
	}
	if req.Link == "" {
		details = append(details, map[string]string{"field": "link", "message": "Link is required"})
	} else if _, err := url.ParseRequestURI(req.Link); err != nil {
		details = append(details, map[string]string{"field": "link", "message": "Invalid URL format"})
	}

	if len(details) > 0 {
		return response.ValidationError(c, "Validation failed", details)
	}

	social := &entity.SocialLink{
		Name:    req.Name,
		Link:    req.Link,
		Icon:    req.Icon,
		AboutID: req.AboutID,
	}

	if req.OrderBy != nil {
		social.OrderBy = *req.OrderBy
	}

	if err := h.usecase.CreateSocialLink(c.Request().Context(), social); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}

	return response.Success(c, http.StatusCreated, "Social link created successfully", map[string]interface{}{"social_link_id": social.ID})
}

// UpdateSocialLink updates an existing social link
// @Summary Update social link
// @Description Update social media link details
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Social Link ID"
// @Param request body CreateSocialLinkRequest true "Social Link Data"
// @Success 200 {object} response.SuccessResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 422 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/social-links/{id} [patch]
func (h *SocialHandler) UpdateSocialLink(c echo.Context) error {
	id := c.Param("id")

	// Helper check existence
	existing, err := h.usecase.GetSocialLinkByID(c.Request().Context(), id)
	if err != nil {
		// Could be DB error or Not Found. Simple handling:
		return response.Error(c, http.StatusNotFound, "Social link not found")
	}
	if existing == nil {
		return response.Error(c, http.StatusNotFound, "Social link not found")
	}

	var req CreateSocialLinkRequest // Reuse request struct
	// Strict Content-Type check
	if c.Request().Header.Get("Content-Type") != "application/json" {
		return response.Error(c, http.StatusUnsupportedMediaType, "Unsupported media type")
	}

	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request payload")
	}

	// Basic validation (only if fields are provided, partial update logic usually applies but here we replace fields if present)
	// If name provided, must not be empty.
	if req.Name != "" {
		existing.Name = req.Name
	}
	if req.Link != "" {
		if _, err := url.ParseRequestURI(req.Link); err != nil {
			return response.ValidationError(c, "Validation failed", []map[string]string{{"field": "link", "message": "Invalid URL format"}})
		}
		existing.Link = req.Link
	}
	if req.Icon != "" {
		existing.Icon = req.Icon
	}
	if req.OrderBy != nil {
		existing.OrderBy = *req.OrderBy
	}

	if err := h.usecase.UpdateSocialLink(c.Request().Context(), existing); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}

	return response.SuccessNoData(c, http.StatusOK, "Social link updated successfully")
}

// DeleteSocialLink soft deletes a social link
// @Summary Delete social link
// @Description Soft delete a social link
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Social Link ID"
// @Success 200 {object} response.SuccessResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/social-links/{id} [delete]
func (h *SocialHandler) DeleteSocialLink(c echo.Context) error {
	id := c.Param("id")

	// Check existence
	_, err := h.usecase.GetSocialLinkByID(c.Request().Context(), id)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Social link not found")
	}

	if err := h.usecase.DeleteSocialLink(c.Request().Context(), id); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}

	return response.SuccessNoData(c, http.StatusOK, "Social link deleted successfully")
}
