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

// TestListWorks - Contract: docs/contracts/interaction/works/list.md
func TestListWorks(t *testing.T) {
	e := echo.New()

	t.Run("Success - Returns list", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		works := []entity.WorksMetadata{
			{Slug: "project-1", Title: "Project 1", ViewsCount: 100},
			{Slug: "project-2", Title: "Project 2", ViewsCount: 50},
		}
		mockUC.On("ListWorks", mock.Anything).Return(works, nil)

		req := httptest.NewRequest(http.MethodGet, "/v1/interactions/works", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.ListWorks(c))
		assert.Equal(t, http.StatusOK, rec.Code)
		mockUC.AssertExpectations(t)
	})

	t.Run("Success - Empty list", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("ListWorks", mock.Anything).Return([]entity.WorksMetadata{}, nil)

		req := httptest.NewRequest(http.MethodGet, "/v1/interactions/works", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.ListWorks(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})
}

// TestGetWork - Contract: docs/contracts/interaction/works/get.md
func TestGetWork(t *testing.T) {
	e := echo.New()
	
	t.Run("Success - Work found", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("GetWork", mock.Anything, "project-slug").Return(&entity.WorksMetadata{
			Slug: "project-slug", Title: "Project", ViewsCount: 10,
		}, nil)

		req := httptest.NewRequest(http.MethodGet, "/v1/interactions/works/project-slug", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("project-slug")

		assert.NoError(t, h.GetWork(c))
		assert.Equal(t, http.StatusOK, rec.Code)
		mockUC.AssertExpectations(t)
	})

	t.Run("404 Not Found", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("GetWork", mock.Anything, "non-existent").Return(nil, errors.New("not found"))

		req := httptest.NewRequest(http.MethodGet, "/v1/interactions/works/non-existent", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("non-existent")

		assert.NoError(t, h.GetWork(c))
		assert.Equal(t, http.StatusNotFound, rec.Code)
	})
}

// TestCreateWork - Contract: docs/contracts/interaction/works/create.md
func TestCreateWork(t *testing.T) {
	e := echo.New()

	t.Run("201 Created", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("CreateWork", mock.Anything, mock.AnythingOfType("*entity.WorksMetadata"), mock.Anything).Return(nil)

		body := map[string]interface{}{
			"title": "New Project",
			"slug":  "new-project",
		}
		bodyBytes, _ := json.Marshal(body)
		req := httptest.NewRequest(http.MethodPost, "/v1/interactions/works", bytes.NewReader(bodyBytes))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.CreateWork(c))
		assert.Equal(t, http.StatusCreated, rec.Code)
	})

	t.Run("400 Bad Request - Invalid JSON", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		req := httptest.NewRequest(http.MethodPost, "/v1/interactions/works", strings.NewReader("invalid json"))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.CreateWork(c))
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})
}

// TestUpdateWork - Contract: docs/contracts/interaction/works/full_update.md
func TestUpdateWork(t *testing.T) {
	e := echo.New()

	t.Run("200 OK - Full update", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("UpdateWork", mock.Anything, mock.AnythingOfType("*entity.WorksMetadata"), mock.Anything).Return(nil)

		body := map[string]interface{}{
			"title": "Updated Title",
			"slug":  "updated-slug",
		}
		bodyBytes, _ := json.Marshal(body)
		req := httptest.NewRequest(http.MethodPut, "/v1/interactions/works/1", bytes.NewReader(bodyBytes))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("1")

		assert.NoError(t, h.UpdateWork(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("400 Bad Request - Invalid UUID", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		req := httptest.NewRequest(http.MethodPut, "/v1/interactions/works/1", strings.NewReader("invalid json"))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("1")

		assert.NoError(t, h.UpdateWork(c))
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})
}

// TestUpdateWorkMetadata - Contract: docs/contracts/interaction/works/update.md
func TestUpdateWorkMetadata(t *testing.T) {
	e := echo.New()

	t.Run("200 OK - Metadata updated", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("UpdateWorkMetadata", mock.Anything, "project-slug", 150, 30).Return(nil)

		body := `{"views_count": 150, "likes_count": 30}`
		req := httptest.NewRequest(http.MethodPatch, "/v1/interactions/works/project-slug", strings.NewReader(body))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("project-slug")

		assert.NoError(t, h.UpdateWorkMetadata(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("415 Unsupported Media Type", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		reqBody := `{"views_count": 10}`
		req := httptest.NewRequest(http.MethodPatch, "/work/slug", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMETextPlain)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("slug")

		assert.NoError(t, h.UpdateWorkMetadata(c))
		assert.Equal(t, http.StatusUnsupportedMediaType, rec.Code)
	})
}

// TestDeleteWork - Contract: docs/contracts/interaction/works/delete.md
func TestDeleteWork(t *testing.T) {
	e := echo.New()

	t.Run("200 OK - Work deleted", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("DeleteWork", mock.Anything, "1").Return(nil)

		req := httptest.NewRequest(http.MethodDelete, "/v1/interactions/works/1", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("1")

		assert.NoError(t, h.DeleteWork(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("404 Not Found", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("DeleteWork", mock.Anything, "999").Return(errors.New("not found"))

		req := httptest.NewRequest(http.MethodDelete, "/v1/interactions/works/999", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("999")

		assert.NoError(t, h.DeleteWork(c))
		assert.Equal(t, http.StatusNotFound, rec.Code)
	})
}

// TestViewWork - Contract: docs/contracts/interaction/works/view.md
func TestViewWork(t *testing.T) {
	e := echo.New()

	t.Run("200 OK - View recorded", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("IncrementWorkViews", mock.Anything, "project-slug").Return(nil)

		req := httptest.NewRequest(http.MethodPost, "/v1/interactions/works/project-slug/view", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("project-slug")

		assert.NoError(t, h.ViewWork(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})
}

// TestLikeWork - Contract: docs/contracts/interaction/works/like.md
func TestLikeWork(t *testing.T) {
	e := echo.New()

	t.Run("200 OK - Like recorded", func(t *testing.T) {
		mockUC := new(MockInteractionUsecase)
		h := NewHandler(mockUC, mockUC, mockUC)

		mockUC.On("IncrementWorkLikes", mock.Anything, "project-slug").Return(nil)

		req := httptest.NewRequest(http.MethodPost, "/v1/interactions/works/project-slug/like", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("slug")
		c.SetParamValues("project-slug")

		assert.NoError(t, h.LikeWork(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})
}
