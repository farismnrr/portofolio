package handler

import (
	"net/http"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/response"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/entity"
	"github.com/labstack/echo/v4"
)

func (h *Handler) GetBlog(c echo.Context) error {
	slug := c.Param("slug")
	blog, err := h.blogUsecase.GetBlog(c.Request().Context(), slug)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Blog not found")
	}
	return response.Success(c, http.StatusOK, "Blog retrieved", blog)
}

func (h *Handler) ListBlogs(c echo.Context) error {
	blogs, err := h.blogUsecase.ListBlogs(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to list blogs")
	}
	return response.Success(c, http.StatusOK, "Blogs retrieved", blogs)
}

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

func (h *Handler) DeleteBlog(c echo.Context) error {
	id := c.Param("id")
	if err := h.blogUsecase.DeleteBlog(c.Request().Context(), id); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to delete blog")
	}
	return response.SuccessNoData(c, http.StatusOK, "Blog deleted successfully")
}

func (h *Handler) ViewBlog(c echo.Context) error {
	slug := c.Param("slug")
	if err := h.blogUsecase.IncrementBlogViews(c.Request().Context(), slug); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to increment view")
	}
	return response.SuccessNoData(c, http.StatusOK, "View incremented")
}

func (h *Handler) LikeBlog(c echo.Context) error {
	slug := c.Param("slug")
	if err := h.blogUsecase.IncrementBlogLikes(c.Request().Context(), slug); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to increment like")
	}
	return response.SuccessNoData(c, http.StatusOK, "Like incremented")
}

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
