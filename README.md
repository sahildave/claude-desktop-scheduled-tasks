# claude-desktop-scheduled-tasks

The Claude desktop app hides scheduled-task runs from the Code tab's sidebar. You only reach them through the Scheduled page. This extension puts them back in the sidebar as ordinary sessions, so they get the same status dots (running, unread, needs approval), PR badges and Archive menu as everything else.

macOS only. Unofficial, and not affiliated with Anthropic.

## Install

```sh
git clone https://github.com/sahildave/claude-desktop-scheduled-tasks
cd claude-desktop-scheduled-tasks
./install.sh
```

Then quit Claude with Cmd+Q and open it again. Runs show up under their project folders.

`install.sh` does two things:

1. Copies the extension into `~/Library/Application Support/Claude/extensions/`.
2. Installs a login item (`~/Library/LaunchAgents/dev.claude-react-profile.plist`) that sets `REACT_PROFILE=1` at login. Claude only loads extensions from that folder when this variable is set.

To remove it, run `./uninstall.sh` and restart Claude.

## How it works

The sidebar drops any session that has a `scheduledTaskId`. The extension finds the store where the app keeps local Code sessions and clears that field on each run, every time the store changes. The app then draws the runs with its own row component.

The Scheduled page loads runs through a separate call, so it still lists each task's runs.

## Trade-offs

- The Scheduled entry's "needs attention" count no longer counts these runs.
- A run's own page may not say that it came from a scheduled task.
- It depends on the app's internal structure, so a Claude update can break it. If runs disappear from the sidebar, look for `[sched-sidebar]` lines in `~/Library/Logs/Claude/claude.ai-web.log`.

## License

MIT
