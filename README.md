# MCP Bridge

Chrome extension + SSE server for connecting Claude.ai to local MCP servers.

## Quick Start

### Homebrew (Recommended for macOS)

```bash
# Install the bridge server (runs as a background service)
brew tap data-wise/homebrew-tap
brew install -s mcp-bridge
brew services start mcp-bridge

# Check service status
mcp-bridge status
```

### From Source

```bash
# Install dependencies
npm install -g pnpm
pnpm install

# Build the extension
pnpm build:chrome

# Start the SSE bridge server
pnpm server
```

## Packages

| Package | Description |
|---------|-------------|
| [@mcp-bridge/extension](./packages/extension) | Chrome extension for Claude.ai |
| [@mcp-bridge/server](./packages/server) | SSE bridge server for MCP stdio servers |

## Documentation

See [docs/](./docs/) for detailed guides:

- [INSTALL_GUIDE.md](./docs/INSTALL_GUIDE.md) - Full installation instructions
- [QUICK_GUIDE.md](./docs/QUICK_GUIDE.md) - Quick reference
- [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) - Common issues

## License

MIT - See [LICENSE](./LICENSE)
