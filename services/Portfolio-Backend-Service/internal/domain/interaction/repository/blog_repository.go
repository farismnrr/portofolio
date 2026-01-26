package repository

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/entity"
	"gorm.io/gorm"
)

type BlogRepository interface {
	GetBlogMetadata(ctx context.Context, slug string) (*entity.BlogsMetadata, error)
	ListBlogs(ctx context.Context) ([]entity.BlogsMetadata, error)
	CreateBlog(ctx context.Context, blog *entity.BlogsMetadata) error
	UpdateBlog(ctx context.Context, blog *entity.BlogsMetadata) error
	DeleteBlog(ctx context.Context, id string) error
	IncrementBlogViews(ctx context.Context, slug string) error
	IncrementBlogLikes(ctx context.Context, slug string) error
	UpdateBlogMetadata(ctx context.Context, slug string, views, likes int) error
}

type blogRepository struct {
	db *gorm.DB
}

func NewBlogRepository(db *gorm.DB) BlogRepository {
	return &blogRepository{db: db}
}

func (r *blogRepository) GetBlogMetadata(ctx context.Context, slug string) (*entity.BlogsMetadata, error) {
	var blog entity.BlogsMetadata
	err := r.db.WithContext(ctx).Where("slug = ?", slug).First(&blog).Error
	return &blog, err
}

func (r *blogRepository) ListBlogs(ctx context.Context) ([]entity.BlogsMetadata, error) {
	var blogs []entity.BlogsMetadata
	err := r.db.WithContext(ctx).Order("published_at DESC").Find(&blogs).Error
	return blogs, err
}

func (r *blogRepository) CreateBlog(ctx context.Context, blog *entity.BlogsMetadata) error {
	return r.db.WithContext(ctx).Create(blog).Error
}

func (r *blogRepository) UpdateBlog(ctx context.Context, blog *entity.BlogsMetadata) error {
	return r.db.WithContext(ctx).Save(blog).Error
}

func (r *blogRepository) DeleteBlog(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&entity.BlogsMetadata{}, "id = ?", id).Error
}

func (r *blogRepository) IncrementBlogViews(ctx context.Context, slug string) error {
	return r.db.WithContext(ctx).Model(&entity.BlogsMetadata{}).Where("slug = ?", slug).
		UpdateColumn("views_count", gorm.Expr("views_count + ?", 1)).Error
}

func (r *blogRepository) IncrementBlogLikes(ctx context.Context, slug string) error {
	return r.db.WithContext(ctx).Model(&entity.BlogsMetadata{}).Where("slug = ?", slug).
		UpdateColumn("likes_count", gorm.Expr("likes_count + ?", 1)).Error
}

func (r *blogRepository) UpdateBlogMetadata(ctx context.Context, slug string, views, likes int) error {
	updates := map[string]interface{}{}
	if views >= 0 {
		updates["views_count"] = views
	}
	if likes >= 0 {
		updates["likes_count"] = likes
	}

	result := r.db.WithContext(ctx).Model(&entity.BlogsMetadata{}).Where("slug = ?", slug).Updates(updates)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		meta := entity.BlogsMetadata{
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
