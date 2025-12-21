# Project Scope: MCP Bridge

**Created:** 2025-12-21
**Status:** Active
**Type:** Browser Extension + Server

---

## Objective

Provide a **bridge for connecting Claude.ai (web interface) to local MCP servers** via Chrome extension and SSE server, enabling filesystem access, database queries, and custom tools directly from the browser.

**Core Principle:** Zero cloud dependency—all communication stays local.

---

## Target User

**Claude Pro/Max subscribers** who want:

- MCP tools in claude.ai (browser)
- Multiple concurrent chats with filesystem access
- No separate desktop app required

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ BROWSER LAYER (Chrome Extension)                        │
│ - Injects MCP client into claude.ai                     │
│ - Manages SSE connections                               │
│ - Handles reconnection and errors                       │
└──────────────────┬──────────────────────────────────────┘
                   │ SSE / HTTP POST
┌──────────────────▼──────────────────────────────────────┐
│ BRIDGE LAYER (Node.js SSE Server)                       │
│ - Receives SSE connections from extension               │
│ - Spawns MCP servers (stdio)                            │
│ - Translates SSE ↔ stdio JSON-RPC                       │
└──────────────────┬──────────────────────────────────────┘
                   │ stdio (JSON-RPC)
┌──────────────────▼──────────────────────────────────────┐
│ MCP SERVERS (Various)                                   │
│ - @anthropic/mcp-filesystem-server                      │
│ - @anthropic/mcp-sqlite-server                          │
│ - Custom servers                                        │
└─────────────────────────────────────────────────────────┘
```

---

## Current Status: v2.0.0 ✅

**Completed:**

- [x] Monorepo structure (pnpm workspaces)
- [x] Chrome extension with Svelte 5 popup
- [x] SSE bridge server with auto-reconnection
- [x] GitHub Pages documentation site
- [x] ADHD-friendly docs theme

---

## Roadmap

### Phase 1: Foundation ✅ (Dec 2025)

| Week | Goal | Deliverable |
|------|------|-------------|
| 1 | Monorepo setup | pnpm workspaces, unified commands |
| 2 | Documentation | MkDocs site, ADHD theme |
| 3 | Quick wins | Error handling, context invalidation |

**Status:** Complete

---

### Phase 2: Polish (Jan 2026)

| Week | Goal | Deliverable |
|------|------|-------------|
| 1 | Firefox support | Manifest v3 compatibility |
| 2 | Connection UI | Status indicators, health checks |
| 3 | Auto-start | LaunchAgent improvements |
| 4 | Testing | Integration test suite |

**Metrics:**

- Firefox extension submission
- 95% reconnection success rate
- <5 second cold start

---

### Phase 3: Advanced Features (Feb 2026)

| Feature | Priority | Effort |
|---------|----------|--------|
| Multiple bridge servers | P1 | 2 weeks |
| Server profiles/groups | P2 | 1 week |
| Config hot-reload | P2 | 1 week |
| Docker support | P3 | 1 week |

---

### Backlog (Future)

- [ ] Safari extension (WebKit)
- [ ] Remote bridge support (SSH tunnel)
- [ ] MCP server marketplace
- [ ] VS Code extension integration

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Cold start time | <5 seconds |
| Reconnection success | >95% |
| Tool availability | 100% when bridge running |
| Documentation coverage | All features documented |

---

## What's NOT in Scope

❌ Desktop app (use Claude Desktop for that)
❌ Mobile support
❌ Cloud sync
❌ Multi-user features
❌ Server-side storage

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Extension | JavaScript, Svelte 5, Vite |
| Server | Node.js, Express |
| Build | pnpm, Vite |
| Docs | MkDocs Material |
| CI/CD | GitHub Actions |

---

**Next Action:** Firefox extension testing (Phase 2, Week 1)
