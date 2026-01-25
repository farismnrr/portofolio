package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"path/filepath"
	"time"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/repository"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/cache"
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
	cache        cache.Cache
}

func NewAboutUsecase(repo repository.AboutRepository, cloudStorage storage.CloudStorage, bucketName string, cache cache.Cache) AboutUsecase {
	return &aboutUsecase{
		repo:         repo,
		cloudStorage: cloudStorage,
		bucketName:   bucketName,
		cache:        cache,
	}
}

func (u *aboutUsecase) GetAbout(ctx context.Context) (*entity.About, error) {
	const cacheKey = "about_profile"

	// Try cache
	data, err := u.cache.Get(ctx, cacheKey)
	if err == nil && data != nil {
		var about entity.About
		if err := json.Unmarshal(data, &about); err == nil {
			return &about, nil
		}
	}

	// Cache miss
	about, err := u.repo.Get(ctx)
	if err != nil {
		return nil, err
	}

	// Save to cache (TTL: 1 hour)
	if data, err := json.Marshal(about); err == nil {
		_ = u.cache.Set(ctx, cacheKey, data, 1*time.Hour)
	}

	return about, nil
}

func (u *aboutUsecase) UpdateAbout(ctx context.Context, about *entity.About) error {
	// For singleton record, we must fetch the existing one first to get its ID
	existingAbout, err := u.repo.Get(ctx)
	if err != nil {
		return fmt.Errorf("failed to fetch existing profile: %w", err)
	}

	// Update fields
	existingAbout.Name = about.Name
	existingAbout.Role = about.Role
	existingAbout.Description = about.Description
	existingAbout.Avatar = about.Avatar

	if err := u.repo.Update(ctx, existingAbout); err != nil {
		return err
	}
	_ = u.cache.Delete(ctx, "about_profile")
	return nil
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

	_ = u.cache.Delete(ctx, "about_profile")

	return url, nil
}
