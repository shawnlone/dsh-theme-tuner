#!/usr/bin/env bash
# install.sh — wire dsh-theme-tuner into the DSH "web" profile (macOS/Linux).
# Mirrors scripts/install.ps1. Adding a new plugin requires a profile restart.
#
# Both paths finish by re-asserting the `dsh.profile.bundles` entry: a profile
# can lose that row (a plugin-manager rewrite drops out-of-band entries) and then
# the plugin silently stops loading even though it is still installed.
set -euo pipefail

PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOME_DIR="${DSH_HOME:-$HOME/.dsh}"
PROFILE_DIR="$HOME_DIR/profiles/web"

if [[ ! -f "$PROFILE_DIR/package.json" ]]; then
  echo "Profile 'web' not found at $PROFILE_DIR. Is DSH installed?" >&2
  exit 1
fi

MANIFEST="$PROFILE_DIR/package.json"
DISABLED="$PROFILE_DIR/disabled-plugins.json"
cp "$MANIFEST" "$MANIFEST.dsh-theme-tuner.bak"
echo "Backed up profile manifest -> $MANIFEST.dsh-theme-tuner.bak"

if command -v dsh >/dev/null 2>&1; then
  echo "Installing via: dsh plugin --profile web add link:$PLUGIN_DIR"
  dsh plugin --profile web add "link:$PLUGIN_DIR"
elif command -v pnpm >/dev/null 2>&1; then
  (cd "$PROFILE_DIR" && pnpm add "link:$PLUGIN_DIR")
else
  echo "Neither 'dsh' nor 'pnpm' is on PATH." >&2
  exit 1
fi

# Re-assert the bundle layer (idempotent).
node -e '
const fs = require("fs");
const file = process.argv[1];
const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
pkg.dsh ??= {};
pkg.dsh.profile ??= {};
pkg.dsh.profile.bundles = pkg.dsh.profile.bundles ?? [];
if (!pkg.dsh.profile.bundles.includes("dsh-theme-tuner")) {
  pkg.dsh.profile.bundles.push("dsh-theme-tuner");
  fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
  console.log("Appended dsh-theme-tuner to dsh.profile.bundles");
} else {
  console.log("dsh-theme-tuner already in dsh.profile.bundles");
}
' "$MANIFEST"

node -e '
const fs = require("fs");
const file = process.argv[1];
if (!fs.existsSync(file)) process.exit(0);
const off = JSON.parse(fs.readFileSync(file, "utf8"));
if (Object.prototype.hasOwnProperty.call(off, "dsh-theme-tuner")) {
  console.warn("WARNING: dsh-theme-tuner is still listed in disabled-plugins.json — enable it from the plugin manager (or delete that entry) or the row stays hidden.");
}
' "$DISABLED"

echo ""
echo "Install complete. RESTART the DSH web profile to see the '主题定制' settings page."
echo "To uninstall: dsh plugin --profile web remove dsh-theme-tuner"
