package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Education struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	AboutID     uuid.UUID      `gorm:"type:uuid;not null;index" json:"about_id"`
	Institution string         `gorm:"size:255;not null" json:"institution"`
	Degree      string         `gorm:"size:255;not null" json:"degree"`
	Period      string         `gorm:"size:100;not null" json:"period"`
	Description string         `gorm:"type:text" json:"description"`
	OrderBy     int            `gorm:"not null;default:0;index" json:"order_by"`
	CreatedAt   time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
