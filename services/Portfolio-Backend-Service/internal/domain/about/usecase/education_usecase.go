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

type EducationUsecase interface {
	GetEducations(ctx context.Context) ([]entity.Education, error)
	GetEducationByID(ctx context.Context, id string) (*entity.Education, error)
	CreateEducation(ctx context.Context, edu *entity.Education) error
	UpdateEducation(ctx context.Context, edu *entity.Education) error
	DeleteEducation(ctx context.Context, id string) error
}

type educationUsecase struct {
	repo  repository.EducationRepository
	cache cache.Cache
}

func NewEducationUsecase(repo repository.EducationRepository, cache cache.Cache) EducationUsecase {
	return &educationUsecase{
		repo:  repo,
		cache: cache,
	}
}

func (u *educationUsecase) GetEducations(ctx context.Context) ([]entity.Education, error) {
	const cacheKey = "about_educations"

	// Try cache
	data, err := u.cache.Get(ctx, cacheKey)
	if err == nil && data != nil {
		var edus []entity.Education
		if err := json.Unmarshal(data, &edus); err == nil {
			return edus, nil
		}
	}

	// Cache miss
	edus, err := u.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	// Save to cache (TTL: 1 hour)
	if data, err := json.Marshal(edus); err == nil {
		_ = u.cache.Set(ctx, cacheKey, data, 1*time.Hour)
	}

	return edus, nil
}

func (u *educationUsecase) GetEducationByID(ctx context.Context, id string) (*entity.Education, error) {
	return u.repo.GetByID(ctx, id)
}

func (u *educationUsecase) CreateEducation(ctx context.Context, edu *entity.Education) error {
	edu.ID = uuid.New().String()
	if err := u.repo.Create(ctx, edu); err != nil {
		return err
	}
	_ = u.cache.Delete(ctx, "about_educations")
	return nil
}

func (u *educationUsecase) UpdateEducation(ctx context.Context, edu *entity.Education) error {
	if err := u.repo.Update(ctx, edu); err != nil {
		return err
	}
	_ = u.cache.Delete(ctx, "about_educations")
	return nil
}

func (u *educationUsecase) DeleteEducation(ctx context.Context, id string) error {
	if err := u.repo.Delete(ctx, id); err != nil {
		return err
	}
	_ = u.cache.Delete(ctx, "about_educations")
	return nil
}
