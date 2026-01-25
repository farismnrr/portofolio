package handler

type DashboardResponse struct {
	Message  string `json:"message"`
	Username string `json:"username"`
	Role     string `json:"role"`
}
