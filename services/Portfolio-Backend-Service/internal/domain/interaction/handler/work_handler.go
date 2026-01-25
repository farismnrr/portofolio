package handler

import (
	"net/http"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/response"
	"github.com/labstack/echo/v4"
)

// GetWork returns work engagement data
// @Summary Get Work Metadata
// @Tags Interaction
// @Param slug path string true "Work Slug"
// @Success 200 {object} response.SuccessResponse{data=entity.WorksMetadata}
// @Router /v1/interactions/works/{slug} [get]
func (h *Handler) GetWork(c echo.Context) error {
	slug := c.Param("slug")
	work, err := h.workUsecase.GetWork(c.Request().Context(), slug)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Work not found")
	}
	return response.Success(c, http.StatusOK, "Work metadata retrieved", work)
}

// ViewWork increments view count
// @Summary Increment Work View
// @Tags Interaction
// @Param slug path string true "Work Slug"
// @Success 200 {object} response.SuccessResponse
// @Router /v1/interactions/works/{slug}/view [patch]
func (h *Handler) ViewWork(c echo.Context) error {
	slug := c.Param("slug")
	if err := h.workUsecase.IncrementWorkViews(c.Request().Context(), slug); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to increment view")
	}
	return response.SuccessNoData(c, http.StatusOK, "View incremented")
}

// LikeWork increments like count
// @Summary Increment Work Like
// @Tags Interaction
// @Param slug path string true "Work Slug"
// @Success 200 {object} response.SuccessResponse
// @Router /v1/interactions/works/{slug}/like [patch]
func (h *Handler) LikeWork(c echo.Context) error {
	slug := c.Param("slug")
	if err := h.workUsecase.IncrementWorkLikes(c.Request().Context(), slug); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to increment like")
	}
	return response.SuccessNoData(c, http.StatusOK, "Like incremented")
}

// UpdateWork updates engagement manually (Admin)
// @Summary Update Work Metadata
// @Tags Interaction
// @Router /v1/interactions/works/{slug} [patch]
func (h *Handler) UpdateWork(c echo.Context) error {
	slug := c.Param("slug")
	var req WorkUpdateDTO
	// Strict Content-Type check
	if c.Request().Header.Get("Content-Type") != "application/json" {
		return response.Error(c, http.StatusUnsupportedMediaType, "Unsupported media type")
	}

	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request body")
	}

	views := -1
	likes := -1
	if req.ViewsCount != nil {
		views = *req.ViewsCount
	}
	if req.LikesCount != nil {
		likes = *req.LikesCount
	}

	if err := h.workUsecase.UpdateWorkMetadata(c.Request().Context(), slug, views, likes); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to update metadata")
	}
	return response.SuccessNoData(c, http.StatusOK, "Work project metadata updated successfully")
}
