#!/bin/bash

NAME=book-searcher

targets=(x86_64-unknown-linux-gnu x86_64-unknown-linux-musl)
targets_win=(x86_64-pc-windows-gnu)

for target in "${targets[@]}"
do
    echo $target
    cargo build --release --target $target -p book-searcher
    pushd target/$target/release/ && zip book-searcher-$target.zip $NAME && mv book-searcher-$target.zip ../../ && popd
done

for target in "${targets_win[@]}"
do
    echo $target
    cargo build --release --target $target -p book-searcher
    pushd target/$target/release/ && zip book-searcher-$target.zip $NAME.exe && mv book-searcher-$target.zip ../../ && popd
done
