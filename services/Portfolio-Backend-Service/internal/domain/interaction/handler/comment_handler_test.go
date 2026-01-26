package handler

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/usecase"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestCreateComment_StrictContentType(t *testing.T) {
	e := echo.New()
	t.Run("415 Unsupported Media Type", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		reqBody := `{"content": "hello"}`
		req := httptest.NewRequest(http.MethodPost, "/comment", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMETextPlain) // Invalid
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.CreateComment(c)) {
			assert.Equal(t, http.StatusUnsupportedMediaType, rec.Code)
		}
	})

	t.Run("422 Unprocessable Entity - Missing Email", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		// Missing email
		reqBody := `{"post_type": "blog", "post_slug": "slug", "user_name": "user", "content": "hello"}`
		req := httptest.NewRequest(http.MethodPost, "/comment", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.CreateComment(c)) {
			assert.Equal(t, http.StatusUnprocessableEntity, rec.Code)
		}
	})

	t.Run("201 Created - Anonymous Success", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("CreateComment", mock.Anything, mock.MatchedBy(func(req usecase.CreateCommentRequest) bool {
			return req.PostType == "blog" && req.Email == "test@example.com"
		})).Return(nil)

		reqBody := `{"post_type": "blog", "post_slug": "slug", "user_name": "user", "email": "test@example.com", "content": "hello"}`
		req := httptest.NewRequest(http.MethodPost, "/comment", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.CreateComment(c)) {
			assert.Equal(t, http.StatusCreated, rec.Code)
		}
	})
}

func TestDeleteComment_Authorization(t *testing.T) {
	e := echo.New()
	t.Run("401 Unauthorized - No Role", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		req := httptest.NewRequest(http.MethodDelete, "/comments/1", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("1")

		if assert.NoError(t, h.DeleteComment(c)) {
			assert.Equal(t, http.StatusUnauthorized, rec.Code)
		}
	})

	t.Run("403 Forbidden - Role is user", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("DeleteComment", mock.Anything, "1", "user").Return(errors.New("unauthorized: admin role required"))

		req := httptest.NewRequest(http.MethodDelete, "/comments/1", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("1")
		c.Set("role", "user")

		if assert.NoError(t, h.DeleteComment(c)) {
			assert.Equal(t, http.StatusForbidden, rec.Code)
		}
	})

	t.Run("200 OK - Role is admin", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("DeleteComment", mock.Anything, "1", "admin").Return(nil)

		req := httptest.NewRequest(http.MethodDelete, "/comments/1", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("1")
		c.Set("role", "admin")

		if assert.NoError(t, h.DeleteComment(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)
		}
	})
}
