package handler

import (
	"net/http"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/usecase"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/response"
	"github.com/labstack/echo/v4"
)

type SkillHandler struct {
	usecase usecase.SkillUsecase
}

func NewSkillHandler(u usecase.SkillUsecase) *SkillHandler {
	return &SkillHandler{usecase: u}
}

// GetSkills retrieves list of skill categories with tags
// @Summary Get skills
// @Description Fetch all skills grouped by category
// @Tags About
// @Accept json
// @Produce json
// @Success 200 {object} response.SuccessResponse{data=map[string][]entity.SkillCategory}
// @Failure 500 {object} response.ErrorResponse
// @Router /v1/about/skills [get]
func (h *SkillHandler) GetSkills(c echo.Context) error {
	cats, err := h.usecase.GetSkillCategories(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}
	return response.Success(c, http.StatusOK, "Skills retrieved successfully", map[string]interface{}{"skills": cats})
}

type TagRequest struct {
	Name    string `json:"name"`
	Icon    string `json:"icon"`
	OrderBy int    `json:"order_by"`
}

type CreateCategoryRequest struct {
	Title       string       `json:"title"`
	Description string       `json:"description"`
	OrderBy     int          `json:"order_by"`
	AboutID     string       `json:"about_id"`
	Tags        []TagRequest `json:"tags"`
}

// CreateCategory creates a new skill category
// @Summary Create skill category
// @Description Add a new skill category
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CreateCategoryRequest true "Category Data"
// @Success 201 {object} response.SuccessResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 422 {object} response.ErrorResponse
// @Router /v1/about/skills [post]
func (h *SkillHandler) CreateCategory(c echo.Context) error {
	var req CreateCategoryRequest
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request payload")
	}

	if req.Title == "" {
		return response.ValidationError(c, "Validation failed", []map[string]string{{"field": "title", "message": "Title is required"}})
	}

	tags := make([]entity.SkillTag, len(req.Tags))
	for i, t := range req.Tags {
		tags[i] = entity.SkillTag{
			Name:    t.Name,
			Icon:    t.Icon,
			OrderBy: t.OrderBy,
		}
	}

	cat := &entity.SkillCategory{
		Title:       req.Title,
		Description: req.Description,
		OrderBy:     req.OrderBy,
		AboutID:     req.AboutID,
		Tags:        tags,
	}

	if err := h.usecase.CreateCategory(c.Request().Context(), cat); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}

	return response.Success(c, http.StatusCreated, "Skill category created successfully", map[string]interface{}{"category": cat})
}

// UpdateCategory updates a skill category
// @Summary Update skill category
// @Description Update details of a skill category
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Category ID"
// @Param request body CreateCategoryRequest true "Category Data"
// @Success 200 {object} response.SuccessResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 422 {object} response.ErrorResponse
// @Router /v1/about/skills/{id} [patch]
func (h *SkillHandler) UpdateCategory(c echo.Context) error {
	id := c.Param("id")

	existing, err := h.usecase.GetCategoryByID(c.Request().Context(), id)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Category not found")
	}

	var req CreateCategoryRequest
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request payload")
	}

	if req.Title != "" {
		existing.Title = req.Title
	}
	if req.Description != "" {
		existing.Description = req.Description
	}
	if req.OrderBy != 0 {
		existing.OrderBy = req.OrderBy
	}

	if err := h.usecase.UpdateCategory(c.Request().Context(), existing); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}

	return response.Success(c, http.StatusOK, "Category updated successfully", nil)
}

// DeleteCategory soft deletes a skill category
// @Summary Delete skill category
// @Description Soft delete a skill category
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Category ID"
// @Success 200 {object} response.SuccessResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Router /v1/about/skills/{id} [delete]
func (h *SkillHandler) DeleteCategory(c echo.Context) error {
	id := c.Param("id")

	_, err := h.usecase.GetCategoryByID(c.Request().Context(), id)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Category not found")
	}

	if err := h.usecase.DeleteCategory(c.Request().Context(), id); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}
	return response.SuccessNoData(c, http.StatusOK, "Category deleted successfully")
}

// AddTag adds a tag to a category
// @Summary Add skill tag
// @Description Add a new skill tag to a category
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Category ID"
// @Param request body TagRequest true "Tag Data"
// @Success 201 {object} response.SuccessResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 422 {object} response.ErrorResponse
// @Router /v1/about/skills/{id}/tags [post]
func (h *SkillHandler) AddTag(c echo.Context) error {
	catID := c.Param("id")

	_, err := h.usecase.GetCategoryByID(c.Request().Context(), catID)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Category not found")
	}

	var req TagRequest
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request payload")
	}

	if req.Name == "" {
		return response.ValidationError(c, "Validation failed", []map[string]string{{"field": "name", "message": "Name is required"}})
	}

	tag := &entity.SkillTag{
		SkillCategoryID: catID,
		Name:            req.Name,
		Icon:            req.Icon,
		OrderBy:         req.OrderBy,
	}

	if err := h.usecase.AddTag(c.Request().Context(), tag); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}
	return response.Success(c, http.StatusCreated, "Tag added successfully", map[string]interface{}{"tag": tag})
}

// DeleteTag deletes a skill tag
// @Summary Delete skill tag
// @Description Soft delete a skill tag
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param tag_id path string true "Tag ID"
// @Success 200 {object} response.SuccessResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Router /v1/about/skills/tags/{tag_id} [delete]
func (h *SkillHandler) DeleteTag(c echo.Context) error {
	id := c.Param("tag_id")

	_, err := h.usecase.GetTagByID(c.Request().Context(), id)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Tag not found")
	}

	if err := h.usecase.DeleteTag(c.Request().Context(), id); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}
	return response.SuccessNoData(c, http.StatusOK, "Tag deleted successfully")
}
