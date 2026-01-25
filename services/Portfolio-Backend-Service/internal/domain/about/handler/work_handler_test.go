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

func TestGetWorkExperiences(t *testing.T) {
	e := echo.New()
	t.Run("Case 1: Successfully Retrieve", func(t *testing.T) {
		mockUC := new(MockWorkUsecase)
		h := NewWorkHandler(mockUC)

		works := []entity.WorkExperience{{ID: "uuid-1", Company: "Google"}}
		mockUC.On("GetWorkExperiences", mock.Anything).Return(works, nil)

		req := httptest.NewRequest(http.MethodGet, "/v1/about/work-experiences", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.GetWorkExperiences(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)
			var response struct {
				Status bool `json:"status"`
				Data   struct {
					WorkExperiences []entity.WorkExperience `json:"work_experiences"`
				} `json:"data"`
			}
			_ = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.NotEmpty(t, response.Data.WorkExperiences)
		}
	})

	t.Run("Case 2: Internal Server Error", func(t *testing.T) {
		mockUC := new(MockWorkUsecase)
		h := NewWorkHandler(mockUC)
		mockUC.On("GetWorkExperiences", mock.Anything).Return(nil, errors.New("db error"))

		req := httptest.NewRequest(http.MethodGet, "/v1/about/work-experiences", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.GetWorkExperiences(c)) {
			assert.Equal(t, http.StatusInternalServerError, rec.Code)
		}
	})
}

func TestCreateWorkExperience(t *testing.T) {
	e := echo.New()
	t.Run("Case 1: Created", func(t *testing.T) {
		mockUC := new(MockWorkUsecase)
		h := NewWorkHandler(mockUC)

		reqBody := `{"company":"Tech Corp","role":"Dev","timeframe":"2020-2021"}`
		mockUC.On("CreateWorkExperience", mock.Anything, mock.MatchedBy(func(w *entity.WorkExperience) bool {
			return w.Company == "Tech Corp"
		})).Return(nil).Run(func(args mock.Arguments) {
			w := args.Get(1).(*entity.WorkExperience)
			w.ID = "new-work-uuid"
		})

		req := httptest.NewRequest(http.MethodPost, "/v1/about/work-experiences", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.CreateWorkExperience(c)) {
			assert.Equal(t, http.StatusCreated, rec.Code)
			var response struct {
				Data struct {
					ExperienceID string `json:"experience_id"`
				} `json:"data"`
			}
			_ = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.Equal(t, "new-work-uuid", response.Data.ExperienceID)
		}
	})

	t.Run("Case 2: Validation Failed (422)", func(t *testing.T) {
		mockUC := new(MockWorkUsecase)
		h := NewWorkHandler(mockUC)
		reqBody := `{"company":""}`
		req := httptest.NewRequest(http.MethodPost, "/v1/about/work-experiences", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.CreateWorkExperience(c)) {
			assert.Equal(t, 422, rec.Code)
		}
		if assert.NoError(t, h.CreateWorkExperience(c)) {
			assert.Equal(t, 422, rec.Code)
		}
	})

	t.Run("UnsupportedMediaType", func(t *testing.T) {
		mockUC := new(MockWorkUsecase)
		h := NewWorkHandler(mockUC)

		reqBody := `{"company":"Tech Corp"}`
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(reqBody))
		// Invalid Content-Type
		req.Header.Set(echo.HeaderContentType, echo.MIMETextPlain)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.CreateWorkExperience(c)) {
			assert.Equal(t, http.StatusUnsupportedMediaType, rec.Code)
		}
	})
}

func TestUpdateWorkExperience(t *testing.T) {
	e := echo.New()
	t.Run("Case 1: Successfully Updated", func(t *testing.T) {
		mockUC := new(MockWorkUsecase)
		h := NewWorkHandler(mockUC)

		id := "uuid-1"
		mockUC.On("GetWorkExperienceByID", mock.Anything, id).Return(&entity.WorkExperience{ID: id}, nil)
		mockUC.On("UpdateWorkExperience", mock.Anything, mock.Anything).Return(nil)

		reqBody := `{"company":"Updated Corp"}`
		req := httptest.NewRequest(http.MethodPatch, "/v1/about/work-experiences/"+id, strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues(id)

		if assert.NoError(t, h.UpdateWorkExperience(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)
			var response struct {
				Data interface{} `json:"data"`
			}
			_ = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.Nil(t, response.Data)
		}
	})

	t.Run("Case 2: Unsupported Media Type (415)", func(t *testing.T) {
		mockUC := new(MockWorkUsecase)
		h := NewWorkHandler(mockUC)
		mockUC.On("GetWorkExperienceByID", mock.Anything, "1").Return(&entity.WorkExperience{ID: "1"}, nil)

		reqBody := `{"company":"Updated"}`
		req := httptest.NewRequest(http.MethodPatch, "/v1/about/work-experiences/1", strings.NewReader(reqBody))
		// Invalid Content-Type
		req.Header.Set(echo.HeaderContentType, echo.MIMETextPlain)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("1")

		if assert.NoError(t, h.UpdateWorkExperience(c)) {
			assert.Equal(t, http.StatusUnsupportedMediaType, rec.Code)
		}
	})
}

func TestDeleteWorkExperience(t *testing.T) {
	e := echo.New()
	t.Run("Case 1: Successfully Deleted", func(t *testing.T) {
		mockUC := new(MockWorkUsecase)
		h := NewWorkHandler(mockUC)

		id := "123"
		mockUC.On("GetWorkExperienceByID", mock.Anything, id).Return(&entity.WorkExperience{ID: id}, nil)
		mockUC.On("DeleteWorkExperience", mock.Anything, id).Return(nil)

		req := httptest.NewRequest(http.MethodDelete, "/v1/about/work-experiences/"+id, nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues(id)

		if assert.NoError(t, h.DeleteWorkExperience(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)
		}
	})

	t.Run("Case 2: Not Found (404)", func(t *testing.T) {
		mockUC := new(MockWorkUsecase)
		h := NewWorkHandler(mockUC)
		mockUC.On("GetWorkExperienceByID", mock.Anything, "999").Return(nil, errors.New("not found"))

		req := httptest.NewRequest(http.MethodDelete, "/v1/about/work-experiences/999", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("999")

		if assert.NoError(t, h.DeleteWorkExperience(c)) {
			assert.Equal(t, http.StatusNotFound, rec.Code)
		}
	})
}
