.DEFAULT_GOAL := help

APP_NAME ?= gamelingo
PORT ?= 5173
PREVIEW_PORT ?= 4173

.PHONY: help install dev build preview lint check clean deploy deploy-pages

help:
	@printf "Gamelingo commands\n"
	@printf "  make install       Install npm packages\n"
	@printf "  make dev           Run local dev server on port $(PORT)\n"
	@printf "  make build         Build production assets\n"
	@printf "  make preview       Preview dist locally on port $(PREVIEW_PORT)\n"
	@printf "  make lint          Run ESLint\n"
	@printf "  make check         Run lint and production build\n"
	@printf "  make deploy        Dispatch the GitHub Pages workflow\n"
	@printf "\n"
	@printf "Override examples:\n"
	@printf "  make dev PORT=3000\n"

install:
	npm install

dev:
	npm run dev -- --host 0.0.0.0 --port $(PORT)

build:
	npm run build

preview:
	npm run preview -- --host 0.0.0.0 --port $(PREVIEW_PORT)

lint:
	npm run lint

check: lint build

clean:
	rm -rf dist

deploy:
	gh workflow run deploy-pages.yml --ref main

deploy-pages: deploy
