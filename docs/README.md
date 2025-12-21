# MCP Bridge Extension

<div align="center">

![MCP Bridge Hero](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=15,17,19,21,23&height=200&section=header&text=MCP%20Bridge&fontSize=80&animation=fadeIn&fontAlignY=35&desc=Connect%20Claude%20→%20Local%20MCP&descAlignY=55&descSize=22&fontColor=ffffff)

[![Chrome](https://img.shields.io/badge/Chrome-Extension-4F46E5?style=flat-square&logo=googlechrome&logoColor=white)](https://github.com/dt/mcp-bridge-extension)
[![Status](https://img.shields.io/badge/Status-Active-22C55E?style=flat-square)](http://localhost:3000/health)
[![License](https://img.shields.io/badge/license-MIT-22C55E?style=flat-square)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

**Bridge the gap between Claude.ai and your local MCP servers.**

[Quick Start](#quick-start) · [Documentation](#how-it-works) · [Report Bug](https://github.com/dt/mcp-bridge-extension/issues)

</div>

> **Note:** This is a fork of [dnakov/claude-mcp](https://github.com/dnakov/claude-mcp). See [ATTRIBUTION.md](ATTRIBUTION.md) for details.

---

## What is MCP Bridge?

MCP Bridge is a Chrome extension that connects claude.ai to local MCP (Model Context Protocol) servers through an SSE (Server-Sent Events) bridge. This allows Claude on the web to access your local files, execute commands, and use custom tools.

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Claude.ai  │ ←──→ │  MCP Bridge  │ ←──→ │ Local MCP   │
│  (Browser)  │ SSE  │  Extension   │ stdio│  Servers    │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ SSE Bridge   │
                    │ localhost:   │
                    │ 3000         │
                    └──────────────┘
```

### Key Features

<table>
<tr>
<td width="50%">

### 🌉 **SSE Bridge Integration**
Optimized for `http://localhost:3000/sse` architecture

</td>
<td width="50%">

### 📋 **Quick Server Templates**
Pre-configured filesystem, shell, and git servers

</td>
</tr>
<tr>
<td>

### 💚 **Bridge Health Monitoring**
Visual indicators for bridge status

</td>
<td>

### ⚙️ **Easy Configuration**
Simplified server setup workflow

</td>
</tr>
<tr>
<td>

### 🔄 **Multiple Servers**
Run filesystem, shell, and custom MCP servers simultaneously

</td>
<td>

### 🎨 **Modern Design**
Clean, professional UI with Indigo/Teal branding

</td>
</tr>
</table>

---

## Prerequisites

1. **MCP SSE Bridge** must be running:
   ```bash
   cd ~/projects/dev-tools/mcp-sse-bridge
   ./mcp-bridge start
   ```

2. **Node.js 18+** installed

3. **Chrome or Edge browser**

---

## Installation

### From Source

```bash
# Clone this repository
git clone https://github.com/dt/mcp-bridge-extension.git
cd mcp-bridge-extension

# Install dependencies
npm install

# Build for Chrome
npm run build:chrome

# Load in Chrome:
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the `dist-chrome` folder
```

---

## Quick Start

### 1. Start the SSE Bridge

```bash
cd ~/projects/dev-tools/mcp-sse-bridge
./mcp-bridge install  # Auto-start on login
./mcp-bridge status   # Verify running
```

**Expected output:**
```
✅ Running
{
  "status": "healthy",
  "sessions": 0
}
```

### 2. Configure Servers

Go to https://claude.ai and click the **MCP Bridge** extension icon.

**Filesystem Server:**
```
Name: filesystem
URL: http://localhost:3000/sse
Command: npx
Arguments: -y, @modelcontextprotocol/server-filesystem, /Users/dt
```

**Shell Server:**
```
Name: shell
URL: http://localhost:3000/sse
Command: node
Arguments: /Users/dt/projects/dev-tools/shell-mcp-server/index.js
```

**Git Server (Optional):**
```
Name: git
URL: http://localhost:3000/sse
Command: npx
Arguments: -y, @modelcontextprotocol/server-git, /Users/dt/projects
```

### 3. Test

Ask Claude on claude.ai:

```
"Read the file at /Users/dt/test-mcp-filesystem.txt"
```

```
"Use the execute_command tool to run: whoami"
```

---

## How It Works

### Architecture

```
┌────────────────────────────────────────────────────────┐
│                    Claude.ai (Web)                     │
│  Uses MCP tools as if they were built-in capabilities  │
└────────────────────────────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│              MCP Bridge Extension (Chrome)             │
│  Intercepts tool requests, forwards to SSE bridge      │
└────────────────────────────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│           SSE Bridge (http://localhost:3000)           │
│  Translates HTTP/SSE ↔ stdio for MCP servers          │
└────────────────────────────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│  Local MCP Servers (filesystem, shell, git, custom)   │
│  Provide tools: read_file, execute_command, git_*, etc │
└────────────────────────────────────────────────────────┘
```

### Protocol Flow

1. **Claude makes a tool request** (e.g., "read_file")
2. **Extension intercepts** the request via content script
3. **Extension sends to SSE bridge** at `localhost:3000/sse`
4. **SSE bridge spawns MCP server** (if not already running)
5. **MCP server processes request** (reads file, runs command, etc.)
6. **Response flows back** through bridge → extension → Claude
7. **Claude uses the result** in conversation

---

## Features

### Bridge Health Check

The extension monitors your SSE bridge status:

**Connected:**
```
● Connected
http://localhost:3000/sse
2 servers active
```

**Disconnected:**
```
⚠️ Disconnected
http://localhost:3000/sse
Start: ./mcp-bridge start
```

### Quick Templates

Click "Templates" to quickly add common servers:

- **📁 Filesystem Server** - Access local files
- **🐚 Shell Server** - Execute commands
- **📊 Git Server** - Repository operations

### Server Management

- ✅ Add/edit/remove servers
- ✅ Enable/disable individual servers
- ✅ Test server connections
- ✅ View server logs

---

## Configuration Files

### Extension Settings

Server configurations are stored in Chrome's local storage. Export/import available through the extension popup.

### SSE Bridge

The SSE bridge runs on `localhost:3000` by default. Configure in:

```bash
~/projects/dev-tools/mcp-sse-bridge/server.js
```

---

## Troubleshooting

### Extension Not Connecting

**Issue:** Extension shows "Disconnected"

**Solution:**
```bash
# Check if bridge is running
curl http://localhost:3000/health

# If not running, start it
cd ~/projects/dev-tools/mcp-sse-bridge
./mcp-bridge start

# Check logs
./mcp-bridge logs
```

### MCP Server Not Found

**Issue:** Claude says "I cannot access your local Mac filesystem"

**Solution:**
1. Check extension is installed: `chrome://extensions/`
2. Verify server configuration in extension popup
3. Test server manually:
   ```bash
   npx -y @modelcontextprotocol/server-filesystem /Users/dt
   ```

### Wrong Tool Being Used

**Issue:** Claude uses built-in bash instead of MCP shell server

**Solution:** Be explicit:
```
"Use the execute_command MCP tool to run: whoami"
```

---

## Development

### Build Commands

```bash
# Build for Chrome
npm run build:chrome

# Build for Firefox
npm run build:firefox

# Development mode (watch)
npm run dev

# Run tests
npm test
```

### Project Structure

```
mcp-bridge-extension/
├── src/
│   ├── manifest.json      # Extension manifest (template)
│   ├── popup.html         # Extension popup UI
│   ├── popup.js           # Popup logic
│   ├── popup.css          # Popup styles
│   ├── content.js         # Main world content script
│   └── isolated-content.js # Isolated world content script
├── dist-chrome/           # Built Chrome extension
│   ├── manifest.json      # Generated manifest
│   ├── icon/              # Bridge icons (16-128px)
│   └── src/               # Built source files
├── DESIGN-CONCEPT.md      # Design philosophy & specs
├── ICONS-TODO.md          # Icon design documentation
└── ATTRIBUTION.md         # Credit to original author
```

### Icon Design

Custom bridge-themed icons in 5 sizes (16, 32, 48, 96, 128px):

- **Design:** Modern gradient bridge (Indigo → Cyan)
- **Theme:** Data flow from local (computer) to cloud
- **Colors:** Indigo (#4F46E5) + Teal (#14B8A6)
- **Format:** SVG + PNG

See [DESIGN-CONCEPT.md](DESIGN-CONCEPT.md) for full design specifications.

---

## Attribution

**Original:** [dnakov/claude-mcp](https://github.com/dnakov/claude-mcp) by dnakov
**This Fork:** MCP Bridge by dt

Thank you to dnakov for the original extension! 🙏

See [ATTRIBUTION.md](ATTRIBUTION.md) for full details.

---

## License

MIT License - See [LICENSE](LICENSE)

```
Copyright (c) 2024 dnakov (original)
Copyright (c) 2025 dt (fork)
```

---

<div align="center">

**Made with 🌉 by dt**

[Quick Start](#quick-start) · [How It Works](#how-it-works) · [Report Bug](https://github.com/dt/mcp-bridge-extension/issues)

</div>
