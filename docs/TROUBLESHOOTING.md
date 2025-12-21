# MCP Extension Troubleshooting Guide

## Issue: "Cannot access local filesystem" on claude.ai

This means the MCP extension isn't connecting properly.

### Quick Checks:

1. **Extension Loaded?**
   - Go to `chrome://extensions/`
   - Find "claude-tools" or similar
   - Should show "Enabled"
   - Check for any errors under the extension

2. **On claude.ai page?**
   - Extension ONLY works on claude.ai
   - Won't work on other websites
   - Refresh the page (Cmd+R)

3. **Extension Icon Visible?**
   - Should see icon in Chrome toolbar
   - Click it when on claude.ai
   - Should show server list

4. **Server Configuration?**
   - Click extension icon → Should see "filesystem" server
   - Check the settings match:
     ```
     Name: filesystem
     URL: local
     Command: npx
     Args: -y, @modelcontextprotocol/..., /Users/dt
     ```

### Debugging Steps:

#### 1. Check Extension Console
```
1. Right-click extension icon
2. Click "Inspect popup"
3. Look for errors in Console tab
4. Common errors:
   - "Command not found" → npx not in PATH
   - "Connection failed" → Server didn't start
   - "Timeout" → Server taking too long
```

#### 2. Test Server Manually
```bash
# Test if npx works:
npx -y @modelcontextprotocol/server-filesystem /Users/dt

# Should start the server (no errors)
# Press Ctrl+C to stop
```

#### 3. Check Chrome DevTools
```
1. On claude.ai, press F12 (open DevTools)
2. Go to Console tab
3. Look for MCP-related messages
4. Check Network tab for SSE connections
```

#### 4. Reload Extension
```
1. Go to chrome://extensions/
2. Find the extension
3. Click reload icon (circular arrow)
4. Refresh claude.ai page
```

### Common Issues:

#### Issue 1: "npx: command not found"
**Solution:** Install Node.js/npm
```bash
# Check if npx exists:
which npx

# If not found, install Node.js:
brew install node
```

#### Issue 2: Server starts but doesn't connect
**Solution:** Check the URL field
- Should be: `local` or similar placeholder
- NOT empty
- NOT a real URL like http://...

#### Issue 3: Extension icon shows but no servers
**Solution:** Server wasn't saved properly
- Delete and re-add the server
- Make sure all fields are filled
- Click "Add" (not Cancel)

#### Issue 4: Works in popup but not in chat
**Solution:** Refresh claude.ai page
- The extension injects code into the page
- Needs page refresh after adding servers

### Verification Steps:

✅ Extension loaded at chrome://extensions/
✅ Extension icon visible in toolbar
✅ Clicked icon shows "filesystem" server
✅ Server status shows connected/green
✅ Refreshed claude.ai page
✅ npx command works in terminal

If all ✅, try the test again:
```
Read the file at /Users/dt/test-mcp-filesystem.txt
```

### Still Not Working?

Try rebuilding the extension:
```bash
cd ~/projects/dev-tools/claude-mcp
git pull
npm install
npm run build:chrome
# Then reload extension at chrome://extensions/
```

### Alternative: Check if it's a Chrome issue

Try in a different Chromium browser:
- Brave
- Edge
- Chrome Canary

Sometimes extensions work differently across browsers.
