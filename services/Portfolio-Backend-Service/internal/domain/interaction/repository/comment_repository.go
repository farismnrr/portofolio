package repository

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/entity"
	"gorm.io/gorm"
)

type CommentRepository interface {
	CreateComment(ctx context.Context, comment *entity.Comment) error
	GetCommentsByPost(ctx context.Context, postType, postSlug string) ([]entity.Comment, error)
	GetCommentByID(ctx context.Context, id string) (*entity.Comment, error)
	UpdateComment(ctx context.Context, comment *entity.Comment) error
	DeleteComment(ctx context.Context, id string) error
}

type commentRepositoryImpl struct {
	db *gorm.DB
}

func NewCommentRepository(db *gorm.DB) CommentRepository {
	return &commentRepositoryImpl{db: db}
}

func (r *commentRepositoryImpl) CreateComment(ctx context.Context, comment *entity.Comment) error {
	return r.db.WithContext(ctx).Create(comment).Error
}

func (r *commentRepositoryImpl) GetCommentsByPost(ctx context.Context, postType, postSlug string) ([]entity.Comment, error) {
	var comments []entity.Comment
	err := r.db.WithContext(ctx).
		Where("post_type = ? AND post_slug = ?", postType, postSlug).
		Order("created_at desc").
		Find(&comments).Error
	return comments, err
}

func (r *commentRepositoryImpl) GetCommentByID(ctx context.Context, id string) (*entity.Comment, error) {
	var comment entity.Comment
	err := r.db.WithContext(ctx).First(&comment, "id = ?", id).Error
	return &comment, err
}

func (r *commentRepositoryImpl) UpdateComment(ctx context.Context, comment *entity.Comment) error {
	return r.db.WithContext(ctx).Save(comment).Error
}

func (r *commentRepositoryImpl) DeleteComment(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&entity.Comment{}, "id = ?", id).Error
}
