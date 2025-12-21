# Claude MCP Extension - Reference Card

## 🔧 Quick Commands

### Load Extension
```
chrome://extensions/ → Developer mode → Load unpacked →
~/projects/dev-tools/claude-mcp/dist-chrome/
```

### Update Extension
```bash
cd ~/projects/dev-tools/claude-mcp
git pull && npm run build:chrome
# Then reload extension in chrome://extensions/
```

---

## 📋 MCP Server Configs (For Extension UI)

### Filesystem Server
```
Name:      filesystem
URL:       (empty)
Command:   npx
Arguments: (separate entries - click + Add for each)
  -y
  @modelcontextprotocol/server-filesystem
  /Users/dt
Env:       (none)
Purpose:   Read/write files under /Users/dt
```

### Shell Server
```
Name:      shell
URL:       (empty)
Command:   node
Arguments: (one entry)
  /Users/dt/projects/dev-tools/shell-mcp-server/index.js
Env:       (none)
Purpose:   Execute zsh commands
```

### Statistical Research Server
```
Name:      statistical-research
URL:       (empty)
Command:   bun
Arguments: (separate entries)
  run
  /Users/dt/projects/dev-tools/claude-statistical-research/mcp-server/src/index.ts
Env:       (click Show)
  Key: R_LIBS_USER | Value: ~/R/library
Purpose:   R execution, literature, Zotero tools
```

**💡 Detailed UI guide:** `SERVER_CONFIGS_FOR_EXTENSION.md`

---

## 💬 Example Prompts

### File Operations
```
✓ "Read ~/projects/README.md"
✓ "List all files in ~/projects/dev-tools"
✓ "Create ~/notes.txt with: Hello World"
✓ "Show me the contents of ~/.zshrc"
✓ "Find all .py files in ~/projects"
```

### Shell Commands
```
✓ "Run: git status"
✓ "Execute: ls -la ~/projects"
✓ "Run: npm install"
✓ "Show: df -h"
✓ "Execute: which python"
```

### Combined Tasks
```
✓ "Find all TODO comments and save to ~/todos.md"
✓ "Run tests and analyze failures"
✓ "Clone [repo] to ~/projects/new-project"
✓ "Monitor ~/logs/app.log for errors"
```

---

## 🎯 Parallel Chat Workflows

### Research + Code + Monitor
```
Tab 1: "Research [topic] and save to ~/research.md"
Tab 2: "Help me code in ~/projects/app"
Tab 3: "Monitor ~/logs/error.log"
```

### Multi-Project Development
```
Tab 1: "Work on ~/projects/frontend"
Tab 2: "Work on ~/projects/backend"
Tab 3: "Run tests in ~/projects/integration"
```

### Data Analysis Pipeline
```
Tab 1: "Clean data in ~/data/raw"
Tab 2: "Run analysis scripts in ~/analysis"
Tab 3: "Generate report from results"
```

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| Extension not showing | Reload page, check green icon |
| Tools not available | Verify server configs, check paths |
| Commands fail | Check permissions, verify command paths |
| Filesystem errors | Ensure path is under /Users/dt |
| Shell errors | Test command in terminal first |

### Debug Commands
```bash
# Check extension console
Right-click extension icon → "Inspect popup"

# Test shell server
node ~/projects/dev-tools/shell-mcp-server/index.js

# Verify commands exist
which node  # /usr/local/bin/node
which npx   # /usr/local/bin/npx
which bun   # ~/.bun/bin/bun
```

---

## 📁 File Locations

```
~/projects/dev-tools/
├── claude-mcp/                    # Extension source
│   ├── dist-chrome/               # ← Load this in Chrome
│   ├── INSTALL_GUIDE.md           # Full setup guide
│   ├── QUICK_GUIDE.md             # This guide
│   ├── REFCARD.md                 # This card
│   └── MCP_SERVER_CONFIG.json     # Server configs
│
└── shell-mcp-server/              # Shell MCP server
    ├── index.js                   # Server code
    └── package.json               # Dependencies

~/.claude/
└── CLAUDE.md                      # Knowledge base (updated)
```

---

## 🔐 Security

| Item | Access Level |
|------|-------------|
| Filesystem | Only /Users/dt and subdirectories |
| Shell | Your user permissions |
| Network | No outbound connections (except to claude.ai) |
| Data | Everything stays local |

**Rule:** Never run commands you don't understand!

---

## 📊 Comparison Chart

| Feature | Desktop | Browser Ext | Claude Code |
|---------|---------|-------------|-------------|
| MCP Support | ✅ | ✅ | ✅ |
| Parallel Chats | ❌ | ✅✅✅ | ❌ |
| File Access | ✅ | ✅ | ✅ |
| Shell Access | ✅ | ✅ | ✅ |
| UI | App | Web | Terminal |
| Cost | Pro/Max | Pro/Max | Pro/Max |

---

## 🔗 Links

- Extension source: https://github.com/dnakov/claude-mcp
- MCP docs: https://modelcontextprotocol.io/
- MCP servers: https://github.com/modelcontextprotocol/servers
- Claude help: https://support.claude.com/

---

## ⚡ Keyboard Shortcuts

```
Chrome Extensions:    chrome://extensions/
Open Extension:       Click toolbar icon (on claude.ai)
Inspect Popup:        Right-click icon → Inspect popup
Reload Extension:     chrome://extensions/ → Reload button
Pin Extension:        Puzzle icon → Pin
```

---

## 🎓 Best Practices

1. **Start Small** - Test with simple commands first
2. **Verify Paths** - Use absolute paths for clarity
3. **Check Output** - Review command results before proceeding
4. **Use Tabs** - Separate tasks into different tabs
5. **Pin Tabs** - Keep important chats pinned
6. **Name Servers** - Use descriptive names for servers
7. **Monitor Logs** - Check extension console for issues
8. **Update Regularly** - Pull latest extension updates

---

**💡 Tip:** Bookmark this file for quick reference!

**🎯 Quick Access:**
```bash
# View this file:
cat ~/projects/dev-tools/claude-mcp/REFCARD.md

# Open in editor:
code ~/projects/dev-tools/claude-mcp/REFCARD.md
```
