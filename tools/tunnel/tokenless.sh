#!/usr/bin/env bash
set -euo pipefail
LOG=".lhr.log"; :> "$LOG"
# 80 -> local 3003 (Slack)
setsid ssh -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=25 -o ExitOnForwardFailure=yes -R 80:localhost:${1:-3003} nokey@localhost.run 2>&1 | tee "$LOG" >/dev/null &
for _ in $(seq 1 25); do
  T=$(grep -oE 'https://[a-z0-9.-]+\.lhr\.life' "$LOG" | head -1 || true)
  [ -n "$T" ] && { echo "$T"; exit 0; }
  sleep 1
done
echo ""
exit 1
