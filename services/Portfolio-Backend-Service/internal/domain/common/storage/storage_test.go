package storage

import (
	"context"
	"io"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockCloudStorage is a mock of the CloudStorage interface
type MockCloudStorage struct {
	mock.Mock
}

func (m *MockCloudStorage) UploadFile(ctx context.Context, bucketName string, objectName string, content io.Reader) (string, error) {
	args := m.Called(ctx, bucketName, objectName, content)
	return args.String(0), args.Error(1)
}

func (m *MockCloudStorage) DeleteFile(ctx context.Context, bucketName string, objectName string) error {
	args := m.Called(ctx, bucketName, objectName)
	return args.Error(0)
}

func (m *MockCloudStorage) GetPublicURL(bucketName string, objectName string) string {
	args := m.Called(bucketName, objectName)
	return args.String(0)
}

func TestGCPStorage_GetPublicURL(t *testing.T) {
	s := &gcpStorage{}
	bucket := "test-bucket"
	object := "test-object.jpg"

	expected := "https://storage.googleapis.com/test-bucket/test-object.jpg"
	actual := s.GetPublicURL(bucket, object)

	assert.Equal(t, expected, actual)
}
