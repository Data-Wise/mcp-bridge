# Server Configuration

Configure MCP servers for the bridge to spawn and connect to.

## Configuration File

The bridge reads from `~/.config/claude/claude_desktop_config.json` (same as Claude Desktop).

### Basic Structure

```json
{
  "mcpServers": {
    "server-name": {
      "command": "executable",
      "args": ["arg1", "arg2"],
      "env": {
        "KEY": "value"
      }
    }
  }
}
```

## Example Configurations

### Filesystem Server

Access local files and directories:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@anthropic/mcp-filesystem-server",
        "/Users/me/projects",
        "/Users/me/documents"
      ]
    }
  }
}
```

### SQLite Database

Query SQLite databases:

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": [
        "-y",
        "@anthropic/mcp-sqlite-server",
        "--db-path",
        "/path/to/database.db"
      ]
    }
  }
}
```

### Custom Server

Run your own MCP server:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/my-server.js"],
      "env": {
        "API_KEY": "secret"
      }
    }
  }
}
```

## Bridge-Specific Config

The bridge also reads `packages/server/config.json` for its own settings:

```json
{
  "port": 8080,
  "host": "localhost"
}
```

## Verify Configuration

After editing config, restart the bridge server:

```bash
# Stop current server (Ctrl+C)
pnpm server
```

Check the logs for discovered servers:

```
Found MCP servers: filesystem, sqlite
```

!!! warning "Security"
    The bridge runs MCP servers with your user permissions. Only add servers you trust.
