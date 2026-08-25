#!/usr/bin/env bash
# install.sh — wire dsh-theme-customizer into the DSH "web" profile (macOS/Linux).
# Mirrors scripts/install.ps1. Adding a new plugin requires a profile restart.
set -euo pipefail

PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOME_DIR="${DSH_HOME:-$HOME/.dsh}"
PROFILE_DIR="$HOME_DIR/profiles/web"

if [[ ! -f "$PROFILE_DIR/package.json" ]]; then
  echo "Profile 'web' not found at $PROFILE_DIR. Is DSH installed?" >&2
  exit 1
fi

MANIFEST="$PROFILE_DIR/package.json"
cp "$MANIFEST" "$MANIFEST.dsh-theme-customizer.bak"
echo "Backed up profile manifest -> $MANIFEST.dsh-theme-customizer.bak"

if command -v dsh >/dev/null 2>&1; then
  echo "Installing via: dsh plugin --profile web add link:$PLUGIN_DIR"
  dsh plugin --profile web add "link:$PLUGIN_DIR"
elif command -v pnpm >/dev/null 2>&1; then
  (cd "$PROFILE_DIR" && pnpm add "link:$PLUGIN_DIR")
else
  echo "Neither 'dsh' nor 'pnpm' is on PATH." >&2
  exit 1
fi

echo ""
echo "Install prepared. RESTART the DSH web profile to see the '主题定制' settings page."
echo "To uninstall: dsh plugin --profile web remove dsh-theme-customizer"
