package usecase

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/repository"
)

type BlogUsecase interface {
	GetBlog(ctx context.Context, slug string) (*entity.BlogsMetadata, error)
	IncrementBlogViews(ctx context.Context, slug string) error
	IncrementBlogLikes(ctx context.Context, slug string) error
	UpdateBlogMetadata(ctx context.Context, slug string, views, likes int) error
}

type blogUsecase struct {
	repo repository.BlogRepository
}

func NewBlogUsecase(repo repository.BlogRepository) BlogUsecase {
	return &blogUsecase{repo: repo}
}

func (u *blogUsecase) GetBlog(ctx context.Context, slug string) (*entity.BlogsMetadata, error) {
	return u.repo.GetBlogMetadata(ctx, slug)
}

func (u *blogUsecase) IncrementBlogViews(ctx context.Context, slug string) error {
	return u.repo.IncrementBlogViews(ctx, slug)
}

func (u *blogUsecase) IncrementBlogLikes(ctx context.Context, slug string) error {
	return u.repo.IncrementBlogLikes(ctx, slug)
}

func (u *blogUsecase) UpdateBlogMetadata(ctx context.Context, slug string, views, likes int) error {
	return u.repo.UpdateBlogMetadata(ctx, slug, views, likes)
}
