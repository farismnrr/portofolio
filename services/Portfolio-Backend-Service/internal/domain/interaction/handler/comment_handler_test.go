package handler

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/entity"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/usecase"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// TestCreateComment - Contract: docs/contracts/interaction/comments/create.md
func TestCreateComment(t *testing.T) {
	e := echo.New()

	t.Run("201 Created - Valid request", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("CreateComment", mock.Anything, mock.MatchedBy(func(req usecase.CreateCommentRequest) bool {
			return req.PostType == "blog" && req.Email == "test@example.com"
		})).Return(nil)

		reqBody := `{"post_type": "blog", "post_slug": "slug", "user_name": "user", "email": "test@example.com", "content": "hello"}`
		req := httptest.NewRequest(http.MethodPost, "/v1/interactions/blog/slug/comments", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.CreateComment(c))
		assert.Equal(t, http.StatusCreated, rec.Code)
	})

	t.Run("415 Unsupported Media Type", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		reqBody := `{"content": "hello"}`
		req := httptest.NewRequest(http.MethodPost, "/v1/interactions/blog/slug/comments", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMETextPlain)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.CreateComment(c))
		assert.Equal(t, http.StatusUnsupportedMediaType, rec.Code)
	})

	t.Run("422 Unprocessable Entity - Missing Email", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		reqBody := `{"post_type": "blog", "post_slug": "slug", "user_name": "user", "content": "hello"}`
		req := httptest.NewRequest(http.MethodPost, "/v1/interactions/blog/slug/comments", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.CreateComment(c))
		assert.Equal(t, http.StatusUnprocessableEntity, rec.Code)
	})
}

// TestGetComments - Contract: docs/contracts/interaction/comments/list.md
func TestGetComments(t *testing.T) {
	e := echo.New()

	t.Run("200 OK - Returns comments list", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		comments := []entity.Comment{
			{
				PostType: "blog",
				PostSlug: "slug",
				UserName: "User 1",
				Email:    "user1@test.com",
				Content:  "Comment 1",
			},
			{
				PostType: "blog",
				PostSlug: "slug",
				UserName: "User 2",
				Email:    "user2@test.com",
				Content:  "Comment 2",
			},
		}
		mockUC.On("GetComments", mock.Anything, "blog", "slug").Return(comments, nil)

		req := httptest.NewRequest(http.MethodGet, "/v1/interactions/blog/slug/comments", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("post_type", "post_slug")
		c.SetParamValues("blog", "slug")

		assert.NoError(t, h.GetComments(c))
		assert.Equal(t, http.StatusOK, rec.Code)
		mockUC.AssertExpectations(t)
	})

	t.Run("200 OK - Empty list", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("GetComments", mock.Anything, "blog", "slug").Return([]entity.Comment{}, nil)

		req := httptest.NewRequest(http.MethodGet, "/v1/interactions/blog/slug/comments", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("post_type", "post_slug")
		c.SetParamValues("blog", "slug")

		assert.NoError(t, h.GetComments(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})
}

// TestUpdateComment - Contract: docs/contracts/interaction/comments/update.md
func TestUpdateComment(t *testing.T) {
	e := echo.New()

	t.Run("200 OK - Comment updated", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("UpdateComment", mock.Anything, "comment-1", "Updated content", "admin").Return(nil)

		body := `{"content": "Updated content"}`
		req := httptest.NewRequest(http.MethodPatch, "/v1/interactions/comments/comment-1", strings.NewReader(body))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("comment-1")
		c.Set("role", "admin")

		assert.NoError(t, h.UpdateComment(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("400 Bad Request - Invalid JSON", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		req := httptest.NewRequest(http.MethodPatch, "/v1/interactions/comments/comment-1", strings.NewReader("invalid"))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("comment-1")

		assert.NoError(t, h.UpdateComment(c))
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})
}

// TestDeleteComment - Contract: docs/contracts/interaction/comments/delete.md
func TestDeleteComment(t *testing.T) {
	e := echo.New()

	t.Run("200 OK - Admin deletes comment", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("DeleteComment", mock.Anything, "1", "admin").Return(nil)

		req := httptest.NewRequest(http.MethodDelete, "/v1/interactions/comments/1", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("1")
		c.Set("role", "admin")

		assert.NoError(t, h.DeleteComment(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("401 Unauthorized - No role", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		req := httptest.NewRequest(http.MethodDelete, "/v1/interactions/comments/1", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("1")

		assert.NoError(t, h.DeleteComment(c))
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
	})

	t.Run("403 Forbidden - User role", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("DeleteComment", mock.Anything, "1", "user").Return(errors.New("unauthorized: admin role required"))

		req := httptest.NewRequest(http.MethodDelete, "/v1/interactions/comments/1", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("1")
		c.Set("role", "user")

		assert.NoError(t, h.DeleteComment(c))
		assert.Equal(t, http.StatusForbidden, rec.Code)
	})

	t.Run("404 Not Found", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("DeleteComment", mock.Anything, "999", "admin").Return(errors.New("not found"))

		req := httptest.NewRequest(http.MethodDelete, "/v1/interactions/comments/999", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("999")
		c.Set("role", "admin")

		assert.NoError(t, h.DeleteComment(c))
		assert.Equal(t, http.StatusNotFound, rec.Code)
	})
}
