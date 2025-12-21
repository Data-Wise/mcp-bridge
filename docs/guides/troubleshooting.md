# 🚨 Troubleshooting Guide

> **Quick fix:** 90% of issues resolve with: Refresh page → Reload extension → Restart bridge

---

## 📊 Common Issues

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| No MCP tools in Claude | Bridge not running | `pnpm server` |
| Extension icon grey | Not on claude.ai | Navigate to claude.ai |
| "Connection failed" | Bridge crashed | Restart bridge, check logs |
| "Command not found" | npx not in PATH | `brew install node` |
| Tools timeout | Server spawn failed | Check command/args config |

---

## 🔍 DIAGNOSTIC STEPS

### 1. Check Bridge Server

```bash
# Is it running?
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","activeSessions":0,...}
```

!!! tip "Not running?"
    ```bash
    cd ~/projects/dev-tools/mcp-bridge
    pnpm server
    ```

### 2. Check Extension

1. Go to `chrome://extensions/`
2. Find "MCP Bridge"
3. Should show **Enabled** (no errors)
4. Click **reload** icon if needed

### 3. Check Console Logs

```
Right-click extension icon → "Inspect popup" → Console tab
```

Common errors:

| Error | Meaning |
|-------|---------|
| `ECONNREFUSED` | Bridge not running |
| `EPIPE` | MCP server crashed |
| `Timeout` | Server took too long to start |

---

## 🛠️ SPECIFIC ISSUES

### Extension Shows "Disconnected"

1. **Check bridge:** `curl localhost:3000/health`
2. **Restart bridge:** `pnpm server`
3. **Reload extension:** `chrome://extensions/` → reload
4. **Refresh claude.ai**

### MCP Server Won't Start

Test manually:

```bash
# Filesystem server
npx -y @anthropic/mcp-filesystem-server /Users/dt

# Should output JSON-RPC messages
# Ctrl+C to stop
```

If fails:

- Check Node.js installed: `node --version`
- Check npx works: `which npx`
- Check path exists

### Tools Available But Returning Errors

1. Check server logs in bridge terminal
2. Verify file paths are accessible
3. Test simpler operation first (read before write)

---

## 🔄 NUCLEAR OPTION

If nothing works:

```bash
# 1. Stop everything
pkill -f "node.*server.js"

# 2. Clean install
cd ~/projects/dev-tools/mcp-bridge
rm -rf node_modules packages/*/node_modules
pnpm install

# 3. Rebuild extension
pnpm build:chrome

# 4. Reload in Chrome
# chrome://extensions/ → Remove → Load unpacked

# 5. Start fresh
pnpm server
```

---

## 📞 GET HELP

- **GitHub Issues:** [github.com/Data-Wise/mcp-bridge/issues](https://github.com/Data-Wise/mcp-bridge/issues)
- **MCP Docs:** [modelcontextprotocol.io](https://modelcontextprotocol.io/)

---

**Last updated:** 2025-12-21
