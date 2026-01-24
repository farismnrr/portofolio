package about

import (
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/handler"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/repository"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/usecase"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func RegisterAboutRoutes(e *echo.Group, db *gorm.DB) {
	repo := repository.NewAboutRepository(db)
	uc := usecase.NewAboutUsecase(repo)
	h := handler.NewAboutHandler(uc)

	aboutGroup := e.Group("/about")
	aboutGroup.GET("", h.GetAbout)
	aboutGroup.PATCH("", h.UpdateAbout)
}
