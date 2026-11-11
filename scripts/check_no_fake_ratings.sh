#!/usr/bin/env bash
# Stage 0 regression: no fabricated public ratings in src/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Hardcoded decimal ratings like 4.8 / 4.9 in production UI paths
hits="$(rg -n --glob '!src/**/*.test.*' --glob '!src/test/**' \
  -e 'rating:\s*4\.[0-9]' \
  -e 'reviewCount\s*\?\?\s*12' \
  -e 'reviews:\s*.*bookingsCount' \
  -e 'Средний рейтинг' \
  -e 'Рейтинг 4\.' \
  -e 'Star[^
]*/>\s*4\.[0-9]' \
  -e '>\s*4\.[0-9]\s*·' \
  src || true)"

if [[ -n "${hits}" ]]; then
  echo "Found fabricated rating patterns:"
  echo "${hits}"
  exit 1
fi
echo "OK: no fabricated rating patterns in src/"
