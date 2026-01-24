package entity

import (
	"time"

	"gorm.io/gorm"
)

type Education struct {
	ID          string         `gorm:"type:text;primaryKey" json:"id"`
	AboutID     string         `gorm:"type:text;not null;index" json:"about_id"`
	Institution string         `gorm:"size:255;not null" json:"institution"`
	Degree      string         `gorm:"size:255;not null" json:"degree"`
	Period      string         `gorm:"size:100;not null" json:"period"`
	Description string         `gorm:"type:text" json:"description"`
	OrderBy     int            `gorm:"not null;default:0;index" json:"order_by"`
	CreatedAt   time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
