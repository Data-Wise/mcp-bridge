# Testing the Claude MCP Browser Extension

## 🧪 Test Suite Overview

We've created comprehensive tests to verify the extension works correctly with the SSE bridge and MCP servers.

---

## 📋 Test Types

### 1. **Browser-Based Tests** (test-extension.html)
Interactive test page that runs in Chrome to verify:
- SSE bridge connectivity
- MCP server connections
- Extension presence
- Error handling
- Multiple concurrent connections

### 2. **Manual Extension Tests**
Step-by-step verification on actual claude.ai

---

## 🚀 Running Browser Tests

### Step 1: Ensure Prerequisites

```bash
# 1. SSE bridge must be running
cd ~/projects/dev-tools/mcp-sse-bridge
node server.js
# Keep this terminal open!

# 2. Verify it's running
curl http://localhost:3000/health
# Should return: {"status":"ok","activeSessions":0}
```

### Step 2: Open Test Page

```bash
# Open the test page in Chrome
open -a "Google Chrome" ~/projects/dev-tools/claude-mcp/test-extension.html
```

### Step 3: Run Tests

1. **Click "🚀 Run All Tests"** button
2. Watch the results appear in real-time
3. Check the summary at the bottom

**Expected Results:**
- ✅ All 7 tests should pass
- Summary shows 100% success rate

---

## 🔍 Test Descriptions

| Test | What It Checks | Expected |
|------|----------------|----------|
| **SSE Bridge Health** | Bridge server is running | ✅ Returns 200 OK |
| **SSE Connection** | Can establish SSE connection | ✅ Receives endpoint event |
| **Extension Presence** | Extension APIs available | ✅ Detects window.postMessage |
| **Filesystem Server** | Real @modelcontextprotocol/server-filesystem | ✅ Connects & initializes |
| **Shell Server** | Custom shell MCP server | ✅ Connects & initializes |
| **Multiple Connections** | 3 concurrent connections | ✅ All succeed |
| **Error Handling** | Invalid command handling | ✅ Gracefully fails |

---

## 🎯 Manual Extension Tests on claude.ai

### Test 1: Extension Loaded

1. Go to `chrome://extensions/`
2. Find "claude-tools" or "MCP for Claude.ai"
3. **Verify:** ✅ Enabled

### Test 2: Server Configuration

1. Go to [claude.ai](https://claude.ai)
2. Click extension icon in toolbar
3. **Verify:** ✅ Shows popup with server list

### Test 3: Add Filesystem Server

1. Click "Add Server" in extension popup
2. Fill in:
   ```
   Name: filesystem
   URL: http://localhost:3000/sse
   Command: npx
   Arguments: -y, @modelcontextprotocol/server-filesystem, /Users/dt
   ```
3. Click "Add"
4. **Verify:** ✅ Server appears in list

### Test 4: Connection Status

1. Refresh claude.ai page (Cmd+R)
2. Click extension icon
3. **Verify:** ✅ Green indicator next to "filesystem" server

### Test 5: File Read Test

1. Start a new chat on claude.ai
2. Send: `Read the file at /Users/dt/test-mcp-filesystem.txt`
3. **Expected:** Claude displays the file contents
4. **Verify:** ✅ File content shown correctly

### Test 6: File List Test

1. Send: `List all files in /Users/dt/projects/dev-tools/claude-mcp/`
2. **Expected:** Claude lists all files/folders
3. **Verify:** ✅ Sees README.md, src/, dist-chrome/, etc.

### Test 7: Multiple Tabs (Parallel Processing)

1. Open 2-3 tabs of claude.ai
2. In each tab, ask different questions simultaneously:
   - Tab 1: "Read /Users/dt/test-mcp-filesystem.txt"
   - Tab 2: "List files in /Users/dt/projects"
   - Tab 3: "Does /Users/dt/.claude exist?"
3. **Verify:** ✅ All tabs get responses without interfering

---

## 🐛 Troubleshooting

### Browser Tests Fail

**Problem:** Tests fail with connection errors

**Solution:**
```bash
# Check if SSE bridge is running
curl http://localhost:3000/health

# If not running, start it:
cd ~/projects/dev-tools/mcp-sse-bridge
node server.js
```

### Extension Not Detected

**Problem:** "Extension Presence Check" fails

**Solution:**
1. Reload extension at `chrome://extensions/`
2. Reload test page
3. Check browser console (F12) for errors

### Filesystem Server Fails

**Problem:** Can't connect to filesystem server

**Solution:**
```bash
# Test server manually
npx -y @modelcontextprotocol/server-filesystem /Users/dt

# Should print: "Secure MCP Filesystem Server running on stdio"
# Press Ctrl+C to stop
```

### claude.ai Not Reading Files

**Problem:** Claude says "I can't access local files"

**Checklist:**
- [ ] SSE bridge running (curl http://localhost:3000/health)
- [ ] Extension loaded (chrome://extensions/)
- [ ] Server added with URL: http://localhost:3000/sse
- [ ] Page refreshed after adding server
- [ ] Extension icon shows green indicator

---

## 📊 Test Results Reference

After running tests, you should see:

```
📊 Test Summary
Total Tests: 7
✅ Passed: 7
❌ Failed: 0
Success Rate: 100%
🎉 All tests passed!
```

---

## ✅ Success Criteria

Extension is working correctly if:

- ✅ All 7 browser tests pass
- ✅ Extension shows in chrome://extensions/
- ✅ Server appears in extension popup
- ✅ Green indicator shows connection
- ✅ Claude can read files on claude.ai
- ✅ Multiple tabs work simultaneously

---

## 📁 Test Files

```
~/projects/dev-tools/claude-mcp/
├── test-extension.html       # Browser-based tests
├── TEST_EXTENSION.md          # This file
└── dist-chrome/               # Extension to load

~/projects/dev-tools/mcp-sse-bridge/
├── server.js                  # Must be running
├── test.js                    # Unit tests
└── test-integration.js        # Integration tests
```

---

## 🎉 Next Steps

After all tests pass:

1. ✅ Add shell server to extension
2. ✅ Configure statistical-research server (if needed)
3. ✅ Start using Claude with MCP powers on claude.ai!

**Enjoy your MCP-powered Claude experience!** 🚀
