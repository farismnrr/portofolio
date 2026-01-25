package handler

// WorkUpdateDTO for updating work metadata
type WorkUpdateDTO struct {
	ViewsCount *int `json:"views_count"`
	LikesCount *int `json:"likes_count"`
}
