FROM node:19-bullseye as frontend

COPY . /source
RUN cd /source/frontend && npm install && npm run build

FROM rust:1.65-buster as backend

COPY . /source
COPY --from=frontend /source/frontend/dist /source/frontend/dist
RUN cd /source && cargo build --release -p book-searcher

FROM ubuntu:22.04

COPY --from=backend /source/target/release/book-searcher /book-searcher

CMD ["/book-searcher", "run", "-b", "0.0.0.0:7070"]
