#!/usr/bin/env bash
set -euo pipefail

# LawFlow Deployment Script
# Usage: ./deployment-script.sh [setup|start|stop|restart|update]

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/lawflow_backend"
FRONTEND_DIR="$ROOT_DIR/lawflow_frontend"

print_help() {
  echo "Usage: $0 [setup|start|stop|restart|update|help]"
  echo ""
  echo "setup     - Install dependencies and configure services"
  echo "start     - Start all services"
  echo "stop      - Stop all services"
  echo "restart   - Restart all services"
  echo "update    - Update code and restart services"
  echo "help      - Show this help message"
}

setup() {
  echo "📦 Setting up LawFlow application..."
  
  # Install system dependencies
  echo "🔧 Installing system dependencies..."
  sudo apt update
  sudo apt install -y nginx
  
  # Setup backend
  echo "🐍 Setting up backend..."
  cd "$BACKEND_DIR"
  if [ ! -d ".venv" ]; then
    python3 -m venv .venv
  fi
  . .venv/bin/activate
  pip install -e .
  
  # Setup frontend
  echo "📦 Setting up frontend..."
  cd "$FRONTEND_DIR"
  npm install
  npm run build
  
  # Configure systemd services
  echo "🔧 Setting up systemd services..."
  # Adjust paths in service files if necessary before copying
  # This is a simple copy; in a real scenario we might need sed to replace paths
  sudo cp "$ROOT_DIR/production/lawflow-backend.service" /etc/systemd/system/
  sudo cp "$ROOT_DIR/production/lawflow-frontend.service" /etc/systemd/system/
  sudo cp "$ROOT_DIR/production/nginx.conf" /etc/nginx/conf.d/lawflow.conf
  
  sudo systemctl daemon-reload
  sudo systemctl enable lawflow-backend.service
  sudo systemctl enable lawflow-frontend.service
  
  # Configure firewall
  echo "🔥 Configuring firewall..."
  # sudo ufw allow 80/tcp # Uncomment if ufw is used
  
  echo "✅ Setup complete!"
}

start() {
  echo "🚀 Starting services..."
  sudo systemctl start lawflow-backend.service
  sudo systemctl start lawflow-frontend.service
  sudo systemctl restart nginx.service
  echo "✅ Services started!"
}

stop() {
  echo "🛑 Stopping services..."
  sudo systemctl stop lawflow-backend.service
  sudo systemctl stop lawflow-frontend.service
  echo "✅ Services stopped!"
}

restart() {
  echo "🔄 Restarting services..."
  sudo systemctl restart lawflow-backend.service
  sudo systemctl restart lawflow-frontend.service
  sudo systemctl restart nginx.service
  echo "✅ Services restarted!"
}

update() {
  echo "🔄 Updating LawFlow application..."
  
  # Pull latest code
  cd "$ROOT_DIR"
  git pull origin master
  
  # Update backend dependencies
  cd "$BACKEND_DIR"
  . .venv/bin/activate
  pip install -e .
  
  # Update frontend dependencies
  cd "$FRONTEND_DIR"
  npm install
  npm run build
  
  # Restart services
  restart
  
  echo "✅ Update complete!"
}

main() {
  ACTION="${1:-help}"
  
  case "$ACTION" in
    setup) setup ;;
    start) start ;;
    stop) stop ;;
    restart) restart ;;
    update) update ;;
    help|--help|-h) print_help ;;
    *) 
      echo "Unknown action: $ACTION"
      print_help
      exit 1
      ;;
  esac
}

main "$@"
