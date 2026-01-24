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

	// Work Experience
	workRepo := repository.NewWorkRepository(db)
	workUC := usecase.NewWorkUsecase(workRepo)
	workHandler := handler.NewWorkHandler(workUC)

	aboutGroup.GET("/work-experiences", workHandler.GetWorkExperiences)
	aboutGroup.POST("/work-experiences", workHandler.CreateWorkExperience, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	aboutGroup.PATCH("/work-experiences/:id", workHandler.UpdateWorkExperience, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	aboutGroup.DELETE("/work-experiences/:id", workHandler.DeleteWorkExperience, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	aboutGroup.POST("/work-experiences/:id/achievements", workHandler.AddAchievement, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	aboutGroup.DELETE("/work-experiences/achievements/:achievement_id", workHandler.DeleteAchievement, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))

	// Education
	eduRepo := repository.NewEducationRepository(db)
	eduUC := usecase.NewEducationUsecase(eduRepo)
	eduHandler := handler.NewEducationHandler(eduUC)

	aboutGroup.GET("/education", eduHandler.GetEducations)
	aboutGroup.POST("/education", eduHandler.CreateEducation, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	aboutGroup.PATCH("/education/:id", eduHandler.UpdateEducation, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	aboutGroup.DELETE("/education/:id", eduHandler.DeleteEducation, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))

	// Skills
	skillRepo := repository.NewSkillRepository(db)
	skillUC := usecase.NewSkillUsecase(skillRepo)
	skillHandler := handler.NewSkillHandler(skillUC)

	aboutGroup.GET("/skills", skillHandler.GetSkills)
	aboutGroup.POST("/skills", skillHandler.CreateCategory, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	aboutGroup.PATCH("/skills/:id", skillHandler.UpdateCategory, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	aboutGroup.DELETE("/skills/:id", skillHandler.DeleteCategory, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	aboutGroup.POST("/skills/:id/tags", skillHandler.AddTag, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	aboutGroup.DELETE("/skills/tags/:tag_id", skillHandler.DeleteTag, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))

	aboutGroup.PATCH("/avatar", h.UpdateAvatar, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
}
