package og

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestFetchMetadata_MissingURL(t *testing.T) {
	// Setup
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/v1/og/fetch", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handler := NewHandler()

	// Test
	if assert.NoError(t, handler.FetchMetadata(c)) {
		assert.Equal(t, http.StatusBadRequest, rec.Code)

		var response struct {
			Status  bool   `json:"status"`
			Message string `json:"message"`
		}
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.False(t, response.Status)
		assert.Equal(t, "URL parameter is required", response.Message)
	}
}

func TestProxyImage_MissingURL(t *testing.T) {
	// Setup
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/v1/og/proxy", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handler := NewHandler()

	// Test
	if assert.NoError(t, handler.ProxyImage(c)) {
		assert.Equal(t, http.StatusBadRequest, rec.Code)

		var response struct {
			Success bool   `json:"success"`
			Message string `json:"message"`
		}
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.False(t, response.Success)
		assert.Equal(t, "URL parameter is required", response.Message)
	}
}

func TestExtractMetadata(t *testing.T) {
	html := `
		<html>
			<head>
				<title>Test Page</title>
				<meta name="description" content="Test description">
				<meta property="og:image" content="https://example.com/image.jpg">
			</head>
		</html>
	`

	metadata := extractMetadata(html, "https://example.com")

	assert.Equal(t, "Test Page", metadata.Title)
	assert.Equal(t, "Test description", metadata.Description)
	assert.Equal(t, "https://example.com/image.jpg", metadata.Image)
	assert.Equal(t, "https://example.com", metadata.URL)
}

func TestDecodeHTMLEntities(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"Hello &amp; World", "Hello & World"},
		{"Test &lt;tag&gt;", "Test <tag>"},
		{"Quote &quot;test&quot;", "Quote \"test\""},
		{"It&#39;s working", "It's working"},
		{"Normal text", "Normal text"},
	}

	for _, tt := range tests {
		result := decodeHTMLEntities(tt.input)
		assert.Equal(t, tt.expected, result, "Input: %s", tt.input)
	}
}
