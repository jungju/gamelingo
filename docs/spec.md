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

The current product includes `What Remains of Edith Finch` as the built-in game
and lets each user add personal games that share the same study note workflow:
missions, vocabulary, story notes, sentence cards, local guest storage, and
game-specific note UI templates, character lists, optional ohmesh-backed
account storage.

## Data Contract

- Guest state uses browser `localStorage`.
- Account storage uses ohmesh with HttpOnly session cookies.
- App slug: `gamelingo`
- Current record type: `gamelingo-study-state`
- Current guest key: `gamelingo:v3:app:guest`
- Record data stores custom game metadata plus game-keyed mission checks,
  vocabulary, story notes, sentence notes, selected note UI template, and
  character lists in the compact v3 shape documented in `README.md`.
- Legacy fallback reads `edith-finch-study-state` and
  `gamelingo:v2:edithFinch:guest` as Edith Finch-only notes, then writes future
  saves to the v3 app shape.

## Update Rules

- User-facing flow or data shape changes update this file and `README.md`.
- Built-in games should document their path, default data, and any game-specific
  guide behavior. User-added games use `/games/{id}` and the shared empty note
  defaults, including the default note UI template and empty character lists.
- Behavior changes should keep `AGENTS.md` validation rules intact.
