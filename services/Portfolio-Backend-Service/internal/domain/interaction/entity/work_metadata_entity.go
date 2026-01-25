package entity

// WorksMetadata represents engagement data for works/projects
type WorksMetadata struct {
	Base
	Slug       string `gorm:"uniqueIndex;not null;type:varchar(255)" json:"slug"`
	ViewsCount int    `gorm:"not null;type:integer;default:0" json:"views_count"`
	LikesCount int    `gorm:"not null;type:integer;default:0" json:"likes_count"`
}

func (WorksMetadata) TableName() string {
	return "works_metadata"
}
