package entity

import (
	"time"

	"gorm.io/gorm"
)

type WorkExperience struct {
	ID        string         `gorm:"type:text;primaryKey" json:"id"`
	AboutID   string         `gorm:"type:text;not null;index" json:"about_id"`
	Company   string         `gorm:"size:255;not null" json:"company"`
	Role      string         `gorm:"size:255;not null" json:"role"`
	Timeframe string         `gorm:"size:100;not null" json:"timeframe"`
	OrderBy   int            `gorm:"not null;default:0;index" json:"order_by"`
	CreatedAt time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Achievements []WorkAchievement `gorm:"foreignKey:WorkExperienceID;constraint:OnDelete:CASCADE" json:"achievements"`
}
