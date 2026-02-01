package handler

import (
	"errors"
	"net/http"
	"strings"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/response"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/entity"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// GetWork returns work engagement data
// @Summary Get Work Metadata
// @Description Fetch a work project with metadata, views, and likes count
// @Tags Interaction - Works
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param slug path string true "Work Slug"
// @Success 200 {object} response.SuccessResponse{data=entity.WorksMetadata}
// @Failure 401 {object} response.ErrorResponse "Unauthorized"
// @Failure 404 {object} response.ErrorResponse "Work not found"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/works/{slug} [get]
func (h *Handler) GetWork(c echo.Context) error {
	slug := c.Param("slug")
	work, err := h.workUsecase.GetWork(c.Request().Context(), slug)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Work not found")
	}
	return response.Success(c, http.StatusOK, "Work retrieved", work)
}

// ListWorks retrieves all published works
// @Summary List All Works
// @Description Fetch all work projects with pagination support
// @Tags Interaction - Works
// @Accept json
// @Produce json
// @Success 200 {object} response.SuccessResponse{data=[]entity.WorksMetadata}
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/works [get]
func (h *Handler) ListWorks(c echo.Context) error {
	works, err := h.workUsecase.ListWorks(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to list works")
	}
	return response.Success(c, http.StatusOK, "Works retrieved", works)
}

// CreateWork creates a new work project
// @Summary Create Work
// @Description Admin-only endpoint to create a new work project with SEO metadata
// @Tags Interaction - Works
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body WorkCreateUpdateDTO true "Work Data"
// @Success 201 {object} response.SuccessResponse{data=entity.WorksMetadata}
// @Failure 401 {object} response.ErrorResponse "Unauthorized"
// @Failure 409 {object} response.ErrorResponse "Conflict (Duplicate slug)"
// @Failure 422 {object} response.ErrorResponse "Unprocessable Entity"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/works [post]
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

// UpdateWork updates work content and SEO metadata
// @Summary Update Work (Full)
// @Description Admin-only endpoint to fully update work content and SEO
// @Tags Interaction - Works
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Work ID"
// @Param request body WorkCreateUpdateDTO true "Updated Work Data"
// @Success 200 {object} response.SuccessResponse{data=entity.WorksMetadata}
// @Failure 400 {object} response.ErrorResponse "Bad Request"
// @Failure 401 {object} response.ErrorResponse "Unauthorized"
// @Failure 403 {object} response.ErrorResponse "Forbidden"
// @Failure 404 {object} response.ErrorResponse "Work not found"
// @Failure 415 {object} response.ErrorResponse "Unsupported media type"
// @Failure 422 {object} response.ErrorResponse "Unprocessable Entity"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/works/{id} [put]
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

// DeleteWork deletes a work project
// @Summary Delete Work
// @Description Admin-only endpoint to permanently delete a work project
// @Tags Interaction - Works
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Work ID"
// @Success 200 {object} response.SuccessResponse
// @Failure 401 {object} response.ErrorResponse "Unauthorized"
// @Failure 403 {object} response.ErrorResponse "Forbidden"
// @Failure 404 {object} response.ErrorResponse "Work not found"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/works/{id} [delete]
func (h *Handler) DeleteWork(c echo.Context) error {
	id := c.Param("id")
	if err := h.workUsecase.DeleteWork(c.Request().Context(), id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || strings.Contains(strings.ToLower(err.Error()), "not found") {
			return response.Error(c, http.StatusNotFound, "Work not found")
		}
		return response.Error(c, http.StatusInternalServerError, "Failed to delete work")
	}
	return response.SuccessNoData(c, http.StatusOK, "Work deleted successfully")
}

// ViewWork increments view count
// @Summary Increment Work View
// @Description User action to increment view count
// @Tags Interaction - Works
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param slug path string true "Work Slug"
// @Success 200 {object} response.SuccessResponse
// @Failure 401 {object} response.ErrorResponse "Unauthorized"
// @Failure 404 {object} response.ErrorResponse "Work not found"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/works/{slug}/view [post]
func (h *Handler) ViewWork(c echo.Context) error {
	slug := c.Param("slug")
	if err := h.workUsecase.IncrementWorkViews(c.Request().Context(), slug); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to increment view")
	}
	return response.SuccessNoData(c, http.StatusOK, "View incremented")
}

// LikeWork increments like count
// @Summary Increment Work Like
// @Description User action to toggle like (increment)
// @Tags Interaction - Works
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param slug path string true "Work Slug"
// @Success 200 {object} response.SuccessResponse
// @Failure 401 {object} response.ErrorResponse "Unauthorized"
// @Failure 404 {object} response.ErrorResponse "Work not found"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/works/{slug}/like [post]
func (h *Handler) LikeWork(c echo.Context) error {
	slug := c.Param("slug")
	if err := h.workUsecase.IncrementWorkLikes(c.Request().Context(), slug); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to increment like")
	}
	return response.SuccessNoData(c, http.StatusOK, "Like incremented")
}

// UpdateWorkMetadata updates engagement manually (Admin)
// @Summary Update Work Metadata
// @Description Admin-only endpoint to update interaction counts
// @Tags Interaction - Works
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param slug path string true "Work Slug"
// @Param request body WorkUpdateDTO true "Metadata"
// @Success 200 {object} response.SuccessResponse
// @Failure 400 {object} response.ErrorResponse "Bad Request"
// @Failure 401 {object} response.ErrorResponse "Unauthorized"
// @Failure 403 {object} response.ErrorResponse "Forbidden"
// @Failure 404 {object} response.ErrorResponse "Work not found"
// @Failure 415 {object} response.ErrorResponse "Unsupported media type"
// @Failure 422 {object} response.ErrorResponse "Unprocessable Entity"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
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
