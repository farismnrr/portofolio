package repository

import (
	"context"
	"errors"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/entity"
	"gorm.io/gorm"
)

type WorkRepository interface {
	GetWorkMetadata(ctx context.Context, slug string) (*entity.WorksMetadata, error)
	IncrementWorkViews(ctx context.Context, slug string) error
	IncrementWorkLikes(ctx context.Context, slug string) error
	UpdateWorkMetadata(ctx context.Context, slug string, views, likes int) error
	EnsureWorkMetadataExist(ctx context.Context, slug, id string) error
}

type workRepository struct {
	db *gorm.DB
}

func NewWorkRepository(db *gorm.DB) WorkRepository {
	return &workRepository{db: db}
}

func (r *workRepository) GetWorkMetadata(ctx context.Context, slug string) (*entity.WorksMetadata, error) {
	var work entity.WorksMetadata
	err := r.db.WithContext(ctx).Where("slug = ?", slug).First(&work).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		return nil, err
	}
	return &work, nil
}

func (r *workRepository) IncrementWorkViews(ctx context.Context, slug string) error {
	result := r.db.WithContext(ctx).Model(&entity.WorksMetadata{}).Where("slug = ?", slug).
		UpdateColumn("views_count", gorm.Expr("views_count + ?", 1))

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		meta := entity.WorksMetadata{
			Slug:       slug,
			ViewsCount: 1,
		}
		return r.db.WithContext(ctx).Create(&meta).Error
	}
	return nil
}

func (r *workRepository) IncrementWorkLikes(ctx context.Context, slug string) error {
	return r.db.WithContext(ctx).Model(&entity.WorksMetadata{}).Where("slug = ?", slug).
		UpdateColumn("likes_count", gorm.Expr("likes_count + ?", 1)).Error
}

func (r *workRepository) UpdateWorkMetadata(ctx context.Context, slug string, views, likes int) error {
	updates := map[string]interface{}{}
	if views >= 0 {
		updates["views_count"] = views
	}
	if likes >= 0 {
		updates["likes_count"] = likes
	}

	result := r.db.WithContext(ctx).Model(&entity.WorksMetadata{}).Where("slug = ?", slug).Updates(updates)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		meta := entity.WorksMetadata{
			Slug:       slug,
			ViewsCount: views,
			LikesCount: likes,
		}
		if views < 0 {
			meta.ViewsCount = 0
		}
		if likes < 0 {
			meta.LikesCount = 0
		}
		return r.db.WithContext(ctx).Create(&meta).Error
	}
	return nil
}

func (r *workRepository) EnsureWorkMetadataExist(ctx context.Context, slug, id string) error {
	meta := entity.WorksMetadata{
		Base: entity.Base{ID: id},
		Slug: slug,
	}
	return r.db.WithContext(ctx).FirstOrCreate(&meta, entity.WorksMetadata{Slug: slug}).Error
}
