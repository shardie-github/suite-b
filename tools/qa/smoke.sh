#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-http://localhost:3002}"
echo "🩺 /healthz:";  curl -iS "$BASE/healthz" || true; echo
echo "🟢 /readyz:";   curl -iS "$BASE/readyz" || true; echo
echo "📈 /metrics:";  curl -sS "$BASE/metrics" | head -c 200; echo
echo "📄 /api/reports:"; curl -iS "$BASE/api/reports?from=2025-01-01&to=2025-12-31" || true; echo
