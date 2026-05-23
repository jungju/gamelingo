# Gamelingo Spec

## Document Role

This file is the stable Codex entrypoint for Gamelingo product scope and
document navigation. The README remains the human quick-start and usage guide.

## Source Of Truth

- `README.md`: current user flow, local commands, ohmesh data shape, and game
  addition guide
- `src/App.jsx`: current single-page app shell, route selection, auth/storage
  orchestration
- `src/constants.js`: stable app constants, default game metadata, sample study
  defaults
- `src/gameState.js`: runtime state normalization, migration, compact v3
  serialization, game/note helper functions
- `src/ohmeshClient.js`: ohmesh request, redirect, route, and guest storage
  helpers
- `src/components/HomePage.jsx`: game selection and custom game management UI
- `src/components/StudyBoardPage.jsx`: selected-game study board UI and note,
  vocabulary, character editing surfaces
- `AGENTS.md`: agent workflow, validation, and commit rules

When these files disagree, use `README.md` for user-facing behavior and
`src/App.jsx` plus the focused module above for the implemented app structure.

## Product Scope

Gamelingo is a React/Vite learning app for collecting useful English sentences
while playing games and turning them into short personal practice notes.

The current product includes `What Remains of Edith Finch` as the built-in game
and lets each user add personal games that share the same study board workflow:
sentence cards, vocabulary, character lists, browser guest storage, and optional
ohmesh-backed account storage. The study screen uses the visual direction from
`prototype/template1.jsx`: a board, same-size sentence notes, a right-side word
panel, and a bottom character rail.

## Locked User-Facing Behavior

- The home page is the game selection page.
- The built-in Edith Finch game is always present at `/games/edith-finch`.
- Users can add custom games with required `title` and optional `description`.
- Custom games use generated internal covers based on the title; no image URL or
  file upload is supported.
- Custom game title/description edits must preserve the game `id` and route.
- Only custom games can be edited or deleted. Deleting a custom game also deletes
  that game's note data after confirmation.
- Selecting a game opens the shared study board for that game.
- Edith Finch starts with its cover, default vocabulary, and sample sentences.
- Custom games start with empty sentences, vocabulary, and characters.
- Sentence notes render as compact fixed-size cards in a row-major grid: left to
  right, then the next row from the left.
- Sentence note cards show the note creation timestamp in compact `M.D HH:mm`
  form and show the English original text with a two-line clamp.
- Sentence notes are not freely positioned by `x`/`y` coordinates in the current
  UI.
- Dragging is only for reordering. Users drag the note handle to move a sentence
  to another place in the grid order.
- The persisted sentence array order is the displayed board order.
- Clicking a sentence card opens the note modal. The visible note form stores
  required English original text and optional Korean/meaning text.
- The note modal can hide or show the Korean/meaning field and can delete an
  existing sentence.
- The right `영단어` panel uses an icon-only pencil button for
  whole-vocabulary editing.
- The vocabulary editor is a multiline text area. Each non-empty line is parsed
  as `{english}: {translation}`.
- Saving vocabulary text replaces the displayed vocabulary with parsed entries
  in line order.
- Existing vocabulary ids are preserved for matching English words. Deleting a
  line deletes that vocabulary entry.
- The board vocabulary panel is a narrow, compact one-column list.
- Sentence cards and the sentence note modal do not show vocabulary tags.
- The bottom character rail supports character add, edit, and delete. The add
  button text is `등장인물 추가`.
- Guest mode shows `로그인`, not browser-save wording.
- Logged-in mode shows `로그아웃`.

## Data Contract

- Guest state uses browser `localStorage`.
- Account storage uses ohmesh with HttpOnly session cookies.
- App slug: `gamelingo`
- Current record type: `gamelingo-study-state`
- Current guest key: `gamelingo:v3:app:guest`
- Current pending guest save key: `gamelingo:v3:pendingGuestSave`
- Record data stores custom game metadata plus game-keyed mission checks,
  vocabulary, word-board notes, story notes, sentence notes, and character lists
  in the compact v3 shape documented in `README.md`.
- The compact `s` sentence array order is the current board order. Sentence
  notes serialize created/updated timestamps as `a`/`u`. New saves do not
  serialize legacy sentence `x` and `y` coordinates.
- Legacy fallback reads `edith-finch-study-state` and
  `gamelingo:v2:edithFinch:guest` as Edith Finch-only notes, then writes future
  saves to the v3 app shape.
- After a user presses `로그인`, guest data is marked pending before redirecting to
  ohmesh. On return, pending guest data is uploaded to the current ohmesh record.
- Signed-in changes are saved to ohmesh with a short debounce.

## Update Rules

- User-facing flow or data shape changes update this file and `README.md`.
- Built-in games should document their path, default data, and any game-specific
  guide behavior. User-added games use `/games/{id}` and the shared empty note
  defaults, including empty board notes and character lists.
- Board layout changes must document whether sentence order, coordinates, or
  another field controls placement.
- Auth/storage changes must document button labels, guest key, record type,
  pending-save behavior, and legacy fallback behavior.
- Behavior changes should keep `AGENTS.md` validation rules intact.
