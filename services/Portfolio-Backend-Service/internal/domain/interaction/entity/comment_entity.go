package entity

// Comment represents a user comment on a work or blog
type Comment struct {
	Base
	PostType string `gorm:"index:idx_comments_post;not null;type:varchar(50)" json:"post_type"` // 'work' or 'blog'
	PostSlug string `gorm:"index:idx_comments_post;not null;type:varchar(255)" json:"post_slug"`
	UserName string `gorm:"not null;type:varchar(255)" json:"user_name"`
	Content  string `gorm:"not null;type:text" json:"content"`
}

func (Comment) TableName() string {
	return "comments"
}
