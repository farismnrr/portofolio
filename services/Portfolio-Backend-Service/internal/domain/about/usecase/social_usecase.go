package usecase

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/repository"
	"github.com/google/uuid"
)

type SocialUsecase interface {
	GetSocialLinks(ctx context.Context) ([]entity.SocialLink, error)
	CreateSocialLink(ctx context.Context, social *entity.SocialLink) error
	UpdateSocialLink(ctx context.Context, social *entity.SocialLink) error
	DeleteSocialLink(ctx context.Context, id string) error
	GetSocialLinkByID(ctx context.Context, id string) (*entity.SocialLink, error)
}

type socialUsecase struct {
	repo repository.SocialRepository
}

func NewSocialUsecase(repo repository.SocialRepository) SocialUsecase {
	return &socialUsecase{repo: repo}
}

func (u *socialUsecase) GetSocialLinks(ctx context.Context) ([]entity.SocialLink, error) {
	return u.repo.GetAll(ctx)
}

func (u *socialUsecase) CreateSocialLink(ctx context.Context, social *entity.SocialLink) error {
	social.ID = uuid.New().String()
	return u.repo.Create(ctx, social)
}

func (u *socialUsecase) UpdateSocialLink(ctx context.Context, social *entity.SocialLink) error {
	// Verify existence if needed, but simple update usually blindly updates.
	// For better robustness, usually we fetch first. But here we trust the handler to pass valid data or handle partial updates.
	return u.repo.Update(ctx, social)
}

func (u *socialUsecase) DeleteSocialLink(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}

func (u *socialUsecase) GetSocialLinkByID(ctx context.Context, id string) (*entity.SocialLink, error) {
	return u.repo.GetByID(ctx, id)
}
