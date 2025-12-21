# ⚡ MCP Bridge Reference Card

> **Quick Access:** Extension icon in toolbar (on claude.ai)

**Last Updated:** 2025-12-21 | **Components:** Extension + SSE Bridge Server

**Philosophy:** Connect Claude.ai to local MCP servers. All communication stays local.

---

## 📊 Quick Stats

| Component | Purpose |
|-----------|---------|
| **Extension** | Injects MCP client into claude.ai |
| **SSE Bridge** | Spawns and manages stdio MCP servers |
| **Port** | `localhost:3000` (bridge server) |

---

## 🛠️ CORE COMMANDS (4)

| Command | Description | Frequency |
|---------|-------------|-----------|
| `pnpm server` | Start SSE bridge | 1x/session |
| `pnpm build:chrome` | Build extension | After code changes |
| `pnpm dev` | Dev mode (hot reload) | During development |
| `pnpm install` | Install all deps | After git pull |

---

## 📋 SERVER CONFIG EXAMPLES

### Filesystem Server

```json
{
  "name": "filesystem",
  "command": "npx",
  "args": ["-y", "@anthropic/mcp-filesystem-server", "/Users/dt"]
}
```

### SQLite Server

```json
{
  "name": "sqlite",
  "command": "npx",
  "args": ["-y", "@anthropic/mcp-sqlite-server", "--db-path", "/path/to/db.sqlite"]
}
```

**Config location:** `~/.config/claude/claude_desktop_config.json`

---

## 💬 EXAMPLE PROMPTS

| Task | Prompt |
|------|--------|
| Read file | "Read ~/projects/README.md" |
| List files | "List all files in ~/projects" |
| Create file | "Create ~/notes.txt with: Hello World" |
| Search | "Find all .py files in ~/projects" |

---

## 🚨 QUICK TROUBLESHOOTING

| Problem | Fix |
|---------|-----|
| Extension not connecting | Is bridge running? (`pnpm server`) |
| Tools not available | Refresh claude.ai page |
| "npx not found" | `brew install node` |
| Server timeout | Check command/args in config |

### Debug Checklist

- [ ] Bridge server running (`localhost:3000`)
- [ ] Extension loaded (`chrome://extensions/`)
- [ ] On claude.ai page
- [ ] Extension icon shows connected (green)

---

## 📁 FILE LOCATIONS

```
mcp-bridge/
├── packages/extension/    # Chrome extension source
│   └── dist-chrome/       # ← Load this in Chrome
├── packages/server/       # SSE bridge server
│   └── server.js          # Main server file
└── docs/                  # Documentation
```

---

## 🔐 SECURITY

| Item | Access |
|------|--------|
| Filesystem | Paths you configure |
| Network | Localhost only |
| Data | Everything stays local |

!!! warning "Rule"
    Only add MCP servers you trust. They run with your permissions.

---

## 🔗 LINKS

- **Docs:** [data-wise.github.io/mcp-bridge](https://data-wise.github.io/mcp-bridge/)
- **Repo:** [github.com/Data-Wise/mcp-bridge](https://github.com/Data-Wise/mcp-bridge)
- **MCP Protocol:** [modelcontextprotocol.io](https://modelcontextprotocol.io/)

---

**Last cleanup:** 2025-12-21 (Monorepo restructure)
