# MCP Bridge

<div class="grid cards" markdown>

- :material-puzzle-outline:{ .lg .middle } **Chrome Extension**

    ---

    Connect Claude.ai to your local MCP servers directly from the browser

    [:octicons-arrow-right-24: Quick Start](getting-started/quick-start.md)

- :material-server-network:{ .lg .middle } **SSE Bridge Server**

    ---

    Lightweight bridge that translates SSE ↔ stdio for MCP communication

    [:octicons-arrow-right-24: Installation](getting-started/installation.md)

</div>

---

## What is MCP Bridge?

**MCP Bridge** enables Claude.ai (the web interface) to communicate with local [Model Context Protocol](https://modelcontextprotocol.io) servers — giving Claude access to your filesystem, databases, APIs, and custom tools.

```mermaid
graph LR
    A[Claude.ai<br>Extension] <-->|SSE| B[SSE Bridge<br>(local)]
    B <-->|stdio| C[MCP Server<br>(fs, db..)]
```

## Features

| Feature | Description |
|---------|-------------|
| 🔌 **Zero Config** | Auto-discovers MCP servers from Claude Desktop config |
| 🔒 **Local Only** | All communication stays on localhost |
| ⚡ **Fast** | SSE streaming for real-time responses |
| 🛠️ **Extensible** | Works with any stdio-based MCP server |

## Quick Links

<div class="grid cards" markdown>

- [:material-rocket-launch: **Quick Start**](getting-started/quick-start.md)
- [:material-wrench: **Server Config**](getting-started/server-config.md)
- [:material-lifebuoy: **Troubleshooting**](guides/troubleshooting.md)
- [:material-file-document: **Reference Card**](guides/refcard.md)

</div>
