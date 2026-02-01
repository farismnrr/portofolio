package handler

import (
	"net/http"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/usecase"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/response"
	"github.com/labstack/echo/v4"
)

type EducationHandler struct {
	usecase usecase.EducationUsecase
}

func NewEducationHandler(u usecase.EducationUsecase) *EducationHandler {
	return &EducationHandler{usecase: u}
}

// GetEducations retrieves list of degrees and institutions
// @Summary Get Educations
// @Description Retrieves list of degrees and institutions.
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.SuccessResponse{data=map[string][]entity.Education} "Successfully Retrieve"
// @Failure 401 {object} response.ErrorResponse "Unauthorized (Missing or Invalid Token)"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/education [get]
func (h *EducationHandler) GetEducations(c echo.Context) error {
	edus, err := h.usecase.GetEducations(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}
	return response.Success(c, http.StatusOK, "Education history retrieved successfully", map[string]interface{}{"educations": edus})
}

type CreateEducationRequest struct {
	Institution string `json:"institution"`
	Degree      string `json:"degree"`
	Period      string `json:"period"`
	Description string `json:"description"`
	OrderBy     *int   `json:"order_by"`
	AboutID     string `json:"about_id"`
}

// CreateEducation adds a new education entry
// @Summary Create Education
// @Description Adds a new education entry.
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CreateEducationRequest true "Education Data"
// @Success 201 {object} response.SuccessResponse "Created"
// @Failure 401 {object} response.ErrorResponse "Unauthorized (Missing or Invalid Token)"
// @Failure 403 {object} response.ErrorResponse "Forbidden (Insufficient Permissions)"
// @Failure 422 {object} response.ErrorResponse "Validation Failed"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/education [post]
func (h *EducationHandler) CreateEducation(c echo.Context) error {
	var req CreateEducationRequest
	// Strict Content-Type check
	if c.Request().Header.Get("Content-Type") != "application/json" {
		return response.Error(c, http.StatusUnsupportedMediaType, "Unsupported media type")
	}

	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request payload")
	}

	var details []map[string]string
	if req.Institution == "" {
		details = append(details, map[string]string{"field": "institution", "message": "Institution is required"})
	}
	if req.Degree == "" {
		details = append(details, map[string]string{"field": "degree", "message": "Degree is required"})
	}
	if req.Period == "" {
		details = append(details, map[string]string{"field": "period", "message": "Period is required"})
	}

	if len(details) > 0 {
		return response.ValidationError(c, "Validation failed", details)
	}

	edu := &entity.Education{
		Institution: req.Institution,
		Degree:      req.Degree,
		Period:      req.Period,
		Description: req.Description,
		AboutID:     req.AboutID,
	}

	if req.OrderBy != nil {
		edu.OrderBy = *req.OrderBy
	}

	if err := h.usecase.CreateEducation(c.Request().Context(), edu); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}

	return response.Success(c, http.StatusCreated, "Education entry created successfully", map[string]interface{}{"education_id": edu.ID})
}

// UpdateEducation updates an education record
// @Summary Update Education
// @Description Updates an education record.
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Education ID"
// @Param request body CreateEducationRequest true "Education Data"
// @Success 200 {object} response.SuccessResponse "Successfully Updated"
// @Failure 401 {object} response.ErrorResponse "Unauthorized (Missing or Invalid Token)"
// @Failure 403 {object} response.ErrorResponse "Forbidden (Insufficient Permissions)"
// @Failure 404 {object} response.ErrorResponse "Not Found"
// @Failure 422 {object} response.ErrorResponse "Validation Failed"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/education/{id} [patch]
func (h *EducationHandler) UpdateEducation(c echo.Context) error {
	id := c.Param("id")

	existing, err := h.usecase.GetEducationByID(c.Request().Context(), id)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Education entry not found")
	}

	var req CreateEducationRequest

	// Strict Content-Type check
	if c.Request().Header.Get("Content-Type") != "application/json" {
		return response.Error(c, http.StatusUnsupportedMediaType, "Unsupported media type")
	}

	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request payload")
	}

	if req.Institution != "" {
		existing.Institution = req.Institution
	}
	if req.Degree != "" {
		existing.Degree = req.Degree
	}
	if req.Period != "" {
		existing.Period = req.Period
	}
	if req.Description != "" {
		existing.Description = req.Description
	}
	if req.OrderBy != nil {
		existing.OrderBy = *req.OrderBy
	}

	if err := h.usecase.UpdateEducation(c.Request().Context(), existing); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}

	return response.SuccessNoData(c, http.StatusOK, "Education entry updated successfully")
}

// DeleteEducation removes an education record
// @Summary Delete Education
// @Description Removes an education record (Soft Delete).
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Education ID"
// @Success 200 {object} response.SuccessResponse "Successfully Deleted"
// @Failure 401 {object} response.ErrorResponse "Unauthorized (Missing or Invalid Token)"
// @Failure 403 {object} response.ErrorResponse "Forbidden (Insufficient Permissions)"
// @Failure 404 {object} response.ErrorResponse "Not Found"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/education/{id} [delete]
func (h *EducationHandler) DeleteEducation(c echo.Context) error {
	id := c.Param("id")

	_, err := h.usecase.GetEducationByID(c.Request().Context(), id)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Education entry not found")
	}

	if err := h.usecase.DeleteEducation(c.Request().Context(), id); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}
	return response.SuccessNoData(c, http.StatusOK, "Education entry deleted successfully")
}
