#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$ROOT_DIR/aligna_app"

if ! command -v flutter >/dev/null 2>&1; then
  echo "Installing Flutter SDK (stable)..."
  FLUTTER_DIR="/tmp/flutter-sdk"
  rm -rf "$FLUTTER_DIR"
  git clone https://github.com/flutter/flutter.git -b stable --depth 1 "$FLUTTER_DIR"
  export PATH="$FLUTTER_DIR/bin:$PATH"
  flutter config --enable-web
  flutter precache --web
fi

cd "$APP_DIR"

# Ensure generated web scaffolding (icons, plugin registrant, etc.)
if [ ! -f "web/icons/Icon-192.png" ]; then
  echo "Scaffolding Flutter web project..."
  flutter create . --project-name aligna_app --platforms=web
fi

flutter pub get
flutter analyze --no-fatal-infos --no-fatal-warnings

echo "Building Flutter web release..."
flutter build web --release --base-href /
