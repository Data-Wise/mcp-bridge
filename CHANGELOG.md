# Changelog

All notable changes to MCP Bridge are documented here.

## [Unreleased]

### Added

- Monorepo structure with pnpm workspaces
- GitHub Pages documentation site
- ADHD-friendly cyan/purple theme
- Package READMEs for extension and server

### Changed

- Renamed packages to @mcp-bridge/extension and @mcp-bridge/server
- Consolidated docs into docs/ folder

### Fixed

- Suppress expected SSE reconnection errors
- Handle extension context invalidation gracefully

---

## [2.0.0] - 2025-12-21

### Added

- Initial monorepo release
- Chrome extension for claude.ai
- SSE bridge server for stdio MCP servers
- Auto-reconnection with exponential backoff
- Health check endpoint
- Web dashboard at /dashboard

### Architecture

```
mcp-bridge/
├── packages/extension/  # Chrome extension
├── packages/server/     # SSE bridge
└── docs/                # MkDocs site
```

---

## [1.0.0] - 2025-12-12

- Original fork from dnakov/claude-mcp
- Basic SSE bridge functionality
- Single-repo structure
