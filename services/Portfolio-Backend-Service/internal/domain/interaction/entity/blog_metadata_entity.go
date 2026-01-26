package entity

import "time"

// BlogsMetadata represents engagement data for blogs/articles
type BlogsMetadata struct {
	Base
	Slug        string       `gorm:"uniqueIndex;not null;type:varchar(255)" json:"slug"`
	ViewsCount  int          `gorm:"not null;type:integer;default:0" json:"views_count"`
	LikesCount  int          `gorm:"not null;type:integer;default:0" json:"likes_count"`
	Title       string       `gorm:"type:varchar(255)" json:"title"`
	Content     string       `gorm:"type:text" json:"content"`
	Summary     string       `gorm:"type:text" json:"summary"`
	BlogTitle   string       `gorm:"type:varchar(255)" json:"blog_title"`
	Images      string       `gorm:"type:text" json:"images"` // JSON string
	Source      string       `gorm:"type:text" json:"source"`
	PublishedAt *time.Time   `json:"published_at"`
	SEOMetadata *SEOMetadata `gorm:"-" json:"seo_metadata,omitempty"`
}

func (BlogsMetadata) TableName() string {
	return "blogs_metadata"
}
