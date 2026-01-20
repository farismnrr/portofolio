package usecase

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/sso/repository"
)

type Usecase interface {
	RefreshToken(ctx context.Context, refreshToken string) (*repository.TokenResponse, error)
	VerifyUser(ctx context.Context, accessToken string) (*repository.UserData, error)
	Logout(ctx context.Context, accessToken string) error
}

type ssoUsecase struct {
	repo *repository.SSOClient
}

func NewSSOUsecase(repo *repository.SSOClient) Usecase {
	return &ssoUsecase{repo: repo}
}

func (u *ssoUsecase) RefreshToken(ctx context.Context, refreshToken string) (*repository.TokenResponse, error) {
	return u.repo.RefreshToken(ctx, refreshToken)
}

func (u *ssoUsecase) VerifyUser(ctx context.Context, accessToken string) (*repository.UserData, error) {
	return u.repo.VerifyUser(ctx, accessToken)
}

func (u *ssoUsecase) Logout(ctx context.Context, accessToken string) error {
	return u.repo.Logout(ctx, accessToken)
}
