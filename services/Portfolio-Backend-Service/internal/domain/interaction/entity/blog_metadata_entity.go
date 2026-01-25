package entity

// BlogsMetadata represents engagement data for blogs/articles
type BlogsMetadata struct {
	Base
	Slug       string `gorm:"uniqueIndex;not null;type:varchar(255)" json:"slug"`
	ViewsCount int    `gorm:"not null;type:integer;default:0" json:"views_count"`
	LikesCount int    `gorm:"not null;type:integer;default:0" json:"likes_count"`
}

func (BlogsMetadata) TableName() string {
	return "blogs_metadata"
}
