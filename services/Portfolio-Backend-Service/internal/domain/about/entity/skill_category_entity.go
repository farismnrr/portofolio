package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SkillCategory struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	AboutID     uuid.UUID      `gorm:"type:uuid;not null;index" json:"about_id"`
	Title       string         `gorm:"size:255;not null" json:"title"`
	Description string         `gorm:"type:text" json:"description"`
	OrderBy     int            `gorm:"not null;default:0;index" json:"order_by"`
	CreatedAt   time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Tags []SkillTag `gorm:"foreignKey:SkillCategoryID;constraint:OnDelete:CASCADE" json:"tags"`
}
