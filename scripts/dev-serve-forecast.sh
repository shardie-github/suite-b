#!/usr/bin/env bash
# scripts/dev-serve-forecast.sh — quick local runner for the Express example
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
if ! command -v node >/dev/null 2>&1; then echo "Node required."; exit 1; fi
if ! npm ls express >/dev/null 2>&1; then npm i express >/dev/null 2>&1 || true; fi
npx ts-node -v >/dev/null 2>&1 || npm i -D ts-node typescript >/dev/null 2>&1 || true
PORT="${PORT:-3050}" npx ts-node src/server/forecast.example.ts
