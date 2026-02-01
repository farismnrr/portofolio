package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/entity"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// TestListBlogs - Contract: docs/contracts/interaction/blogs/list.md
func TestListBlogs(t *testing.T) {
	e := echo.New()

	t.Run("Success - Returns list", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		blogs := []entity.BlogsMetadata{
			{Slug: "blog-1", Title: "Blog 1", ViewsCount: 200},
			{Slug: "blog-2", Title: "Blog 2", ViewsCount: 100},
		}
		mockUC.On("ListBlogs", mock.Anything).Return(blogs, nil)

		req := httptest.NewRequest(http.MethodGet, "/v1/interactions/blogs", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.ListBlogs(c))
		assert.Equal(t, http.StatusOK, rec.Code)
		mockUC.AssertExpectations(t)
	})

	t.Run("Success - Empty list", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("ListBlogs", mock.Anything).Return([]entity.BlogsMetadata{}, nil)

		req := httptest.NewRequest(http.MethodGet, "/v1/interactions/blogs", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.ListBlogs(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})
}

// TestGetBlog - Contract: docs/contracts/interaction/blogs/get.md
func TestGetBlog(t *testing.T) {
	e := echo.New()
	
	t.Run("Success - Blog found", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("GetBlog", mock.Anything, "blog-slug").Return(&entity.BlogsMetadata{
			Slug: "blog-slug", Title: "Blog Post", ViewsCount: 200,
		}, nil)

		req := httptest.NewRequest(http.MethodGet, "/v1/interactions/blogs/blog-slug", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("blog-slug")

		assert.NoError(t, h.GetBlog(c))
		assert.Equal(t, http.StatusOK, rec.Code)
		mockUC.AssertExpectations(t)
	})

	t.Run("404 Not Found", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("GetBlog", mock.Anything, "non-existent").Return(nil, errors.New("not found"))

		req := httptest.NewRequest(http.MethodGet, "/v1/interactions/blogs/non-existent", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("non-existent")

		assert.NoError(t, h.GetBlog(c))
		assert.Equal(t, http.StatusNotFound, rec.Code)
	})
}

// TestCreateBlog - Contract: docs/contracts/interaction/blogs/create.md
func TestCreateBlog(t *testing.T) {
	e := echo.New()

	t.Run("201 Created", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("CreateBlog", mock.Anything, mock.AnythingOfType("*entity.BlogsMetadata"), mock.Anything).Return(nil)

		body := map[string]interface{}{
			"title":  "New Blog Post",
			"slug":   "new-blog-post",
			"author": "John Doe",
		}
		bodyBytes, _ := json.Marshal(body)
		req := httptest.NewRequest(http.MethodPost, "/v1/interactions/blogs", bytes.NewReader(bodyBytes))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.CreateBlog(c))
		assert.Equal(t, http.StatusCreated, rec.Code)
	})

	t.Run("400 Bad Request - Invalid JSON", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		req := httptest.NewRequest(http.MethodPost, "/v1/interactions/blogs", strings.NewReader("invalid json"))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.CreateBlog(c))
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})
}

// TestUpdateBlog - Contract: docs/contracts/interaction/blogs/full_update.md
func TestUpdateBlog(t *testing.T) {
	e := echo.New()

	t.Run("200 OK - Full update", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("UpdateBlog", mock.Anything, mock.AnythingOfType("*entity.BlogsMetadata"), mock.Anything).Return(nil)

		body := map[string]interface{}{
			"title":  "Updated Title",
			"slug":   "updated-slug",
			"author": "Jane Doe",
		}
		bodyBytes, _ := json.Marshal(body)
		req := httptest.NewRequest(http.MethodPut, "/v1/interactions/blogs/1", bytes.NewReader(bodyBytes))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("1")

		assert.NoError(t, h.UpdateBlog(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("400 Bad Request - Invalid JSON", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		req := httptest.NewRequest(http.MethodPut, "/v1/interactions/blogs/1", strings.NewReader("invalid json"))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("1")

		assert.NoError(t, h.UpdateBlog(c))
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})
}

// TestUpdateBlogMetadata - Contract: docs/contracts/interaction/blogs/update.md
func TestUpdateBlogMetadata(t *testing.T) {
	e := echo.New()

	t.Run("200 OK - Metadata updated", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("UpdateBlogMetadata", mock.Anything, "blog-slug", 300, 60).Return(nil)

		body := `{"views_count": 300, "likes_count": 60}`
		req := httptest.NewRequest(http.MethodPatch, "/v1/interactions/blogs/blog-slug", strings.NewReader(body))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("blog-slug")

		assert.NoError(t, h.UpdateBlogMetadata(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("415 Unsupported Media Type", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		reqBody := `{"views_count": 10}`
		req := httptest.NewRequest(http.MethodPatch, "/blog/slug", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMETextPlain)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("slug")

		assert.NoError(t, h.UpdateBlogMetadata(c))
		assert.Equal(t, http.StatusUnsupportedMediaType, rec.Code)
	})
}

// TestDeleteBlog - Contract: docs/contracts/interaction/blogs/delete.md
func TestDeleteBlog(t *testing.T) {
	e := echo.New()

	t.Run("200 OK - Blog deleted", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("DeleteBlog", mock.Anything, "1").Return(nil)

		req := httptest.NewRequest(http.MethodDelete, "/v1/interactions/blogs/1", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("1")

		assert.NoError(t, h.DeleteBlog(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("404 Not Found", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("DeleteBlog", mock.Anything, "999").Return(errors.New("not found"))

		req := httptest.NewRequest(http.MethodDelete, "/v1/interactions/blogs/999", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("999")

		assert.NoError(t, h.DeleteBlog(c))
		assert.Equal(t, http.StatusNotFound, rec.Code)
	})
}

// TestViewBlog - Contract: docs/contracts/interaction/blogs/view.md
func TestViewBlog(t *testing.T) {
	e := echo.New()

	t.Run("200 OK - View recorded", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("IncrementBlogViews", mock.Anything, "blog-slug").Return(nil)

		req := httptest.NewRequest(http.MethodPost, "/v1/interactions/blogs/blog-slug/view", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("blog-slug")

		assert.NoError(t, h.ViewBlog(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})
}

// TestLikeBlog - Contract: docs/contracts/interaction/blogs/like.md
func TestLikeBlog(t *testing.T) {
	e := echo.New()

	t.Run("200 OK - Like recorded", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("IncrementBlogLikes", mock.Anything, "blog-slug").Return(nil)

		req := httptest.NewRequest(http.MethodPost, "/v1/interactions/blogs/blog-slug/like", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("blog-slug")

		assert.NoError(t, h.LikeBlog(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})
}
