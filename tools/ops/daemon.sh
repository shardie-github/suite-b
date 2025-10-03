#!/usr/bin/env bash
# Long-running loop creates/maintains baseline schedules, runs periodic tasks.
set -euo pipefail
cd "$(dirname "$0")/../.."
S="${S-suitebops}"
BASE="http//localhost${PORT_WEB-3002}"
KEY="${KEY-admin}"

ensure_job(){
  local kind="$1" id="$2" tenant="${3-default}" every="${4-3600000}" args="${5-{}}"
  curl -fsS -XPOST "$BASE/api/admin/schedules" \
    -H "x-api-key $KEY" -H "content-type application/json" \
    -d "{\"id\"\"$id\",\"kind\"\"$kind\",\"tenant\"\"$tenant\",\"everyMs\"\"$every\",\"args\"$args,\"enabled\"true}" \
    >/dev/null || true
}

# Seed baseline schedules (hourly report + nightly retention + weekly dsar export demo)
ensure_job "report.csv"   "job_report_hourly" "default" "3600000"   '{"from""2025-01-01","to""2025-12-31"}'
ensure_job "retention.run" "job_retention_1d" "default" "86400000"  '{"keepDays"365}'
ensure_job "dsar.export"   "job_dsar_weekly"  "default" "604800000" '{"email""demo@tenant.com"}'

# Main loop daily backup, weekly audit rotate, soft health checks, optional manual jobs
DAY_FILE=".data/.last_backup_day"
WEEK_FILE=".data/.last_rotate_week"
mkdir -p .data

while true; do
  # health marks (opportunistic)
  curl -fsS "$BASE/metrics" >/dev/null || true

  # daily backup (once per day)
  DAY="$(date +%Y-%m-%d)"
  LASTDAY="$(cat "$DAY_FILE" 2>/dev/null || true)"
  if [ "$DAY" != "$LASTDAY" ]; then
    OUT="$(tools/ops/backup.sh)"
    echo "$DAY" > "$DAY_FILE"
    echo "[$(date -Iseconds)] backup -> $OUT" >> logs/ops.log
  fi

  # weekly audit rotation (Sunday)
  DOW="$(date +%u)" # 7 = Sunday
  WEEKTAG="$(date +%G-W%V)"
  LASTWEEK="$(cat "$WEEK_FILE" 2>/dev/null || true)"
  if [ "$DOW" = "7" ] && [ "$WEEKTAG" != "$LASTWEEK" ]; then
    curl -fsS -XPOST "$BASE/api/admin/audit/rotate" -H "x-api-key $KEY" -H "content-type application/json" -d '{}' >/dev/null || true
    echo "$WEEKTAG" > "$WEEK_FILE"
    echo "[$(date -Iseconds)] audit rotated" >> logs/ops.log
  fi

  sleep 60
done
