#!/bin/bash
cargo build --release --no-default-features --features best-speed --target x86_64-unknown-linux-musl -p book-searcher
