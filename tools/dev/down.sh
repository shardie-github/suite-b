#!/usr/bin/env bash
set -euo pipefail
S="${S-suiteb020}"
tmux has-session -t "$S" 2>/dev/null && tmux kill-session -t "$S" || true
echo "🛑 Stopped tmux session $S"
