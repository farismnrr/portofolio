package usecase

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/repository"
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
	repo repository.SkillRepository
}

func NewSkillUsecase(repo repository.SkillRepository) SkillUsecase {
	return &skillUsecase{repo: repo}
}

func (u *skillUsecase) GetSkillCategories(ctx context.Context) ([]entity.SkillCategory, error) {
	return u.repo.GetAllCategories(ctx)
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
	return u.repo.CreateCategory(ctx, category)
}

func (u *skillUsecase) UpdateCategory(ctx context.Context, category *entity.SkillCategory) error {
	return u.repo.UpdateCategory(ctx, category)
}

func (u *skillUsecase) DeleteCategory(ctx context.Context, id string) error {
	return u.repo.DeleteCategory(ctx, id)
}

func (u *skillUsecase) AddTag(ctx context.Context, tag *entity.SkillTag) error {
	tag.ID = uuid.New().String()
	return u.repo.AddTag(ctx, tag)
}

func (u *skillUsecase) DeleteTag(ctx context.Context, id string) error {
	return u.repo.DeleteTag(ctx, id)
}

func (u *skillUsecase) GetTagByID(ctx context.Context, id string) (*entity.SkillTag, error) {
	return u.repo.GetTagByID(ctx, id)
}
