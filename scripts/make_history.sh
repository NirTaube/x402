#!/usr/bin/env bash
set -euo pipefail

# Backdate commit generator
# Usage: set environment variables to customise:
#  START, END, COMMITS_PER_DAY, INITIAL_DATE, AUTHOR_NAME, AUTHOR_EMAIL

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

START="${START:-2020-01-02}"
END="${END:-2025-12-13}"
COMMITS_PER_DAY="${COMMITS_PER_DAY:-1}"
INITIAL_DATE="${INITIAL_DATE:-2019-12-31T12:00:00}"
AUTHOR_NAME="${AUTHOR_NAME:-Your Name}"
AUTHOR_EMAIL="${AUTHOR_EMAIL:-you@example.com}"
FILE="HISTORY.md"

touch "$FILE"

# If no commits yet, make an initial import commit with INITIAL_DATE
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  git add -A
  GIT_AUTHOR_DATE="$INITIAL_DATE" GIT_COMMITTER_DATE="$INITIAL_DATE" \
    git commit -m "Initial import" --author="$AUTHOR_NAME <$AUTHOR_EMAIL>"
fi

python3 - <<PY | while read dt; do
from datetime import date, timedelta
start = date.fromisoformat("$START")
end = date.fromisoformat("$END")
d = start
while d <= end:
    for i in range(int($COMMITS_PER_DAY)):
        print(d.isoformat() + "T12:00:00")
    d = d + timedelta(days=1)
PY
do
  echo "- Backdated commit $dt" >> "$FILE"
  GIT_AUTHOR_DATE="$dt" GIT_COMMITTER_DATE="$dt" \
    git add "$FILE" && git commit -m "Backdated commit $dt" --author="$AUTHOR_NAME <$AUTHOR_EMAIL>"
done

echo "Done: generated backdated commits from $START to $END ($COMMITS_PER_DAY commits/day)."
