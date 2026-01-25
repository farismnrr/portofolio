package handler

import (
	"net/http"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/usecase"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/response"
	"github.com/labstack/echo/v4"
)

type WorkHandler struct {
	usecase usecase.WorkUsecase
}

func NewWorkHandler(u usecase.WorkUsecase) *WorkHandler {
	return &WorkHandler{usecase: u}
}

// GetWorkExperiences retrieves user's work history including achievements
// @Summary Get Work Experiences
// @Description Retrieves user's work history including achievements.
// @Tags About
// @Accept json
// @Produce json
// @Success 200 {object} response.SuccessResponse{data=map[string][]entity.WorkExperience} "Successfully Retrieve"
// @Failure 401 {object} response.ErrorResponse "Unauthorized (Missing or Invalid Token)"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/work-experiences [get]
func (h *WorkHandler) GetWorkExperiences(c echo.Context) error {
	works, err := h.usecase.GetWorkExperiences(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}
	return response.Success(c, http.StatusOK, "Work experiences retrieved successfully", map[string]interface{}{"work_experiences": works})
}

type CreateWorkRequestFull struct {
	Company     string `json:"company"`
	Role        string `json:"role"`
	Timeframe   string `json:"timeframe"`
	Description string `json:"description"`
	OrderBy     *int   `json:"order_by"`
	AboutID     string `json:"about_id"`
}

// CreateWorkExperience adds a new job entry
// @Summary Create Work Experience
// @Description Adds a new job entry.
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CreateWorkRequestFull true "Work Data"
// @Success 201 {object} response.SuccessResponse "Created"
// @Failure 401 {object} response.ErrorResponse "Unauthorized (Missing or Invalid Token)"
// @Failure 403 {object} response.ErrorResponse "Forbidden (Insufficient Permissions)"
// @Failure 422 {object} response.ErrorResponse "Validation Failed"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/work-experiences [post]
func (h *WorkHandler) CreateWorkExperience(c echo.Context) error {
	var req CreateWorkRequestFull
	// Strict Content-Type check
	if c.Request().Header.Get("Content-Type") != "application/json" {
		return response.Error(c, http.StatusUnsupportedMediaType, "Unsupported media type")
	}

	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request payload")
	}

	// Validation
	var details []map[string]string
	if req.Company == "" {
		details = append(details, map[string]string{"field": "company", "message": "Company is required"})
	}
	if req.Role == "" {
		details = append(details, map[string]string{"field": "role", "message": "Role is required"})
	}
	if req.Timeframe == "" {
		details = append(details, map[string]string{"field": "timeframe", "message": "Timeframe is required"})
	}

	if len(details) > 0 {
		return response.ValidationError(c, "Validation failed", details)
	}

	work := &entity.WorkExperience{
		Company:     req.Company,
		Role:        req.Role,
		Timeframe:   req.Timeframe,
		Description: req.Description,
		AboutID:     req.AboutID,
	}

	if req.OrderBy != nil {
		work.OrderBy = *req.OrderBy
	}

	if err := h.usecase.CreateWorkExperience(c.Request().Context(), work); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}

	return response.Success(c, http.StatusCreated, "Work experience created successfully", map[string]interface{}{"experience_id": work.ID})
}

// UpdateWorkExperience updates work experience details
// @Summary Update Work Experience
// @Description Updates company, role, timeframe, or description.
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Work ID"
// @Param request body CreateWorkRequestFull true "Work Data"
// @Success 200 {object} response.SuccessResponse "Successfully Updated"
// @Failure 401 {object} response.ErrorResponse "Unauthorized (Missing or Invalid Token)"
// @Failure 403 {object} response.ErrorResponse "Forbidden (Insufficient Permissions)"
// @Failure 404 {object} response.ErrorResponse "Not Found"
// @Failure 422 {object} response.ErrorResponse "Validation Failed"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/work-experiences/{id} [patch]
func (h *WorkHandler) UpdateWorkExperience(c echo.Context) error {
	id := c.Param("id")

	existing, err := h.usecase.GetWorkExperienceByID(c.Request().Context(), id)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Work experience not found")
	}

	var req CreateWorkRequestFull
	// Strict Content-Type check
	if c.Request().Header.Get("Content-Type") != "application/json" {
		return response.Error(c, http.StatusUnsupportedMediaType, "Unsupported media type")
	}

	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request payload")
	}

	if req.Company != "" {
		existing.Company = req.Company
	}
	if req.Role != "" {
		existing.Role = req.Role
	}
	if req.Timeframe != "" {
		existing.Timeframe = req.Timeframe
	}
	if req.Description != "" {
		existing.Description = req.Description
	}
	if req.OrderBy != nil {
		existing.OrderBy = *req.OrderBy
	}

	if err := h.usecase.UpdateWorkExperience(c.Request().Context(), existing); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}

	return response.SuccessNoData(c, http.StatusOK, "Work experience updated successfully")
}

// DeleteWorkExperience deletes a job entry
// @Summary Delete Work Experience
// @Description Deletes a job entry.
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Work ID"
// @Success 200 {object} response.SuccessResponse "Successfully Deleted"
// @Failure 401 {object} response.ErrorResponse "Unauthorized (Missing or Invalid Token)"
// @Failure 403 {object} response.ErrorResponse "Forbidden (Insufficient Permissions)"
// @Failure 404 {object} response.ErrorResponse "Not Found"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/work-experiences/{id} [delete]
func (h *WorkHandler) DeleteWorkExperience(c echo.Context) error {
	id := c.Param("id")

	_, err := h.usecase.GetWorkExperienceByID(c.Request().Context(), id)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Work experience not found")
	}

	if err := h.usecase.DeleteWorkExperience(c.Request().Context(), id); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}
	return response.SuccessNoData(c, http.StatusOK, "Work experience deleted successfully")
}
