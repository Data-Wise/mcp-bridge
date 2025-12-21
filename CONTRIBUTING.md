# Contributing to MCP Bridge

Thanks for your interest in contributing!

## Quick Start

```bash
git clone https://github.com/Data-Wise/mcp-bridge.git
cd mcp-bridge
pnpm install
pnpm dev
```

## Development Workflow

1. **Create branch** from `dev`
2. **Make changes** with clear commits
3. **Test locally** - extension + server
4. **Submit PR** to `dev`

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation only
chore: maintenance
refactor: code restructure
```

## Project Structure

| Path | Description |
|------|-------------|
| `packages/extension/` | Chrome extension (Svelte + Vite) |
| `packages/server/` | SSE bridge (Express + Node) |
| `docs/` | MkDocs documentation |

## Testing

```bash
# Build extension
pnpm build:chrome

# Start server
pnpm server

# Load extension in Chrome
# chrome://extensions → Load unpacked → packages/extension/dist-chrome
```

## Code Style

- **JavaScript** - ES modules, async/await
- **Svelte 5** - For popup UI
- **No TypeScript** (yet) - Plain JS for simplicity

## Need Help?

- Open an issue for bugs/features
- Check existing issues first
- Include reproduction steps
