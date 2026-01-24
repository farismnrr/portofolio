package usecase

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/repository"
	"github.com/google/uuid"
)

type WorkUsecase interface {
	GetWorkExperiences(ctx context.Context) ([]entity.WorkExperience, error)
	GetWorkExperienceByID(ctx context.Context, id string) (*entity.WorkExperience, error)
	CreateWorkExperience(ctx context.Context, work *entity.WorkExperience) error
	UpdateWorkExperience(ctx context.Context, work *entity.WorkExperience) error
	DeleteWorkExperience(ctx context.Context, id string) error

	AddAchievement(ctx context.Context, achievement *entity.WorkAchievement) error
	DeleteAchievement(ctx context.Context, achievementID string) error
	GetAchievementByID(ctx context.Context, id string) (*entity.WorkAchievement, error)
}

type workUsecase struct {
	repo repository.WorkRepository
}

func NewWorkUsecase(repo repository.WorkRepository) WorkUsecase {
	return &workUsecase{repo: repo}
}

func (u *workUsecase) GetWorkExperiences(ctx context.Context) ([]entity.WorkExperience, error) {
	return u.repo.GetAll(ctx)
}

func (u *workUsecase) GetWorkExperienceByID(ctx context.Context, id string) (*entity.WorkExperience, error) {
	return u.repo.GetByID(ctx, id)
}

func (u *workUsecase) CreateWorkExperience(ctx context.Context, work *entity.WorkExperience) error {
	work.ID = uuid.New().String()
	// Process nested achievements if any (though usually added separately or during init)
	for i := range work.Achievements {
		work.Achievements[i].ID = uuid.New().String()
		work.Achievements[i].WorkExperienceID = work.ID
	}
	return u.repo.Create(ctx, work)
}

func (u *workUsecase) UpdateWorkExperience(ctx context.Context, work *entity.WorkExperience) error {
	return u.repo.Update(ctx, work)
}

func (u *workUsecase) DeleteWorkExperience(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}

func (u *workUsecase) AddAchievement(ctx context.Context, achievement *entity.WorkAchievement) error {
	achievement.ID = uuid.New().String()
	return u.repo.AddAchievement(ctx, achievement)
}

func (u *workUsecase) DeleteAchievement(ctx context.Context, achievementID string) error {
	return u.repo.DeleteAchievement(ctx, achievementID)
}

func (u *workUsecase) GetAchievementByID(ctx context.Context, id string) (*entity.WorkAchievement, error) {
	return u.repo.GetAchievementByID(ctx, id)
}
