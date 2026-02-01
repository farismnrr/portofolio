package handler

import (
	"net/http"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/response"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/usecase"
	"github.com/labstack/echo/v4"
)

// CreateComment adds a public comment
func (h *Handler) CreateComment(c echo.Context) error {
	var req CreateCommentDTO
	// Strict Content-Type check
	if c.Request().Header.Get("Content-Type") != "application/json" {
		return response.Error(c, http.StatusUnsupportedMediaType, "Unsupported media type")
	}

	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request body")
	}

	// Manual validation or use validator
	if req.PostType != "work" && req.PostType != "blog" {
		return response.Error(c, http.StatusUnprocessableEntity, "Invalid post_type")
	}
	if req.PostSlug == "" || req.UserName == "" || req.Email == "" || req.Content == "" {
		return response.Error(c, http.StatusUnprocessableEntity, "Missing required fields")
	}

	err := h.commentUsecase.CreateComment(c.Request().Context(), usecase.CreateCommentRequest{
		PostType: req.PostType,
		PostSlug: req.PostSlug,
		UserName: req.UserName,
		Email:    req.Email,
		Content:  req.Content,
		ParentID: req.ParentID,
	})
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to create comment")
	}

	return response.SuccessNoData(c, http.StatusCreated, "Comment added successfully")
}

// GetComments retrieves comments for a post
func (h *Handler) GetComments(c echo.Context) error {
	postType := c.Param("post_type")
	postSlug := c.Param("post_slug")

	comments, err := h.commentUsecase.GetComments(c.Request().Context(), postType, postSlug)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to fetch comments")
	}

	return response.Success(c, http.StatusOK, "Comments retrieved", comments)
}

// UpdateComment updates an existing comment (Admin only)
func (h *Handler) UpdateComment(c echo.Context) error {
	id := c.Param("id")
	
	var req struct {
		Content string `json:"content"`
	}
	
	if c.Request().Header.Get("Content-Type") != "application/json" {
		return response.Error(c, http.StatusUnsupportedMediaType, "Unsupported media type")
	}
	
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request body")
	}
	
	if req.Content == "" {
		return response.Error(c, http.StatusUnprocessableEntity, "Content is required")
	}
	
	// Get role from context
	role, ok := c.Get("role").(string)
	if !ok {
		return response.Error(c, http.StatusUnauthorized, "Unauthorized")
	}
	
	err := h.commentUsecase.UpdateComment(c.Request().Context(), id, req.Content, role)
	if err != nil {
		return response.Error(c, http.StatusForbidden, err.Error())
	}
	
	return response.SuccessNoData(c, http.StatusOK, "Comment updated successfully")
}

// DeleteComment removes a comment (Admin only)
func (h *Handler) DeleteComment(c echo.Context) error {
	id := c.Param("id")

	// Get role from context (set by middleware)
	role, ok := c.Get("role").(string)
	if !ok {
		// Should be handled by middleware, but safe fallback
		return response.Error(c, http.StatusUnauthorized, "Unauthorized")
	}

	err := h.commentUsecase.DeleteComment(c.Request().Context(), id, role)
	if err != nil {
		return response.Error(c, http.StatusForbidden, err.Error())
	}

	return response.SuccessNoData(c, http.StatusOK, "Comment deleted successfully")
}
