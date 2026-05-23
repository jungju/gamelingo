#!/usr/bin/env bash
set -Eeuo pipefail

die() {
  printf '[agent-commit] ERROR: %s\n' "$*" >&2
  exit 1
}

repo_root="$(git rev-parse --show-toplevel)"
repo_name="$(basename "$repo_root")"

type="${TYPE:-}"
scope="${SCOPE:-$repo_name}"
summary="${SUMMARY:-}"
agent="${AGENT:-}"
verify="${VERIFY:-}"
body="${BODY:-}"
dry_run="${DRY_RUN:-}"

allowed_types=" feat fix docs test refactor chore ci build deploy content "

[[ " $allowed_types " == *" $type "* ]] || die "invalid TYPE: ${type:-empty}"
[[ "$type" =~ ^[a-z][a-z0-9-]*$ ]] || die "TYPE must be lowercase kebab-case"
[[ "$scope" =~ ^[a-z][a-z0-9-]*$ ]] || die "SCOPE must be lowercase kebab-case"
[[ -n "$summary" ]] || die "SUMMARY is required"
[[ "$summary" != *$'\n'* ]] || die "SUMMARY must be a single line"
[[ "$summary" != *. ]] || die "SUMMARY must not end with a period"

subject="${type}(${scope}): ${summary}"
(( ${#subject} <= 72 )) || die "commit subject is too long (${#subject} > 72): $subject"

mapfile -t staged < <(git -C "$repo_root" diff --cached --name-only)
(( ${#staged[@]} > 0 )) || die "no staged changes to commit"

printf '[agent-commit] subject: %s\n' "$subject"
printf '[agent-commit] staged:\n'
printf '  %s\n' "${staged[@]}"

git -C "$repo_root" diff --cached --check

if [[ "$dry_run" == "1" || "$dry_run" == "true" ]]; then
  printf '[agent-commit] dry-run: commit skipped\n'
  exit 0
fi

commit_args=(-m "$subject")
body_lines=()
[[ -n "$agent" ]] && body_lines+=("Agent: $agent")
[[ -n "$verify" ]] && body_lines+=("Verify: $verify")
[[ -n "$body" ]] && body_lines+=("$body")

if (( ${#body_lines[@]} > 0 )); then
  commit_args+=(-m "$(printf '%s\n' "${body_lines[@]}")")
fi

git -C "$repo_root" commit "${commit_args[@]}"
