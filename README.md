# MCP Bridge

Chrome extension + SSE server for connecting Claude.ai to local MCP servers.

## Quick Start

```bash
# Install dependencies
npm install -g pnpm
pnpm install

# Start the SSE bridge server
pnpm server

# Build the extension
pnpm build:chrome
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
