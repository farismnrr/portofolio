package storage

import (
	"context"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"io"
	"os"

	"cloud.google.com/go/storage"
	"golang.org/x/crypto/pkcs12"
	"golang.org/x/oauth2/google"
	"golang.org/x/oauth2/jwt"
	"google.golang.org/api/option"
)

// CloudStorage defines the interface for cloud storage operations
type CloudStorage interface {
	// UploadFile uploads a file to cloud storage and returns the public URL
	UploadFile(ctx context.Context, bucketName string, objectName string, content io.Reader) (string, error)
	// DeleteFile deletes a file from cloud storage
	DeleteFile(ctx context.Context, bucketName string, objectName string) error
	// GetPublicURL returns the public URL of an object
	GetPublicURL(bucketName string, objectName string) string
}

type gcpStorage struct {
	client *storage.Client
}

// NewGCPStorage creates a new GCP implementation of CloudStorage using P12 credentials
func NewGCPStorage(ctx context.Context, credentialsPath string, serviceAccountEmail string, p12Password string) (CloudStorage, error) {
	if credentialsPath == "" || serviceAccountEmail == "" {
		return nil, fmt.Errorf("GCP_CREDENTIALS_PATH and GCP_SERVICE_ACCOUNT_EMAIL are required")
	}

	// Read the P12 file
	p12Data, err := os.ReadFile(credentialsPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read p12 file: %w", err)
	}

	// Decode the P12 file
	pvKey, _, err := pkcs12.Decode(p12Data, p12Password)
	if err != nil {
		return nil, fmt.Errorf("failed to decode p12 file: %w", err)
	}

	// Assert to RSA Private Key
	rsaKey, ok := pvKey.(*rsa.PrivateKey)
	if !ok {
		return nil, fmt.Errorf("p12 file does not contain an RSA private key")
	}

	// Encode to PEM
	keyBytes := x509.MarshalPKCS1PrivateKey(rsaKey)
	pemKey := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: keyBytes,
	})

	// Create JWT configuration
	conf := &jwt.Config{
		Email:      serviceAccountEmail,
		PrivateKey: pemKey,
		Scopes:     []string{storage.ScopeFullControl},
		TokenURL:   google.JWTTokenURL,
	}

	// Create client with P12 auth
	httpClient := conf.Client(ctx)
	client, err := storage.NewClient(ctx, option.WithHTTPClient(httpClient))
	if err != nil {
		return nil, fmt.Errorf("failed to create gcp storage client: %w", err)
	}

	return &gcpStorage{client: client}, nil
}

func (s *gcpStorage) UploadFile(ctx context.Context, bucketName string, objectName string, content io.Reader) (string, error) {
	bucket := s.client.Bucket(bucketName)
	obj := bucket.Object(objectName)

	wc := obj.NewWriter(ctx)
	wc.ObjectAttrs.PredefinedACL = "publicRead" // Ensure public access for avatar URL

	if _, err := io.Copy(wc, content); err != nil {
		return "", fmt.Errorf("failed to copy content to gcp object: %w", err)
	}

	if err := wc.Close(); err != nil {
		return "", fmt.Errorf("failed to close gcp object writer: %w", err)
	}

	return s.GetPublicURL(bucketName, objectName), nil
}

func (s *gcpStorage) DeleteFile(ctx context.Context, bucketName string, objectName string) error {
	bucket := s.client.Bucket(bucketName)
	obj := bucket.Object(objectName)

	if err := obj.Delete(ctx); err != nil {
		return fmt.Errorf("failed to delete gcp object: %w", err)
	}

	return nil
}

func (s *gcpStorage) GetPublicURL(bucketName string, objectName string) string {
	return fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, objectName)
}
