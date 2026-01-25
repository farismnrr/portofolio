package usecase

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/repository"
)

type WorkUsecase interface {
	GetWork(ctx context.Context, slug string) (*entity.WorksMetadata, error)
	IncrementWorkViews(ctx context.Context, slug string) error
	IncrementWorkLikes(ctx context.Context, slug string) error
	UpdateWorkMetadata(ctx context.Context, slug string, views, likes int) error
}

type workUsecase struct {
	repo repository.WorkRepository
}

func NewWorkUsecase(repo repository.WorkRepository) WorkUsecase {
	return &workUsecase{repo: repo}
}

func (u *workUsecase) GetWork(ctx context.Context, slug string) (*entity.WorksMetadata, error) {
	return u.repo.GetWorkMetadata(ctx, slug)
}

func (u *workUsecase) IncrementWorkViews(ctx context.Context, slug string) error {
	return u.repo.IncrementWorkViews(ctx, slug)
}

func (u *workUsecase) IncrementWorkLikes(ctx context.Context, slug string) error {
	return u.repo.IncrementWorkLikes(ctx, slug)
}

func (u *workUsecase) UpdateWorkMetadata(ctx context.Context, slug string, views, likes int) error {
	return u.repo.UpdateWorkMetadata(ctx, slug, views, likes)
}
