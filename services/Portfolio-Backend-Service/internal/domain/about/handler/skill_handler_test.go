package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockSkillUsecase
type MockSkillUsecase struct {
	mock.Mock
}

func (m *MockSkillUsecase) GetSkillCategories(ctx context.Context) ([]entity.SkillCategory, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]entity.SkillCategory), args.Error(1)
}
func (m *MockSkillUsecase) GetCategoryByID(ctx context.Context, id string) (*entity.SkillCategory, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.SkillCategory), args.Error(1)
}
func (m *MockSkillUsecase) CreateCategory(ctx context.Context, category *entity.SkillCategory) error {
	args := m.Called(ctx, category)
	return args.Error(0)
}
func (m *MockSkillUsecase) UpdateCategory(ctx context.Context, category *entity.SkillCategory) error {
	args := m.Called(ctx, category)
	return args.Error(0)
}
func (m *MockSkillUsecase) DeleteCategory(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}
func (m *MockSkillUsecase) AddTag(ctx context.Context, tag *entity.SkillTag) error {
	args := m.Called(ctx, tag)
	return args.Error(0)
}
func (m *MockSkillUsecase) DeleteTag(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}
func (m *MockSkillUsecase) GetTagByID(ctx context.Context, id string) (*entity.SkillTag, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.SkillTag), args.Error(1)
}

// TestGetSkills - Contract: docs/contracts/about/skills/list.md
func TestGetSkills(t *testing.T) {
	e := echo.New()
	t.Run("Case 1: Successfully Retrieve", func(t *testing.T) {
		mockUC := new(MockSkillUsecase)
		h := NewSkillHandler(mockUC)

		cats := []entity.SkillCategory{{ID: "cat-1", Title: "Backend"}}
		mockUC.On("GetSkillCategories", mock.Anything).Return(cats, nil)

		req := httptest.NewRequest(http.MethodGet, "/v1/about/skills", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.GetSkills(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)
			var response struct {
				Status bool `json:"status"`
				Data   struct {
					SkillCategories []entity.SkillCategory `json:"skill_categories"`
				} `json:"data"`
			}
			_ = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.NotEmpty(t, response.Data.SkillCategories)
		}
	})

	t.Run("Case 2: Internal Server Error", func(t *testing.T) {
		mockUC := new(MockSkillUsecase)
		h := NewSkillHandler(mockUC)
		mockUC.On("GetSkillCategories", mock.Anything).Return(nil, errors.New("db error"))

		req := httptest.NewRequest(http.MethodGet, "/v1/about/skills", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.GetSkills(c)) {
			assert.Equal(t, http.StatusInternalServerError, rec.Code)
		}
	})
}

// TestCreateCategory - Contract: docs/contracts/about/skills/create_category.md
func TestCreateCategory(t *testing.T) {
	e := echo.New()
	t.Run("Case 1: Created", func(t *testing.T) {
		mockUC := new(MockSkillUsecase)
		h := NewSkillHandler(mockUC)

		reqBody := `{"title":"Backend","order_by":1}`
		mockUC.On("CreateCategory", mock.Anything, mock.MatchedBy(func(c *entity.SkillCategory) bool {
			return c.Title == "Backend"
		})).Return(nil).Run(func(args mock.Arguments) {
			cat := args.Get(1).(*entity.SkillCategory)
			cat.ID = "new-cat-uuid"
		})

		req := httptest.NewRequest(http.MethodPost, "/v1/about/skills", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.CreateCategory(c)) {
			assert.Equal(t, http.StatusCreated, rec.Code)
			var response struct {
				Data struct {
					CategoryID string `json:"category_id"`
				} `json:"data"`
			}
			_ = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.Equal(t, "new-cat-uuid", response.Data.CategoryID)
		}
	})

	t.Run("Case 2: Validation Failed (422)", func(t *testing.T) {
		mockUC := new(MockSkillUsecase)
		h := NewSkillHandler(mockUC)
		reqBody := `{"title":""}` // Missing title
		req := httptest.NewRequest(http.MethodPost, "/v1/about/skills", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.CreateCategory(c)) {
			assert.Equal(t, 422, rec.Code)
		}
	})

	t.Run("Case 3: Unsupported Media Type (415)", func(t *testing.T) {
		mockUC := new(MockSkillUsecase)
		h := NewSkillHandler(mockUC)

		reqBody := `{"title":"Backend"}`
		req := httptest.NewRequest(http.MethodPost, "/v1/about/skills", strings.NewReader(reqBody))
		// Invalid Content-Type
		req.Header.Set(echo.HeaderContentType, echo.MIMETextPlain)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.CreateCategory(c)) {
			assert.Equal(t, http.StatusUnsupportedMediaType, rec.Code)
		}
	})

}

// TestUpdateCategory - Contract: docs/contracts/about/skills/update_category.md
func TestUpdateCategory(t *testing.T) {
	e := echo.New()
	t.Run("Case 1: Successfully Updated", func(t *testing.T) {
		mockUC := new(MockSkillUsecase)
		h := NewSkillHandler(mockUC)

		id := "cat-1"
		mockUC.On("GetCategoryByID", mock.Anything, id).Return(&entity.SkillCategory{ID: id}, nil)
		mockUC.On("UpdateCategory", mock.Anything, mock.Anything).Return(nil)

		reqBody := `{"title":"Frontend"}`
		req := httptest.NewRequest(http.MethodPatch, "/v1/about/skills/"+id, strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues(id)

		if assert.NoError(t, h.UpdateCategory(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)
			var response struct {
				Data interface{} `json:"data"`
			}
			_ = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.Nil(t, response.Data)
		}
	})

	t.Run("Case 2: Unsupported Media Type (415)", func(t *testing.T) {
		mockUC := new(MockSkillUsecase)
		h := NewSkillHandler(mockUC)

		id := "cat-1"
		mockUC.On("GetCategoryByID", mock.Anything, id).Return(&entity.SkillCategory{ID: id}, nil)

		reqBody := `{"title":"Updated"}`
		req := httptest.NewRequest(http.MethodPatch, "/v1/about/skills/"+id, strings.NewReader(reqBody))
		// Invalid Content-Type
		req.Header.Set(echo.HeaderContentType, echo.MIMETextPlain)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues(id)

		if assert.NoError(t, h.UpdateCategory(c)) {
			assert.Equal(t, http.StatusUnsupportedMediaType, rec.Code)
		}
	})

}

// TestAddTag - Contract: docs/contracts/about/skills/add_tag.md
func TestAddTag(t *testing.T) {
	e := echo.New()
	t.Run("Case 1: Successfully Created", func(t *testing.T) {
		mockUC := new(MockSkillUsecase)
		h := NewSkillHandler(mockUC)

		mockUC.On("GetCategoryByID", mock.Anything, "1").Return(&entity.SkillCategory{ID: "1"}, nil)
		mockUC.On("AddTag", mock.Anything, mock.MatchedBy(func(t *entity.SkillTag) bool {
			return t.Name == "Go"
		})).Return(nil).Run(func(args mock.Arguments) {
			tag := args.Get(1).(*entity.SkillTag)
			tag.ID = "new-tag-uuid"
		})

		reqBody := `{"name":"Go","order_by":1}`
		req := httptest.NewRequest(http.MethodPost, "/v1/about/skills/1/tags", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetPath("/:id/tags")
		c.SetParamNames("id")
		c.SetParamValues("1")

		if assert.NoError(t, h.AddTag(c)) {
			assert.Equal(t, http.StatusCreated, rec.Code)
			var response struct {
				Data struct {
					TagID string `json:"tag_id"`
				} `json:"data"`
			}
			_ = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.Equal(t, "new-tag-uuid", response.Data.TagID)
		}
	})

	t.Run("Case 2: Category Not Found (404)", func(t *testing.T) {
		mockUC := new(MockSkillUsecase)
		h := NewSkillHandler(mockUC)
		mockUC.On("GetCategoryByID", mock.Anything, "999").Return(nil, errors.New("not found"))

		req := httptest.NewRequest(http.MethodPost, "/v1/about/skills/999/tags", strings.NewReader(`{}`))
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("999")

		if assert.NoError(t, h.AddTag(c)) {
			assert.Equal(t, http.StatusNotFound, rec.Code)
		}
	})

	t.Run("Case 3: Unsupported Media Type (415)", func(t *testing.T) {
		mockUC := new(MockSkillUsecase)
		h := NewSkillHandler(mockUC)

		mockUC.On("GetCategoryByID", mock.Anything, "1").Return(&entity.SkillCategory{ID: "1"}, nil)

		reqBody := `{"name":"Go"}`
		req := httptest.NewRequest(http.MethodPost, "/v1/about/skills/1/tags", strings.NewReader(reqBody))
		// Invalid Content-Type
		req.Header.Set(echo.HeaderContentType, echo.MIMETextPlain)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("1")

		if assert.NoError(t, h.AddTag(c)) {
			assert.Equal(t, http.StatusUnsupportedMediaType, rec.Code)
		}
	})

}

// TestDeleteTag - Contract: docs/contracts/about/skills/delete_tag.md
func TestDeleteTag(t *testing.T) {
	e := echo.New()
	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockSkillUsecase)
		h := NewSkillHandler(mockUC)

		mockUC.On("GetTagByID", mock.Anything, "tag1").Return(&entity.SkillTag{ID: "tag1"}, nil)
		mockUC.On("DeleteTag", mock.Anything, "tag1").Return(nil)

		req := httptest.NewRequest(http.MethodDelete, "/tags/tag1", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetPath("/tags/:tag_id")
		c.SetParamNames("tag_id")
		c.SetParamValues("tag1")

		assert.NoError(t, h.DeleteTag(c))
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Contains(t, rec.Body.String(), "Skill tag deleted successfully")
	})
}
