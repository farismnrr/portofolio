package handler

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/usecase"
	"github.com/stretchr/testify/mock"
)

// MockInteractionUsecase
type MockInteractionUsecase struct {
	mock.Mock
}

func (m *MockInteractionUsecase) GetBlogInteractions(ctx context.Context, slug string) (*entity.BlogsMetadata, error) {
	args := m.Called(ctx, slug)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.BlogsMetadata), args.Error(1)
}
func (m *MockInteractionUsecase) RecordBlogView(ctx context.Context, slug string) error {
	args := m.Called(ctx, slug)
	return args.Error(0)
}
func (m *MockInteractionUsecase) ToggleBlogLike(ctx context.Context, slug string) error {
	args := m.Called(ctx, slug)
	return args.Error(0)
}
func (m *MockInteractionUsecase) GetComments(ctx context.Context, postType string, postSlug string) ([]entity.Comment, error) {
	args := m.Called(ctx, postType, postSlug)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]entity.Comment), args.Error(1)
}
func (m *MockInteractionUsecase) CreateComment(ctx context.Context, req usecase.CreateCommentRequest) error {
	args := m.Called(ctx, req)
	return args.Error(0)
}
func (m *MockInteractionUsecase) DeleteComment(ctx context.Context, id string, role string) error {
	args := m.Called(ctx, id, role)
	return args.Error(0)
}
func (m *MockInteractionUsecase) IncrementBlogViews(ctx context.Context, slug string) error {
	args := m.Called(ctx, slug)
	return args.Error(0)
}
func (m *MockInteractionUsecase) IncrementBlogLikes(ctx context.Context, slug string) error {
	args := m.Called(ctx, slug)
	return args.Error(0)
}
func (m *MockInteractionUsecase) GetBlog(ctx context.Context, slug string) (*entity.BlogsMetadata, error) {
	args := m.Called(ctx, slug)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.BlogsMetadata), args.Error(1)
}
func (m *MockInteractionUsecase) UpdateBlogMetadata(ctx context.Context, slug string, views int, likes int) error {
	args := m.Called(ctx, slug, views, likes)
	return args.Error(0)
}

func (m *MockInteractionUsecase) GetWork(ctx context.Context, slug string) (*entity.WorksMetadata, error) {
	args := m.Called(ctx, slug)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.WorksMetadata), args.Error(1)
}
func (m *MockInteractionUsecase) IncrementWorkViews(ctx context.Context, slug string) error {
	args := m.Called(ctx, slug)
	return args.Error(0)
}
func (m *MockInteractionUsecase) IncrementWorkLikes(ctx context.Context, slug string) error {
	args := m.Called(ctx, slug)
	return args.Error(0)
}
func (m *MockInteractionUsecase) UpdateWorkMetadata(ctx context.Context, slug string, views int, likes int) error {
	args := m.Called(ctx, slug, views, likes)
	return args.Error(0)
}
