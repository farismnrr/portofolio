package repository

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"gorm.io/gorm"
)

type WorkRepository interface {
	GetAll(ctx context.Context) ([]entity.WorkExperience, error)
	GetByID(ctx context.Context, id string) (*entity.WorkExperience, error)
	Create(ctx context.Context, work *entity.WorkExperience) error
	Update(ctx context.Context, work *entity.WorkExperience) error
	Delete(ctx context.Context, id string) error

	// Achievement Ops
	AddAchievement(ctx context.Context, achievement *entity.WorkAchievement) error
	DeleteAchievement(ctx context.Context, achievementID string) error
	GetAchievementByID(ctx context.Context, id string) (*entity.WorkAchievement, error)
}

type workRepository struct {
	db *gorm.DB
}

func NewWorkRepository(db *gorm.DB) WorkRepository {
	return &workRepository{db: db}
}

func (r *workRepository) GetAll(ctx context.Context) ([]entity.WorkExperience, error) {
	var works []entity.WorkExperience
	// Preload Achievements and order both levels
	if err := r.db.WithContext(ctx).
		Preload("Achievements", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_by asc")
		}).
		Order("order_by asc").
		Find(&works).Error; err != nil {
		return nil, err
	}
	return works, nil
}

func (r *workRepository) GetByID(ctx context.Context, id string) (*entity.WorkExperience, error) {
	var work entity.WorkExperience
	if err := r.db.WithContext(ctx).
		Preload("Achievements", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_by asc")
		}).
		Where("id = ?", id).
		First(&work).Error; err != nil {
		return nil, err
	}
	return &work, nil
}

func (r *workRepository) Create(ctx context.Context, work *entity.WorkExperience) error {
	return r.db.WithContext(ctx).Create(work).Error
}

func (r *workRepository) Update(ctx context.Context, work *entity.WorkExperience) error {
	// Updates work experience fields. Nested achievements are usually handled separately,
	// or via Full Save if provided, but Update usually patches the parent.
	return r.db.WithContext(ctx).Save(work).Error
}

func (r *workRepository) Delete(ctx context.Context, id string) error {
	// Soft delete the work experience
	return r.db.WithContext(ctx).Where("id = ?", id).Delete(&entity.WorkExperience{}).Error
}

func (r *workRepository) AddAchievement(ctx context.Context, achievement *entity.WorkAchievement) error {
	return r.db.WithContext(ctx).Create(achievement).Error
}

func (r *workRepository) DeleteAchievement(ctx context.Context, achievementID string) error {
	return r.db.WithContext(ctx).Where("id = ?", achievementID).Delete(&entity.WorkAchievement{}).Error
}

func (r *workRepository) GetAchievementByID(ctx context.Context, id string) (*entity.WorkAchievement, error) {
	var achievement entity.WorkAchievement
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&achievement).Error; err != nil {
		return nil, err
	}
	return &achievement, nil
}
