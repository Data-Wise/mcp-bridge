# Claude MCP Browser Extension - Quick Guide

⚡ **Goal:** Run multiple parallel claude.ai chats with local file/shell access

## 🚀 Setup (5 minutes)

### 1. Load Extension in Chrome
```bash
# Navigate to:
chrome://extensions/

# Steps:
1. Toggle "Developer mode" ON (top-right)
2. Click "Load unpacked"
3. Select: ~/projects/dev-tools/claude-mcp/dist-chrome/
4. Pin extension to toolbar (puzzle icon → pin)
```

### 2. Configure MCP Servers

Open [claude.ai](https://claude.ai), click extension icon, add these servers:

**Note:** Leave URL field empty for all servers (they're command-based, not URL-based)

#### Server 1: Filesystem
```
Name:      filesystem
URL:       (leave empty)
Command:   npx
Arguments: (click "+ Add argument" for each)
           -y
           @modelcontextprotocol/server-filesystem
           /Users/dt
Env Vars:  (none)
```

#### Server 2: Shell
```
Name:      shell
URL:       (leave empty)
Command:   node
Arguments: (click "+ Add argument")
           /Users/dt/projects/dev-tools/shell-mcp-server/index.js
Env Vars:  (none)
```

#### Server 3: Statistical Research (Optional)
```
Name:      statistical-research
URL:       (leave empty)
Command:   bun
Arguments: (click "+ Add argument" for each)
           run
           /Users/dt/projects/dev-tools/claude-statistical-research/mcp-server/src/index.ts
Env Vars:  (click "Show" then add)
           Key: R_LIBS_USER
           Value: ~/R/library
```

**Detailed configs:** See `SERVER_CONFIGS_FOR_EXTENSION.md` for step-by-step UI guide

## ✅ Test It

### Quick Tests:
```
1. "Read /Users/dt/projects/dev-tools/claude-mcp/README.md"
2. "Run: ls -la ~/projects/dev-tools"
3. "Show git status of ~/projects/dev-tools/ask"
```

### Expected Behavior:
- Extension icon shows green dot when connected
- Claude can read files without you uploading them
- Claude can execute shell commands and see output
- All responses appear in chat like normal

## 🔥 Use Multiple Parallel Chats

### The Power Move:
1. Open **Tab 1**: "Monitor my ~/todo.txt file and notify me of changes"
2. Open **Tab 2**: "Help me write code in ~/projects/dev-tools/ask"
3. Open **Tab 3**: "Research this topic and save findings to ~/research.md"

**All three run simultaneously!** Each has full MCP access.

## 🎯 Common Tasks

### File Operations:
```
"Read the file ~/projects/README.md"
"Create a new file ~/notes.txt with this content: ..."
"List all Python files in ~/projects/dev-tools"
"Show me the diff between these two files: ..."
```

### Shell Commands:
```
"Run: git status"
"Execute: npm install in ~/projects/dev-tools/ask"
"Run: find . -name '*.py' | wc -l"
"Show me: df -h"
```

### Combined:
```
"Find all TODO comments in ~/projects/dev-tools and save to ~/todos.md"
"Run the tests in ~/projects/ask and analyze failures"
"Clone this repo to ~/projects: [URL]"
```

## 🐛 Troubleshooting

### Extension not working:
- Refresh claude.ai page
- Check extension icon is green
- Right-click icon → "Inspect popup" to see logs

### Tools not appearing:
- Verify servers are configured correctly
- Check command paths are absolute
- Test servers work: `node ~/projects/dev-tools/shell-mcp-server/index.js`

### Permission errors:
- Filesystem only accesses paths you specify
- Shell runs with your user permissions
- Check file/directory permissions: `ls -la`

## 📊 What's Different from Desktop App?

| Feature | Desktop App | Browser Extension |
|---------|-------------|-------------------|
| MCP Support | ✅ Built-in | ✅ Via extension |
| Multiple parallel chats | ❌ One at a time | ✅ Multiple tabs! |
| File access | ✅ | ✅ |
| Shell commands | ✅ | ✅ |
| Browser automation | ❌ | ✅ Can add Browser MCP |
| Mobile support | ✅ Has mobile app | ❌ Desktop only |

## 💡 Pro Tips

1. **Pin frequently used tabs** - Keep 3-4 claude.ai tabs pinned
2. **Name your tabs** - Right-click tab → rename for clarity
3. **Use workspaces** - Group related tabs in Chrome
4. **Bookmark configs** - Save server configs in extension
5. **Check logs** - Extension console shows connection status

## 🔐 Security Notes

- ✅ Filesystem server only accesses directories you specify
- ✅ Shell commands run with YOUR user permissions
- ⚠️ Be careful with destructive commands (`rm`, `mv`, etc.)
- ✅ Extension is open source: https://github.com/dnakov/claude-mcp
- ✅ All data stays local (no API = no cloud storage)

## 📚 More Info

- Full setup: `~/projects/dev-tools/claude-mcp/INSTALL_GUIDE.md`
- Reference card: `~/projects/dev-tools/claude-mcp/REFCARD.md`
- Server configs: `~/projects/dev-tools/claude-mcp/MCP_SERVER_CONFIG.json`
- Extension source: https://github.com/dnakov/claude-mcp

## 🆘 Quick Help

```bash
# Rebuild extension after updates:
cd ~/projects/dev-tools/claude-mcp
git pull
npm run build:chrome

# Test shell server:
node ~/projects/dev-tools/shell-mcp-server/index.js

# Check if servers are installed:
which node    # Should show path
which npx     # Should show path
which bun     # Should show path
```

---

**🎉 You're ready! Open claude.ai and start chatting with MCP superpowers!**
