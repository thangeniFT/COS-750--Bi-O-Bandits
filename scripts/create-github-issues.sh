#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Creates the GitHub labels and one issue per ticket file in docs/backlog/.
#
# Usage (from the repository root, after the repo has been pushed to GitHub):
#   scripts/create-github-issues.sh --dry-run   # show what would be created
#   scripts/create-github-issues.sh             # create labels and issues
#
# Needs the GitHub CLI (https://cli.github.com), logged in with `gh auth login`.
# Safe to run more than once: an issue whose title already exists is skipped.
# Works with macOS's built-in bash 3.2 and with Git Bash on Windows.
# ---------------------------------------------------------------------------
set -euo pipefail

DRY_RUN=false
if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN=true
fi

cd "$(dirname "$0")/.."

if ! $DRY_RUN; then
  if ! command -v gh >/dev/null 2>&1; then
    echo "The GitHub CLI (gh) is not installed. See https://cli.github.com" >&2
    exit 1
  fi
  if ! gh auth status >/dev/null 2>&1; then
    echo "You are not logged in to GitHub. Run: gh auth login" >&2
    exit 1
  fi
fi

# --- Labels ---------------------------------------------------------------
# name|colour|description
LABELS="backend|1f4e94|Java: model, service, controller
frontend|82b366|HTML, CSS, JavaScript
content|d6b656|Lesson text, quiz bank, glossary
qa|9673a6|Testing with people, demo
docs|666666|SE and ID documents
must|b85450|Must have for the demo
should|d79b00|Should have
could|6c8ebf|Only if time allows
good first issue|7057ff|Small and self-contained"

echo "Labels:"
echo "$LABELS" | while IFS='|' read -r name colour description; do
  if $DRY_RUN; then
    echo "  would create label '$name'"
  else
    gh label create "$name" --color "$colour" --description "$description" --force >/dev/null
    echo "  ok  $name"
  fi
done

# --- Issues ---------------------------------------------------------------
existing=""
if ! $DRY_RUN; then
  existing="$(gh issue list --state all --limit 500 --json title --jq '.[].title')"
fi

echo "Issues:"
for file in docs/backlog/*.md; do
  title="$(sed -n 's/^title: "\(.*\)"$/\1/p' "$file" | head -n 1)"
  labels="$(sed -n 's/^labels: //p' "$file" | head -n 1 | sed 's/, /,/g')"
  # The body is everything after the second '---' line (the end of the front matter).
  body="$(awk 'count == 2 { print } /^---$/ { count++ }' "$file")"

  if [ -z "$title" ]; then
    echo "  skip $file (no title: line)" >&2
    continue
  fi

  if printf '%s\n' "$existing" | grep -Fxq "$title"; then
    echo "  exists  $title"
    continue
  fi

  if $DRY_RUN; then
    echo "  would create  $title  [$labels]"
  else
    printf '%s\n' "$body" | gh issue create --title "$title" --label "$labels" --body-file - >/dev/null
    echo "  created  $title"
    sleep 1 # be gentle with the API rate limit
  fi
done
