package handler

import (
	"net/http"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/response"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/entity"
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
	return response.Success(c, http.StatusOK, "Work retrieved", work)
}

func (h *Handler) ListWorks(c echo.Context) error {
	works, err := h.workUsecase.ListWorks(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to list works")
	}
	return response.Success(c, http.StatusOK, "Works retrieved", works)
}

func (h *Handler) CreateWork(c echo.Context) error {
	var req WorkCreateUpdateDTO
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request body")
	}

	work := &entity.WorksMetadata{
		Slug:        req.Slug,
		Title:       req.Title,
		Content:     req.Content,
		Summary:     req.Summary,
		ProjectName: req.ProjectName,
		Link:        req.Link,
		Repository:  req.Repository,
		PublishedAt: req.PublishedAt,
	}

	var seo *entity.SEOMetadata
	if req.SEOMetadata != nil {
		seo = &entity.SEOMetadata{
			Title:       req.SEOMetadata.Title,
			Description: req.SEOMetadata.Description,
			Keywords:    req.SEOMetadata.Keywords,
			OGImage:     req.SEOMetadata.OGImage,
		}
	}

	if err := h.workUsecase.CreateWork(c.Request().Context(), work, seo); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to create work")
	}

	return response.Success(c, http.StatusCreated, "Work created successfully", work)
}

func (h *Handler) UpdateWork(c echo.Context) error {
	id := c.Param("id")
	var req WorkCreateUpdateDTO
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request body")
	}

	work := &entity.WorksMetadata{
		Base:        entity.Base{ID: id},
		Slug:        req.Slug,
		Title:       req.Title,
		Content:     req.Content,
		Summary:     req.Summary,
		ProjectName: req.ProjectName,
		Link:        req.Link,
		Repository:  req.Repository,
		PublishedAt: req.PublishedAt,
	}

	var seo *entity.SEOMetadata
	if req.SEOMetadata != nil {
		seo = &entity.SEOMetadata{
			Title:       req.SEOMetadata.Title,
			Description: req.SEOMetadata.Description,
			Keywords:    req.SEOMetadata.Keywords,
			OGImage:     req.SEOMetadata.OGImage,
		}
	}

	if err := h.workUsecase.UpdateWork(c.Request().Context(), work, seo); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to update work")
	}

	return response.Success(c, http.StatusOK, "Work updated successfully", work)
}

func (h *Handler) DeleteWork(c echo.Context) error {
	id := c.Param("id")
	if err := h.workUsecase.DeleteWork(c.Request().Context(), id); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to delete work")
	}
	return response.SuccessNoData(c, http.StatusOK, "Work deleted successfully")
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

// UpdateWorkMetadata updates engagement manually (Admin)
// @Summary Update Work Metadata
// @Tags Interaction
// @Router /v1/interactions/works/{slug} [patch]
func (h *Handler) UpdateWorkMetadata(c echo.Context) error {
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
