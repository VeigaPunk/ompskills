# 2026-10-09 — the omarchy launcher family (OmarchyBinLaunchers)

**Asked:** `omarchy-launch*`, `omarchy-cmd-*`, `omarchy-webapp*` in
`~/.local/share/omarchy/bin/`; shared pattern; bindings usage; metadata.

## Observed

| script | argv | launches | appId |
| ------ | ---- | -------- | ----- |
| `omarchy-launch-browser` | `[url]`, `--private` | default browser from `xdg-settings` Exec, `setsid uwsm-app` | none |
| `omarchy-launch-editor` | `<path>` | `$EDITOR` fallback nvim; TUI editors via `omarchy-launch-tui`, else `setsid uwsm-app` | `org.omarchy.<editor>` for TUIs |
| `omarchy-launch-webapp` | `<url> [flags]` | browser `--app=<url>` via `setsid uwsm-app` | browser-set |
| `omarchy-launch-or-focus-webapp` | `<pattern> <url…>` | `or-focus` → `launch-webapp` | caller pattern |
| `omarchy-launch-or-focus` | `<pattern> [cmd]` | `focuswindow address:` or `eval exec setsid $cmd` | caller-supplied; default `uwsm-app -- <pattern>` |
| `omarchy-launch-or-focus-tui` | `<command> [args]` | `or-focus` → `launch-tui` | `org.omarchy.$(basename)` as match pattern |
| `omarchy-launch-tui` | `<command> [args]` | `xdg-terminal-exec --app-id=… -e` via `setsid uwsm-app` | `org.omarchy.$(basename)` |
| `omarchy-cmd-terminal-cwd` | none (`hidden=true`) | prints active terminal's child-shell cwd, falls back `$HOME` | n/a |
| `omarchy-menu` | `[submenu]` | walker dmenu menus; `terminal()` → `org.omarchy.terminal` | fixed for menu terminal |

- Shared pattern: GUI → `setsid uwsm-app --`; TUIs → `xdg-terminal-exec
  --app-id=`; appId `org.omarchy.<basename>` only on the TUI path;
  floating/menu terminals use the fixed `org.omarchy.terminal` class (which
  `default apps/system.conf:6` floats — the wall class is not in that list).
- Metadata convention: `# omarchy:<key>=<value>` parsed by `bin/omarchy`
  ~150-207; keys group,name,summary,args,examples,aliases,hidden,
  requires-sudo; `hidden`/`requires-sudo` must equal `true`; fallback
  summary = first non-omarchy comment line.
- `bindings.conf` consumers: lines 4,7,8 browser; 11 editor; 12 lazydocker;
  9,13,14 or-focus; 10 cliamp; 19-28 webapps; 2,3,6 `cmd-terminal-cwd` as
  command substitution.
- Substrate link: `config/ufo.json:56` `terminalLauncher` →
  `ufo-sighting.mjs:2742-2753` → shim basename `ufo-sighting` →
  `org.omarchy.ufo-sighting` = `APP_ID` (`base.mjs:39`).
- Verified: regex matches on synthetic JSON; `eval` word-splitting drops
  `&c=2` from a URL arg; all listed commands resolve on PATH.

## Unknowns

- Whether every supported terminal honors `--app-id` (only Alacritty's
  desktop entry carries `X-TerminalArgAppId` here).
- Live Chromium window classes; `omarchy-menu` beyond launcher call sites.

Confidence: high for static contents/argv/appId; medium for substrate chain.
