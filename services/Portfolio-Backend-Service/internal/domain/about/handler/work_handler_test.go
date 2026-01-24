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

// MockWorkUsecase
type MockWorkUsecase struct {
	mock.Mock
}

func (m *MockWorkUsecase) GetWorkExperiences(ctx context.Context) ([]entity.WorkExperience, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]entity.WorkExperience), args.Error(1)
}
func (m *MockWorkUsecase) GetWorkExperienceByID(ctx context.Context, id string) (*entity.WorkExperience, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.WorkExperience), args.Error(1)
}
func (m *MockWorkUsecase) CreateWorkExperience(ctx context.Context, work *entity.WorkExperience) error {
	args := m.Called(ctx, work)
	return args.Error(0)
}
func (m *MockWorkUsecase) UpdateWorkExperience(ctx context.Context, work *entity.WorkExperience) error {
	args := m.Called(ctx, work)
	return args.Error(0)
}
func (m *MockWorkUsecase) DeleteWorkExperience(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}
func (m *MockWorkUsecase) AddAchievement(ctx context.Context, achievement *entity.WorkAchievement) error {
	args := m.Called(ctx, achievement)
	return args.Error(0)
}
func (m *MockWorkUsecase) DeleteAchievement(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}
func (m *MockWorkUsecase) GetAchievementByID(ctx context.Context, id string) (*entity.WorkAchievement, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.WorkAchievement), args.Error(1)
}

func TestGetWorkExperiences(t *testing.T) {
	e := echo.New()
	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockWorkUsecase)
		h := NewWorkHandler(mockUC)

		works := []entity.WorkExperience{{Company: "Google"}}
		mockUC.On("GetWorkExperiences", mock.Anything).Return(works, nil)

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.GetWorkExperiences(c))
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Contains(t, rec.Body.String(), "Google")
	})
}

func TestCreateWorkExperience(t *testing.T) {
	e := echo.New()
	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockWorkUsecase)
		h := NewWorkHandler(mockUC)

		reqBody := `{"company":"Tech Corp","role":"Dev","timeframe":"2020-2021"}`
		mockUC.On("CreateWorkExperience", mock.Anything, mock.MatchedBy(func(w *entity.WorkExperience) bool {
			return w.Company == "Tech Corp"
		})).Return(nil)

		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.CreateWorkExperience(c))
		assert.Equal(t, http.StatusCreated, rec.Code)
	})

	t.Run("ValidationFailed", func(t *testing.T) {
		mockUC := new(MockWorkUsecase)
		h := NewWorkHandler(mockUC)

		// Missing role
		reqBody := `{"company":"Tech Corp","timeframe":"2020-2021"}`
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.CreateWorkExperience(c))
		assert.Equal(t, 422, rec.Code)
	})
}

func TestDeleteWorkExperience(t *testing.T) {
	e := echo.New()
	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockWorkUsecase)
		h := NewWorkHandler(mockUC)

		mockUC.On("GetWorkExperienceByID", mock.Anything, "1").Return(&entity.WorkExperience{ID: "1"}, nil)
		mockUC.On("DeleteWorkExperience", mock.Anything, "1").Return(nil)

		req := httptest.NewRequest(http.MethodDelete, "/1", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetPath("/:id")
		c.SetParamNames("id")
		c.SetParamValues("1")

		assert.NoError(t, h.DeleteWorkExperience(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})
}

func TestAddAchievement(t *testing.T) {
	e := echo.New()
	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockWorkUsecase)
		h := NewWorkHandler(mockUC)

		mockUC.On("GetWorkExperienceByID", mock.Anything, "1").Return(&entity.WorkExperience{ID: "1"}, nil)
		mockUC.On("AddAchievement", mock.Anything, mock.Anything).Return(nil)

		reqBody := `{"content":"Shipped feature X","order_by":1}`
		req := httptest.NewRequest(http.MethodPost, "/1/achievements", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetPath("/:id/achievements")
		c.SetParamNames("id")
		c.SetParamValues("1")

		assert.NoError(t, h.AddAchievement(c))
		assert.Equal(t, http.StatusCreated, rec.Code)
	})
}
