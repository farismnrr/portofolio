# ==========================================
# Stage 1: Build Go Backend
# ==========================================
FROM --platform=$BUILDPLATFORM golang:alpine AS backend-builder
WORKDIR /app
RUN apk add --no-cache git

# Copy backend dependencies
COPY services/Portfolio-Backend-Service/go.mod services/Portfolio-Backend-Service/go.sum ./
RUN go mod download

# Copy backend source (Granular to avoid bloat)
COPY services/Portfolio-Backend-Service/api ./api
COPY services/Portfolio-Backend-Service/assets ./assets
COPY services/Portfolio-Backend-Service/cmd ./cmd
COPY services/Portfolio-Backend-Service/internal ./internal
COPY services/Portfolio-Backend-Service/migration ./migration

# Build for target architecture
ARG TARGETOS TARGETARCH
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -a -installsuffix cgo -o portfolio-backend-service ./cmd/server
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -a -installsuffix cgo -o portfolio-seeder ./cmd/seed

# Install migrate tool
RUN go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# ==========================================
# Stage 2: Build Next.js Frontend
# ==========================================
FROM --platform=$BUILDPLATFORM node:20-alpine AS frontend-builder
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Copy frontend dependencies
COPY package.json package-lock.json ./
RUN npm ci

# This avoids copying the 'services/' or 'deployments/' directories
COPY src ./src
COPY public ./public
COPY next.config.mjs tsconfig.json biome.json ./

# Build args for Frontend (Public vars)
ARG NEXT_PUBLIC_SSO_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_TENANT_ID
ARG NEXT_PUBLIC_API_KEY
ARG NEXT_PUBLIC_BASE_URL

ENV NEXT_PUBLIC_SSO_URL=$NEXT_PUBLIC_SSO_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_TENANT_ID=$NEXT_PUBLIC_TENANT_ID
ENV NEXT_PUBLIC_API_KEY=$NEXT_PUBLIC_API_KEY
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# Build standalone (Next.js build is architecture independent but standalone helps)
RUN npm run build

# ==========================================
# Stage 3: Final Unified Image
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache ca-certificates curl

# Setup Users
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# --- Setup Frontend ---
COPY --from=frontend-builder /app/public ./public
RUN mkdir .next && chown nextjs:nodejs .next

# Ensure Backend has permissions for its temp/cache dirs
RUN mkdir -p tmp/badger && chown -R nextjs:nodejs tmp/badger

COPY --from=frontend-builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=frontend-builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# --- Setup Backend ---
COPY --from=backend-builder --chown=nextjs:nodejs /app/portfolio-backend-service .
COPY --from=backend-builder --chown=nextjs:nodejs /app/portfolio-seeder .
COPY --from=backend-builder --chown=nextjs:nodejs /go/bin/migrate ./migrate

# Copy backend migrations (REQUIRED for first run)
COPY --from=backend-builder --chown=nextjs:nodejs /app/migration ./migration

# --- Setup Startup Script ---
COPY --chown=nextjs:nodejs start.sh .
RUN chmod +x start.sh

USER nextjs

EXPOSE 3000 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/health && curl -f http://localhost:3000/api/health || exit 1

CMD ["./start.sh"]
