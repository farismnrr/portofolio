package handler

type AboutResponse struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Role        string `json:"role"`
	Description string `json:"description"`
	Avatar      string `json:"avatar"`
}

type UpdateAboutRequest struct {
	Name        string `json:"name" validate:"required"`
	Role        string `json:"role" validate:"required"`
	Description string `json:"description" validate:"required"`
	Avatar      string `json:"avatar"`
}
