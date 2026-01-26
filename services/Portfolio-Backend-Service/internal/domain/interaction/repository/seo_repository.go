package repository

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/entity"
	"gorm.io/gorm"
)

type SEORepository interface {
	GetByPost(ctx context.Context, postType, postID string) (*entity.SEOMetadata, error)
	Upsert(ctx context.Context, seo *entity.SEOMetadata) error
}

type seoRepository struct {
	db *gorm.DB
}

func NewSEORepository(db *gorm.DB) SEORepository {
	return &seoRepository{db: db}
}

func (r *seoRepository) GetByPost(ctx context.Context, postType, postID string) (*entity.SEOMetadata, error) {
	var seo entity.SEOMetadata
	err := r.db.WithContext(ctx).Where("post_type = ? AND post_id = ?", postType, postID).First(&seo).Error
	if err != nil {
		return nil, err
	}
	return &seo, nil
}

func (r *seoRepository) Upsert(ctx context.Context, seo *entity.SEOMetadata) error {
	return r.db.WithContext(ctx).Save(seo).Error
}
