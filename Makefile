NAME=zlib-searcher

PREFIX ?= /usr/local/bin
TARGET ?= debug

.PHONY: all frontend_preinstall frontend build desktop clean
all: build

frontend_preinstall:
	pnpm -C frontend install 

frontend:
	pnpm -C frontend run build

build:
ifeq (${TARGET}, release)
	cargo build -p zlib-searcher --release
else
	cargo build -p zlib-searcher
endif

desktop:
	cargo tauri build

clean:
	cargo clean
	rm -rf release
