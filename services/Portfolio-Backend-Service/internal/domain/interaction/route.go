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
	seoRepo := repository.NewSEORepository(db)
	workRepo := repository.NewWorkRepository(db)
	blogRepo := repository.NewBlogRepository(db)
	commentRepo := repository.NewCommentRepository(db)

	workUC := usecase.NewWorkUsecase(workRepo, seoRepo)
	blogUC := usecase.NewBlogUsecase(blogRepo, seoRepo)
	commentUC := usecase.NewCommentUsecase(commentRepo)

	h := handler.NewHandler(workUC, blogUC, commentUC)

	interactions := e.Group("/interactions")

	// Works
	interactions.GET("/works", h.ListWorks)
	interactions.GET("/works/:slug", h.GetWork)
	interactions.POST("/works", h.CreateWork, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	interactions.PUT("/works/:id", h.UpdateWork, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	interactions.DELETE("/works/:id", h.DeleteWork, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	interactions.PATCH("/works/:slug", h.UpdateWorkMetadata, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	interactions.POST("/works/:slug/view", h.ViewWork)
	interactions.POST("/works/:slug/like", h.LikeWork)

	// Blogs
	interactions.GET("/blogs", h.ListBlogs)
	interactions.GET("/blogs/:slug", h.GetBlog)
	interactions.POST("/blogs", h.CreateBlog, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	interactions.PUT("/blogs/:id", h.UpdateBlog, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	interactions.DELETE("/blogs/:id", h.DeleteBlog, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	interactions.PATCH("/blogs/:slug", h.UpdateBlogMetadata, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	interactions.POST("/blogs/:slug/view", h.ViewBlog)
	interactions.POST("/blogs/:slug/like", h.LikeBlog)

	// Comments
	interactions.POST("/comments", h.CreateComment)
	interactions.GET("/:post_type/:post_slug/comments", h.GetComments)
	interactions.PATCH("/comments/:id", h.UpdateComment, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
	interactions.DELETE("/comments/:id", h.DeleteComment, middleware.RequireAuth(cfg), middleware.RequireRole("admin"))
}
