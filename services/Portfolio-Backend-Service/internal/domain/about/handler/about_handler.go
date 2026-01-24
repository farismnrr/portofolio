package handler

import (
	"net/http"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/usecase"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/response"
	"github.com/labstack/echo/v4"
)

type AboutHandler struct {
	usecase usecase.AboutUsecase
}

func NewAboutHandler(u usecase.AboutUsecase) *AboutHandler {
	return &AboutHandler{usecase: u}
}

func (h *AboutHandler) GetAbout(c echo.Context) error {
	about, err := h.usecase.GetAbout(c.Request().Context())
	if err != nil {
		return response.ErrorWithData(c, http.StatusInternalServerError, "Failed to get about information", err.Error())
	}

	if about == nil {
		return response.Success(c, http.StatusOK, "About information is empty", nil)
	}

	res := AboutResponse{
		ID:          about.ID.String(),
		Name:        about.Name,
		Role:        about.Role,
		Description: about.Description,
		Avatar:      about.Avatar,
	}

	return response.Success(c, http.StatusOK, "About information retrieved successfully", res)
}

func (h *AboutHandler) UpdateAbout(c echo.Context) error {
	var req UpdateAboutRequest
	if err := c.Bind(&req); err != nil {
		return response.ErrorWithData(c, http.StatusBadRequest, "Invalid request payload", err.Error())
	}

	about := &entity.About{
		Name:        req.Name,
		Role:        req.Role,
		Description: req.Description,
		Avatar:      req.Avatar,
	}

	if err := h.usecase.UpdateAbout(c.Request().Context(), about); err != nil {
		return response.ErrorWithData(c, http.StatusInternalServerError, "Failed to update about information", err.Error())
	}

	return response.Success(c, http.StatusOK, "About information updated successfully", nil)
}
