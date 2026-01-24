package main

import (
	"log"

	"github.com/farismnrr/portfolio-backend-service/internal/domain/about/seeder"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/config"
	"github.com/farismnrr/portfolio-backend-service/internal/domain/common/database"
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
		log.Fatalf("Seeding failed: %v", err)
	}

	log.Println("✅ Seeding completed successfully")
}
