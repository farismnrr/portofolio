package handler

import (
	"context"
	"io"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"github.com/stretchr/testify/mock"
)

type MockAboutUsecase struct {
	mock.Mock
}

func (m *MockAboutUsecase) GetAbout(ctx context.Context) (*entity.About, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.About), args.Error(1)
}

func (m *MockAboutUsecase) UpdateAbout(ctx context.Context, about *entity.About) error {
	args := m.Called(ctx, about)
	return args.Error(0)
}

func (m *MockAboutUsecase) UpdateAvatar(ctx context.Context, file io.Reader, filename string) (string, error) {
	args := m.Called(ctx, file, filename)
	return args.String(0), args.Error(1)
}
