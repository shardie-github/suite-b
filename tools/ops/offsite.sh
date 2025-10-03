#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
if [ -z "${OFFSITE_URL-}" ] || [ -z "${OFFSITE_TOKEN-}" ]; then
  echo "ℹ️ OFFSITE_URL or OFFSITE_TOKEN not set; skip offsite."
  exit 0
fi
STAMP="$(date +%Y%m%d_%H%M)"
ZIP=".data/backups/suiteb_offsite_${STAMP}.zip"
zip -r "$ZIP" . -x '*.git*' -x 'node_modules/*' -x '.data/backups/*' -x 'dist/*' >/dev/null
curl -fsS -X PUT -H "Authorization Bearer ${OFFSITE_TOKEN}" --data-binary @"$ZIP" "${OFFSITE_URL%/}/suiteb/${STAMP}.zip" >/dev/null && echo "ok" || echo "fail"
