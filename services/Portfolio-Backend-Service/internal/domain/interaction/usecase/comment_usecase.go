package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/repository"
	"github.com/google/uuid"
)

type CommentUsecase interface {
	CreateComment(ctx context.Context, req CreateCommentRequest) error
	GetComments(ctx context.Context, postType, postSlug string) ([]entity.Comment, error)
	DeleteComment(ctx context.Context, id, userRole string) error
}

type commentUsecase struct {
	repo repository.CommentRepository
}

func NewCommentUsecase(repo repository.CommentRepository) CommentUsecase {
	return &commentUsecase{repo: repo}
}

// DTOs (Internal to Usecase/Handler boundary, or defined here)
type CreateCommentRequest struct {
	PostType string
	PostSlug string
	UserName string
	Email    string
	Content  string
	ParentID *string
}

func (u *commentUsecase) CreateComment(ctx context.Context, req CreateCommentRequest) error {
	if req.PostType != "work" && req.PostType != "blog" {
		return errors.New("invalid post type")
	}

	comment := &entity.Comment{
		Base: entity.Base{
			ID:        uuid.New().String(),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		PostType: req.PostType,
		PostSlug: req.PostSlug,
		UserName: req.UserName,
		Email:    req.Email,
		Content:  req.Content,
		ParentID: req.ParentID,
	}

	return u.repo.CreateComment(ctx, comment)
}

func (u *commentUsecase) GetComments(ctx context.Context, postType, postSlug string) ([]entity.Comment, error) {
	return u.repo.GetCommentsByPost(ctx, postType, postSlug)
}

func (u *commentUsecase) DeleteComment(ctx context.Context, id, userRole string) error {
	// Check if exists
	_, err := u.repo.GetCommentByID(ctx, id)
	if err != nil {
		return err
	}

	// Authorization Check: Only Admin can delete comments
	if userRole != "admin" {
		return errors.New("unauthorized: admin role required")
	}

	return u.repo.DeleteComment(ctx, id)
}
