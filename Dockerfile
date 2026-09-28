FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
COPY --from=builder /app/dist ./dist
COPY scripts/serve-spa.mjs ./scripts/serve-spa.mjs
COPY scripts/container-entrypoint.mjs ./scripts/container-entrypoint.mjs
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/ >/dev/null || exit 1
CMD ["node", "scripts/container-entrypoint.mjs"]
