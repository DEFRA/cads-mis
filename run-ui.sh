#!/usr/bin/env bash
set -euo pipefail

# Linux make this executable via: chmod +x run-ui.sh

# Path to the platform root (backend repo)
PLATFORM_DIR="../cads-data-service"

COMMAND="${1:-up}"

case "$COMMAND" in
  up)
    echo "[ui] Starting tools + UI..."
    cd "$PLATFORM_DIR"
    ./platform/platform.sh ui
    ;;
  down)
    echo "[ui] Stopping tools + UI..."
    cd "$PLATFORM_DIR"
    ./platform/platform.sh down
    ;;
  restart)
    echo "[ui] Restarting tools + UI..."
    cd "$PLATFORM_DIR"
    ./platform/platform.sh down
    ./platform/platform.sh ui
    ;;
  *)
    echo "Usage:"
    echo "  ./run-ui.sh up       # Start tools + UI"
    echo "  ./run-ui.sh down     # Stop tools + UI"
    echo "  ./run-ui.sh restart  # Restart tools + UI"
    ;;
esac