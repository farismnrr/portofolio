package handler

import (
	"errors"
	"net/http"
	"strings"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/response"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/usecase"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// CreateComment adds a public comment
// @Summary Create Comment
// @Description Public endpoint to add a comment to a blog or work post
// @Tags Interaction - Comments
// @Accept json
// @Produce json
// @Param request body CreateCommentDTO true "Comment Data"
// @Success 201 {object} response.SuccessResponse
// @Failure 400 {object} response.ErrorResponse "Bad Request"
// @Failure 415 {object} response.ErrorResponse "Unsupported media type"
// @Failure 422 {object} response.ErrorResponse "Unprocessable Entity"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/blog/{slug}/comments [post]
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
// @Summary Get Comments
// @Description Fetch all comments for a specific blog or work post
// @Tags Interaction - Comments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param slug path string true "Post Slug"
// @Success 200 {object} response.SuccessResponse{data=[]entity.Comment}
// @Failure 401 {object} response.ErrorResponse "Unauthorized"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/blog/{slug}/comments [get]
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
// @Summary Update Comment
// @Description Admin-only endpoint to edit comment content
// @Tags Interaction - Comments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Comment ID"
// @Param request body object{content=string} true "Updated Content"
// @Success 200 {object} response.SuccessResponse
// @Failure 400 {object} response.ErrorResponse "Bad Request"
// @Failure 401 {object} response.ErrorResponse "Unauthorized"
// @Failure 403 {object} response.ErrorResponse "Forbidden"
// @Failure 404 {object} response.ErrorResponse "Comment not found"
// @Failure 415 {object} response.ErrorResponse "Unsupported media type"
// @Failure 422 {object} response.ErrorResponse "Unprocessable Entity"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/comments/{id} [patch]
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
		if errors.Is(err, gorm.ErrRecordNotFound) || strings.Contains(strings.ToLower(err.Error()), "not found") {
			return response.Error(c, http.StatusNotFound, "Comment not found")
		}
		if err.Error() == "unauthorized: admin role required" {
			return response.Error(c, http.StatusForbidden, err.Error())
		}
		return response.Error(c, http.StatusInternalServerError, "Failed to update comment")
	}
	
	return response.SuccessNoData(c, http.StatusOK, "Comment updated successfully")
}

// DeleteComment removes a comment (Admin only)
// @Summary Delete Comment
// @Description Admin-only endpoint to permanently remove a comment
// @Tags Interaction - Comments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Comment ID"
// @Success 200 {object} response.SuccessResponse
// @Failure 401 {object} response.ErrorResponse "Unauthorized"
// @Failure 403 {object} response.ErrorResponse "Forbidden"
// @Failure 404 {object} response.ErrorResponse "Comment not found"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/interactions/comments/{id} [delete]
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
		if errors.Is(err, gorm.ErrRecordNotFound) || strings.Contains(strings.ToLower(err.Error()), "not found") {
			return response.Error(c, http.StatusNotFound, "Comment not found")
		}
		if err.Error() == "unauthorized: admin role required" {
			return response.Error(c, http.StatusForbidden, err.Error())
		}
		return response.Error(c, http.StatusInternalServerError, "Failed to delete comment")
	}

	return response.SuccessNoData(c, http.StatusOK, "Comment deleted successfully")
}
