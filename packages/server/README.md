# @mcp-bridge/server

SSE bridge server that connects browser extension to stdio-based MCP servers.

## Usage

```bash
# From monorepo root
pnpm server

# Or directly
node server.js
```

Runs on `http://localhost:3000` by default.

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sse` | GET | SSE connection, spawns MCP server |
| `/message` | POST | Send JSON-RPC to MCP server |
| `/health` | GET | Health check with active sessions |
| `/dashboard` | GET | Web dashboard UI |

## Config

Edit `config.json` for global MCP servers:

```json
{
  "servers": [
    {
      "name": "filesystem",
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-filesystem-server", "/home"]
    }
  ]
}
```

## Install as Service (macOS)

### Recommended: Homebrew

```bash
brew services start mcp-bridge
```

### Manual

```bash
./mcp-bridge install    # Install LaunchAgent
./mcp-bridge uninstall  # Remove LaunchAgent
```
