package handler

import (
	"context"
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

func TestGetSocialLinks(t *testing.T) {
	e := echo.New()
	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockSocialUsecase)
		h := NewSocialHandler(mockUC)

		links := []entity.SocialLink{{Name: "GitHub", Link: "https://github.com"}}
		mockUC.On("GetSocialLinks", mock.Anything).Return(links, nil)

		req := httptest.NewRequest(http.MethodGet, "/social-links", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.GetSocialLinks(c))
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Contains(t, rec.Body.String(), "GitHub")
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

func TestCreateSocialLink(t *testing.T) {
	e := echo.New()
	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockSocialUsecase)
		h := NewSocialHandler(mockUC)

		reqBody := `{"name":"LinkedIn","link":"https://linkedin.com/in/me","icon":"linkedin","order_by":1}`
		mockUC.On("CreateSocialLink", mock.Anything, mock.MatchedBy(func(s *entity.SocialLink) bool {
			return s.Name == "LinkedIn"
		})).Return(nil)

		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h.CreateSocialLink(c))
		assert.Equal(t, http.StatusCreated, rec.Code)
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
		assert.Equal(t, 422, rec.Code)
		assert.Contains(t, rec.Body.String(), "Invalid URL format")
	})
}

func TestDeleteSocialLink(t *testing.T) {
	e := echo.New()
	t.Run("Success", func(t *testing.T) {
		mockUC := new(MockSocialUsecase)
		h := NewSocialHandler(mockUC)

		mockUC.On("GetSocialLinkByID", mock.Anything, "123").Return(&entity.SocialLink{ID: "123"}, nil)
		mockUC.On("DeleteSocialLink", mock.Anything, "123").Return(nil)

		req := httptest.NewRequest(http.MethodDelete, "/social-links/123", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetPath("/social-links/:id")
		c.SetParamNames("id")
		c.SetParamValues("123")

		assert.NoError(t, h.DeleteSocialLink(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("NotFound", func(t *testing.T) {
		mockUC := new(MockSocialUsecase)
		h := NewSocialHandler(mockUC)

		mockUC.On("GetSocialLinkByID", mock.Anything, "999").Return(nil, errors.New("not found"))

		req := httptest.NewRequest(http.MethodDelete, "/social-links/999", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetPath("/social-links/:id")
		c.SetParamNames("id")
		c.SetParamValues("999")

		assert.NoError(t, h.DeleteSocialLink(c))
		assert.Equal(t, http.StatusNotFound, rec.Code)
	})
}
