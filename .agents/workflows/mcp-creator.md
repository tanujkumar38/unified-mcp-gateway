---
name: mcp-creator
description: Universal MCP Server & Multi-Platform Gateway Architect (Claude, ChatGPT Connectors, Vibe, Cursor, VS Code, Gateways & Meta-Tools).
---

# Universal MCP Server & Multi-Platform Gateway Architect

Activate the `mcp-creator` skill to architect, scaffold, implement, test, and package an MCP server or aggregation gateway:
1. **Target Intake & Archetype**: Official API vs. Web Scraping vs. Headless Browser vs. Private-API.
2. **Platform & Transport Architecture**:
   - Claude Desktop, Cursor, VS Code: `stdio` (1:1 local subprocess).
   - OpenAI ChatGPT (Developer Mode / Connectors): Remote HTTPS SSE only + `search`/`fetch` tools + `readOnlyHint: true`.
   - Universal Cross-Platform Adapter: Dual `stdio`/HTTP transport + resource-to-tool wrappers.
   - Multi-Server Gateway: Aggregate multiple MCP servers via `aiMCPGate` or Python `uni-mcp-gateway`.
3. **Scaffolding**: Run `scripts/mcp_scaffold.py` with `--type universal`, `--type gateway`, `--type ts-stdio`, etc.
4. **Schema & Capability Design**: Tools with explicit Zod/Pydantic schemas, `readOnlyHint: true`, and ChatGPT fallback wrappers.
5. **Context Window Optimization**: Protect context window via Deferred Loading (`defer_loading: true`) or the 4-tool Meta-Tool Gateway Pattern (`list_plugins`, `search_tools`, `get_tool_schema`, `call_tool`) to save ~97% tokens.
6. **Stderr Hygiene**: STRICT zero `console.log()` to stdout in stdio mode; send all diagnostic logs to `stderr`.
7. **No-API Integration**: Session re-authentication (Private-API) or stealth Puppeteer with `--no-sandbox`.
8. **Security & Sanitization**: Mask credentials, validate inputs, rate limit, multi-stage Dockerfile.
9. **Automated Verification**: Run `scripts/verify_mcp_server.py` to validate handshake, ping, tools, and stdout hygiene.
10. **Multi-Platform Host Configuration**: Provide absolute paths for Claude Desktop, Cursor, and HTTPS tunnel steps for ChatGPT.
