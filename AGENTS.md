# AGENTS.md

## Development Completion Rule

For this project, after finishing any development change:

1. Run `npm run lint`.
2. Run `npm run build`.
3. Stage only the intended files.
4. Commit the completed change with `scripts/agent-commit.sh`.

Do not push or deploy unless the user explicitly asks for it.

The site is deployed by the `Deploy to GitHub Pages` GitHub Actions workflow after pushes to `main`.

## Commit Message Rule

Use the same Conventional Commits shape across Jungju service repos:

```text
<type>(<scope>): <summary>
```

Prefer the helper so the format stays consistent:

```sh
TYPE=fix SUMMARY="handle empty guest notes" scripts/agent-commit.sh
TYPE=docs SUMMARY="update game guide" scripts/agent-commit.sh
```

The default scope is `gamelingo`. Allowed types are `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`, `build`, `deploy`, and `content`.
