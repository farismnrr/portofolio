package handler

// BlogUpdateDTO for updating blog metadata
type BlogUpdateDTO struct {
	ViewsCount *int `json:"views_count"`
	LikesCount *int `json:"likes_count"`
}
