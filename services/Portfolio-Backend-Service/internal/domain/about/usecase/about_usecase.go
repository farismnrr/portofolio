package usecase

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/repository"
)

type AboutUsecase interface {
	GetAbout(ctx context.Context) (*entity.About, error)
	UpdateAbout(ctx context.Context, about *entity.About) error
}

type aboutUsecase struct {
	repo repository.AboutRepository
}

func NewAboutUsecase(repo repository.AboutRepository) AboutUsecase {
	return &aboutUsecase{repo: repo}
}

func (u *aboutUsecase) GetAbout(ctx context.Context) (*entity.About, error) {
	return u.repo.Get(ctx)
}

func (u *aboutUsecase) UpdateAbout(ctx context.Context, about *entity.About) error {
	return u.repo.Update(ctx, about)
}
