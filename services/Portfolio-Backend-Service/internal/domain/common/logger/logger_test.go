package logger

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestInit(t *testing.T) {
	err := Init("debug")
	assert.NoError(t, err)
	assert.NotNil(t, Log)

	// Test safe methods (should not panic)
	Info("test info")
	Error("test error")
	Warn("test warn")
	Debug("test debug")
	Sync()
}

func TestInit_InvalidLevel(t *testing.T) {
	// Should default to InfoLevel without error
	err := Init("invalid_level")
	assert.NoError(t, err)
	assert.NotNil(t, Log)
}
