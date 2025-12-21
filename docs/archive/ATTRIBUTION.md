# Attribution

This project is a fork of [dnakov/claude-mcp](https://github.com/dnakov/claude-mcp).

## Original Project

- **Author:** dnakov
- **Repository:** https://github.com/dnakov/claude-mcp
- **License:** MIT
- **Description:** A browser extension that enables MCP (Model Control Protocol) capabilities in Claude.ai

## Thank You!

Thank you to **dnakov** for creating the original MCP extension for Claude.ai! This extension provided the foundational architecture for connecting browser-based Claude to MCP servers.

## This Fork: "MCP Bridge"

This fork extends the original project with specific optimizations for SSE (Server-Sent Events) bridge architecture.

### Maintained By
- **Author:** dt
- **Repository:** https://github.com/dt/mcp-bridge-extension
- **Version:** 2.0.0

### Changes in This Fork

**Branding:**
- Renamed to "MCP Bridge"
- New bridge-themed icons
- Updated UI/UX

**Features:**
- Optimized for SSE bridge integration (http://localhost:3000/sse)
- Pre-configured server templates (filesystem, shell, git)
- Bridge health monitoring
- Quick-add server functionality
- Integration with mcp-bridge CLI tool
- Simplified configuration workflow

**Documentation:**
- Setup guides specific to SSE bridge architecture
- Integration tutorials
- Troubleshooting for bridge-specific issues

## License

This fork maintains the MIT License from the original project.

### Copyright

```
Copyright (c) 2024 dnakov (original project)
Copyright (c) 2025 dt (this fork)
```

See [LICENSE](LICENSE) file for details.

## Contributing

Contributions to this fork are welcome! Please:

1. Consider if the contribution should go to the upstream project
2. Follow the existing code style
3. Add tests for new features
4. Update documentation

## Links

- **Original Project:** https://github.com/dnakov/claude-mcp
- **This Fork:** https://github.com/dt/mcp-bridge-extension
- **MCP Protocol:** https://modelcontextprotocol.io
- **SSE Bridge:** https://github.com/dt/mcp-sse-bridge
