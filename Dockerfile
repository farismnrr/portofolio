# syntax=docker/dockerfile:1.7

FROM scratch

COPY release/portfolio-server /portfolio-server

ENV PORT=3000
EXPOSE 3000

USER 10001:10001

ENTRYPOINT ["/portfolio-server"]
