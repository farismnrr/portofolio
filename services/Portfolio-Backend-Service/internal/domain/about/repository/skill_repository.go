package repository

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"gorm.io/gorm"
)

type SkillRepository interface {
	GetAllCategories(ctx context.Context) ([]entity.SkillCategory, error)
	GetCategoryByID(ctx context.Context, id string) (*entity.SkillCategory, error)
	CreateCategory(ctx context.Context, category *entity.SkillCategory) error
	UpdateCategory(ctx context.Context, category *entity.SkillCategory) error
	DeleteCategory(ctx context.Context, id string) error

	// Tag Ops
	AddTag(ctx context.Context, tag *entity.SkillTag) error
	DeleteTag(ctx context.Context, id string) error
	GetTagByID(ctx context.Context, id string) (*entity.SkillTag, error)
}

type skillRepository struct {
	db *gorm.DB
}

func NewSkillRepository(db *gorm.DB) SkillRepository {
	return &skillRepository{db: db}
}

func (r *skillRepository) GetAllCategories(ctx context.Context) ([]entity.SkillCategory, error) {
	var categories []entity.SkillCategory
	if err := r.db.WithContext(ctx).
		Preload("Tags", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_by asc")
		}).
		Order("order_by asc").
		Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

func (r *skillRepository) GetCategoryByID(ctx context.Context, id string) (*entity.SkillCategory, error) {
	var category entity.SkillCategory
	if err := r.db.WithContext(ctx).
		Preload("Tags", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_by asc")
		}).
		Where("id = ?", id).
		First(&category).Error; err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *skillRepository) CreateCategory(ctx context.Context, category *entity.SkillCategory) error {
	return r.db.WithContext(ctx).Create(category).Error
}

func (r *skillRepository) UpdateCategory(ctx context.Context, category *entity.SkillCategory) error {
	return r.db.WithContext(ctx).Save(category).Error
}

func (r *skillRepository) DeleteCategory(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Where("id = ?", id).Delete(&entity.SkillCategory{}).Error
}

func (r *skillRepository) AddTag(ctx context.Context, tag *entity.SkillTag) error {
	return r.db.WithContext(ctx).Create(tag).Error
}

func (r *skillRepository) DeleteTag(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Where("id = ?", id).Delete(&entity.SkillTag{}).Error
}

func (r *skillRepository) GetTagByID(ctx context.Context, id string) (*entity.SkillTag, error) {
	var tag entity.SkillTag
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&tag).Error; err != nil {
		return nil, err
	}
	return &tag, nil
}
