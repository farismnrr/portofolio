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

// GetBlog retrieves a single blog by slug
// @Summary Get Blog by Slug
// @Description Fetch a blog post with metadata, views, and likes count
// @Tags Interaction - Blogs
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param slug path string true "Blog Slug"
// @Success 200 {object} response.SuccessResponse{data=entity.BlogsMetadata}
// @Failure 401 {object} response.ErrorResponse "Unauthorized"
// @Failure 404 {object} response.ErrorResponse "Blog not found"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/blogs/{slug} [get]
func (h *Handler) GetBlog(c echo.Context) error {
	slug := c.Param("slug")
	blog, err := h.blogUsecase.GetBlog(c.Request().Context(), slug)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Blog not found")
	}
	return response.Success(c, http.StatusOK, "Blog retrieved", blog)
}

// ListBlogs retrieves all published blogs
// @Summary List All Blogs
// @Description Fetch all blog posts with pagination support
// @Tags Interaction - Blogs
// @Accept json
// @Produce json
// @Success 200 {object} response.SuccessResponse{data=[]entity.BlogsMetadata}
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/blogs [get]
func (h *Handler) ListBlogs(c echo.Context) error {
	blogs, err := h.blogUsecase.ListBlogs(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to list blogs")
	}
	return response.Success(c, http.StatusOK, "Blogs retrieved", blogs)
}

// CreateBlog creates a new blog post
// @Summary Create Blog
// @Description Admin-only endpoint to create a new blog post with SEO metadata
// @Tags Interaction - Blogs
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body BlogCreateUpdateDTO true "Blog Data"
// @Success 201 {object} response.SuccessResponse{data=entity.BlogsMetadata}
// @Failure 401 {object} response.ErrorResponse "Unauthorized"
// @Failure 409 {object} response.ErrorResponse "Conflict (Duplicate slug)"
// @Failure 422 {object} response.ErrorResponse "Unprocessable Entity"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/blogs [post]
func (h *Handler) CreateBlog(c echo.Context) error {
	var req BlogCreateUpdateDTO
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request body")
	}

	blog := &entity.BlogsMetadata{
		Slug:        req.Slug,
		Title:       req.Title,
		Content:     req.Content,
		Summary:     req.Summary,
		BlogTitle:   req.BlogTitle,
		Source:      req.Source,
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

	if err := h.blogUsecase.CreateBlog(c.Request().Context(), blog, seo); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to create blog")
	}

	return response.Success(c, http.StatusCreated, "Blog created successfully", blog)
}

// UpdateBlog updates blog content and SEO metadata
// @Summary Update Blog (Full)
// @Description Admin-only endpoint to fully update blog content and SEO
// @Tags Interaction - Blogs
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Blog ID"
// @Param request body BlogCreateUpdateDTO true "Updated Blog Data"
// @Success 200 {object} response.SuccessResponse{data=entity.BlogsMetadata}
// @Failure 400 {object} response.ErrorResponse "Bad Request"
// @Failure 401 {object} response.ErrorResponse "Unauthorized"
// @Failure 403 {object} response.ErrorResponse "Forbidden"
// @Failure 404 {object} response.ErrorResponse "Blog not found"
// @Failure 415 {object} response.ErrorResponse "Unsupported media type"
// @Failure 422 {object} response.ErrorResponse "Unprocessable Entity"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/blogs/{id} [put]
func (h *Handler) UpdateBlog(c echo.Context) error {
	id := c.Param("id")
	var req BlogCreateUpdateDTO
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request body")
	}

	blog := &entity.BlogsMetadata{
		Base:        entity.Base{ID: id},
		Slug:        req.Slug,
		Title:       req.Title,
		Content:     req.Content,
		Summary:     req.Summary,
		BlogTitle:   req.BlogTitle,
		Source:      req.Source,
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

	if err := h.blogUsecase.UpdateBlog(c.Request().Context(), blog, seo); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to update blog")
	}

	return response.Success(c, http.StatusOK, "Blog updated successfully", blog)
}

// DeleteBlog deletes a blog post
// @Summary Delete Blog
// @Description Admin-only endpoint to permanently delete a blog post
// @Tags Interaction - Blogs
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Blog ID"
// @Success 200 {object} response.SuccessResponse
// @Failure 401 {object} response.ErrorResponse "Unauthorized"
// @Failure 403 {object} response.ErrorResponse "Forbidden"
// @Failure 404 {object} response.ErrorResponse "Blog not found"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/blogs/{id} [delete]
func (h *Handler) DeleteBlog(c echo.Context) error {
	id := c.Param("id")
	if err := h.blogUsecase.DeleteBlog(c.Request().Context(), id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || strings.Contains(strings.ToLower(err.Error()), "not found") {
			return response.Error(c, http.StatusNotFound, "Blog not found")
		}
		return response.Error(c, http.StatusInternalServerError, "Failed to delete blog")
	}
	return response.SuccessNoData(c, http.StatusOK, "Blog deleted successfully")
}

// ViewBlog increments view count for a blog
// @Summary Increment Blog View
// @Description User action to increment view count
// @Tags Interaction - Blogs
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param slug path string true "Blog Slug"
// @Success 200 {object} response.SuccessResponse
// @Failure 401 {object} response.ErrorResponse "Unauthorized"
// @Failure 404 {object} response.ErrorResponse "Blog not found"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/blogs/{slug}/view [post]
func (h *Handler) ViewBlog(c echo.Context) error {
	slug := c.Param("slug")
	if err := h.blogUsecase.IncrementBlogViews(c.Request().Context(), slug); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to increment view")
	}
	return response.SuccessNoData(c, http.StatusOK, "View incremented")
}

// LikeBlog increments like count for a blog
// @Summary Increment Blog Like
// @Description User action to toggle like (increment)
// @Tags Interaction - Blogs
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param slug path string true "Blog Slug"
// @Success 200 {object} response.SuccessResponse
// @Failure 401 {object} response.ErrorResponse "Unauthorized"
// @Failure 404 {object} response.ErrorResponse "Blog not found"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/blogs/{slug}/like [post]
func (h *Handler) LikeBlog(c echo.Context) error {
	slug := c.Param("slug")
	if err := h.blogUsecase.IncrementBlogLikes(c.Request().Context(), slug); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to increment like")
	}
	return response.SuccessNoData(c, http.StatusOK, "Like incremented")
}

// UpdateBlogMetadata updates only views/likes count
// @Summary Update Blog Metadata
// @Description Admin-only endpoint to update interaction counts
// @Tags Interaction - Blogs
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param slug path string true "Blog Slug"
// @Param request body BlogUpdateDTO true "Metadata"
// @Success 200 {object} response.SuccessResponse
// @Failure 400 {object} response.ErrorResponse "Bad Request"
// @Failure 401 {object} response.ErrorResponse "Unauthorized"
// @Failure 403 {object} response.ErrorResponse "Forbidden"
// @Failure 404 {object} response.ErrorResponse "Blog not found"
// @Failure 415 {object} response.ErrorResponse "Unsupported media type"
// @Failure 422 {object} response.ErrorResponse "Unprocessable Entity"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/blogs/{slug} [patch]
func (h *Handler) UpdateBlogMetadata(c echo.Context) error {
	slug := c.Param("slug")
	var req BlogUpdateDTO
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

	if err := h.blogUsecase.UpdateBlogMetadata(c.Request().Context(), slug, views, likes); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to update metadata")
	}
	return response.SuccessNoData(c, http.StatusOK, "Blog metadata updated successfully")
}
