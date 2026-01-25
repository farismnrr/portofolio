package httpclient

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestNewClient(t *testing.T) {
	client := New(10 * time.Second)
	assert.NotNil(t, client)
	assert.Equal(t, 10*time.Second, client.Timeout)
}

func TestClient_Request(t *testing.T) {
	// Mock server
	svr := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	}))
	defer svr.Close()

	client := New(5 * time.Second)
	resp, err := client.Get(svr.URL)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}
