package repository

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"gorm.io/gorm"
)

type EducationRepository interface {
	GetAll(ctx context.Context) ([]entity.Education, error)
	GetByID(ctx context.Context, id string) (*entity.Education, error)
	Create(ctx context.Context, edu *entity.Education) error
	Update(ctx context.Context, edu *entity.Education) error
	Delete(ctx context.Context, id string) error
}

type educationRepository struct {
	db *gorm.DB
}

func NewEducationRepository(db *gorm.DB) EducationRepository {
	return &educationRepository{db: db}
}

func (r *educationRepository) GetAll(ctx context.Context) ([]entity.Education, error) {
	var edus []entity.Education
	if err := r.db.WithContext(ctx).Order("order_by asc").Find(&edus).Error; err != nil {
		return nil, err
	}
	return edus, nil
}

func (r *educationRepository) GetByID(ctx context.Context, id string) (*entity.Education, error) {
	var edu entity.Education
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&edu).Error; err != nil {
		return nil, err
	}
	return &edu, nil
}

func (r *educationRepository) Create(ctx context.Context, edu *entity.Education) error {
	return r.db.WithContext(ctx).Create(edu).Error
}

func (r *educationRepository) Update(ctx context.Context, edu *entity.Education) error {
	return r.db.WithContext(ctx).Save(edu).Error
}

func (r *educationRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Where("id = ?", id).Delete(&entity.Education{}).Error
}
