package sso

import (
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/config"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/sso/handler"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/sso/repository"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/sso/usecase"
	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Group, cfg *config.Config) {
	// Init Domain Components
	ssoRepo := repository.NewSSOClient(cfg)
	ssoUC := usecase.NewSSOUsecase(ssoRepo)
	ssoHandler := handler.NewHandler(cfg, ssoUC)

	// Register Routes
	authGroup := e.Group("/auth")
	authGroup.POST("/login", ssoHandler.Login)
	authGroup.POST("/refresh", ssoHandler.RefreshToken)
	authGroup.GET("/user", ssoHandler.GetUser)
	authGroup.POST("/logout", ssoHandler.Logout)
}
