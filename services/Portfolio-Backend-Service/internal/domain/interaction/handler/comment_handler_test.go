package handler

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
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

	t.Run("422 Unprocessable Entity - Invalid Post Type", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		// Invalid post_type "invalid"
		reqBody := `{"post_type": "invalid", "post_slug": "slug", "user_name": "user", "content": "hello"}`
		req := httptest.NewRequest(http.MethodPost, "/comment", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.CreateComment(c)) {
			assert.Equal(t, http.StatusUnprocessableEntity, rec.Code)
		}
	})
}
