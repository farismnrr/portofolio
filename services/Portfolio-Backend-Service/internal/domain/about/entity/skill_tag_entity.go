package entity

import (
	"time"

	"gorm.io/gorm"
)

type SkillTag struct {
	ID              string         `gorm:"type:text;primaryKey" json:"id"`
	SkillCategoryID string         `gorm:"type:text;not null;index" json:"skill_category_id"`
	Name            string         `gorm:"size:100;not null" json:"name"`
	Icon            string         `gorm:"size:100" json:"icon"`
	OrderBy         int            `gorm:"not null;default:0;index" json:"order_by"`
	CreatedAt       time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt       time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}
