# docker build . -t ghcr.io/knatnetwork/zlib-searcher:latest
FROM node:19-bullseye as frontend

COPY ./frontend /frontend
RUN cd /frontend && npm install && npm run build

FROM rust:1.65-buster as backend

COPY . /app
COPY --from=frontend /frontend/dist /app/frontend/dist
RUN cd /app && cargo build --release -p zlib-searcher

FROM ubuntu:22.04

COPY --from=backend /app/target/release/zlib-searcher /zlib-searcher

CMD ["/zlib-searcher", "run", "-b", "0.0.0.0:7070"]
