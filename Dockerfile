# docker build . -t ghcr.io/knatnetwork/zlib-searcher:latest
FROM node:18-buster as frontend

COPY . /app
RUN cd /app && git checkout frontend && npm install -g pnpm && pnpm install && pnpm run build

FROM rust:1.65-buster as backend

COPY --from=frontend /app /zlib-searcher-frontend
COPY . /app
RUN cd /app && cargo build --release

FROM ubuntu:22.04

COPY --from=backend /app/target/release/zlib-searcher /zlib-searcher

CMD ["/zlib-searcher"]
