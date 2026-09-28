# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install --package-lock-only && npm ci

COPY frontend/ ./
RUN npm run check && npm run build

FROM rust:1-bookworm AS rust-builder
WORKDIR /app

COPY server/Cargo.toml ./server/Cargo.toml
COPY server/src ./server/src

RUN cargo build --release --manifest-path server/Cargo.toml

FROM debian:bookworm-slim AS runtime
WORKDIR /app

RUN useradd --create-home --uid 10001 portfolio

COPY --from=rust-builder /app/server/target/release/portfolio-server /app/portfolio-server
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

ENV DIST_DIR=/app/frontend/dist
ENV PORT=3000
EXPOSE 3000

USER portfolio

CMD ["/app/portfolio-server"]
