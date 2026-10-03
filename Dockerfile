# syntax=docker/dockerfile:1.7

FROM debian:bookworm-slim

ARG TARGETARCH

RUN apt-get update \
    && apt-get install -y --no-install-recommends chromium ca-certificates fonts-liberation poppler-utils \
    && rm -rf /var/lib/apt/lists/*

COPY --chmod=755 release/${TARGETARCH}/portfolio-server /portfolio-server

ENV PORT=3000
EXPOSE 3000

USER 10001:10001

ENTRYPOINT ["/portfolio-server"]
