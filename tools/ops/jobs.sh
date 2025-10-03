#!/usr/bin/env bash
# Trigger built-in jobs via HTTP (scheduler must be loaded in web service)
set -euo pipefail
BASE="${BASE:-http://localhost:${PORT_WEB:-3002}}"
KEY="${KEY:-admin}"
ID="$1"
if [ -z "${ID:-}" ]; then echo "Usage: KEY=admin BASE=http://localhost:3002 $0 <jobId>"; exit 1; fi
curl -fsS -XPOST "$BASE/api/admin/schedules/$ID/run" -H "x-api-key: $KEY" -H "content-type: application/json" -d '{}' | sed -e 's/{/\\n&/g' || true
