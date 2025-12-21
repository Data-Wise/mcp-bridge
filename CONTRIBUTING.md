# Contributing to MCP Bridge

Thank you for your interest in contributing! This guide will help you get started.

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)

---

## Quick Start

### Prerequisites

- **Node.js** 18+ (for build tools and server)
- **pnpm** 8+ (package manager)
- **Chrome** or Chromium browser
- **Git** (version control)

### Setup

1. **Clone repository:**

   ```bash
   git clone https://github.com/Data-Wise/mcp-bridge.git
   cd mcp-bridge
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Build extension:**

   ```bash
   pnpm build:chrome
   ```

4. **Start server:**

   ```bash
   pnpm server
   ```

5. **Load extension in Chrome:**
   - Go to `chrome://extensions`
   - Enable Developer mode
   - Load unpacked → `packages/extension/dist-chrome`

---

## Project Structure

```
mcp-bridge/
├── packages/
│   ├── extension/           # Chrome extension
│   │   ├── src/             # Source files
│   │   │   ├── background.js      # Service worker
│   │   │   ├── content.js         # Page injection
│   │   │   ├── mcp-connection.js  # MCP protocol
│   │   │   └── pages/             # Svelte components
│   │   ├── public/          # Static assets (icons)
│   │   └── dist-chrome/     # Built extension
│   │
│   └── server/              # SSE bridge server
│       ├── server.js        # Main server
│       ├── config.json      # Server configuration
│       └── mcp-bridge       # Install script
│
├── docs/                    # MkDocs documentation
│   ├── getting-started/     # Installation guides
│   ├── guides/              # Reference material
│   └── stylesheets/         # CSS themes
│
├── mkdocs.yml               # Documentation config
├── pnpm-workspace.yaml      # Monorepo config
└── package.json             # Root scripts
```

---

## Development Workflow

### Making Changes

1. **Create feature branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Extension: Edit files in `packages/extension/src/`
   - Server: Edit `packages/server/server.js`
   - Docs: Edit files in `docs/`

3. **Build and test:**

   ```bash
   pnpm build:chrome
   pnpm server
   # Load extension, test on claude.ai
   ```

4. **Commit changes:**

   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

**Types:**

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code restructure |
| `chore` | Maintenance |
| `test` | Adding tests |

**Examples:**

```
feat(extension): add connection status indicator
fix(server): handle EPIPE errors gracefully
docs: update troubleshooting guide
chore: update dependencies
```

---

## Code Style

### JavaScript

- **ES6 modules** (`import`/`export`)
- **Async/await** over callbacks
- **Descriptive names** for functions and variables
- **No TypeScript** (yet) - plain JS for simplicity

**Example:**

```javascript
/**
 * Send MCP initialize request
 * @returns {Promise<boolean>} Success status
 */
async _sendInitializeRequest() {
  const request = {
    jsonrpc: "2.0",
    id: this.getNextId(),
    method: "initialize",
    params: { /* ... */ }
  };
  
  const response = await fetch(this.messageEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  
  return response.ok;
}
```

### Svelte Components

- **Svelte 5** syntax
- **Single-file components** (`.svelte`)
- **Minimal state** - prefer props over stores

---

## Testing

### Manual Testing

```bash
# 1. Build extension
pnpm build:chrome

# 2. Start server
pnpm server

# 3. Load in Chrome
# chrome://extensions → Load unpacked → dist-chrome

# 4. Test on claude.ai
# - Check extension icon shows connected
# - Verify tools appear in Claude
# - Test file operations
```

### Test Checklist

- [ ] Extension loads without errors
- [ ] Server starts on port 3000
- [ ] SSE connection established
- [ ] MCP handshake completes
- [ ] Tools visible in Claude
- [ ] File read/write works
- [ ] Reconnection works after server restart

---

## Documentation

### Adding Documentation

1. **Choose location:**

   | Content | Directory |
   |---------|-----------|
   | Setup guides | `docs/getting-started/` |
   | Reference | `docs/guides/` |

2. **Follow format:**

   ```markdown
   # Page Title
   
   > **Quick summary:** One-line description
   
   ---
   
   ## Section
   
   Content...
   ```

3. **Add to navigation** in `mkdocs.yml`

4. **Preview locally:**

   ```bash
   mkdocs serve
   # Visit http://127.0.0.1:8000
   ```

### Documentation Guidelines

**ADHD-Friendly Writing:**

- ✅ Use tables and bullet points
- ✅ Keep sections short
- ✅ Add quick fix summaries at top
- ✅ Use emoji headers for scanning

---

## Submitting Changes

### Pull Request Process

1. **Push branch:**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR** against `dev` branch

3. **PR description should include:**
   - What changed and why
   - Testing performed
   - Screenshots (if UI changes)

### Code Review Checklist

- ✅ Extension builds without errors
- ✅ Server starts correctly
- ✅ Manual testing performed
- ✅ Documentation updated
- ✅ Conventional commit format

---

## Questions?

- **Issues:** [github.com/Data-Wise/mcp-bridge/issues](https://github.com/Data-Wise/mcp-bridge/issues)
- **Docs:** [data-wise.github.io/mcp-bridge](https://data-wise.github.io/mcp-bridge/)

---

**Last Updated:** 2025-12-21
**Maintainer:** DT
