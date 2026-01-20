package handler

import (
	"context"
	"fmt"
	"html"
	"io"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/farismnrr/portfolio-backend-service/pkg/httpclient"
	"github.com/farismnrr/portfolio-backend-service/pkg/logger"
	"github.com/farismnrr/portfolio-backend-service/pkg/response"
	"github.com/labstack/echo/v4"
	"go.uber.org/zap"
)

// Handler handles Open Graph related requests
type Handler struct {
	httpClient *httpclient.Client
}

// NewHandler creates a new OG handler
func NewHandler() *Handler {
	return &Handler{
		httpClient: httpclient.New(10 * time.Second),
	}
}

// FetchMetadata fetches Open Graph metadata from a URL
// @Summary Fetch OG Metadata
// @Description Extract Open Graph metadata (title, description, image, etc.) from a given URL.
// @Tags OG
// @Produce json
// @Param url query string true "Target URL to fetch metadata from"
// @Success 200 {object} response.SuccessResponse{data=FetchMetadataResponse} "Metadata fetched successfully"
// @Failure 400 {object} response.ErrorResponse "URL parameter is required"
// @Failure 500 {object} response.ErrorResponse "Failed to fetch or read metadata"
// @Router /v1/og/fetch [get]
func (h *Handler) FetchMetadata(c echo.Context) error {
	targetURL := c.QueryParam("url")
	if targetURL == "" {
		return response.Error(c, http.StatusBadRequest, "URL parameter is required")
	}

	// Create request with timeout
	ctx, cancel := context.WithTimeout(c.Request().Context(), 5*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, targetURL, nil)
	if err != nil {
		logger.Error("Failed to create request", zap.Error(err), zap.String("url", targetURL))
		return response.Error(c, http.StatusInternalServerError, "Failed to create request")
	}

	req.Header.Set("User-Agent", "bot")

	// Fetch the page
	resp, err := h.httpClient.Do(req)
	if err != nil {
		logger.Error("Failed to fetch URL", zap.Error(err), zap.String("url", targetURL))
		return response.Error(c, http.StatusInternalServerError, "Failed to fetch metadata")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return response.Error(c, http.StatusInternalServerError, fmt.Sprintf("Failed to fetch URL: %d", resp.StatusCode))
	}

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		logger.Error("Failed to read response", zap.Error(err))
		return response.Error(c, http.StatusInternalServerError, "Failed to read response")
	}

	htmlContent := string(body)

	// Extract metadata
	metadata := extractMetadata(htmlContent, targetURL)

	return response.Success(c, http.StatusOK, "Metadata fetched successfully", metadata)
}

// ProxyImage proxies an image request with appropriate headers
// @Summary Proxy Image
// @Description Proxy an external image URL to avoid CORS or fetch failures.
// @Tags OG
// @Param url query string true "External image URL to proxy"
// @Success 200 {string} string "Image binary data"
// @Failure 400 {object} response.ErrorResponse "URL parameter is required"
// @Failure 500 {object} response.ErrorResponse "Failed to proxy image"
// @Router /v1/og/proxy [get]
func (h *Handler) ProxyImage(c echo.Context) error {
	imageURL := c.QueryParam("url")
	if imageURL == "" {
		return response.Error(c, http.StatusBadRequest, "URL parameter is required")
	}

	// Create request
	req, err := http.NewRequest(http.MethodGet, imageURL, nil)
	if err != nil {
		logger.Error("Failed to create request", zap.Error(err), zap.String("url", imageURL))
		return response.Error(c, http.StatusInternalServerError, "Failed to create request")
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; ImageProxy/1.0)")

	// Fetch the image
	resp, err := h.httpClient.Do(req)
	if err != nil {
		logger.Error("Failed to fetch image", zap.Error(err), zap.String("url", imageURL))
		return response.Error(c, http.StatusInternalServerError, "Failed to proxy image")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return response.Error(c, resp.StatusCode, fmt.Sprintf("Failed to fetch image: %d", resp.StatusCode))
	}

	// Get content type
	contentType := resp.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "image/jpeg"
	}

	// Read image data
	imageData, err := io.ReadAll(resp.Body)
	if err != nil {
		logger.Error("Failed to read image", zap.Error(err))
		return response.Error(c, http.StatusInternalServerError, "Failed to read image")
	}

	// Set response headers
	c.Response().Header().Set("Content-Type", contentType)
	c.Response().Header().Set("Cache-Control", "public, max-age=86400")
	c.Response().Header().Set("Content-Length", strconv.Itoa(len(imageData)))

	return c.Blob(http.StatusOK, contentType, imageData)
}

// extractMetadata extracts Open Graph metadata from HTML
func extractMetadata(htmlContent string, url string) FetchMetadataResponse {
	metadata := FetchMetadataResponse{
		URL: url,
	}

	// Extract title
	if titleMatch := regexp.MustCompile(`<title[^>]*>([^<]+)</title>`).FindStringSubmatch(htmlContent); len(titleMatch) > 1 {
		metadata.Title = decodeHTMLEntities(strings.TrimSpace(titleMatch[1]))
	}

	// Extract description (meta name="description" or og:description)
	descPatterns := []string{
		`<meta[^>]*name="description"[^>]*content="([^"]+)"[^>]*>`,
		`<meta[^>]*content="([^"]+)"[^>]*name="description"[^>]*>`,
		`<meta[^>]*property="og:description"[^>]*content="([^"]+)"[^>]*>`,
	}
	for _, pattern := range descPatterns {
		if descMatch := regexp.MustCompile(pattern).FindStringSubmatch(htmlContent); len(descMatch) > 1 {
			metadata.Description = decodeHTMLEntities(strings.TrimSpace(descMatch[1]))
			break
		}
	}

	// Extract image (og:image)
	imagePatterns := []string{
		`<meta[^>]*property="og:image"[^>]*content="([^"]+)"[^>]*>`,
		`<meta[^>]*content="([^"]+)"[^>]*property="og:image"[^>]*>`,
	}
	for _, pattern := range imagePatterns {
		if imageMatch := regexp.MustCompile(pattern).FindStringSubmatch(htmlContent); len(imageMatch) > 1 {
			metadata.Image = strings.TrimSpace(imageMatch[1])
			break
		}
	}

	return metadata
}

// decodeHTMLEntities decodes common HTML entities
func decodeHTMLEntities(text string) string {
	// Use html.UnescapeString for basic entities
	return html.UnescapeString(text)
}
