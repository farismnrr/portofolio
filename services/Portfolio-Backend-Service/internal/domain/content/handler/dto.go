package handler

// FetchMetadataResponse represents the OG metadata response
type FetchMetadataResponse struct {
	Title       string `json:"title" example:"Example Title"`
	Description string `json:"description" example:"This is an example description of the page."`
	Image       string `json:"image" example:"https://example.com/og-image.jpg"`
	URL         string `json:"url" example:"https://example.com"`
}
