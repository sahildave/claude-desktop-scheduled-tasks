#!/bin/sh
# Removes the extension and the login item.
EXT="$HOME/Library/Application Support/Claude/extensions/fmkadmapgofadopljbjfkapdkoienihi"
AGENT="$HOME/Library/LaunchAgents/dev.claude-react-profile.plist"
launchctl bootout "gui/$(id -u)" "$AGENT" 2>/dev/null || true
rm -f "$AGENT"
launchctl unsetenv REACT_PROFILE
rm -rf "$EXT"
echo "Removed. Quit Claude (Cmd+Q) and open it again."
