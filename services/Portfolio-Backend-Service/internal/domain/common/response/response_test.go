package response

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestSuccess(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	data := map[string]string{"foo": "bar"}
	err := Success(c, http.StatusOK, "Success message", data)

	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)

	var res SuccessResponse
	err = json.Unmarshal(rec.Body.Bytes(), &res)
	assert.NoError(t, err)
	assert.True(t, res.Status)
	assert.Equal(t, "Success message", res.Message)
	assert.Equal(t, "bar", res.Data.(map[string]interface{})["foo"])
}

func TestSuccessNoData(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := SuccessNoData(c, http.StatusCreated, "Created message")

	assert.NoError(t, err)
	assert.Equal(t, http.StatusCreated, rec.Code)

	var res SuccessResponse
	err = json.Unmarshal(rec.Body.Bytes(), &res)
	assert.NoError(t, err)
	assert.True(t, res.Status)
	assert.Equal(t, "Created message", res.Message)
	assert.Nil(t, res.Data)
}

func TestError(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := Error(c, http.StatusBadRequest, "Error message")

	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, rec.Code)

	var res ErrorResponse
	err = json.Unmarshal(rec.Body.Bytes(), &res)
	assert.NoError(t, err)
	assert.False(t, res.Status)
	assert.Equal(t, "Error message", res.Message)
}

func TestErrorWithData(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	data := "detail info"
	err := ErrorWithData(c, http.StatusInternalServerError, "Server error", data)

	assert.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)

	var res ErrorResponse
	err = json.Unmarshal(rec.Body.Bytes(), &res)
	assert.NoError(t, err)
	assert.False(t, res.Status)
	assert.Equal(t, "Server error", res.Message)
	assert.Equal(t, data, res.Data)
}

func TestValidationError(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	details := []map[string]string{
		{"field": "email", "message": "invalid email"},
	}
	err := ValidationError(c, "Validation failed", details)

	assert.NoError(t, err)
	assert.Equal(t, 422, rec.Code)

	var res ErrorResponse
	err = json.Unmarshal(rec.Body.Bytes(), &res)
	assert.NoError(t, err)
	assert.False(t, res.Status)
	assert.Equal(t, "Validation failed", res.Message)

	resDetails := res.Details.([]interface{})
	assert.Len(t, resDetails, 1)
	assert.Equal(t, "email", resDetails[0].(map[string]interface{})["field"])
}
