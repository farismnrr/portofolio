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
	err := Success(c, http.StatusOK, "success message", data)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)

	var resp SuccessResponse
	err = json.Unmarshal(rec.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.True(t, resp.Status)
	assert.Equal(t, "success message", resp.Message)

	// Type assertion for data map
	respData, ok := resp.Data.(map[string]interface{})
	assert.True(t, ok)
	assert.Equal(t, "bar", respData["foo"])
}

func TestError(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := Error(c, http.StatusInternalServerError, "error message")
	assert.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, rec.Code)

	var resp ErrorResponse
	err = json.Unmarshal(rec.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.False(t, resp.Status)
	assert.Equal(t, "error message", resp.Message)
}

func TestValidationError(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	details := []string{"field required"}
	err := ValidationError(c, "validation failed", details)
	assert.NoError(t, err)
	assert.Equal(t, 422, rec.Code)

	var resp ErrorResponse
	err = json.Unmarshal(rec.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.False(t, resp.Status)
	assert.Equal(t, "validation failed", resp.Message)

	respDetails, ok := resp.Details.([]interface{})
	assert.True(t, ok)
	assert.Equal(t, "field required", respDetails[0])
}
