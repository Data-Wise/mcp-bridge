# @mcp-bridge/extension

Chrome extension for connecting Claude.ai to local MCP servers via SSE bridge.

## Development

```bash
# From monorepo root
pnpm dev              # Run dev server
pnpm build:chrome     # Build for Chrome
pnpm build:firefox    # Build for Firefox
```

## Load in Browser

1. Go to `chrome://extensions`
2. Enable Developer mode
3. Load unpacked → select `dist-chrome/`

## Structure

```
src/
├── background.js       # Service worker (badge updates)
├── content.js          # Page injection for claude.ai
├── mcp-connection.js   # MCP protocol handling
├── popup.html/js       # Extension popup UI (Svelte)
└── utils.js            # Debug logging
```
