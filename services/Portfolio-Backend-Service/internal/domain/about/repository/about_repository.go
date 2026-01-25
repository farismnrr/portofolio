package repository

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AboutRepository interface {
	Get(ctx context.Context) (*entity.About, error)
	Update(ctx context.Context, about *entity.About) error
}

type aboutRepository struct {
	db *gorm.DB
}

func NewAboutRepository(db *gorm.DB) AboutRepository {
	return &aboutRepository{db: db}
}

func (r *aboutRepository) Get(ctx context.Context) (*entity.About, error) {
	var about entity.About
	// Check if record exists
	err := r.db.WithContext(ctx).Where("deleted_at IS NULL").First(&about).Error
	if err == nil {
		return &about, nil
	}

	if err == gorm.ErrRecordNotFound {
		// Create default record if not found
		about = entity.About{
			ID:          uuid.New().String(),
			Name:        "New User",
			Role:        "User",
			Description: "Your description here",
		}
		if err := r.db.WithContext(ctx).Create(&about).Error; err != nil {
			return nil, err
		}
		return &about, nil
	}

	return nil, err
}

func (r *aboutRepository) Update(ctx context.Context, about *entity.About) error {
	// Using explicit Where condition to avoid GORM's "Global Update" protection
	return r.db.WithContext(ctx).Model(&entity.About{}).Where("id = ?", about.ID).Updates(about).Error
}
