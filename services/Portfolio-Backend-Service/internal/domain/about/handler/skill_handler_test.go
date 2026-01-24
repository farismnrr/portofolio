package handler

import (
	"context"
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

func TestGetSkills(t *testing.T) {
	e := echo.New()
	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockSkillUsecase)
		h := NewSkillHandler(mockUC)

		cats := []entity.SkillCategory{{Title: "Backend"}}
		mockUC.On("GetSkillCategories", mock.Anything).Return(cats, nil)

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.GetSkills(c))
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Contains(t, rec.Body.String(), "Backend")
	})
}

func TestCreateCategory(t *testing.T) {
	e := echo.New()
	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockSkillUsecase)
		h := NewSkillHandler(mockUC)

		reqBody := `{"title":"Backend","order_by":1}`
		mockUC.On("CreateCategory", mock.Anything, mock.MatchedBy(func(c *entity.SkillCategory) bool {
			return c.Title == "Backend"
		})).Return(nil)

		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.CreateCategory(c))
		assert.Equal(t, http.StatusCreated, rec.Code)
	})

	t.Run("ValidationFailed", func(t *testing.T) {
		mockUC := new(MockSkillUsecase)
		h := NewSkillHandler(mockUC)

		reqBody := `{"description":"No title"}`
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.CreateCategory(c))
		assert.Equal(t, 422, rec.Code)
	})
}

func TestAddTag(t *testing.T) {
	e := echo.New()
	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockSkillUsecase)
		h := NewSkillHandler(mockUC)

		mockUC.On("GetCategoryByID", mock.Anything, "1").Return(&entity.SkillCategory{ID: "1"}, nil)
		mockUC.On("AddTag", mock.Anything, mock.MatchedBy(func(t *entity.SkillTag) bool {
			return t.Name == "Go"
		})).Return(nil)

		reqBody := `{"name":"Go","order_by":1}`
		req := httptest.NewRequest(http.MethodPost, "/1/tags", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetPath("/:id/tags")
		c.SetParamNames("id")
		c.SetParamValues("1")

		assert.NoError(t, h.AddTag(c))
		assert.Equal(t, http.StatusCreated, rec.Code)
	})
}

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
	})
}
