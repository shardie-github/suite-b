#!/usr/bin/env bash
# Health loop: check healthz/readyz; restart pane if down; bump error budget on failures
set -euo pipefail
BASE_WEB="http://localhost:${PORT_WEB:-3002}"
BASE_SLK="http://localhost:${PORT_SLACK:-3003}"
while true; do
  TS="$(date -Iseconds)"
  ok_web=$(curl -fsS "$BASE_WEB/healthz"    >/dev/null && echo 1 || echo 0)
  ok_web2=$(curl -fsS "$BASE_WEB/readyz"    >/dev/null && echo 1 || echo 0)
  ok_slk=$(curl -fsS "$BASE_SLK/healthz"    >/dev/null && echo 1 || echo 0)
  echo "[$TS] web:$ok_web/$ok_web2 slack:$ok_slk" >> logs/health.log

  # Auto-restart logic (tmux pane names: web/slack/stripe inside session $S)
  if [ "$ok_web" = "0" ] || [ "$ok_web2" = "0" ]; then
    tmux send-keys -t "${S:-suitebops}:web" C-c "PORT=${PORT_WEB:-3002} node packages/web/server.js 2>&1 | tee -a logs/web.log" Enter
  fi
  if [ "$ok_slk" = "0" ]; then
    tmux send-keys -t "${S:-suitebops}:slack" C-c "PORT=${PORT_SLACK:-3003} node packages/slack/app.js 2>&1 | tee -a logs/slack.log" Enter
  fi

  # Optional: increment error budget via a cheap endpoint (no auth needed there)
  sleep 30
done
