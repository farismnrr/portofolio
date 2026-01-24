package usecase

import (
	"context"
	"fmt"
	"io"
	"path/filepath"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/repository"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/storage"
	"github.com/google/uuid"
)

type AboutUsecase interface {
	GetAbout(ctx context.Context) (*entity.About, error)
	UpdateAbout(ctx context.Context, about *entity.About) error
	UpdateAvatar(ctx context.Context, file io.Reader, filename string) (string, error)
}

type aboutUsecase struct {
	repo         repository.AboutRepository
	cloudStorage storage.CloudStorage
	bucketName   string
}

func NewAboutUsecase(repo repository.AboutRepository, cloudStorage storage.CloudStorage, bucketName string) AboutUsecase {
	return &aboutUsecase{
		repo:         repo,
		cloudStorage: cloudStorage,
		bucketName:   bucketName,
	}
}

func (u *aboutUsecase) GetAbout(ctx context.Context) (*entity.About, error) {
	return u.repo.Get(ctx)
}

func (u *aboutUsecase) UpdateAbout(ctx context.Context, about *entity.About) error {
	return u.repo.Update(ctx, about)
}

func (u *aboutUsecase) UpdateAvatar(ctx context.Context, file io.Reader, filename string) (string, error) {
	// Generate a unique filename to avoid collisions
	ext := filepath.Ext(filename)
	objectName := fmt.Sprintf("avatars/%s%s", uuid.New().String(), ext)

	// Upload to cloud storage
	url, err := u.cloudStorage.UploadFile(ctx, u.bucketName, objectName, file)
	if err != nil {
		return "", err
	}

	// Update the avatar URL in the database
	about, err := u.repo.Get(ctx)
	if err != nil {
		return "", err
	}

	about.Avatar = url
	if err := u.repo.Update(ctx, about); err != nil {
		return "", err
	}

	return url, nil
}
