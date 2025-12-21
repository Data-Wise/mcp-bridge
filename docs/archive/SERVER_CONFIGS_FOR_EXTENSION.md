# MCP Server Configurations - For Browser Extension UI

## How to Add Servers

1. Open claude.ai in Chrome
2. Click the claude-mcp extension icon in toolbar
3. Click "Add Server" for each server below
4. Fill in the fields exactly as shown

---

## Server 1: Filesystem Access

```
Name:
  filesystem

URL:
  (leave empty - we're using Command, not URL)

Command:
  npx

Arguments: (click "+ Add argument" for each line)
  -y
  @modelcontextprotocol/server-filesystem
  /Users/dt

Environment Variables:
  (leave empty)
```

**What it does:** Gives Claude read/write access to files under `/Users/dt`

---

## Server 2: Shell Command Execution

```
Name:
  shell

URL:
  (leave empty)

Command:
  node

Arguments: (click "+ Add argument" for each line)
  /Users/dt/projects/dev-tools/shell-mcp-server/index.js

Environment Variables:
  (leave empty)
```

**What it does:** Lets Claude execute shell commands (zsh)

---

## Server 3: Statistical Research (Optional)

```
Name:
  statistical-research

URL:
  (leave empty)

Command:
  bun

Arguments: (click "+ Add argument" for each line)
  run
  /Users/dt/projects/dev-tools/claude-statistical-research/mcp-server/src/index.ts

Environment Variables: (click "Show" then add)
  Key: R_LIBS_USER
  Value: ~/R/library
```

**What it does:** R execution, literature search, Zotero integration

---

## Understanding the Fields

### Name
- Friendly name to identify the server
- Shows up in extension popup
- Use lowercase, descriptive names

### URL (SSE URL)
- For **remote** MCP servers only
- Uses Server-Sent Events protocol
- **Leave empty for local command-based servers**

### Command
- The executable to run
- Must be in PATH or use absolute path
- Examples: `node`, `npx`, `python`, `bun`

### Arguments
- Each argument on a separate line
- Click "+ Add argument" for each one
- Order matters!
- Use absolute paths for file arguments

### Environment Variables
- Click "Show" to reveal
- Add key-value pairs
- Used for server configuration
- Example: `R_LIBS_USER=~/R/library`

---

## Verification Steps

After adding each server:

1. **Check the list** - Server should appear in popup
2. **Refresh claude.ai** - Close and reopen the page
3. **Test the server** - Try a command in chat
4. **Check icon** - Extension icon should show green dot when connected

---

## Example Test Commands

### Test Filesystem Server:
```
"Read the file at /Users/dt/projects/dev-tools/claude-mcp/README.md"
```

### Test Shell Server:
```
"Run this command: ls -la /Users/dt/projects/dev-tools"
```

### Test Statistical Research Server:
```
"List the available R tools"
```

---

## Troubleshooting

### Server shows but doesn't work:
- Check command is in PATH: `which node`, `which npx`, `which bun`
- Verify file paths are absolute and correct
- Check extension console: Right-click icon → "Inspect popup"

### Environment variables not working:
- Click "Show" to reveal the fields
- Make sure both Key and Value are filled
- Don't use quotes around values

### Arguments not working:
- Each argument must be on its own line
- Don't combine arguments: ❌ `-y @model...` ✅ `-y` + `@model...`
- Use absolute paths for file arguments

---

## Visual Guide

```
┌─────────────────────────────────────┐
│ Add Server                          │
├─────────────────────────────────────┤
│ Name:                               │
│ [filesystem                     ]   │
│                                     │
│ URL:                                │
│ [(empty - for local servers)    ]   │
│                                     │
│ Command:                            │
│ [npx                            ]   │
│                                     │
│ Environment Variables  [Show ▼]     │
│                                     │
│ Arguments                           │
│ [-y                             ]   │
│ [@modelcontextprotocol/server...│   │
│ [/Users/dt                      ]   │
│ [+ Add argument                 ]   │
│                                     │
│           [Cancel]  [Add]           │
└─────────────────────────────────────┘
```

---

## Quick Copy-Paste Reference

### Filesystem Arguments (3 separate entries):
```
-y
@modelcontextprotocol/server-filesystem
/Users/dt
```

### Shell Arguments (1 entry):
```
/Users/dt/projects/dev-tools/shell-mcp-server/index.js
```

### Statistical Research Arguments (2 entries):
```
run
/Users/dt/projects/dev-tools/claude-statistical-research/mcp-server/src/index.ts
```

### Statistical Research Env Var:
```
Key:   R_LIBS_USER
Value: ~/R/library
```

---

**💡 Pro Tip:** After adding all servers, refresh claude.ai and check the extension icon for a green connection indicator!
