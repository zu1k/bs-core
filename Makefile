NAME=zlib-searcher

PREFIX ?= /usr/local/bin
TARGET ?= debug

.PHONY: all frontend_preinstall frontend build clean
all: build

frontend_preinstall:
	pnpm -C frontend install 

frontend:
	pnpm -C frontend run build

build: frontend
ifeq (${TARGET}, release)
	cargo build -p zlib-searcher --release
else
	cargo build -p zlib-searcher
endif

clean:
	cargo clean
	rm -rf release
