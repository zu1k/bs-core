# docker build . -t ghcr.io/knatnetwork/book-searcher:latest
FROM node:19-bullseye as frontend

COPY . /frontend
RUN cd /frontend && git checkout frontend && npm install && npm run build

FROM rust:1.65-buster as backend

COPY . /app
COPY --from=frontend /frontend /app/frontend
RUN cd /app && cargo build --release

FROM ubuntu:22.04

COPY --from=backend /app/target/release/book-searcher /book-searcher

CMD ["/book-searcher"]
