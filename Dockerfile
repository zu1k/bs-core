FROM --platform=$BUILDPLATFORM node:20-bullseye as frontend

COPY . /source
RUN cd /source/frontend && npm install --legacy-peer-deps && npm run build

FROM rust:1.69.0-bullseye as backend

COPY . /source
COPY --from=frontend /source/frontend/dist /source/frontend/dist
RUN cd /source && cargo build --release -p book-searcher

FROM debian:bullseye

COPY --from=backend /source/target/release/book-searcher /book-searcher

CMD ["/book-searcher", "run", "-b", "0.0.0.0:7070"]
