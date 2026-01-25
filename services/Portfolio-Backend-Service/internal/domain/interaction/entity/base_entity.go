package entity

import (
	"time"

	"gorm.io/gorm"
)

// Base model for common fields
type Base struct {
	ID        string         `gorm:"primaryKey;type:text" json:"id"`
	CreatedAt time.Time      `gorm:"not null;type:datetime;default:current_timestamp" json:"created_at"`
	UpdatedAt time.Time      `gorm:"not null;type:datetime;default:current_timestamp" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index;type:datetime" json:"deleted_at,omitempty" swaggertype:"string"`
}
