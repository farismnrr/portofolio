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

// MockSocialUsecase needing definition since it's likely distinct from MockAboutUsecase
// created in about_handler_test.go due to different interface.
// Ideally mocks are generated or shared. For now, I'll define a minimal one here.
type MockSocialUsecase struct {
	mock.Mock
}

func (m *MockSocialUsecase) GetSocialLinks(ctx context.Context) ([]entity.SocialLink, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]entity.SocialLink), args.Error(1)
}

func (m *MockSocialUsecase) CreateSocialLink(ctx context.Context, social *entity.SocialLink) error {
	args := m.Called(ctx, social)
	return args.Error(0)
}

func (m *MockSocialUsecase) UpdateSocialLink(ctx context.Context, social *entity.SocialLink) error {
	args := m.Called(ctx, social)
	return args.Error(0)
}

func (m *MockSocialUsecase) DeleteSocialLink(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockSocialUsecase) GetSocialLinkByID(ctx context.Context, id string) (*entity.SocialLink, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.SocialLink), args.Error(1)
}

// Tests

// TestGetSocialLinks - Contract: docs/contracts/about/social_links/list.md
func TestGetSocialLinks(t *testing.T) {
	e := echo.New()
	t.Run("Case 1: Successfully Retrieve", func(t *testing.T) {
		mockUC := new(MockSocialUsecase)
		h := NewSocialHandler(mockUC)

		links := []entity.SocialLink{{ID: "id-1", Name: "GitHub", Link: "https://github.com"}}
		mockUC.On("GetSocialLinks", mock.Anything).Return(links, nil)

		req := httptest.NewRequest(http.MethodGet, "/v1/about/social-links", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.GetSocialLinks(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)
			var response struct {
				Status bool `json:"status"`
				Data   struct {
					SocialLinks []entity.SocialLink `json:"social_links"`
				} `json:"data"`
			}
			_ = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.NotEmpty(t, response.Data.SocialLinks)
		}
	})

	t.Run("InternalError", func(t *testing.T) {
		mockUC := new(MockSocialUsecase)
		h := NewSocialHandler(mockUC)

		mockUC.On("GetSocialLinks", mock.Anything).Return(nil, errors.New("db error"))

		req := httptest.NewRequest(http.MethodGet, "/social-links", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.GetSocialLinks(c))
		assert.Equal(t, http.StatusInternalServerError, rec.Code)
	})
}

// TestCreateSocialLink - Contract: docs/contracts/about/social_links/create.md
func TestCreateSocialLink(t *testing.T) {
	e := echo.New()
	t.Run("Case 1: Created", func(t *testing.T) {
		mockUC := new(MockSocialUsecase)
		h := NewSocialHandler(mockUC)

		reqBody := `{"name":"LinkedIn","link":"https://linkedin.com/in/me","icon":"linkedin","order_by":1}`
		mockUC.On("CreateSocialLink", mock.Anything, mock.MatchedBy(func(s *entity.SocialLink) bool {
			return s.Name == "LinkedIn"
		})).Return(nil).Run(func(args mock.Arguments) {
			s := args.Get(1).(*entity.SocialLink)
			s.ID = "new-social-uuid"
		})

		req := httptest.NewRequest(http.MethodPost, "/v1/about/social-links", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.CreateSocialLink(c)) {
			assert.Equal(t, http.StatusCreated, rec.Code)
			var response struct {
				Data struct {
					SocialLinkID string `json:"social_link_id"`
				} `json:"data"`
			}
			_ = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.Equal(t, "new-social-uuid", response.Data.SocialLinkID)
		}
	})

	t.Run("ValidationFailed_InvalidURL", func(t *testing.T) {
		mockUC := new(MockSocialUsecase)
		h := NewSocialHandler(mockUC)

		reqBody := `{"name":"LinkedIn","link":"invalid-url"}`
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.CreateSocialLink(c))
	})

	t.Run("UnsupportedMediaType", func(t *testing.T) {
		mockUC := new(MockSocialUsecase)
		h := NewSocialHandler(mockUC)

		reqBody := `{"name":"LinkedIn"}`
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(reqBody))
		// Invalid Content-Type
		req.Header.Set(echo.HeaderContentType, echo.MIMETextPlain)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.CreateSocialLink(c)) {
			assert.Equal(t, http.StatusUnsupportedMediaType, rec.Code)
		}
	})
}

// TestUpdateSocialLink - Contract: docs/contracts/about/social_links/update.md
func TestUpdateSocialLink(t *testing.T) {
	e := echo.New()
	t.Run("Case 1: Successfully Updated", func(t *testing.T) {
		mockUC := new(MockSocialUsecase)
		h := NewSocialHandler(mockUC)

		id := "uuid-1"
		mockUC.On("GetSocialLinkByID", mock.Anything, id).Return(&entity.SocialLink{ID: id}, nil)
		mockUC.On("UpdateSocialLink", mock.Anything, mock.Anything).Return(nil)

		reqBody := `{"name":"LinkedIn Updated"}`
		req := httptest.NewRequest(http.MethodPatch, "/v1/about/social-links/"+id, strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues(id)

		if assert.NoError(t, h.UpdateSocialLink(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)
			var response struct {
				Data interface{} `json:"data"`
			}
			_ = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.Nil(t, response.Data)
		}
	})

	t.Run("Case 2: Internal Server Error (500)", func(t *testing.T) {
		mockUC := new(MockSocialUsecase)
		h := NewSocialHandler(mockUC)
		mockUC.On("GetSocialLinkByID", mock.Anything, "1").Return(&entity.SocialLink{ID: "1"}, nil)
		mockUC.On("UpdateSocialLink", mock.Anything, mock.Anything).Return(errors.New("db error"))

		req := httptest.NewRequest(http.MethodPatch, "/v1/about/social-links/1", strings.NewReader(`{}`))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("1")

		if assert.NoError(t, h.UpdateSocialLink(c)) {
			assert.Equal(t, http.StatusInternalServerError, rec.Code)
		}
	})

	t.Run("Case 3: Unsupported Media Type (415)", func(t *testing.T) {
		mockUC := new(MockSocialUsecase)
		h := NewSocialHandler(mockUC)
		mockUC.On("GetSocialLinkByID", mock.Anything, "1").Return(&entity.SocialLink{ID: "1"}, nil)

		reqBody := `{"name":"Updated"}`
		req := httptest.NewRequest(http.MethodPatch, "/v1/about/social-links/1", strings.NewReader(reqBody))
		// Invalid Content-Type
		req.Header.Set(echo.HeaderContentType, echo.MIMETextPlain)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("1")

		if assert.NoError(t, h.UpdateSocialLink(c)) {
			assert.Equal(t, http.StatusUnsupportedMediaType, rec.Code)
		}
	})

}

// TestDeleteSocialLink - Contract: docs/contracts/about/social_links/delete.md
func TestDeleteSocialLink(t *testing.T) {
	e := echo.New()
	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockSocialUsecase)
		h := NewSocialHandler(mockUC)

		mockUC.On("GetSocialLinkByID", mock.Anything, "123").Return(&entity.SocialLink{ID: "123"}, nil)
		mockUC.On("DeleteSocialLink", mock.Anything, "123").Return(nil)

		req := httptest.NewRequest(http.MethodDelete, "/v1/about/social-links/123", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("123")

		assert.NoError(t, h.DeleteSocialLink(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("NotFound", func(t *testing.T) {
		mockUC := new(MockSocialUsecase)
		h := NewSocialHandler(mockUC)

		mockUC.On("GetSocialLinkByID", mock.Anything, "999").Return(nil, errors.New("not found"))

		req := httptest.NewRequest(http.MethodDelete, "/v1/about/social-links/999", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetParamNames("id")
		c.SetParamValues("999")

		assert.NoError(t, h.DeleteSocialLink(c))
		assert.Equal(t, http.StatusNotFound, rec.Code)
	})
}
