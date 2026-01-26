package handler

type CreateCommentDTO struct {
	PostType string  `json:"post_type" validate:"required,oneof=work blog"`
	PostSlug string  `json:"post_slug" validate:"required"`
	UserName string  `json:"user_name" validate:"required"`
	Email    string  `json:"email" validate:"required,email"`
	Content  string  `json:"content" validate:"required"`
	ParentID *string `json:"parent_id"`
}
