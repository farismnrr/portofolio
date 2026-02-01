# ==========================================
# Stage 1: Build Go Backend
# ==========================================
FROM --platform=$BUILDPLATFORM golang:1.24-alpine AS backend-builder
WORKDIR /app

# System deps
RUN apk add --no-cache git curl ca-certificates

# --- Go cache dirs (helps buildx) ---
ENV GOMODCACHE=/go/pkg/mod
ENV GOCACHE=/go/cache

# Copy go mod files first (cacheable)
COPY services/Portfolio-Backend-Service/go.mod services/Portfolio-Backend-Service/go.sum ./
RUN go mod download

# Copy backend source
COPY services/Portfolio-Backend-Service/api ./api
COPY services/Portfolio-Backend-Service/assets ./assets
COPY services/Portfolio-Backend-Service/cmd ./cmd
COPY services/Portfolio-Backend-Service/internal ./internal
COPY services/Portfolio-Backend-Service/migration ./migration

# Build binaries for target arch (NO forced rebuild)
ARG TARGETOS TARGETARCH
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH \
    go build -o portfolio-backend-service ./cmd/server

RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH \
    go build -o portfolio-seeder ./cmd/seed

# --- Install migrate (arch-safe) ---
ARG TARGETARCH
RUN case "$TARGETARCH" in \
      amd64) ARCH=amd64 ;; \
      arm64) ARCH=arm64 ;; \
      *) echo "Unsupported arch: $TARGETARCH" && exit 1 ;; \
    esac && \
    curl -L https://github.com/golang-migrate/migrate/releases/download/v4.17.0/migrate.linux-$ARCH.tar.gz | tar xvz && \
    mv migrate /go/bin/migrate


# ==========================================
# Stage 2: Build Next.js Frontend
# ==========================================
FROM --platform=$BUILDPLATFORM node:20-alpine AS frontend-builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copy frontend deps first
COPY package.json package-lock.json ./

# Install with optional swc-musl for Alpine
RUN npm ci && \
    npm install --no-save --force @next/swc-linux-x64-musl || true

# Copy frontend source (minimal)
COPY src ./src
COPY public ./public
COPY next.config.mjs tsconfig.json biome.json ./

# Build standalone output without Turbopack
RUN npm run build


# ==========================================
# Stage 3: Runtime Image
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache ca-certificates curl dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# --- Frontend ---
COPY --from=frontend-builder --chown=nextjs:nodejs /app/public ./public
COPY --from=frontend-builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=frontend-builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# --- Backend ---
COPY --from=backend-builder --chown=nextjs:nodejs /app/portfolio-backend-service .
COPY --from=backend-builder --chown=nextjs:nodejs /app/portfolio-seeder .
COPY --from=backend-builder --chown=nextjs:nodejs /go/bin/migrate ./migrate
COPY --from=backend-builder --chown=nextjs:nodejs /app/migration ./migration

# Runtime dirs
RUN mkdir -p tmp/badger logs && \
    chown -R nextjs:nodejs tmp logs

# Startup script
COPY --chown=nextjs:nodejs start.sh .
RUN chmod +x start.sh

USER nextjs

EXPOSE 3000 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/health && \
      curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["./start.sh"]
