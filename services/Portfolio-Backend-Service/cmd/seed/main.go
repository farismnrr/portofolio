package main

import (
	"log"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/seeder"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/config"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/database"
	interactionSeeder "github.com/farismnrr/portfolio-backend-service/internal/domain/interaction/seeder"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	db, err := database.Initialize(&cfg.Database)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	if err := seeder.SeedAboutData(db); err != nil {
		log.Printf("About seeding failed: %v", err)
	}

	// Seed Interactions (Works/Blogs) from frontend content
	// Assuming running from services/Portfolio-Backend-Service root or cmd/seed
	// We need to point to src/app which is ../../src/app relative to service root
	srcPath := "../../src/app"
	if err := interactionSeeder.SeedInteractionData(db, srcPath); err != nil {
		log.Printf("Interaction seeding failed: %v", err)
	}

	log.Println("✅ Seeding completed successfully")
}
