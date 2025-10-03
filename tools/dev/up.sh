#!/usr/bin/env bash
set -euo pipefail
ROOT="${ROOT:-$HOME/repos/suite-b}"
PORT_WEB="${PORT_WEB:-3002}"
PORT_SLACK="${PORT_SLACK:-3003}"
PORT_STRIPE="${PORT_STRIPE:-3012}"
S="${S:-suiteb020}"

mkdir -p "$ROOT/logs"
cd "$ROOT"

# kill old session if present
tmux has-session -t "$S" 2>/dev/null && tmux kill-session -t "$S" || true

# function to spawn a restarting pane
spawn_restart() {
  local target="$1" cmd="$2" log="$3"
  tmux new-window -t "$S" -n "$target" "bash -lc 'while true; do echo \"[$(date -Is)] start $target\" | tee -a $log; $cmd 2>&1 | tee -a $log; echo \"[$(date -Is)] crashed $target -> restarting in 2s\" | tee -a $log; sleep 2; done'"
}

# base session with first window running web
tmux new-session -d -s "$S" -n web "bash -lc 'cd packages/web && PORT=$PORT_WEB node server.js 2>&1 | tee -a $ROOT/logs/web.log'"

# right split: slack
tmux split-window -h "bash -lc 'cd packages/slack && PORT=$PORT_SLACK node app.js 2>&1 | tee -a $ROOT/logs/slack.log'"

# new window: stripe (with auto-restart)
tmux new-window -n stripe "bash -lc 'while true; do cd packages/stripe && PORT=$PORT_STRIPE node server.js 2>&1 | tee -a $ROOT/logs/stripe.log; echo \"[$(date -Is)] stripe crashed -> restart in 2s\" | tee -a $ROOT/logs/stripe.log; sleep 2; done'"

# health check window
tmux new-window -n health "bash -lc 'sleep 2; tools/qa/smoke.sh http://localhost:$PORT_WEB || true; echo; echo \"Attach: tmux attach -t $S\"; bash'"

echo "✅ Suite B dev session: $S"
echo "   Web:    http://localhost:$PORT_WEB/reports.html  (log: logs/web.log)"
echo "   Slack:  http://localhost:$PORT_SLACK/healthz     (log: logs/slack.log)"
echo "   Stripe: http://localhost:$PORT_STRIPE/stripe/ok  (log: logs/stripe.log)"
tmux attach -t "$S"
