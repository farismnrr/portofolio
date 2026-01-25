package handler

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestUpdateBlog_StrictContentType(t *testing.T) {
	e := echo.New()
	t.Run("415 Unsupported Media Type", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		reqBody := `{"views_count": 10}`
		req := httptest.NewRequest(http.MethodPatch, "/blog/slug", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMETextPlain) // Invalid
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("slug")

		if assert.NoError(t, h.UpdateBlog(c)) {
			assert.Equal(t, http.StatusUnsupportedMediaType, rec.Code)
		}
	})
}
