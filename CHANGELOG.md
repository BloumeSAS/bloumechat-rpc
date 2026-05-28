# Changelog

All notable changes to the **BloumeChat RPC** extension are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
