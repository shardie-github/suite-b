#!/usr/bin/env bash
# Cron-friendly wrapper: run one iteration (backup if day changed, rotate Sunday).
set -euo pipefail
cd "$(dirname "$0")/../.."
BASE="http://localhost:${PORT_WEB:-3002}"
KEY="${KEY:-admin}"
DAY_FILE=".data/.last_backup_day"
WEEK_FILE=".data/.last_rotate_week"
mkdir -p .data logs

curl -fsS "$BASE/metrics" >/dev/null || true

DAY="$(date +%Y-%m-%d)"
LASTDAY="$(cat "$DAY_FILE" 2>/dev/null || true)"
if [ "$DAY" != "$LASTDAY" ]; then
  OUT="$(tools/ops/backup.sh)"; echo "$DAY" > "$DAY_FILE"
  echo "[$(date -Iseconds)] (cron) backup -> $OUT" >> logs/ops.log
fi

DOW="$(date +%u)"; WEEKTAG="$(date +%G-W%V)"; LASTWEEK="$(cat "$WEEK_FILE" 2>/dev/null || true)"
if [ "$DOW" = "7" ] && [ "$WEEKTAG" != "$LASTWEEK" ]; then
  curl -fsS -XPOST "$BASE/api/admin/audit/rotate" -H "x-api-key: $KEY" -H "content-type: application/json" -d '{}' >/dev/null || true
  echo "$WEEKTAG" > "$WEEK_FILE"
  echo "[$(date -Iseconds)] (cron) audit rotated" >> logs/ops.log
fi
