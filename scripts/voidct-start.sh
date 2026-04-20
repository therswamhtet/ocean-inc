#!/bin/sh

set -eu

bunx voidct stop >/dev/null 2>&1 || true

pid="$(lsof -tiTCP:4100 -sTCP:LISTEN 2>/dev/null | head -n 1 || true)"
if [ -n "$pid" ]; then
  cmd="$(ps -p "$pid" -o command= 2>/dev/null || true)"
  case "$cmd" in
    *"opencode serve"*)
      kill "$pid" >/dev/null 2>&1 || true
      ;;
  esac
fi

exec env -u OPENCODE_SERVER_PASSWORD bunx voidct start --cf "$@"
