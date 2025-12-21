# Quick Start

Get MCP Bridge running in under 5 minutes.

## Prerequisites

- **Node.js** 18+
- **Chrome** or Chromium-based browser
- **pnpm** (recommended) or npm

## 1. Clone & Install

```bash
git clone https://github.com/Data-Wise/mcp-bridge.git
cd mcp-bridge
pnpm install
```

## 2. Start the SSE Bridge

```bash
pnpm server
```

You should see:

```
MCP SSE Bridge listening on http://localhost:8080
```

!!! tip "Keep this running"
    The bridge must stay running while using the extension.

## 3. Build & Load Extension

```bash
pnpm build:chrome
```

Then in Chrome:

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select `packages/extension/dist-chrome`

## 4. Test Connection

1. Click the MCP Bridge extension icon
2. Check that the bridge status shows **Connected**
3. Go to [claude.ai](https://claude.ai) and start chatting!

---

## Next Steps

- [Configure MCP Servers](server-config.md) — Add filesystem, database, or custom MCP servers
- [Troubleshooting](../guides/troubleshooting.md) — Common issues and fixes
