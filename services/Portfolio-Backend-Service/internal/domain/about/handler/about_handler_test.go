package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"net/textproto"
	"strings"
	"testing"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestGetAbout(t *testing.T) {
	e := echo.New()

	t.Run("Case 1: Successfully Retrieve Data", func(t *testing.T) {
		mockUC := new(MockAboutUsecase)
		h := NewAboutHandler(mockUC)

		id := uuid.New()
		aboutData := &entity.About{
			ID:          id.String(),
			Name:        "Faris Munir",
			Role:        "Software Engineer",
			Description: "Software Engineer specializing in backend architecture...",
			Avatar:      "https://storage.googleapis.com/farismnrr-storage/avatars/faris.jpg",
		}

		mockUC.On("GetAbout", mock.Anything).Return(aboutData, nil)

		req := httptest.NewRequest(http.MethodGet, "/v1/about", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.GetAbout(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)

			var resBody struct {
				Status  bool   `json:"status"`
				Message string `json:"message"`
				Data    struct {
					About struct {
						ID          string `json:"id"`
						Name        string `json:"name"`
						Role        string `json:"role"`
						Description string `json:"description"`
						Avatar      string `json:"avatar"`
					} `json:"about"`
				} `json:"data"`
			}
			err := json.Unmarshal(rec.Body.Bytes(), &resBody)
			assert.NoError(t, err)
			assert.True(t, resBody.Status)
			assert.Equal(t, "About information retrieved successfully", resBody.Message)
			assert.Equal(t, "Faris Munir", resBody.Data.About.Name)
			assert.Equal(t, id.String(), resBody.Data.About.ID)
		}
	})

	t.Run("Case 2: Data Has Never Been Set", func(t *testing.T) {
		mockUC := new(MockAboutUsecase)
		h := NewAboutHandler(mockUC)

		mockUC.On("GetAbout", mock.Anything).Return(nil, nil)

		req := httptest.NewRequest(http.MethodGet, "/v1/about", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.GetAbout(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)

			var resBody struct {
				Status  bool   `json:"status"`
				Message string `json:"message"`
				Data    struct {
					About interface{} `json:"about"`
				} `json:"data"`
			}
			err := json.Unmarshal(rec.Body.Bytes(), &resBody)
			assert.NoError(t, err)
			assert.True(t, resBody.Status)
			assert.Equal(t, "About information is empty", resBody.Message)
			assert.Nil(t, resBody.Data.About)
		}
	})

	t.Run("Case 3: Internal Server Error", func(t *testing.T) {
		mockUC := new(MockAboutUsecase)
		h := NewAboutHandler(mockUC)

		mockUC.On("GetAbout", mock.Anything).Return(nil, errors.New("database error"))

		req := httptest.NewRequest(http.MethodGet, "/v1/about", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.GetAbout(c)) {
			assert.Equal(t, http.StatusInternalServerError, rec.Code)

			var resBody struct {
				Status  bool   `json:"status"`
				Message string `json:"message"`
			}
			err := json.Unmarshal(rec.Body.Bytes(), &resBody)
			assert.NoError(t, err)
			assert.False(t, resBody.Status)
			assert.Equal(t, "Internal server error", resBody.Message)
		}
	})
}

func TestUpdateAbout(t *testing.T) {
	e := echo.New()

	t.Run("Case 1: Successfully Update Profile", func(t *testing.T) {
		mockUC := new(MockAboutUsecase)
		h := NewAboutHandler(mockUC)

		reqBody := `{"name":"Faris Munir","role":"Software Engineer","description":"Updated description"}`
		mockUC.On("UpdateAbout", mock.Anything, mock.Anything).Return(nil)

		req := httptest.NewRequest(http.MethodPatch, "/v1/about", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.UpdateAbout(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)

			var resBody struct {
				Status  bool        `json:"status"`
				Message string      `json:"message"`
				Data    interface{} `json:"data"`
			}
			err := json.Unmarshal(rec.Body.Bytes(), &resBody)
			assert.NoError(t, err)
			assert.True(t, resBody.Status)
			assert.Equal(t, "About profile updated successfully", resBody.Message)
			assert.Nil(t, resBody.Data) // Should be nil or empty as per new contract
		}
	})

	t.Run("Case 2: Malformed JSON Format", func(t *testing.T) {
		mockUC := new(MockAboutUsecase)
		h := NewAboutHandler(mockUC)

		reqBody := `{"name":"Faris Munir", "invalid_json": }`
		req := httptest.NewRequest(http.MethodPatch, "/v1/about", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.UpdateAbout(c)) {
			// Malformed JSON usually 400
			assert.Equal(t, http.StatusBadRequest, rec.Code)
		}
	})

	t.Run("Case 3: Unsupported Media Type (415)", func(t *testing.T) {
		mockUC := new(MockAboutUsecase)
		h := NewAboutHandler(mockUC)

		reqBody := `{"name":"Faris"}`
		req := httptest.NewRequest(http.MethodPatch, "/v1/about", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMETextPlain)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.UpdateAbout(c)) {
			assert.Equal(t, http.StatusUnsupportedMediaType, rec.Code)
		}
	})

	t.Run("Case 3: Validation Failed (422)", func(t *testing.T) {
		mockUC := new(MockAboutUsecase)
		h := NewAboutHandler(mockUC)

		// Empty name
		reqBody := `{"name":"","role":"Engineer","description":"Desc"}`
		req := httptest.NewRequest(http.MethodPatch, "/v1/about", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.UpdateAbout(c)) {
			assert.Equal(t, 422, rec.Code)
			var resBody struct {
				Status  bool `json:"status"`
				Details []struct {
					Field string `json:"field"`
				} `json:"details"`
			}
			err := json.Unmarshal(rec.Body.Bytes(), &resBody)
			assert.NoError(t, err)
			assert.False(t, resBody.Status)
			assert.NotEmpty(t, resBody.Details)
			assert.Equal(t, "name", resBody.Details[0].Field)
		}
	})

	t.Run("Case 4: Internal Server Error (500)", func(t *testing.T) {
		mockUC := new(MockAboutUsecase)
		h := NewAboutHandler(mockUC)

		mockUC.On("UpdateAbout", mock.Anything, mock.Anything).Return(errors.New("db error"))

		reqBody := `{"name":"Faris","role":"Dev","description":"Desc"}`
		req := httptest.NewRequest(http.MethodPatch, "/v1/about", strings.NewReader(reqBody))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.UpdateAbout(c)) {
			assert.Equal(t, http.StatusInternalServerError, rec.Code)
			assert.Contains(t, rec.Body.String(), "Internal server error")
		}
	})
}

func TestUpdateAvatar(t *testing.T) {
	e := echo.New()

	t.Run("Case 1: Successfully Upload Avatar", func(t *testing.T) {
		mockUC := new(MockAboutUsecase)
		h := NewAboutHandler(mockUC)

		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)

		h_part := make(textproto.MIMEHeader)
		h_part.Set("Content-Disposition", `form-data; name="avatar"; filename="test.jpg"`)
		h_part.Set("Content-Type", "image/jpeg")
		part, err := writer.CreatePart(h_part)
		assert.NoError(t, err)
		_, err = part.Write([]byte("fake image data"))
		assert.NoError(t, err)
		writer.Close()

		mockUC.On("UpdateAvatar", mock.Anything, mock.Anything, "test.jpg").Return("https://storage.com/new.jpg", nil)

		req := httptest.NewRequest(http.MethodPatch, "/v1/about/avatar", body)
		req.Header.Set(echo.HeaderContentType, writer.FormDataContentType())
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.UpdateAvatar(c)) {
			assert.Equal(t, http.StatusOK, rec.Code)
			var resBody struct {
				Status  bool        `json:"status"`
				Message string      `json:"message"`
				Data    interface{} `json:"data"`
			}
			err := json.Unmarshal(rec.Body.Bytes(), &resBody)
			assert.NoError(t, err)
			assert.True(t, resBody.Status)
			assert.Equal(t, "Avatar updated successfully", resBody.Message)
			assert.Nil(t, resBody.Data)
		}
	})

	t.Run("Case 2: Invalid File Type", func(t *testing.T) {
		mockUC := new(MockAboutUsecase)
		h := NewAboutHandler(mockUC)

		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)

		h_part := make(textproto.MIMEHeader)
		h_part.Set("Content-Disposition", `form-data; name="avatar"; filename="test.pdf"`)
		h_part.Set("Content-Type", "application/pdf")
		part, err := writer.CreatePart(h_part)
		assert.NoError(t, err)
		_, err = part.Write([]byte("pdf data"))
		assert.NoError(t, err)
		writer.Close()

		req := httptest.NewRequest(http.MethodPatch, "/v1/about/avatar", body)
		req.Header.Set(echo.HeaderContentType, writer.FormDataContentType())
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.UpdateAvatar(c)) {
			assert.Equal(t, http.StatusUnsupportedMediaType, rec.Code)
			assert.Contains(t, rec.Body.String(), "Only images are allowed")
		}
	})

	t.Run("Case 3: File Too Large", func(t *testing.T) {
		mockUC := new(MockAboutUsecase)
		h := NewAboutHandler(mockUC)

		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)

		h_part := make(textproto.MIMEHeader)
		h_part.Set("Content-Disposition", `form-data; name="avatar"; filename="large.jpg"`)
		h_part.Set("Content-Type", "image/jpeg")
		part, err := writer.CreatePart(h_part)
		assert.NoError(t, err)
		// 3MB
		_, err = part.Write(make([]byte, 3*1024*1024))
		assert.NoError(t, err)
		writer.Close()

		req := httptest.NewRequest(http.MethodPatch, "/v1/about/avatar", body)
		req.Header.Set(echo.HeaderContentType, writer.FormDataContentType())
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.UpdateAvatar(c)) {
			assert.Equal(t, http.StatusRequestEntityTooLarge, rec.Code)
			assert.Contains(t, rec.Body.String(), "exceeds the 2MB limit")
		}
	})

	t.Run("Case 4: Internal Server Error (500)", func(t *testing.T) {
		mockUC := new(MockAboutUsecase)
		h := NewAboutHandler(mockUC)

		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)

		h_part := make(textproto.MIMEHeader)
		h_part.Set("Content-Disposition", `form-data; name="avatar"; filename="test.jpg"`)
		h_part.Set("Content-Type", "image/jpeg")
		part, err := writer.CreatePart(h_part)
		assert.NoError(t, err)
		_, err = part.Write([]byte("fake data"))
		assert.NoError(t, err)
		writer.Close()

		mockUC.On("UpdateAvatar", mock.Anything, mock.Anything, "test.jpg").Return("", errors.New("upload failed"))

		req := httptest.NewRequest(http.MethodPatch, "/v1/about/avatar", body)
		req.Header.Set(echo.HeaderContentType, writer.FormDataContentType())
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		if assert.NoError(t, h.UpdateAvatar(c)) {
			assert.Equal(t, http.StatusInternalServerError, rec.Code)
			assert.Contains(t, rec.Body.String(), "Internal server error")
		}
	})
}
