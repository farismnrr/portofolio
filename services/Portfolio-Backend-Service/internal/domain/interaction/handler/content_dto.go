package handler

import "time"

type SEOMetadataDTO struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Keywords    string `json:"keywords"`
	OGImage     string `json:"og_image"`
}

type TeamMemberDTO struct {
	Name     string `json:"name"`
	Role     string `json:"role"`
	Avatar   string `json:"avatar"`
	LinkedIn string `json:"linkedIn"`
}

type WorkDTO struct {
	ID          string          `json:"id"`
	Slug        string          `json:"slug"`
	Title       string          `json:"title"`
	Content     string          `json:"content"`
	Summary     string          `json:"summary"`
	ProjectName string          `json:"project_name"`
	Images      []string        `json:"images"`
	Link        string          `json:"link"`
	Repository  string          `json:"repository"`
	Team        []TeamMemberDTO `json:"team"`
	PublishedAt *time.Time      `json:"published_at"`
	SEOMetadata *SEOMetadataDTO `json:"seo_metadata"`
	ViewsCount  int             `json:"views_count"`
	LikesCount  int             `json:"likes_count"`
}

type WorkCreateUpdateDTO struct {
	Slug        string          `json:"slug" validate:"required"`
	Title       string          `json:"title" validate:"required"`
	Content     string          `json:"content" validate:"required"`
	Summary     string          `json:"summary"`
	ProjectName string          `json:"project_name"`
	Images      []string        `json:"images"`
	Link        string          `json:"link"`
	Repository  string          `json:"repository"`
	Team        []TeamMemberDTO `json:"team"`
	PublishedAt *time.Time      `json:"published_at"`
	SEOMetadata *SEOMetadataDTO `json:"seo_metadata"`
}

type BlogDTO struct {
	ID          string          `json:"id"`
	Slug        string          `json:"slug"`
	Title       string          `json:"title"`
	Content     string          `json:"content"`
	Summary     string          `json:"summary"`
	BlogTitle   string          `json:"blog_title"`
	Images      []string        `json:"images"`
	Source      string          `json:"source"`
	PublishedAt *time.Time      `json:"published_at"`
	SEOMetadata *SEOMetadataDTO `json:"seo_metadata"`
	ViewsCount  int             `json:"views_count"`
	LikesCount  int             `json:"likes_count"`
}

type BlogCreateUpdateDTO struct {
	Slug        string          `json:"slug" validate:"required"`
	Title       string          `json:"title" validate:"required"`
	Content     string          `json:"content" validate:"required"`
	Summary     string          `json:"summary"`
	BlogTitle   string          `json:"blog_title"`
	Images      []string        `json:"images"`
	Source      string          `json:"source"`
	PublishedAt *time.Time      `json:"published_at"`
	SEOMetadata *SEOMetadataDTO `json:"seo_metadata"`
}
