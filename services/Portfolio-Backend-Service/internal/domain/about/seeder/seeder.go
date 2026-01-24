package seeder

import (
	"context"
	"log"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/entity"
	"gorm.io/gorm"
)

func SeedAboutData(db *gorm.DB) error {
	ctx := context.Background()

	// Check if data already exists to avoid duplicates
	var count int64
	db.Model(&entity.About{}).Count(&count)
	if count > 0 {
		log.Println("🌱 Seed: About data already exists, skipping...")
		return nil
	}

	log.Println("🌱 Seed: Migrating dummy data for About domain...")

	aboutID := "about-me"
	about := entity.About{
		ID:          aboutID,
		Name:        "Faris Munir Mahdi",
		Role:        "Software Engineer",
		Description: "I am a Software Engineer specializing in backend architecture, cloud infrastructure, and IoT systems. I focus on engineering scalable, high-performance solutions that integrate intelligent hardware with robust software ecosystems.",
		Avatar:      "/images/projects/avatar.jpg",
	}

	if err := db.Create(&about).Error; err != nil {
		return err
	}

	// 1. Social Links
	socialLinks := []entity.SocialLink{
		{ID: "sl-1", AboutID: aboutID, Name: "GitHub", Link: "https://github.com/farismnrr", Icon: "github", OrderBy: 0},
		{ID: "sl-2", AboutID: aboutID, Name: "LinkedIn", Link: "https://www.linkedin.com/in/farismnrr", Icon: "linkedin", OrderBy: 1},
		{ID: "sl-3", AboutID: aboutID, Name: "Email", Link: "mailto:farismunir2@gmail.com", Icon: "email", OrderBy: 2},
	}
	db.Create(&socialLinks)

	// 2. Work Experiences
	workExps := []entity.WorkExperience{
		{
			ID: "we-1", AboutID: aboutID, Company: "DBS Foundation", Role: "Machine Learning Engineer", Timeframe: "Feb 2025 - Present", OrderBy: 0,
			Achievements: []entity.WorkAchievement{
				{ID: "wa-1", Content: "Engineered and deployed high-performance Machine Learning models using Python and TensorFlow to address complex business challenges.", OrderBy: 0},
				{ID: "wa-2", Content: "Orchestrated end-to-end data processing pipelines and advanced visualization techniques to drive model development and performance optimization.", OrderBy: 1},
				{ID: "wa-3", Content: "Leveraged deep learning methodologies to solve real-world problems, ensuring scalable and accurate predictive analysis.", OrderBy: 2},
			},
		},
		{
			ID: "we-2", AboutID: aboutID, Company: "Codepolitan", Role: "Full Stack Web Developer", Timeframe: "Sep 2024 - Dec 2024", OrderBy: 1,
			Achievements: []entity.WorkAchievement{
				{ID: "wa-4", Content: "Architected and maintained robust RESTful APIs using Node.js and Express.js, while managing high-availability MongoDB databases.", OrderBy: 0},
				{ID: "wa-5", Content: "Developed responsive, user-centric frontend interfaces using Vue.js, ensuring seamless cross-device compatibility and user experience.", OrderBy: 1},
				{ID: "wa-6", Content: "Achieved Alibaba Cloud Certification through the KodeBisat collaboration, verifying expertise in scalable cloud infrastructure.", OrderBy: 2},
			},
		},
		{
			ID: "we-3", AboutID: aboutID, Company: "Ruang Guru Academy", Role: "Back End Developer", Timeframe: "Feb 2024 - Aug 2024", OrderBy: 2,
			Achievements: []entity.WorkAchievement{
				{ID: "wa-7", Content: "Designed and implemented efficient RESTful APIs using Golang, prioritizing performance and concurrency.", OrderBy: 0},
				{ID: "wa-8", Content: "Integrated advanced machine learning models into backend services to power intelligent application features.", OrderBy: 1},
				{ID: "wa-9", Content: "Optimized PostgreSQL database schemas and queries to handle large-scale data transactions with minimal latency.", OrderBy: 2},
			},
		},
		{
			ID: "we-4", AboutID: aboutID, Company: "PT Tradeasia International Indonesia", Role: "SEO Specialist", Timeframe: "Jan 2024 - Apr 2024", OrderBy: 3,
			Achievements: []entity.WorkAchievement{
				{ID: "wa-10", Content: "Executed comprehensive keyword analysis and strategy to significantly improve organic search rankings and visibility.", OrderBy: 0},
				{ID: "wa-11", Content: "Optimized technical site structure and content for chentradeasia.lk and formic-acid.com, implementing targeted backlink strategies.", OrderBy: 1},
				{ID: "wa-12", Content: "Analyzed complex web analytics to identify growth opportunities, resulting in measurable improvements in organic traffic and engagement.", OrderBy: 2},
			},
		},
	}
	db.Create(&workExps)

	// 3. Educations
	edus := []entity.Education{
		{
			ID: "edu-1", AboutID: aboutID, Institution: "UPN \"Veteran\" East Java", Degree: "Cumlaude Degree", Period: "2020 - 2024",
			Description: "Achieved Cumlaude honors while actively shaping the technical direction of the IoTNet laboratory since the 5th semester. My role involved not just managing infrastructure, but also spearheading complex research initiatives and fostering a collaborative environment for exploring advanced IoT technologies.",
			OrderBy:     0,
		},
		{
			ID: "edu-2", AboutID: aboutID, Institution: "SMKN 26 Jakarta", Degree: "Power Electronics and Communications", Period: "2017 - 2020",
			Description: "Degree in Power Electronics and Communications", OrderBy: 1,
		},
	}
	db.Create(&edus)

	// 4. Skills
	skillCategories := []entity.SkillCategory{
		{
			ID: "sc-1", AboutID: aboutID, Title: "Languages", OrderBy: 0,
			Description: "Proficient in writing high-performance, memory-safe code for system-level applications and ensuring type safety across the entire stack.",
			Tags: []entity.SkillTag{
				{ID: "st-1", Name: "Go", Icon: "golang", OrderBy: 0},
				{ID: "st-2", Name: "Rust", Icon: "rust", OrderBy: 1},
				{ID: "st-3", Name: "TypeScript", Icon: "typescript", OrderBy: 2},
				{ID: "st-4", Name: "Python", Icon: "python", OrderBy: 3},
				{ID: "st-5", Name: "C++", Icon: "cplusplus", OrderBy: 4},
			},
		},
		{
			ID: "sc-2", AboutID: aboutID, Title: "Backend", OrderBy: 1,
			Description: "Architecting scalable microservices and high-throughput RESTful/gRPC APIs, focusing on concurrency and low-latency performance.",
			Tags: []entity.SkillTag{
				{ID: "st-6", Name: "NestJS", Icon: "nestjs", OrderBy: 0},
				{ID: "st-7", Name: "Hapi", Icon: "hapi", OrderBy: 1},
				{ID: "st-8", Name: "Gin", Icon: "gin", OrderBy: 2},
				{ID: "st-9", Name: "Actix", Icon: "actix", OrderBy: 3},
			},
		},
		{
			ID: "sc-3", AboutID: aboutID, Title: "Frontend", OrderBy: 2,
			Description: "Developing modern, responsive web applications with a focus on component reusability, server-side rendering, and optimal user experience.",
			Tags: []entity.SkillTag{
				{ID: "st-10", Name: "Next.js", Icon: "nextjs", OrderBy: 0},
				{ID: "st-11", Name: "Nuxt", Icon: "nuxt", OrderBy: 1},
				{ID: "st-12", Name: "React", Icon: "react", OrderBy: 2},
				{ID: "st-13", Name: "Vue", Icon: "vue", OrderBy: 3},
			},
		},
		{
			ID: "sc-4", AboutID: aboutID, Title: "Database & Storage", OrderBy: 3,
			Description: "Designing optimized database schemas for complex data relationships and implementing high-speed caching strategies for real-time access.",
			Tags: []entity.SkillTag{
				{ID: "st-14", Name: "PostgreSQL", Icon: "postgresql", OrderBy: 0},
				{ID: "st-15", Name: "MySQL", Icon: "mysql", OrderBy: 1},
				{ID: "st-16", Name: "Redis", Icon: "redis", OrderBy: 2},
				{ID: "st-17", Name: "RocksDB", Icon: "rocksdb", OrderBy: 3},
				{ID: "st-18", Name: "SQLite", Icon: "sqlite", OrderBy: 4},
			},
		},
		{
			ID: "sc-5", AboutID: aboutID, Title: "DevOps & Infrastructure", OrderBy: 4,
			Description: "Automating deployment workflows with CI/CD pipelines and managing containerized infrastructure on cloud platforms for high availability.",
			Tags: []entity.SkillTag{
				{ID: "st-19", Name: "Docker", Icon: "docker", OrderBy: 0},
				{ID: "st-20", Name: "AWS", Icon: "aws", OrderBy: 1},
				{ID: "st-21", Name: "GitHub Actions", Icon: "githubactions", OrderBy: 2},
				{ID: "st-22", Name: "GCP", Icon: "googlecloud", OrderBy: 3},
				{ID: "st-23", Name: "Linux", Icon: "linux", OrderBy: 4},
			},
		},
		{
			ID: "sc-6", AboutID: aboutID, Title: "IoT & Embedded", OrderBy: 5,
			Description: "Engineering secure, real-time communication between hardware and cloud systems, including firmware development and Over-The-Air (OTA) updates.",
			Tags: []entity.SkillTag{
				{ID: "st-24", Name: "Arduino", Icon: "arduino", OrderBy: 0},
				{ID: "st-25", Name: "ESP32", Icon: "esp32", OrderBy: 1},
				{ID: "st-26", Name: "EMQX", Icon: "emqx", OrderBy: 2},
				{ID: "st-27", Name: "Grafana", Icon: "grafana", OrderBy: 3},
				{ID: "st-28", Name: "Node-RED", Icon: "nodered", OrderBy: 4},
			},
		},
	}
	db.Create(&skillCategories)

	_ = ctx
	log.Println("✅ Seed: About dummy data completed successfully")
	return nil
}
