package usecase

import (
	"context"
	"encoding/json"
	"time"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/repository"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/cache"
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
	repo  repository.SocialRepository
	cache cache.Cache
}

func NewSocialUsecase(repo repository.SocialRepository, cache cache.Cache) SocialUsecase {
	return &socialUsecase{
		repo:  repo,
		cache: cache,
	}
}

func (u *socialUsecase) GetSocialLinks(ctx context.Context) ([]entity.SocialLink, error) {
	const cacheKey = "about_social_links"

	// Try cache
	data, err := u.cache.Get(ctx, cacheKey)
	if err == nil && data != nil {
		var links []entity.SocialLink
		if err := json.Unmarshal(data, &links); err == nil {
			return links, nil
		}
	}

	// Cache miss
	links, err := u.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	// Save to cache (TTL: 1 hour)
	if data, err := json.Marshal(links); err == nil {
		_ = u.cache.Set(ctx, cacheKey, data, 1*time.Hour)
	}

	return links, nil
}

func (u *socialUsecase) CreateSocialLink(ctx context.Context, social *entity.SocialLink) error {
	social.ID = uuid.New().String()
	if err := u.repo.Create(ctx, social); err != nil {
		return err
	}
	_ = u.cache.Delete(ctx, "about_social_links")
	return nil
}

func (u *socialUsecase) UpdateSocialLink(ctx context.Context, social *entity.SocialLink) error {
	if err := u.repo.Update(ctx, social); err != nil {
		return err
	}
	_ = u.cache.Delete(ctx, "about_social_links")
	return nil
}

func (u *socialUsecase) DeleteSocialLink(ctx context.Context, id string) error {
	if err := u.repo.Delete(ctx, id); err != nil {
		return err
	}
	_ = u.cache.Delete(ctx, "about_social_links")
	return nil
}

func (u *socialUsecase) GetSocialLinkByID(ctx context.Context, id string) (*entity.SocialLink, error) {
	return u.repo.GetByID(ctx, id)
}
