package handler

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/entity"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestGetWork(t *testing.T) {
	e := echo.New()
	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("GetWork", mock.Anything, "slug").Return(&entity.WorksMetadata{Slug: "slug", ViewsCount: 10}, nil)

		req := httptest.NewRequest(http.MethodGet, "/?slug=slug", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("slug")

		assert.NoError(t, h.GetWork(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})
}

func TestUpdateWork_StrictContentType(t *testing.T) {
	e := echo.New()
	t.Run("415 Unsupported Media Type", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		reqBody := `{"views_count": 10}`
		req := httptest.NewRequest(http.MethodPatch, "/work/slug", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMETextPlain) // Invalid
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("slug")

		if assert.NoError(t, h.UpdateWork(c)) {
			assert.Equal(t, http.StatusUnsupportedMediaType, rec.Code)
		}
	})
}
