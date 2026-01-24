package usecase

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/repository"
	"github.com/google/uuid"
)

type EducationUsecase interface {
	GetEducations(ctx context.Context) ([]entity.Education, error)
	GetEducationByID(ctx context.Context, id string) (*entity.Education, error)
	CreateEducation(ctx context.Context, edu *entity.Education) error
	UpdateEducation(ctx context.Context, edu *entity.Education) error
	DeleteEducation(ctx context.Context, id string) error
}

type educationUsecase struct {
	repo repository.EducationRepository
}

func NewEducationUsecase(repo repository.EducationRepository) EducationUsecase {
	return &educationUsecase{repo: repo}
}

func (u *educationUsecase) GetEducations(ctx context.Context) ([]entity.Education, error) {
	return u.repo.GetAll(ctx)
}

func (u *educationUsecase) GetEducationByID(ctx context.Context, id string) (*entity.Education, error) {
	return u.repo.GetByID(ctx, id)
}

func (u *educationUsecase) CreateEducation(ctx context.Context, edu *entity.Education) error {
	edu.ID = uuid.New().String()
	return u.repo.Create(ctx, edu)
}

func (u *educationUsecase) UpdateEducation(ctx context.Context, edu *entity.Education) error {
	return u.repo.Update(ctx, edu)
}

func (u *educationUsecase) DeleteEducation(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}
