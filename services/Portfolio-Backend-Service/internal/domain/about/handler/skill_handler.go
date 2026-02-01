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

// GetSkills retrieves all skill categories and their associated tags
// @Summary Get Skills
// @Description Retrieves all skill categories and their associated tags.
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.SuccessResponse{data=map[string][]entity.SkillCategory} "Successfully Retrieve"
// @Failure 401 {object} response.ErrorResponse "Unauthorized (Missing or Invalid Token)"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/skills [get]
func (h *SkillHandler) GetSkills(c echo.Context) error {
	cats, err := h.usecase.GetSkillCategories(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}
	return response.Success(c, http.StatusOK, "Skills retrieved successfully", map[string]interface{}{"skill_categories": cats})
}

type TagRequest struct {
	Name    string `json:"name"`
	Icon    string `json:"icon"`
	OrderBy *int   `json:"order_by"`
}

type CreateCategoryRequest struct {
	Title       string       `json:"title"`
	Description string       `json:"description"`
	OrderBy     *int         `json:"order_by"`
	AboutID     string       `json:"about_id"`
	Tags        []TagRequest `json:"tags"`
}

// CreateCategory adds a new category of skills
// @Summary Create Skill Category
// @Description Adds a new category of skills.
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CreateCategoryRequest true "Category Data"
// @Success 201 {object} response.SuccessResponse "Created"
// @Failure 401 {object} response.ErrorResponse "Unauthorized (Missing or Invalid Token)"
// @Failure 403 {object} response.ErrorResponse "Forbidden (Insufficient Permissions)"
// @Failure 422 {object} response.ErrorResponse "Validation Failed"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/skills [post]
func (h *SkillHandler) CreateCategory(c echo.Context) error {
	var req CreateCategoryRequest
	// Strict Content-Type check
	if c.Request().Header.Get("Content-Type") != "application/json" {
		return response.Error(c, http.StatusUnsupportedMediaType, "Unsupported media type")
	}

	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request payload")
	}

	if req.Title == "" {
		return response.ValidationError(c, "Validation failed", []map[string]string{{"field": "title", "message": "Title is required"}})
	}

	cat := &entity.SkillCategory{
		Title:       req.Title,
		Description: req.Description,
		AboutID:     req.AboutID,
	}

	if req.OrderBy != nil {
		cat.OrderBy = *req.OrderBy
	}

	for _, t := range req.Tags {
		tag := entity.SkillTag{
			Name: t.Name,
			Icon: t.Icon,
		}
		if t.OrderBy != nil {
			tag.OrderBy = *t.OrderBy
		}
		cat.Tags = append(cat.Tags, tag)
	}

	if err := h.usecase.CreateCategory(c.Request().Context(), cat); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}

	return response.Success(c, http.StatusCreated, "Skill category created successfully", map[string]interface{}{"category_id": cat.ID})
}

// UpdateCategory updates category details
// @Summary Update Skill Category
// @Description Updates category details.
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Category ID"
// @Param request body CreateCategoryRequest true "Category Data"
// @Success 200 {object} response.SuccessResponse "Successfully Updated"
// @Failure 401 {object} response.ErrorResponse "Unauthorized (Missing or Invalid Token)"
// @Failure 403 {object} response.ErrorResponse "Forbidden (Insufficient Permissions)"
// @Failure 404 {object} response.ErrorResponse "Not Found"
// @Failure 422 {object} response.ErrorResponse "Validation Failed"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/skills/{id} [patch]
func (h *SkillHandler) UpdateCategory(c echo.Context) error {
	id := c.Param("id")

	existing, err := h.usecase.GetCategoryByID(c.Request().Context(), id)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Skill category not found")
	}

	var req CreateCategoryRequest
	// Strict Content-Type check
	if c.Request().Header.Get("Content-Type") != "application/json" {
		return response.Error(c, http.StatusUnsupportedMediaType, "Unsupported media type")
	}

	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request payload")
	}

	if req.Title != "" {
		existing.Title = req.Title
	}
	if req.Description != "" {
		existing.Description = req.Description
	}
	if req.OrderBy != nil {
		existing.OrderBy = *req.OrderBy
	}

	if err := h.usecase.UpdateCategory(c.Request().Context(), existing); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}

	return response.SuccessNoData(c, http.StatusOK, "Skill category updated successfully")
}

// DeleteCategory deletes a category and all its tags
// @Summary Delete Skill Category
// @Description Deletes a category and all its tags.
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Category ID"
// @Success 200 {object} response.SuccessResponse "Successfully Deleted (Soft Delete)"
// @Failure 401 {object} response.ErrorResponse "Unauthorized (Missing or Invalid Token)"
// @Failure 403 {object} response.ErrorResponse "Forbidden (Insufficient Permissions)"
// @Failure 404 {object} response.ErrorResponse "Not Found"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/skills/{id} [delete]
func (h *SkillHandler) DeleteCategory(c echo.Context) error {
	id := c.Param("id")

	_, err := h.usecase.GetCategoryByID(c.Request().Context(), id)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Skill category not found")
	}

	if err := h.usecase.DeleteCategory(c.Request().Context(), id); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}
	return response.SuccessNoData(c, http.StatusOK, "Skill category deleted successfully")
}

// AddTag adds a specific skill tag to a category
// @Summary Add Skill Tag
// @Description Adds a specific skill tag to a category.
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Category ID"
// @Param request body TagRequest true "Tag Data"
// @Success 201 {object} response.SuccessResponse "Successfully Created"
// @Failure 401 {object} response.ErrorResponse "Unauthorized (Missing or Invalid Token)"
// @Failure 403 {object} response.ErrorResponse "Forbidden (Insufficient Permissions)"
// @Failure 404 {object} response.ErrorResponse "Skill Category Not Found"
// @Failure 422 {object} response.ErrorResponse "Validation Failed"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/skills/{id}/tags [post]
func (h *SkillHandler) AddTag(c echo.Context) error {
	catID := c.Param("id")

	_, err := h.usecase.GetCategoryByID(c.Request().Context(), catID)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Skill category not found")
	}

	var req TagRequest
	// Strict Content-Type check
	if c.Request().Header.Get("Content-Type") != "application/json" {
		return response.Error(c, http.StatusUnsupportedMediaType, "Unsupported media type")
	}

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
	}

	if req.OrderBy != nil {
		tag.OrderBy = *req.OrderBy
	}

	if err := h.usecase.AddTag(c.Request().Context(), tag); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}
	return response.Success(c, http.StatusCreated, "Skill tag added successfully", map[string]interface{}{"tag_id": tag.ID})
}

// DeleteTag removes a specific tag
// @Summary Delete Skill Tag
// @Description Removes a specific tag.
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param tag_id path string true "Tag ID"
// @Success 200 {object} response.SuccessResponse "Successfully Deleted (Soft Delete)"
// @Failure 401 {object} response.ErrorResponse "Unauthorized (Missing or Invalid Token)"
// @Failure 403 {object} response.ErrorResponse "Forbidden (Insufficient Permissions)"
// @Failure 404 {object} response.ErrorResponse "Skill Tag Not Found"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/skills/tags/{tag_id} [delete]
func (h *SkillHandler) DeleteTag(c echo.Context) error {
	id := c.Param("tag_id")

	_, err := h.usecase.GetTagByID(c.Request().Context(), id)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Skill tag not found")
	}

	if err := h.usecase.DeleteTag(c.Request().Context(), id); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}
	return response.SuccessNoData(c, http.StatusOK, "Skill tag deleted successfully")
}
