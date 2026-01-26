package entity

// SEOMetadata represents SEO information for works and blogs
type SEOMetadata struct {
	Base
	PostType    string `gorm:"not null;type:varchar(50)" json:"post_type"`
	PostID      string `gorm:"not null;type:text" json:"post_id"`
	Title       string `gorm:"type:varchar(255)" json:"title"`
	Description string `gorm:"type:text" json:"description"`
	Keywords    string `gorm:"type:text" json:"keywords"`
	OGImage     string `gorm:"type:text" json:"og_image"`
}

func (SEOMetadata) TableName() string {
	return "seo_metadata"
}
