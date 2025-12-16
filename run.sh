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

start() {
  if [ ! -d "$VENV_DIR" ]; then
    echo "Missing venv at $VENV_DIR. Run ./run.sh setup first." >&2
    exit 1
  fi

  # shellcheck disable=SC1091
  source "$VENV_DIR/bin/activate"

  echo "Starting backend (uvicorn)..."
  (cd "$BACKEND_DIR" && uvicorn app.main:app --reload --port 8000) &
  BACK_PID=$!

  echo "Starting frontend (Vite)..."
  (cd "$FRONTEND_DIR" && npm run dev -- --host --port 5173) &
  FRONT_PID=$!

  trap 'echo "Stopping..."; kill $BACK_PID $FRONT_PID 2>/dev/null' EXIT
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
