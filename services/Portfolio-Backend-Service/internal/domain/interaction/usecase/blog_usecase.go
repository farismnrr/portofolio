package usecase

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/repository"
)

type BlogUsecase interface {
	GetBlog(ctx context.Context, slug string) (*entity.BlogsMetadata, error)
	ListBlogs(ctx context.Context) ([]entity.BlogsMetadata, error)
	CreateBlog(ctx context.Context, blog *entity.BlogsMetadata, seo *entity.SEOMetadata) error
	UpdateBlog(ctx context.Context, blog *entity.BlogsMetadata, seo *entity.SEOMetadata) error
	DeleteBlog(ctx context.Context, id string) error
	IncrementBlogViews(ctx context.Context, slug string) error
	IncrementBlogLikes(ctx context.Context, slug string) error
	UpdateBlogMetadata(ctx context.Context, slug string, views, likes int) error
}

type blogUsecase struct {
	repo    repository.BlogRepository
	seoRepo repository.SEORepository
}

func NewBlogUsecase(repo repository.BlogRepository, seoRepo repository.SEORepository) BlogUsecase {
	return &blogUsecase{repo: repo, seoRepo: seoRepo}
}

func (u *blogUsecase) GetBlog(ctx context.Context, slug string) (*entity.BlogsMetadata, error) {
	blog, err := u.repo.GetBlogMetadata(ctx, slug)
	if err != nil {
		return nil, err
	}
	seo, _ := u.seoRepo.GetByPost(ctx, "blog", blog.ID)
	blog.SEOMetadata = seo
	return blog, nil
}

func (u *blogUsecase) ListBlogs(ctx context.Context) ([]entity.BlogsMetadata, error) {
	return u.repo.ListBlogs(ctx)
}

func (u *blogUsecase) CreateBlog(ctx context.Context, blog *entity.BlogsMetadata, seo *entity.SEOMetadata) error {
	if err := u.repo.CreateBlog(ctx, blog); err != nil {
		return err
	}
	if seo != nil {
		seo.PostType = "blog"
		seo.PostID = blog.ID
		return u.seoRepo.Upsert(ctx, seo)
	}
	return nil
}

func (u *blogUsecase) UpdateBlog(ctx context.Context, blog *entity.BlogsMetadata, seo *entity.SEOMetadata) error {
	if err := u.repo.UpdateBlog(ctx, blog); err != nil {
		return err
	}
	if seo != nil {
		seo.PostType = "blog"
		seo.PostID = blog.ID
		return u.seoRepo.Upsert(ctx, seo)
	}
	return nil
}

func (u *blogUsecase) DeleteBlog(ctx context.Context, id string) error {
	return u.repo.DeleteBlog(ctx, id)
}

func (u *blogUsecase) IncrementBlogViews(ctx context.Context, slug string) error {
	return u.repo.IncrementBlogViews(ctx, slug)
}

func (u *blogUsecase) IncrementBlogLikes(ctx context.Context, slug string) error {
	return u.repo.IncrementBlogLikes(ctx, slug)
}

func (u *blogUsecase) UpdateBlogMetadata(ctx context.Context, slug string, views, likes int) error {
	return u.repo.UpdateBlogMetadata(ctx, slug, views, likes)
}
