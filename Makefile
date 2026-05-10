.DEFAULT_GOAL := help

APP_NAME ?= gamelingo
PORT ?= 5173
PREVIEW_PORT ?= 4173
PAGES_BASE ?= /$(APP_NAME)/

.PHONY: help install dev build build-pages preview lint check clean deploy-pages

help:
	@printf "Gamelingo commands\n"
	@printf "  make install       Install npm packages\n"
	@printf "  make dev           Run local dev server on port $(PORT)\n"
	@printf "  make build         Build for normal hosting at /\n"
	@printf "  make build-pages   Build for GitHub Pages at $(PAGES_BASE)\n"
	@printf "  make preview       Preview dist locally on port $(PREVIEW_PORT)\n"
	@printf "  make lint          Run ESLint\n"
	@printf "  make check         Run lint and production build\n"
	@printf "  make deploy-pages  Build and push dist to gh-pages branch\n"
	@printf "\n"
	@printf "Override examples:\n"
	@printf "  make dev PORT=3000\n"
	@printf "  make build-pages PAGES_BASE=/your-repo-name/\n"

install:
	npm install

dev:
	npm run dev -- --host 0.0.0.0 --port $(PORT)

build:
	npm run build

build-pages:
	VITE_BASE=$(PAGES_BASE) npm run build

preview:
	npm run preview -- --host 0.0.0.0 --port $(PREVIEW_PORT)

lint:
	npm run lint

check: lint build

clean:
	rm -rf dist

deploy-pages:
	VITE_BASE=$(PAGES_BASE) npm run build
	npm run deploy:pages
