package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SkillTag struct {
	ID              uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	SkillCategoryID uuid.UUID      `gorm:"type:uuid;not null;index" json:"skill_category_id"`
	Name            string         `gorm:"size:100;not null" json:"name"`
	Icon            string         `gorm:"size:100" json:"icon"`
	OrderBy         int            `gorm:"not null;default:0;index" json:"order_by"`
	CreatedAt       time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt       time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}
