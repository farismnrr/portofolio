package httpclient

import (
	"net/http"
	"time"
)

// Client is a wrapper around http.Client with sensible defaults
type Client struct {
	*http.Client
}

// New creates a new HTTP client with timeout
func New(timeout time.Duration) *Client {
	return &Client{
		Client: &http.Client{
			Timeout: timeout,
			Transport: &http.Transport{
				MaxIdleConns:        100,
				MaxIdleConnsPerHost: 10,
				IdleConnTimeout:     90 * time.Second,
			},
		},
	}
}

// Default creates a new HTTP client with default 30s timeout
func Default() *Client {
	return New(30 * time.Second)
}
