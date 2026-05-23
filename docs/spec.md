# Gamelingo Spec

## Document Role

This file is the stable Codex entrypoint for Gamelingo product scope and
document navigation. The README remains the human quick-start and usage guide.

## Source Of Truth

- `README.md`: current user flow, local commands, ohmesh data shape, and game
  addition guide
- `src/App.jsx`: current single-page app structure and game registry
- `AGENTS.md`: agent workflow, validation, and commit rules

When these files disagree, use `README.md` for user-facing behavior and
`src/App.jsx` for the implemented app structure.

## Product Scope

Gamelingo is a React/Vite learning app for collecting useful English sentences
while playing games and turning them into short personal practice notes.

The current product centers on `What Remains of Edith Finch`, with game-specific
missions, vocabulary, story notes, sentence cards, local guest storage, and
optional ohmesh-backed account storage.

## Data Contract

- Guest state uses browser `localStorage`.
- Account storage uses ohmesh with HttpOnly session cookies.
- App slug: `gamelingo`
- Current record type: `edith-finch-study-state`
- Record data stores mission checks, vocabulary, story notes, and sentence
  notes in the compact v2 shape documented in `README.md`.

## Update Rules

- User-facing flow or data shape changes update this file and `README.md`.
- New games should document their path, default data, and ohmesh record type.
- Behavior changes should keep `AGENTS.md` validation rules intact.
