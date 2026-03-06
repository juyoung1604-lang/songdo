#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

BRANCH_NAME="${GIT_AUTO_BRANCH:-main}"
COMMIT_MESSAGE="${1:-chore: auto sync source updates}"

git add .gitignore app components lib scripts package.json package-lock.json next.config.ts postcss.config.mjs tailwind.config.ts tsconfig.json next-env.d.ts README.md

if git diff --cached --quiet; then
  echo "No staged source changes to commit."
  exit 0
fi

git commit -m "$COMMIT_MESSAGE"
git push origin "HEAD:${BRANCH_NAME}"
