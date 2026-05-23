# AGENTS.md

## First Read

1. `README.md`
2. `docs/spec.md`
3. `src/App.jsx` for the current app/game registry structure

## Development Completion Rule

For this project, after finishing any development change:

1. Run `npm run lint`.
2. Run `npm run build`.
3. Stage only the intended files.
4. Commit the completed change with `scripts/agent-commit.sh`.

Do not push, deploy, or wait for the GitHub Pages workflow unless the user explicitly asks for it.

GitHub Pages deploys through `.github/workflows/deploy-pages.yml` after pushes
to `main`, or by manually dispatching that workflow. Agents should not wait for
or verify the workflow unless the user explicitly asks for it. Local `gh-pages`
branch publishes are not the normal deployment path.

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
