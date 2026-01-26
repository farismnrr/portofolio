package entity

import "time"

// WorksMetadata represents engagement data for works/projects
type WorksMetadata struct {
	Base
	Slug        string       `gorm:"uniqueIndex;not null;type:varchar(255)" json:"slug"`
	ViewsCount  int          `gorm:"not null;type:integer;default:0" json:"views_count"`
	LikesCount  int          `gorm:"not null;type:integer;default:0" json:"likes_count"`
	Title       string       `gorm:"type:varchar(255)" json:"title"`
	Content     string       `gorm:"type:text" json:"content"`
	Summary     string       `gorm:"type:text" json:"summary"`
	ProjectName string       `gorm:"type:varchar(255)" json:"project_name"`
	Images      string       `gorm:"type:text" json:"images"` // JSON string
	Link        string       `gorm:"type:text" json:"link"`
	Repository  string       `gorm:"type:text" json:"repository"`
	Team        string       `gorm:"type:text" json:"team"` // JSON string
	PublishedAt *time.Time   `json:"published_at"`
	SEOMetadata *SEOMetadata `gorm:"-" json:"seo_metadata,omitempty"`
}

func (WorksMetadata) TableName() string {
	return "works_metadata"
}
