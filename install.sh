#!/bin/sh
# Installs the extension and a login item that sets REACT_PROFILE=1, which makes Claude load it.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
EXT="$HOME/Library/Application Support/Claude/extensions/fmkadmapgofadopljbjfkapdkoienihi"
AGENT="$HOME/Library/LaunchAgents/dev.claude-react-profile.plist"

mkdir -p "$EXT"
cp "$HERE/extension/manifest.json" "$HERE/extension/main.js" "$EXT/"

cp "$HERE/dev.claude-react-profile.plist" "$AGENT"
launchctl bootout "gui/$(id -u)" "$AGENT" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$AGENT"
launchctl setenv REACT_PROFILE 1

echo "Installed. Quit Claude (Cmd+Q) and open it again."
