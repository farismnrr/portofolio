package seeder

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/entity"
	"github.com/google/uuid"
	"gopkg.in/yaml.v2"
	"gorm.io/gorm"
)

type WorkFrontmatter struct {
	Title       string   `yaml:"title"`
	ProjectName string   `yaml:"projectName"`
	PublishedAt string   `yaml:"publishedAt"`
	Summary     string   `yaml:"summary"`
	Images      []string `yaml:"images"`
	Link        string   `yaml:"link"`
	Repository  string   `yaml:"repository"`
	Team        []struct {
		Name     string `yaml:"name"`
		Role     string `yaml:"role"`
		Avatar   string `yaml:"avatar"`
		LinkedIn string `yaml:"linkedIn"`
	} `yaml:"team"`
}

type BlogFrontmatter struct {
	Title       string `yaml:"title"`
	PublishedAt string `yaml:"publishedAt"`
	Summary     string `yaml:"summary"`
	Image       string `yaml:"image"`
	Tag         string `yaml:"tag"`
}

func SeedInteractionData(db *gorm.DB, srcPath string) error {
	if err := seedWorks(db, filepath.Join(srcPath, "(marketing)/work/projects")); err != nil {
		return fmt.Errorf("failed to seed works: %w", err)
	}

	if err := seedBlogs(db, filepath.Join(srcPath, "(marketing)/blog/posts")); err != nil {
		return fmt.Errorf("failed to seed blogs: %w", err)
	}

	return nil
}

func seedWorks(db *gorm.DB, dirPath string) error {
	return filepath.Walk(dirPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() || filepath.Ext(path) != ".mdx" {
			return nil
		}

		content, err := ioutil.ReadFile(path)
		if err != nil {
			return err
		}

		parts := strings.SplitN(string(content), "---", 3)
		if len(parts) < 3 {
			return nil
		}

		var fm WorkFrontmatter
		if err := yaml.Unmarshal([]byte(parts[1]), &fm); err != nil {
			return fmt.Errorf("failed to parse frontmatter for %s: %w", path, err)
		}

		slug := strings.TrimSuffix(filepath.Base(path), ".mdx")
		publishedAt, _ := time.Parse("2006-01-02", fm.PublishedAt)

		imagesJSON, _ := json.Marshal(fm.Images)
		teamJSON, _ := json.Marshal(fm.Team)

		work := entity.WorksMetadata{
			Slug:        slug,
			Title:       fm.Title,
			ProjectName: fm.ProjectName,
			Summary:     fm.Summary,
			Content:     strings.TrimSpace(parts[2]),
			Images:      string(imagesJSON),
			Link:        fm.Link,
			Repository:  fm.Repository,
			Team:        string(teamJSON),
			PublishedAt: &publishedAt,
			ViewsCount:  0,
			LikesCount:  0,
		}

		// Check if exists
		var existingWork entity.WorksMetadata
		err = db.Where("slug = ?", slug).First(&existingWork).Error
		if err == nil {
			// Update using explicit Updates call to force UPDATE statement
			updates := map[string]interface{}{
				"title":        fm.Title,
				"project_name": fm.ProjectName,
				"summary":      fm.Summary,
				"content":      strings.TrimSpace(parts[2]),
				"images":       string(imagesJSON),
				"link":         fm.Link,
				"repository":   fm.Repository,
				"team":         string(teamJSON),
				"published_at": &publishedAt,
			}

			if err := db.Model(&existingWork).Where("id = ?", existingWork.ID).Updates(updates).Error; err != nil {
				return fmt.Errorf("failed to update work %s: %w", slug, err)
			}
		} else {
			// Create new
			work.ID = uuid.New().String()
			if err := db.Create(&work).Error; err != nil {
				return fmt.Errorf("failed to create work %s: %w", slug, err)
			}
		}

		fmt.Printf("✅ Seeded work: %s\n", slug)
		return nil
	})
}

func seedBlogs(db *gorm.DB, dirPath string) error {
	return filepath.Walk(dirPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() || filepath.Ext(path) != ".mdx" {
			return nil
		}

		content, err := ioutil.ReadFile(path)
		if err != nil {
			return err
		}

		parts := strings.SplitN(string(content), "---", 3)
		if len(parts) < 3 {
			return nil
		}

		var fm BlogFrontmatter
		if err := yaml.Unmarshal([]byte(parts[1]), &fm); err != nil {
			return fmt.Errorf("failed to parse frontmatter for %s: %w", path, err)
		}

		slug := strings.TrimSuffix(filepath.Base(path), ".mdx")
		publishedAt, _ := time.Parse("2006-01-02", fm.PublishedAt)

		imagesJSON, _ := json.Marshal([]string{fm.Image})

		blog := entity.BlogsMetadata{
			Slug:        slug,
			Title:       fm.Title,
			BlogTitle:   fm.Title,
			Summary:     fm.Summary,
			Content:     strings.TrimSpace(parts[2]),
			Images:      string(imagesJSON),
			PublishedAt: &publishedAt,
			Source:      "local",
			ViewsCount:  0,
			LikesCount:  0,
		}

		// Check if exists
		var existingBlog entity.BlogsMetadata
		err = db.Where("slug = ?", slug).First(&existingBlog).Error
		if err == nil {
			// Update using explicit Updates call to force UPDATE statement
			updates := map[string]interface{}{
				"title":        fm.Title,
				"blog_title":   fm.Title,
				"summary":      fm.Summary,
				"content":      strings.TrimSpace(parts[2]),
				"images":       string(imagesJSON),
				"published_at": &publishedAt,
			}

			if err := db.Model(&existingBlog).Where("id = ?", existingBlog.ID).Updates(updates).Error; err != nil {
				return fmt.Errorf("failed to update blog %s: %w", slug, err)
			}
		} else {
			// Create
			blog.ID = uuid.New().String()
			if err := db.Create(&blog).Error; err != nil {
				return fmt.Errorf("failed to create blog %s: %w", slug, err)
			}
		}

		fmt.Printf("✅ Seeded blog: %s\n", slug)
		return nil
	})
}
