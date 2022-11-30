# docker build . -t ghcr.io/knatnetwork/book-searcher:latest
FROM node:19-bullseye as frontend

COPY ./frontend /frontend
RUN cd /frontend && npm install && npm run build

FROM rust:1.65-buster as backend

COPY . /app
COPY --from=frontend /frontend/dist /app/frontend/dist
RUN cd /app && cargo build --release -p book-searcher

FROM ubuntu:22.04

COPY --from=backend /app/target/release/book-searcher /book-searcher

CMD ["/book-searcher", "run", "-b", "0.0.0.0:7070"]
