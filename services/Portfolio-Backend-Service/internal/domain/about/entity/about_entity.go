package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// About is the aggregate root for all about page content
type About struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Name        string         `gorm:"size:255;not null" json:"name"`
	Role        string         `gorm:"size:255;not null" json:"role"`
	Description string         `gorm:"type:text;not null" json:"description"`
	Avatar      string         `gorm:"type:text" json:"avatar"`
	CreatedAt   time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	SocialLinks    []SocialLink     `gorm:"foreignKey:AboutID;constraint:OnDelete:CASCADE" json:"social_links"`
	WorkExperience []WorkExperience `gorm:"foreignKey:AboutID;constraint:OnDelete:CASCADE" json:"work_experience"`
	Education      []Education      `gorm:"foreignKey:AboutID;constraint:OnDelete:CASCADE" json:"education"`
	TechSkills     []SkillCategory  `gorm:"foreignKey:AboutID;constraint:OnDelete:CASCADE" json:"tech_skills"`
}
