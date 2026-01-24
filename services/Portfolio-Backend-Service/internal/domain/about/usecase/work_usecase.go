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

type WorkUsecase interface {
	GetWorkExperiences(ctx context.Context) ([]entity.WorkExperience, error)
	GetWorkExperienceByID(ctx context.Context, id string) (*entity.WorkExperience, error)
	CreateWorkExperience(ctx context.Context, work *entity.WorkExperience) error
	UpdateWorkExperience(ctx context.Context, work *entity.WorkExperience) error
	DeleteWorkExperience(ctx context.Context, id string) error
}

type workUsecase struct {
	repo  repository.WorkRepository
	cache cache.Cache
}

func NewWorkUsecase(repo repository.WorkRepository, cache cache.Cache) WorkUsecase {
	return &workUsecase{
		repo:  repo,
		cache: cache,
	}
}

func (u *workUsecase) GetWorkExperiences(ctx context.Context) ([]entity.WorkExperience, error) {
	const cacheKey = "about_work_experiences"

	// Try cache
	data, err := u.cache.Get(ctx, cacheKey)
	if err == nil && data != nil {
		var works []entity.WorkExperience
		if err := json.Unmarshal(data, &works); err == nil {
			return works, nil
		}
	}

	// Cache miss
	works, err := u.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	// Save to cache (TTL: 1 hour)
	if data, err := json.Marshal(works); err == nil {
		_ = u.cache.Set(ctx, cacheKey, data, 1*time.Hour)
	}

	return works, nil
}

func (u *workUsecase) GetWorkExperienceByID(ctx context.Context, id string) (*entity.WorkExperience, error) {
	return u.repo.GetByID(ctx, id)
}

func (u *workUsecase) CreateWorkExperience(ctx context.Context, work *entity.WorkExperience) error {
	work.ID = uuid.New().String()
	if err := u.repo.Create(ctx, work); err != nil {
		return err
	}
	_ = u.cache.Delete(ctx, "about_work_experiences")
	return nil
}

func (u *workUsecase) UpdateWorkExperience(ctx context.Context, work *entity.WorkExperience) error {
	if err := u.repo.Update(ctx, work); err != nil {
		return err
	}
	_ = u.cache.Delete(ctx, "about_work_experiences")
	return nil
}

func (u *workUsecase) DeleteWorkExperience(ctx context.Context, id string) error {
	if err := u.repo.Delete(ctx, id); err != nil {
		return err
	}
	_ = u.cache.Delete(ctx, "about_work_experiences")
	return nil
}
