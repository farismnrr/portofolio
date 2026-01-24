package entity

import (
	"time"

	"gorm.io/gorm"
)

type WorkAchievement struct {
	ID               string         `gorm:"type:text;primaryKey" json:"id"`
	WorkExperienceID string         `gorm:"type:text;not null;index" json:"work_experience_id"`
	Content          string         `gorm:"type:text;not null" json:"content"`
	OrderBy          int            `gorm:"not null;default:0;index" json:"order_by"`
	CreatedAt        time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt        time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}
