package handler

import (
	"net/http"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/response"
	"github.com/labstack/echo/v4"
)

func (h *Handler) GetBlog(c echo.Context) error {
	slug := c.Param("slug")
	blog, err := h.blogUsecase.GetBlog(c.Request().Context(), slug)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Blog not found")
	}
	return response.Success(c, http.StatusOK, "Blog metadata retrieved", blog)
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

func (h *Handler) UpdateBlog(c echo.Context) error {
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
