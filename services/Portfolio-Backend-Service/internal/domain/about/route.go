package about

import (
	"context"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/handler"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/repository"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/usecase"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/config"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/middleware"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/storage"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func RegisterAboutRoutes(e *echo.Group, db *gorm.DB, cfg *config.Config) {
	// Initialize Cloud Storage
	cloudStorage, _ := storage.NewGCPStorage(
		context.Background(),
		cfg.GCP.CredentialsPath,
		cfg.GCP.ServiceAccountEmail,
		cfg.GCP.P12Password,
	)

	repo := repository.NewAboutRepository(db)
	uc := usecase.NewAboutUsecase(repo, cloudStorage, cfg.GCP.BucketName)
	h := handler.NewAboutHandler(uc)

	aboutGroup := e.Group("/about")
	aboutGroup.GET("", h.GetAbout)
	aboutGroup.PATCH("", h.UpdateAbout, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	// Social Links
	socialRepo := repository.NewSocialRepository(db)
	socialUC := usecase.NewSocialUsecase(socialRepo)
	socialHandler := handler.NewSocialHandler(socialUC)

	aboutGroup.GET("/social-links", socialHandler.GetSocialLinks)
	aboutGroup.POST("/social-links", socialHandler.CreateSocialLink, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	aboutGroup.PATCH("/social-links/:id", socialHandler.UpdateSocialLink, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	aboutGroup.DELETE("/social-links/:id", socialHandler.DeleteSocialLink, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))

	aboutGroup.PATCH("/avatar", h.UpdateAvatar, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
}
