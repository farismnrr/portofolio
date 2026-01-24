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
}

type workRepository struct {
	db *gorm.DB
}

func NewWorkRepository(db *gorm.DB) WorkRepository {
	return &workRepository{db: db}
}

func (r *workRepository) GetAll(ctx context.Context) ([]entity.WorkExperience, error) {
	var works []entity.WorkExperience
	if err := r.db.WithContext(ctx).
		Order("order_by asc").
		Find(&works).Error; err != nil {
		return nil, err
	}
	return works, nil
}

func (r *workRepository) GetByID(ctx context.Context, id string) (*entity.WorkExperience, error) {
	var work entity.WorkExperience
	if err := r.db.WithContext(ctx).
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
	return r.db.WithContext(ctx).Save(work).Error
}

func (r *workRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Where("id = ?", id).Delete(&entity.WorkExperience{}).Error
}
