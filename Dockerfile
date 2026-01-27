# ==========================================
# Stage 1: Build Go Backend
# ==========================================
FROM golang:alpine AS backend-builder
WORKDIR /app
RUN apk add --no-cache git

# Copy backend source
COPY services/Portfolio-Backend-Service/go.mod services/Portfolio-Backend-Service/go.sum ./
RUN go mod download

COPY services/Portfolio-Backend-Service/ .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o portfolio-backend-service ./cmd/server
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o portfolio-seeder ./cmd/seed

# ==========================================
# Stage 2: Build Next.js Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Copy frontend source
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

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

# Build standalone
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
RUN mkdir .next
RUN chown nextjs:nodejs .next
# Ensure Backend has permissions for its temp/cache dirs
RUN mkdir -p tmp/badger
RUN chown -R nextjs:nodejs tmp/badger
RUN chmod 755 tmp/badger
COPY --from=frontend-builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=frontend-builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# --- Setup Backend ---
COPY --from=backend-builder --chown=nextjs:nodejs /app/portfolio-backend-service .
COPY --from=backend-builder --chown=nextjs:nodejs /app/portfolio-seeder .
# Copy backend migrations/secrets if needed (Adjust paths if they are in subdirs)
COPY --from=backend-builder --chown=nextjs:nodejs /app/migration ./migration
COPY --from=backend-builder --chown=nextjs:nodejs /app/secret ./secret

# --- Setup Startup Script ---
COPY --chown=nextjs:nodejs start.sh .
RUN chmod +x start.sh

USER nextjs

EXPOSE 3000 8080

CMD ["./start.sh"]
