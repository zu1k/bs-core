#!/bin/bash	
cargo build --release --no-default-features --features best-speed --target x86_64-unknown-linux-musl --bin index
cargo build --release --no-default-features --features best-speed --target x86_64-unknown-linux-musl --bin zlib-searcher
