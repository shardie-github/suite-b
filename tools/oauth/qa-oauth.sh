#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-http://localhost:3002}"
SHOP="${2:-example.myshopify.com}"
echo "🔐 Install URL: $BASE/oauth/install?shop=$SHOP"
echo "👉 Callback should store token at /oauth/callback"
