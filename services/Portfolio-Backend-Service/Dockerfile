# Build stage
FROM golang:alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o portfolio-backend-service ./cmd/server
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o portfolio-seeder ./cmd/seed

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates curl

# Install migrate tool
RUN curl -L https://github.com/golang-migrate/migrate/releases/download/v4.16.2/migrate.linux-amd64.tar.gz | tar xvz && \
    mv migrate /usr/bin/migrate

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/portfolio-backend-service .
COPY --from=builder /app/portfolio-seeder .
# Copy migrations
COPY --from=builder /app/migration ./migration
# Copy secrets
COPY --from=builder /app/secret ./secret
# Copy entrypoint
COPY --from=builder /app/docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

# Expose port
EXPOSE 8080

# Use entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]
