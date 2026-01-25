package interaction

import (
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/config"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/middleware"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/handler"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/repository"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/usecase"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func RegisterRoutes(e *echo.Group, db *gorm.DB, cfg *config.Config) {
	workRepo := repository.NewWorkRepository(db)
	blogRepo := repository.NewBlogRepository(db)
	commentRepo := repository.NewCommentRepository(db)

	workUC := usecase.NewWorkUsecase(workRepo)
	blogUC := usecase.NewBlogUsecase(blogRepo)
	commentUC := usecase.NewCommentUsecase(commentRepo)

	h := handler.NewHandler(workUC, blogUC, commentUC)

	interactions := e.Group("/interactions")

	// Works
	interactions.GET("/works/:slug", h.GetWork)
	interactions.PATCH("/works/:slug/view", h.ViewWork)
	interactions.PATCH("/works/:slug/like", h.LikeWork)
	interactions.PATCH("/works/:slug", h.UpdateWork, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))

	// Blogs
	interactions.GET("/blogs/:slug", h.GetBlog)
	interactions.PATCH("/blogs/:slug/view", h.ViewBlog)
	interactions.PATCH("/blogs/:slug/like", h.LikeBlog)
	interactions.PATCH("/blogs/:slug", h.UpdateBlog, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))

	// Comments
	interactions.POST("/comments", h.CreateComment)
	interactions.GET("/:post_type/:post_slug/comments", h.GetComments)
	interactions.DELETE("/comments/:id", h.DeleteComment, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
}
