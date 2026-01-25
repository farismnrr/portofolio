package handler

import (
	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/usecase"
)

type Handler struct {
	workUsecase    usecase.WorkUsecase
	blogUsecase    usecase.BlogUsecase
	commentUsecase usecase.CommentUsecase
}

func NewHandler(
	workUsecase usecase.WorkUsecase,
	blogUsecase usecase.BlogUsecase,
	commentUsecase usecase.CommentUsecase,
) *Handler {
	return &Handler{
		workUsecase:    workUsecase,
		blogUsecase:    blogUsecase,
		commentUsecase: commentUsecase,
	}
}
