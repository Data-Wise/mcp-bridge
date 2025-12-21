# Installation

Detailed installation instructions for all components.

## System Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | 18+ |
| pnpm | 8+ (or npm) |
| Chrome | 88+ |

## Install from Source

### 1. Clone Repository

```bash
git clone https://github.com/Data-Wise/mcp-bridge.git
cd mcp-bridge
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Build Extension

=== "Chrome"

    ```bash
    pnpm build:chrome
    ```
    
    Output: `packages/extension/dist-chrome/`

=== "Firefox"

    ```bash
    pnpm build:firefox
    ```
    
    Output: `packages/extension/dist-firefox/`

### 4. Load Extension in Browser

=== "Chrome"

    1. Navigate to `chrome://extensions`
    2. Enable **Developer mode**
    3. Click **Load unpacked**
    4. Select `packages/extension/dist-chrome`

=== "Firefox"

    1. Navigate to `about:debugging#/runtime/this-firefox`
    2. Click **Load Temporary Add-on**
    3. Select any file in `packages/extension/dist-firefox`

## Start SSE Bridge Server

```bash
pnpm server
```

The server runs on `http://localhost:8080` by default.

### Run as Background Service (macOS)

```bash
cd packages/server
./mcp-bridge install
```

To uninstall:

```bash
./mcp-bridge uninstall
```

## Verify Installation

1. Extension icon should appear in browser toolbar
2. Click extension → Status should show "Connected"
3. Bridge server terminal should show connection logs

!!! success "Ready!"
    You're all set. Continue to [Server Config](server-config.md) to add MCP servers.
