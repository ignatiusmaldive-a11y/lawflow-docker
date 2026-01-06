#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/lawflow_backend"
FRONTEND_DIR="$ROOT_DIR/lawflow_frontend"
VENV_DIR="$BACKEND_DIR/.venv"

print_help() {
  cat <<'EOF'
Usage: ./run.sh [up|setup|start|help]

up     Install dependencies (if needed) and start both dev servers (default)
setup  Install dependencies only
start  Start dev servers assuming deps are installed
help   Show this message

Backend: http://localhost:8000/docs
Frontend: http://localhost:5173
EOF
}

check_prereqs() {
  command -v python3 >/dev/null 2>&1 || { echo "python3 is required"; exit 1; }
  command -v npm >/dev/null 2>&1 || { echo "npm is required"; exit 1; }
}

setup() {
  check_prereqs
  if [ ! -d "$VENV_DIR" ]; then
    echo "Creating backend venv at $VENV_DIR"
    python3 -m venv "$VENV_DIR"
  fi

  echo "Installing backend deps..."
  # shellcheck disable=SC1091
  source "$VENV_DIR/bin/activate"
  python -m pip install -U pip
  (cd "$BACKEND_DIR" && python -m pip install -e .)

  echo "Installing frontend deps..."
  (cd "$FRONTEND_DIR" && npm install)
}

kill_on_port() {
  local port=$1
  local pids
  pids=$(lsof -t -i:"$port" || true)
  if [ -n "$pids" ]; then
    echo "Killing processes on port $port (PIDs: $pids)..."
    for pid in $pids; do
      kill -9 "$pid" 2>/dev/null || true
    done
  fi
}

backend_healthy() {
  local url=${1:-http://127.0.0.1:8000/health}
  if command -v curl >/dev/null 2>&1; then
    curl -fsS "$url" >/dev/null 2>&1
    return $?
  fi

  python - <<PY >/dev/null 2>&1
import urllib.request
urllib.request.urlopen("${url}", timeout=1).read()
PY
}

wait_for_backend() {
  local url=${1:-http://127.0.0.1:8000/health}
  local timeout_s=${2:-30}
  local start_ts
  start_ts=$(date +%s)

  while true; do
    if backend_healthy "$url"; then
      return 0
    fi
    if [ $(( $(date +%s) - start_ts )) -ge "$timeout_s" ]; then
      echo "Backend did not become ready within ${timeout_s}s (${url})." >&2
      return 1
    fi
    sleep 0.25
  done
}

start() {
  if [ ! -d "$VENV_DIR" ]; then
    echo "Missing venv at $VENV_DIR. Run ./run.sh setup first." >&2
    exit 1
  fi

  # shellcheck disable=SC1091
  source "$VENV_DIR/bin/activate"

  echo "Checking for port conflicts..."
  kill_on_port 8000
  kill_on_port 5173

  echo "Starting backend (uvicorn)..."
  (cd "$BACKEND_DIR" && uvicorn app.main:app --reload --port 8000 --log-config logging_config.json) &
  BACK_PID=$!

  trap 'echo "Stopping..."; test -n "${BACK_PID:-}" && kill "$BACK_PID" 2>/dev/null; test -n "${FRONT_PID:-}" && kill "$FRONT_PID" 2>/dev/null' EXIT

  echo "Waiting for backend to be ready..."
  if ! wait_for_backend "http://127.0.0.1:8000/health" 30; then
    kill "$BACK_PID" 2>/dev/null || true
    exit 1
  fi

  echo "Starting frontend (Vite)..."
  (cd "$FRONTEND_DIR" && npm run dev -- --host --port 5173) &
  FRONT_PID=$!

  wait -n
}

main() {
  MODE="${1:-up}"
  case "$MODE" in
    up)
      setup
      start
      ;;
    setup)
      setup
      ;;
    start)
      start
      ;;
    help|-h|--help)
      print_help
      ;;
    *)
      echo "Unknown mode: $MODE" >&2
      print_help
      exit 1
      ;;
  esac
}

main "$@"
