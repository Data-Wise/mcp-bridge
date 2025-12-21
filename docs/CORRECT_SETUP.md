# ✅ CORRECT Setup for Claude MCP Browser Extension

## The Issue We Found

The extension needs an **SSE (Server-Sent Events) URL**, not just command-based configs.

I've created an **SSE Bridge Server** that solves this!

---

## 🎯 Step 1: Start the SSE Bridge Server

The SSE bridge is already running! To start it manually:

```bash
# Start the bridge server
cd ~/projects/dev-tools/mcp-sse-bridge
node server.js

# Keep this terminal open!
```

**The server runs on:** `http://localhost:3000`

---

## 📝 Step 2: Configure Extension with CORRECT URLs

Now update your extension servers to use the SSE bridge:

### **Server 1: Filesystem**
```
Name:     filesystem
URL:      http://localhost:3000/sse        ← CORRECT URL!
Command:  npx
Arguments: (click + Add for each)
  -y
  @modelcontextprotocol/server-filesystem
  /Users/dt
Env Vars: (none)
```

### **Server 2: Shell**
```
Name:     shell
URL:      http://localhost:3000/sse        ← CORRECT URL!
Command:  node
Arguments: (click + Add)
  /Users/dt/projects/dev-tools/shell-mcp-server/index.js
Env Vars: (none)
```

### **Server 3: Statistical Research**
```
Name:     statistical-research
URL:      http://localhost:3000/sse        ← CORRECT URL!
Command:  bun
Arguments: (click + Add for each)
  run
  /Users/dt/projects/dev-tools/claude-statistical-research/mcp-server/src/index.ts
Env Vars: (click Show)
  Key: R_LIBS_USER
  Value: ~/R/library
```

---

## ✅ Step 3: Test It!

1. **Delete old "filesystem" server** in extension (if URL was "local")
2. **Add new "filesystem" server** with URL `http://localhost:3000/sse`
3. **Refresh claude.ai** page
4. **Test:** `Read the file at /Users/dt/test-mcp-filesystem.txt`

---

## 🔧 How It Works

```
┌─────────────────┐
│  claude.ai      │  Browser
│  + Extension    │
└────────┬────────┘
         │ SSE (HTTP)
         ↓
┌─────────────────┐
│  SSE Bridge     │  localhost:3000
│  (Node server)  │
└────────┬────────┘
         │ stdio
         ↓
┌─────────────────┐
│  MCP Server     │  Your local tools
│  (npx/node/bun) │
└─────────────────┘
```

The SSE bridge translates between:
- **Browser** (HTTP/SSE) ↔ **MCP Servers** (stdio)

---

## 🚀 Auto-Start the Bridge (Optional)

To start the bridge automatically:

```bash
# Create a launch script
cat > ~/projects/dev-tools/mcp-sse-bridge/start.sh << 'EOF'
#!/bin/bash
cd ~/projects/dev-tools/mcp-sse-bridge
node server.js
EOF

chmod +x ~/projects/dev-tools/mcp-sse-bridge/start.sh

# Run it:
~/projects/dev-tools/mcp-sse-bridge/start.sh
```

Or add to your startup items (System Preferences → Users & Groups → Login Items).

---

## 🐛 Troubleshooting

### Bridge not running?
```bash
# Check if running:
curl http://localhost:3000/health

# Should return: {"status":"ok","activeSessions":0}
```

### Port 3000 already in use?
```bash
# Change port in server.js:
# Line 7: const PORT = 3001;  (or any free port)

# Then update extension URLs to:
# http://localhost:3001/sse
```

### Extension still not working?
1. Check bridge server logs in terminal
2. Check extension console (Right-click icon → Inspect popup)
3. Check browser console (F12 on claude.ai)

---

## ✅ Final Checklist

- [ ] SSE bridge running (`curl http://localhost:3000/health` works)
- [ ] Extension loaded in Chrome
- [ ] Servers configured with `http://localhost:3000/sse` URL
- [ ] Page refreshed on claude.ai
- [ ] Test file read works

---

**Now go to claude.ai and test it!** 🎉
