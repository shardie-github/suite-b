#!/usr/bin/env bash
# Install cron jobs (Termux pkg install cronie; sv-enable crond). Falls back silently if crontab not present.
set -euo pipefail
cd "$(dirname "$0")/../.."
if ! command -v crontab >/dev/null 2>&1; then
  echo "ℹ️ crontab not found; skip cron install."
  exit 0
fi
( crontab -l 2>/dev/null | grep -v 'suite-b cron' || true; \
  echo "*/5 * * * * cd $PWD && KEY=admin PORT_WEB=3002 bash tools/ops/cron.sh # suite-b cron" ) | crontab -
echo "✅ cron entry installed (every 5 minutes)."
