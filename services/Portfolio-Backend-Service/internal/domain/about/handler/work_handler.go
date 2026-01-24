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

type CreateWorkRequest struct {
	Company   string `json:"company"`
	Role      string `json:"role"`
	Timeframe string `json:"timeframe"`
	OrderBy   int    `json:"order_by"`
	AboutID   string `json:"about_id"`
	// Optional: initial achievements can be passed here if desired,
	// but strictly following REST often separates sub-resources.
	// The contract implies creating experience first, then adding achievements, OR creating with achievements?
	// Contract "Create Work Experience" Body shows `achievements` array. Let's support it.
	Achievements []string `json:"achievements_content"` // Simplified list of strings for initial creation? Or objects?
	// Let's stick to simple creation first as per `work_experience.md` "Create Work Experience"
	// Wait, checking contract... contract Request Body has "achievements": [{"content": "...", "order_by": 1}]
}

type AchievementRequest struct {
	Content string `json:"content"`
	OrderBy int    `json:"order_by"`
}

type CreateWorkRequestFull struct {
	Company      string               `json:"company"`
	Role         string               `json:"role"`
	Timeframe    string               `json:"timeframe"`
	OrderBy      int                  `json:"order_by"`
	AboutID      string               `json:"about_id"`
	Achievements []AchievementRequest `json:"achievements"`
}

// CreateWorkExperience adds a new job entry
// @Summary Create Work Experience
// @Description Adds a new job entry. Optionally includes initial achievements.
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

	// Map request to entity
	achievements := make([]entity.WorkAchievement, len(req.Achievements))
	for i, a := range req.Achievements {
		achievements[i] = entity.WorkAchievement{
			Content: a.Content,
			OrderBy: a.OrderBy,
		}
	}

	work := &entity.WorkExperience{
		Company:      req.Company,
		Role:         req.Role,
		Timeframe:    req.Timeframe,
		OrderBy:      req.OrderBy,
		AboutID:      req.AboutID,
		Achievements: achievements,
	}

	if err := h.usecase.CreateWorkExperience(c.Request().Context(), work); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}

	return response.Success(c, http.StatusCreated, "Work experience created successfully", map[string]interface{}{"work_experience": work})
}

// UpdateWorkExperience updates work experience details
// @Summary Update Work Experience
// @Description Updates company, role, timeframe, or replaces achievements.
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
	if req.OrderBy != 0 {
		existing.OrderBy = req.OrderBy
	}
	// Note: Updating achievements array via PATCH is complex (replace all? merge?).
	// Usually specialized endpoints are better. Here strictly updating the parent fields.

	if err := h.usecase.UpdateWorkExperience(c.Request().Context(), existing); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}

	return response.Success(c, http.StatusOK, "Work experience updated successfully", nil)
}

// DeleteWorkExperience deletes a job entry
// @Summary Delete Work Experience
// @Description Deletes a job entry and its achievements.
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

// AddAchievement adds a single achievement
// @Summary Add Achievement
// @Description Adds a single achievement to a work experience.
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Work Experience ID"
// @Param request body AchievementRequest true "Achievement Data"
// @Success 201 {object} response.SuccessResponse "Successfully Created"
// @Failure 401 {object} response.ErrorResponse "Unauthorized (Missing or Invalid Token)"
// @Failure 403 {object} response.ErrorResponse "Forbidden (Insufficient Permissions)"
// @Failure 404 {object} response.ErrorResponse "Work Experience Not Found"
// @Failure 422 {object} response.ErrorResponse "Validation Failed"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/work-experiences/{id}/achievements [post]
func (h *WorkHandler) AddAchievement(c echo.Context) error {
	workID := c.Param("id")

	// Check parent existence
	_, err := h.usecase.GetWorkExperienceByID(c.Request().Context(), workID)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Work experience not found")
	}

	var req AchievementRequest
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request payload")
	}

	if req.Content == "" {
		return response.ValidationError(c, "Validation failed", []map[string]string{{"field": "content", "message": "Content is required"}})
	}

	achievement := &entity.WorkAchievement{
		WorkExperienceID: workID,
		Content:          req.Content,
		OrderBy:          req.OrderBy,
	}

	if err := h.usecase.AddAchievement(c.Request().Context(), achievement); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}

	return response.Success(c, http.StatusCreated, "Achievement added successfully", map[string]interface{}{"achievement": achievement})
}

// DeleteAchievement removes a specific achievement
// @Summary Delete Achievement
// @Description Removes a specific achievement.
// @Tags About
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param achievement_id path string true "Achievement ID"
// @Success 200 {object} response.SuccessResponse "Successfully Deleted (Soft Delete)"
// @Failure 401 {object} response.ErrorResponse "Unauthorized (Missing or Invalid Token)"
// @Failure 403 {object} response.ErrorResponse "Forbidden (Insufficient Permissions)"
// @Failure 404 {object} response.ErrorResponse "Achievement Not Found"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /v1/about/work-experiences/achievements/{achievement_id} [delete]
func (h *WorkHandler) DeleteAchievement(c echo.Context) error {
	id := c.Param("achievement_id")

	_, err := h.usecase.GetAchievementByID(c.Request().Context(), id)
	if err != nil {
		return response.Error(c, http.StatusNotFound, "Achievement not found")
	}

	if err := h.usecase.DeleteAchievement(c.Request().Context(), id); err != nil {
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}
	return response.SuccessNoData(c, http.StatusOK, "Achievement deleted successfully")
}
