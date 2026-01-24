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

type SkillUsecase interface {
	GetSkillCategories(ctx context.Context) ([]entity.SkillCategory, error)
	GetCategoryByID(ctx context.Context, id string) (*entity.SkillCategory, error)
	CreateCategory(ctx context.Context, category *entity.SkillCategory) error
	UpdateCategory(ctx context.Context, category *entity.SkillCategory) error
	DeleteCategory(ctx context.Context, id string) error

	AddTag(ctx context.Context, tag *entity.SkillTag) error
	DeleteTag(ctx context.Context, id string) error
	GetTagByID(ctx context.Context, id string) (*entity.SkillTag, error)
}

type skillUsecase struct {
	repo  repository.SkillRepository
	cache cache.Cache
}

func NewSkillUsecase(repo repository.SkillRepository, cache cache.Cache) SkillUsecase {
	return &skillUsecase{
		repo:  repo,
		cache: cache,
	}
}

func (u *skillUsecase) GetSkillCategories(ctx context.Context) ([]entity.SkillCategory, error) {
	const cacheKey = "about_skills"

	// Try cache
	data, err := u.cache.Get(ctx, cacheKey)
	if err == nil && data != nil {
		var cats []entity.SkillCategory
		if err := json.Unmarshal(data, &cats); err == nil {
			return cats, nil
		}
	}

	// Cache miss
	cats, err := u.repo.GetAllCategories(ctx)
	if err != nil {
		return nil, err
	}

	// Save to cache (TTL: 1 hour)
	if data, err := json.Marshal(cats); err == nil {
		_ = u.cache.Set(ctx, cacheKey, data, 1*time.Hour)
	}

	return cats, nil
}

func (u *skillUsecase) GetCategoryByID(ctx context.Context, id string) (*entity.SkillCategory, error) {
	return u.repo.GetCategoryByID(ctx, id)
}

func (u *skillUsecase) CreateCategory(ctx context.Context, category *entity.SkillCategory) error {
	category.ID = uuid.New().String()
	// Init tags UUIDs if provided
	for i := range category.Tags {
		category.Tags[i].ID = uuid.New().String()
		category.Tags[i].SkillCategoryID = category.ID
	}
	if err := u.repo.CreateCategory(ctx, category); err != nil {
		return err
	}
	_ = u.cache.Delete(ctx, "about_skills")
	return nil
}

func (u *skillUsecase) UpdateCategory(ctx context.Context, category *entity.SkillCategory) error {
	if err := u.repo.UpdateCategory(ctx, category); err != nil {
		return err
	}
	_ = u.cache.Delete(ctx, "about_skills")
	return nil
}

func (u *skillUsecase) DeleteCategory(ctx context.Context, id string) error {
	if err := u.repo.DeleteCategory(ctx, id); err != nil {
		return err
	}
	_ = u.cache.Delete(ctx, "about_skills")
	return nil
}

func (u *skillUsecase) AddTag(ctx context.Context, tag *entity.SkillTag) error {
	tag.ID = uuid.New().String()
	if err := u.repo.AddTag(ctx, tag); err != nil {
		return err
	}
	_ = u.cache.Delete(ctx, "about_skills")
	return nil
}

func (u *skillUsecase) DeleteTag(ctx context.Context, id string) error {
	if err := u.repo.DeleteTag(ctx, id); err != nil {
		return err
	}
	_ = u.cache.Delete(ctx, "about_skills")
	return nil
}

func (u *skillUsecase) GetTagByID(ctx context.Context, id string) (*entity.SkillTag, error) {
	return u.repo.GetTagByID(ctx, id)
}
