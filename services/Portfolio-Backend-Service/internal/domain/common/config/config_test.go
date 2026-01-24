package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoad(t *testing.T) {
	// Setup environment variables
	os.Setenv("PORT", "9090")
	os.Setenv("ENV", "production")
	os.Setenv("SSO_URL", "http://sso.test")
	os.Setenv("API_KEY", "test-api-key")
	os.Setenv("TENANT_ID", "test-tenant-id")
	os.Setenv("PAGE_ACCESS_PASSWORD", "secret")
	os.Setenv("ALLOWED_ORIGINS", "http://example.com,http://test.com")
	os.Setenv("LOG_LEVEL", "debug")
	os.Setenv("CORE_DB_TYPE", "postgres")
	os.Setenv("CORE_DB_HOST", "dbhost")
	os.Setenv("GCP_PROJECT_ID", "test-project")

	// Cleanup after test
	defer func() {
		os.Unsetenv("PORT")
		os.Unsetenv("ENV")
		os.Unsetenv("SSO_URL")
		os.Unsetenv("API_KEY")
		os.Unsetenv("TENANT_ID")
		os.Unsetenv("PAGE_ACCESS_PASSWORD")
		os.Unsetenv("ALLOWED_ORIGINS")
		os.Unsetenv("LOG_LEVEL")
		os.Unsetenv("CORE_DB_TYPE")
		os.Unsetenv("CORE_DB_HOST")
		os.Unsetenv("GCP_PROJECT_ID")
	}()

	cfg, err := Load()
	assert.NoError(t, err)
	assert.NotNil(t, cfg)

	// Verify values
	assert.Equal(t, "9090", cfg.Server.Port)
	assert.Equal(t, "production", cfg.Server.Env)
	assert.Equal(t, "http://sso.test", cfg.SSO.URL)
	assert.Equal(t, "test-api-key", cfg.SSO.APIKey)
	assert.Equal(t, "test-tenant-id", cfg.SSO.TenantID)
	assert.Equal(t, "secret", cfg.PageAuth.Password)
	assert.Equal(t, []string{"http://example.com", "http://test.com"}, cfg.CORS.AllowedOrigins)
	assert.Equal(t, "debug", cfg.Logging.Level)
	assert.Equal(t, "postgres", cfg.Database.Type)
	assert.Equal(t, "dbhost", cfg.Database.Host)
	assert.Equal(t, "test-project", cfg.GCP.ProjectID)

	assert.True(t, cfg.IsProduction())
	assert.False(t, cfg.IsDevelopment())
}

func TestLoad_Defaults(t *testing.T) {
	// Ensure mandatory fields are set to pass validation
	os.Setenv("SSO_URL", "http://sso.test")
	os.Setenv("API_KEY", "key")
	os.Setenv("TENANT_ID", "tenant")
	os.Setenv("PAGE_ACCESS_PASSWORD", "pass")
	defer os.Clearenv()

	cfg, err := Load()
	assert.NoError(t, err)

	// Check defaults
	assert.Equal(t, "8080", cfg.Server.Port)
	assert.Equal(t, "development", cfg.Server.Env)
	assert.Equal(t, "info", cfg.Logging.Level)
	assert.Equal(t, "sqlite", cfg.Database.Type)
}

func TestLoad_ValidationFailed(t *testing.T) {
	os.Clearenv()
	// Missing mandatory SSO_URL, API_KEY etc.
	cfg, err := Load()
	assert.Error(t, err)
	assert.Nil(t, cfg)
	assert.Contains(t, err.Error(), "required")
}
