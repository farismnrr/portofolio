# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install --package-lock-only && npm ci
COPY frontend/ ./
RUN npm run guard && npm run check && npm run build

FROM rust:1-alpine AS rust-builder
RUN apk add --no-cache musl-dev
WORKDIR /app
COPY server/Cargo.toml ./server/Cargo.toml
COPY server/src ./server/src
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
RUN cargo build --release --manifest-path server/Cargo.toml

FROM scratch
COPY --from=rust-builder /app/server/target/release/portfolio-server /portfolio-server
ENV PORT=3000
EXPOSE 3000
USER 10001:10001
ENTRYPOINT ["/portfolio-server"]
