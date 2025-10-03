#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
STAMP="$(date +%Y%m%d_%H%M)"
OUT=".data/backups/suiteb_backup_${STAMP}.zip"
mkdir -p .data/backups
# backup API surface + data (exclude node_modules/git)
zip -r "$OUT" . -x '*.git*' -x 'node_modules/*' -x '.data/backups/*' -x 'dist/*' >/dev/null
echo "$OUT"
