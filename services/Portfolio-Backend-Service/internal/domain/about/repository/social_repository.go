package repository

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"gorm.io/gorm"
)

type SocialRepository interface {
	GetAll(ctx context.Context) ([]entity.SocialLink, error)
	Create(ctx context.Context, social *entity.SocialLink) error
	Update(ctx context.Context, social *entity.SocialLink) error
	Delete(ctx context.Context, id string) error
	GetByID(ctx context.Context, id string) (*entity.SocialLink, error)
}

type socialRepository struct {
	db *gorm.DB
}

func NewSocialRepository(db *gorm.DB) SocialRepository {
	return &socialRepository{db: db}
}

func (r *socialRepository) GetAll(ctx context.Context) ([]entity.SocialLink, error) {
	var socialLinks []entity.SocialLink
	// GORM handles Soft Delete automatically by filtering deleted_at IS NULL
	if err := r.db.WithContext(ctx).Order("order_by asc").Find(&socialLinks).Error; err != nil {
		return nil, err
	}
	return socialLinks, nil
}

func (r *socialRepository) Create(ctx context.Context, social *entity.SocialLink) error {
	return r.db.WithContext(ctx).Create(social).Error
}

func (r *socialRepository) Update(ctx context.Context, social *entity.SocialLink) error {
	return r.db.WithContext(ctx).Save(social).Error
}

func (r *socialRepository) Delete(ctx context.Context, id string) error {
	// GORM's Delete performs a Soft Delete if the model has DeletedAt field
	return r.db.WithContext(ctx).Where("id = ?", id).Delete(&entity.SocialLink{}).Error
}

func (r *socialRepository) GetByID(ctx context.Context, id string) (*entity.SocialLink, error) {
	var social entity.SocialLink
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&social).Error; err != nil {
		return nil, err
	}
	return &social, nil
}
