package config

import (
	"fmt"
	"os"
	"strings"
)

// Config holds all application configuration
type Config struct {
	Server   ServerConfig
	SSO      SSOConfig
	PageAuth PageAuthConfig
	CORS     CORSConfig
	Logging  LoggingConfig
	Database DatabaseConfig
	GCP      GCPConfig
}

// GCPConfig holds Google Cloud Platform configuration
type GCPConfig struct {
	ProjectID           string
	CredentialsPath     string
	BucketName          string
	ServiceAccountEmail string
	P12Password         string
}

// ServerConfig holds server-specific configuration
type ServerConfig struct {
	Port          string
	Env           string
	SwaggerAPIKey string
}

// SSOConfig holds SSO service configuration
type SSOConfig struct {
	URL      string
	APIKey   string
	TenantID string
}

// PageAuthConfig holds page authentication configuration
type PageAuthConfig struct {
	Password string
}

// CORSConfig holds CORS configuration
type CORSConfig struct {
	AllowedOrigins []string
}

// LoggingConfig holds logging configuration
type LoggingConfig struct {
	Level string
}

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	Type      string
	Host      string
	Port      string
	User      string
	Password  string
	Name      string
	SeedDummy bool
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	cfg := &Config{
		Server: ServerConfig{
			Port:          getEnv("BACKEND_PORT", getEnv("PORT", "8080")),
			Env:           getEnv("ENV", "development"),
			SwaggerAPIKey: getEnv("SWAGGER_API_KEY", ""),
		},
		SSO: SSOConfig{
			URL:      getEnv("SSO_URL", ""),
			APIKey:   getEnv("API_KEY", ""),
			TenantID: getEnv("TENANT_ID", ""),
		},
		PageAuth: PageAuthConfig{
			Password: getEnv("PAGE_ACCESS_PASSWORD", ""),
		},
		CORS: CORSConfig{
			AllowedOrigins: strings.Split(getEnv("ALLOWED_ORIGINS", "http://localhost:3000"), ","),
		},
		Logging: LoggingConfig{
			Level: getEnv("LOG_LEVEL", "info"),
		},
		Database: DatabaseConfig{
			Type:      getEnv("CORE_DB_TYPE", "sqlite"),
			Host:      getEnv("CORE_DB_HOST", "localhost"),
			Port:      getEnv("CORE_DB_PORT", "5432"),
			User:      getEnv("CORE_DB_USER", "postgres"),
			Password:  getEnv("CORE_DB_PASS", "postgres"),
			Name:      getEnv("CORE_DB_NAME", "user_auth_plugin.sqlite"),
			SeedDummy: strings.ToLower(getEnv("CORE_DB_SEED_DUMMY", "false")) == "true",
		},
		GCP: GCPConfig{
			ProjectID:           getEnv("GCP_PROJECT_ID", ""),
			CredentialsPath:     getEnv("GCP_CREDENTIALS_PATH", ""),
			BucketName:          getEnv("GCP_BUCKET_NAME", ""),
			ServiceAccountEmail: getEnv("GCP_SERVICE_ACCOUNT_EMAIL", ""),
			P12Password:         getEnv("GCP_P12_PASSWORD", ""),
		},
	}

	// Validate required fields
	if err := cfg.validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

// validate checks if all required configuration is present
func (c *Config) validate() error {
	if c.SSO.URL == "" {
		return fmt.Errorf("SSO_URL is required")
	}
	if c.SSO.APIKey == "" {
		return fmt.Errorf("API_KEY is required")
	}
	if c.SSO.TenantID == "" {
		return fmt.Errorf("TENANT_ID is required")
	}
	if c.PageAuth.Password == "" {
		return fmt.Errorf("PAGE_ACCESS_PASSWORD is required")
	}
	return nil
}

// getEnv gets an environment variable with a fallback default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// IsDevelopment returns true if running in development mode
func (c *Config) IsDevelopment() bool {
	return c.Server.Env == "development"
}

// IsProduction returns true if running in production mode
func (c *Config) IsProduction() bool {
	return c.Server.Env == "production"
}
