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

// TestGetEducations - Contract: docs/contracts/about/education/list.md
func TestGetEducations(t *testing.T) {
	e := echo.New()
	t.Run("Case 1: Successfully Retrieve", func(t *testing.T) {
		mockUC := new(MockEducationUsecase)
		h := NewEducationHandler(mockUC)

		edus := []entity.Education{{ID: "uuid-1", Institution: "MIT", Degree: "BSc"}}
		mockUC.On("GetEducations", mock.Anything).Return(edus, nil)

		req := httptest.NewRequest(http.MethodGet, "/v1/about/education", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.GetEducations(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)
			var response struct {
				Status bool `json:"status"`
				Data   struct {
					Educations []entity.Education `json:"educations"`
				} `json:"data"`
			}
			_ = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.True(t, response.Status)
			assert.NotEmpty(t, response.Data.Educations)
		}
	})

	t.Run("Case 2: Internal Server Error", func(t *testing.T) {
		mockUC := new(MockEducationUsecase)
		h := NewEducationHandler(mockUC)

		mockUC.On("GetEducations", mock.Anything).Return(nil, errors.New("db error"))

		req := httptest.NewRequest(http.MethodGet, "/v1/about/education", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.GetEducations(c)) {
			assert.Equal(t, http.StatusInternalServerError, rec.Code)
		}
	})
}

// TestCreateEducation - Contract: docs/contracts/about/education/create.md
func TestCreateEducation(t *testing.T) {
	e := echo.New()
	t.Run("Case 1: Created", func(t *testing.T) {
		mockUC := new(MockEducationUsecase)
		h := NewEducationHandler(mockUC)

		reqBody := `{"institution":"MIT","degree":"BSc","period":"2015-2019"}`
		mockUC.On("CreateEducation", mock.Anything, mock.MatchedBy(func(e *entity.Education) bool {
			return e.Institution == "MIT"
		})).Return(nil).Run(func(args mock.Arguments) {
			edu := args.Get(1).(*entity.Education)
			edu.ID = "new-uuid"
		})

		req := httptest.NewRequest(http.MethodPost, "/v1/about/education", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.CreateEducation(c)) {
			assert.Equal(t, http.StatusCreated, rec.Code)
			var response struct {
				Status bool `json:"status"`
				Data   struct {
					EducationID string `json:"education_id"`
				} `json:"data"`
			}
			_ = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.True(t, response.Status)
			assert.Equal(t, "new-uuid", response.Data.EducationID)
		}
	})

	t.Run("Case 2: Validation Failed (422)", func(t *testing.T) {
		mockUC := new(MockEducationUsecase)
		h := NewEducationHandler(mockUC)

		reqBody := `{"institution":"","degree":"BSc"}`
		req := httptest.NewRequest(http.MethodPost, "/v1/about/education", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.CreateEducation(c)) {
			assert.Equal(t, 422, rec.Code)
		}
	})

	t.Run("Case 3: Unsupported Media Type (415)", func(t *testing.T) {
		mockUC := new(MockEducationUsecase)
		h := NewEducationHandler(mockUC)

		reqBody := `{"institution":"MIT"}`
		req := httptest.NewRequest(http.MethodPost, "/v1/about/education", strings.NewReader(reqBody))
		// No Content-Type or wrong type
		req.Header.Set(echo.HeaderContentType, echo.MIMETextPlain)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.CreateEducation(c)) {
			assert.Equal(t, http.StatusUnsupportedMediaType, rec.Code)
		}
	})

}

// TestUpdateEducation - Contract: docs/contracts/about/education/update.md
func TestUpdateEducation(t *testing.T) {
	e := echo.New()
	t.Run("Case 1: Successfully Updated", func(t *testing.T) {
		mockUC := new(MockEducationUsecase)
		h := NewEducationHandler(mockUC)

		id := "uuid-1"
		mockUC.On("GetEducationByID", mock.Anything, id).Return(&entity.Education{ID: id}, nil)
		mockUC.On("UpdateEducation", mock.Anything, mock.Anything).Return(nil)

		reqBody := `{"institution":"MIT Updated"}`
		req := httptest.NewRequest(http.MethodPatch, "/v1/about/education/"+id, strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues(id)

		if assert.NoError(t, h.UpdateEducation(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)
			var response struct {
				Data interface{} `json:"data"`
			}
			_ = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.Nil(t, response.Data)
		}
	})

	t.Run("Case 2: Not Found (404)", func(t *testing.T) {
		mockUC := new(MockEducationUsecase)
		h := NewEducationHandler(mockUC)

		mockUC.On("GetEducationByID", mock.Anything, "999").Return(nil, errors.New("not found"))

		req := httptest.NewRequest(http.MethodPatch, "/v1/about/education/999", strings.NewReader(`{}`))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("999")

		if assert.NoError(t, h.UpdateEducation(c)) {
			assert.Equal(t, http.StatusNotFound, rec.Code)
		}
	})

	t.Run("Case 3: Unsupported Media Type (415)", func(t *testing.T) {
		mockUC := new(MockEducationUsecase)
		h := NewEducationHandler(mockUC)

		reqBody := `{"institution":"UPDATED"}`
		req := httptest.NewRequest(http.MethodPatch, "/v1/about/education/1", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMETextPlain)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("1")

		// Mock GetEducationByID because it's called before binding
		mockUC.On("GetEducationByID", mock.Anything, "1").Return(&entity.Education{ID: "1"}, nil)

		if assert.NoError(t, h.UpdateEducation(c)) {
			assert.Equal(t, http.StatusUnsupportedMediaType, rec.Code)
		}
	})

}

// TestDeleteEducation - Contract: docs/contracts/about/education/delete.md
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
