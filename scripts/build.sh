#!/bin/bash

NAME=zlib-searcher

targets=(x86_64-unknown-linux-gnu x86_64-unknown-linux-musl)
targets_win=(x86_64-pc-windows-gnu)

for target in "${targets[@]}"
do
    echo $target
    cargo build --release --target $target -p zlib-searcher
    pushd target/$target/release/ && zip zlib-searcher-$target.zip $NAME && mv zlib-searcher-$target.zip ../../ && popd
done

for target in "${targets_win[@]}"
do
    echo $target
    cargo build --release --target $target -p zlib-searcher
    pushd target/$target/release/ && zip zlib-searcher-$target.zip $NAME.exe && mv zlib-searcher-$target.zip ../../ && popd
done
