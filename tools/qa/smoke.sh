#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-http://localhost:3002}"
kcurl(){ echo -e "\n### $2"; curl -fsSL -H "x-api-key: admin" "$1" | head -c 500 || true; echo; }
echo "Smoking endpoints @ $BASE"
kcurl "$BASE/healthz"            "healthz"
kcurl "$BASE/readyz"             "readyz"
kcurl "$BASE/api/reports"        "/api/reports"
kcurl "$BASE/api/dsar/export?email=alice@example.com" "/api/dsar/export"
# Slack health (if running)
curl -fsSL "http://localhost:3003/healthz" | head -c 400 || echo "slack: not running"
