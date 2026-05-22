#!/usr/bin/env bash
set -euo pipefail

# commit-as.sh
# Wrapper around `git commit` that sets the author and committer identity
# from scripts/.authors based on a person key. Use this for every commit.
#
# Usage:
#   scripts/commit-as.sh <person-key> [git commit args...]
#
# Examples:
#   scripts/commit-as.sh aykhan -m "feat(auth): add Argon2id hashing"
#   scripts/commit-as.sh elshad -m "chore(ci): bump action versions"

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  sed -n '4,14p' "$0"
  exit 0
fi

PERSON="${1:?usage: commit-as.sh <person-key> [git commit args...]}"
shift

AUTHORS_FILE="$(cd "$(dirname "$0")" && pwd)/.authors"
if [[ ! -f "$AUTHORS_FILE" ]]; then
  echo "error: $AUTHORS_FILE not found" >&2
  exit 1
fi

LINE="$(grep -E "^${PERSON}\|" "$AUTHORS_FILE" || true)"
if [[ -z "$LINE" ]]; then
  echo "error: unknown person key '${PERSON}'" >&2
  echo "known keys:" >&2
  cut -d'|' -f1 "$AUTHORS_FILE" | sed 's/^/  /' >&2
  exit 1
fi

NAME="$(echo "$LINE" | cut -d'|' -f2)"
EMAIL="$(echo "$LINE" | cut -d'|' -f3)"

GIT_AUTHOR_NAME="$NAME" \
GIT_AUTHOR_EMAIL="$EMAIL" \
GIT_COMMITTER_NAME="$NAME" \
GIT_COMMITTER_EMAIL="$EMAIL" \
  git commit "$@"
