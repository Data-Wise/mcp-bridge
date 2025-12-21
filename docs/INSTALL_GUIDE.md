# Claude MCP Extension - Installation Guide

## 1. Load Extension in Chrome

1. **Open Chrome Extensions page:**
   - Go to `chrome://extensions/`
   - Or click: Menu (⋮) → Extensions → Manage Extensions

2. **Enable Developer Mode:**
   - Toggle "Developer mode" switch in top-right corner

3. **Load the extension:**
   - Click "Load unpacked" button
   - Navigate to: `/Users/dt/projects/dev-tools/claude-mcp/dist-chrome`
   - Click "Select" to load the extension

4. **Verify installation:**
   - You should see "claude-tools" extension card
   - Pin the extension to toolbar for easy access

## 2. Configure MCP Servers

Click the extension icon when on claude.ai and add these servers:

### Server 1: Filesystem Access
```
Name: filesystem
Command: npx
Arguments: -y @modelcontextprotocol/server-filesystem /Users/dt
Environment Variables:
  (none needed)
```

### Server 2: Shell Command Execution
```
Name: shell
Command: node
Arguments: /Users/dt/projects/dev-tools/shell-mcp-server/index.js
Environment Variables:
  (none needed)
```

### Server 3: Your Statistical Research Server (Optional)
```
Name: statistical-research
Command: bun
Arguments: run /Users/dt/projects/dev-tools/claude-statistical-research/mcp-server/src/index.ts
Environment Variables:
  R_LIBS_USER: ~/R/library
```

## 3. Test the Extension

1. **Open claude.ai** in Chrome
2. **Start a new chat**
3. **Test filesystem access:**
   ```
   "Read the file at /Users/dt/projects/dev-tools/ask/README.md"
   ```

4. **Test shell execution:**
   ```
   "Run the command: ls -la /Users/dt/projects/dev-tools"
   ```

5. **Open multiple tabs:**
   - Open 2-3 claude.ai tabs
   - Each can run different tasks in parallel!
   - File/shell access works in all tabs

## 4. Troubleshooting

### Extension not showing tools:
- Refresh claude.ai page
- Check extension console: Right-click extension icon → "Inspect popup"
- Verify MCP servers are configured correctly

### Commands not working:
- Check server paths are correct
- Verify `node` and `npx` are in PATH
- Look at Chrome DevTools console (F12) for errors

### Permission issues:
- Filesystem server only has access to directories you specify
- Shell commands run with your user permissions

## 5. Usage Tips

### Multiple Parallel Chats:
```
Tab 1: "Monitor system logs while I work"
Tab 2: "Help me write code in this directory"
Tab 3: "Research this topic for me"
```

All three run simultaneously with full file/shell access!

### Security:
- Be careful with shell commands - they execute with your permissions
- Filesystem server only accesses directories you explicitly allow
- Review commands before confirming execution

## Next Steps

- Add more MCP servers from: https://github.com/modelcontextprotocol/servers
- Customize shell server for your specific workflows
- Create aliases for common tasks
