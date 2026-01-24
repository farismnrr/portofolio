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

// MockEducationUsecase
type MockEducationUsecase struct {
	mock.Mock
}

func (m *MockEducationUsecase) GetEducations(ctx context.Context) ([]entity.Education, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]entity.Education), args.Error(1)
}
func (m *MockEducationUsecase) GetEducationByID(ctx context.Context, id string) (*entity.Education, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.Education), args.Error(1)
}
func (m *MockEducationUsecase) CreateEducation(ctx context.Context, edu *entity.Education) error {
	args := m.Called(ctx, edu)
	return args.Error(0)
}
func (m *MockEducationUsecase) UpdateEducation(ctx context.Context, edu *entity.Education) error {
	args := m.Called(ctx, edu)
	return args.Error(0)
}
func (m *MockEducationUsecase) DeleteEducation(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestGetEducations(t *testing.T) {
	e := echo.New()
	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockEducationUsecase)
		h := NewEducationHandler(mockUC)

		edus := []entity.Education{{Institution: "MIT"}}
		mockUC.On("GetEducations", mock.Anything).Return(edus, nil)

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.GetEducations(c))
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Contains(t, rec.Body.String(), "Education history retrieved successfully")
		assert.Contains(t, rec.Body.String(), "MIT")
	})
}

func TestCreateEducation(t *testing.T) {
	e := echo.New()
	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockEducationUsecase)
		h := NewEducationHandler(mockUC)

		reqBody := `{"institution":"MIT","degree":"BSc","period":"2015-2019"}`
		mockUC.On("CreateEducation", mock.Anything, mock.MatchedBy(func(e *entity.Education) bool {
			return e.Institution == "MIT"
		})).Return(nil)

		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.CreateEducation(c))
		assert.Equal(t, http.StatusCreated, rec.Code)
		assert.Contains(t, rec.Body.String(), "Education entry created successfully")
	})

	t.Run("ValidationFailed", func(t *testing.T) {
		mockUC := new(MockEducationUsecase)
		h := NewEducationHandler(mockUC)

		// Missing degree
		reqBody := `{"institution":"MIT","period":"2015-2019"}`
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.CreateEducation(c))
		assert.Equal(t, 422, rec.Code)
	})
}

func TestDeleteEducation(t *testing.T) {
	e := echo.New()
	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockEducationUsecase)
		h := NewEducationHandler(mockUC)

		mockUC.On("GetEducationByID", mock.Anything, "1").Return(&entity.Education{ID: "1"}, nil)
		mockUC.On("DeleteEducation", mock.Anything, "1").Return(nil)

		req := httptest.NewRequest(http.MethodDelete, "/1", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetPath("/:id")
		c.SetParamNames("id")
		c.SetParamValues("1")

		assert.NoError(t, h.DeleteEducation(c))
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Contains(t, rec.Body.String(), "Education entry deleted successfully")
	})
}
