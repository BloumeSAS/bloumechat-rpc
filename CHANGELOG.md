# Changelog

All notable changes to the **BloumeChat RPC** extension are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.3] - 2026-06-09

### Fixed
- **Infinite reconnection**: removed the hard cap of 5 retries. The extension now retries indefinitely with exponential back-off (3 s → 6 s → 12 s → 24 s → 30 s max) until the user explicitly stops it or VS Code closes. Previously the extension would silently stop trying after ~93 seconds.

### Added
- **Open VSX publishing**: CI workflow now publishes to [Open VSX Registry](https://open-vsx.org) automatically on every version tag when the `OVSX_TOKEN` GitHub secret is set.

## [1.1.0] - 2026-05-29

### Added
- **Status bar control**: a clickable BloumeChat RPC item to **Start / Reconnect / Stop** broadcasting, plus commands `BloumeChat RPC: Start | Stop | Reconnect`.
- **Auto-start**: the extension now connects automatically on launch when `enabled` is `true`.
- New display options, configurable like Discord rich presence:
  - `showFileType` (default on) — file-type / language icon for the current file.
  - `showLineNumber` (default off) — current cursor position (line:column).
  - `showProblems` (default off) — number of problems (errors + warnings) in the workspace.

### Changed
- The activity now **persists when VS Code loses focus** (e.g. when you switch to another application) instead of being cleared.

### Removed
- **`bloumechatRpc.serverUrl`** — the realtime endpoint is now hardcoded to `wss://api.bloumechat.com` and is no longer user-configurable.

## [1.0.4] - 2026-05-28

### Added
- Extension icon and Visual Studio Marketplace metadata (keywords, gallery banner, homepage, issues).
- Proprietary `LICENSE` and this changelog.

### Changed
- The extension is now bundled with **esbuild** into a single file, so the
  `socket.io-client` runtime dependency ships correctly inside the `.vsix`.
- Continuous integration now type-checks before packaging.

### Fixed
- Compilation errors under TypeScript strict mode.
- Release workflow no longer requires a committed lock file.

## [1.0.0] - 2026-05-28

### Added
- Initial release.
- Live broadcasting of your current file and workspace to BloumeChat over Socket.IO.
- Automatic reconnection with exponential backoff.
- Settings: `enabled`, `serverUrl`, `token`, `showFileName`, `showWorkspace`.
- Activity is cleared automatically when Visual Studio Code loses focus.
