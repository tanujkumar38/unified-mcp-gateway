---
name: mcp-creator
title: Universal MCP Server & Multi-Platform Gateway Architect
description: Professional procedural guide and toolkit for AI agents to architect, scaffold, develop, test, debug, and package production-grade Model Context Protocol (MCP) servers for any API, database, website, or no-API portal. Supports platform-specific builds (Claude Desktop/Code/API, OpenAI ChatGPT Developer Mode/Connectors, Mistral Vibe, Cursor, VS Code), universal cross-platform adapters, multi-server aggregation gateways (aiMCPGate, uni-mcp-gateway), and context-optimized meta-tool routing.
version: 2.0.0
author: Tanuj Kumar
license: MIT
platforms: [windows, macos, linux]
metadata:
  tags: [mcp, model-context-protocol, mcp-server, claude, chatgpt, chatgpt-connectors, vibe, cursor, vscode, multi-server, gateway, meta-tool, context-optimization, deferred-loading, stdio, sse, streamable-http, web-scraping, browser-automation, private-api, reverse-engineering]
  category: development
  related_skills: [autonomous-research-team, agy-customizations]
  requires_toolsets: [terminal, files]
  inputs:
    - target_service (string, required): The target app, website, service, or database to connect via MCP.
    - target_platform (string, optional): 'universal' (default), 'claude', 'chatgpt', 'vibe', 'cursor', or 'gateway'.
    - integration_archetype (string, optional): 'official-api', 'web-scraping', 'browser-automation', 'private-api', or 'auto-detect'.
    - transport (string, optional): 'stdio' (default for local agents), 'streamable-http' (for remote/ChatGPT), or 'dual' (universal).
    - language (string, optional): 'typescript' (recommended, mature) or 'python' (FastMCP).
  outputs:
    - mcp_server_project (directory): Complete, buildable, tested MCP server codebase.
    - host_configuration (json): Valid client configuration snippet for Claude Desktop, Cursor, ChatGPT, Antigravity, and VS Code.
    - verification_report (string): Protocol handshake, tool discovery, and stdout hygiene test report.
---

# Universal MCP Server & Multi-Platform Gateway Architect

An open-standard procedural engineering framework for AI agents to architect, code, test, harden, and register production-grade Model Context Protocol (MCP) servers across all major AI platforms (Claude, ChatGPT, Cursor, Windsurf, Mistral Vibe, Antigravity, and custom agent runtimes).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               UNIVERSAL MCP SERVER & MULTI-PLATFORM CREATION PIPELINE                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
   │
   ▼
[Phase 1: Target Intake & Archetype Decision] ──► Official API vs. Scraping vs. Browser vs. Private-API
   │
   ▼
[Phase 2: Platform Targeting & Transport] ──────► Claude / IDEs (stdio) vs. ChatGPT (Remote HTTPS SSE)
   │                                              vs. Universal Adapter (Dual-Transport) vs. Gateway
   ▼
[Phase 3: Automated Scaffolding] ───────────────► Run scripts/mcp_scaffold.py (--type universal / gateway / ts-stdio)
   │
   ▼
[Phase 4: Schema & Capability Design] ──────────► Tools (Zod/Pydantic), ChatGPT Connectors (search & fetch),
   │                                              readOnlyHint: true, and Resource-to-Tool fallback wrappers
   ▼
[Phase 5: Context Optimization & Scaling] ──────► Deferred Loading (defer_loading: true) or
   │                                              Meta-Tool Gateway Pattern (4-tool token saver: ~97% context reduction)
   ▼
[Phase 6: Implementation & Stderr Hygiene] ─────► STRICT STDERR LOGGING (NEVER console.log to stdout in stdio)
   │
   ▼
[Phase 7: No-API Integration Execution] ────────► Session re-auth (Private-API) / Stealth headless browser
   │
   ▼
[Phase 8: Defensive Security & Scrubbing] ──────► Mask secrets/tokens, validate inputs, rate limit, Dockerfile
   │
   ▼
[Phase 9: Automated Verification & Debugging] ──► Run scripts/verify_mcp_server.py + The Debugging Holy Trinity
   │
   ▼
[Phase 10: Host Configuration & Multi-Platform] ► Claude Desktop, Cursor, VS Code, and ChatGPT Tunnel registration
```

---

## 1. When to Use This Skill

Activate this skill whenever the user or agent needs to:
- **Build a new MCP server** connecting an AI agent to an external system, API, database, website, or enterprise portal.
- **Build cross-platform compatible MCP servers** that run seamlessly on both local desktop tools (Claude Desktop, Cursor, VS Code) and cloud assistants (OpenAI ChatGPT, remote web agents).
- **Integrate websites or apps without official APIs** (via Web Scraping, Stealth Browser Automation, or Reverse-Engineered Private-APIs).
- **Aggregate multiple MCP servers into a single endpoint** using gateways (`aiMCPGate` or Python `uni-mcp-gateway`).
- **Solve Context Window Bloat**: Implement the 4-tool Meta-Tool pattern (`list_plugins`, `search_tools`, `get_tool_schema`, `call_tool`) to scale from 10 to 100+ tools while consuming <2k tokens.
- **Troubleshoot or debug a broken MCP server** suffering from connection timeouts, JSON-RPC parsing errors, stdout pollution, or ChatGPT confirmation dialog fatigue.

---

## 2. Progressive Disclosure Architecture

To optimize context window consumption, domain knowledge is organized into modular reference playbooks, production templates, and automated verification tools:

| Component | Path | Purpose |
| :--- | :--- | :--- |
| **Platform Compatibility** | [`references/platform_support_and_compatibility.md`](references/platform_support_and_compatibility.md) | Platform matrix (Claude, ChatGPT, Vibe, Cursor), HTTPS requirements, ChatGPT Connectors (`search`/`fetch`), `readOnlyHint`. |
| **Multi-Server Aggregation** | [`references/multi_server_aggregation.md`](references/multi_server_aggregation.md) | `aiMCPGate` (Go), `uni-mcp-gateway` (Python), Context optimization via the 4-tool Meta-Tool pattern. |
| **Architecture & Protocol** | [`references/architecture_and_protocols.md`](references/architecture_and_protocols.md) | JSON-RPC 2.0 schemas, Tool annotations, stdio vs Streamable HTTP, deferred loading. |
| **No-API Strategies** | [`references/no_api_strategies.md`](references/no_api_strategies.md) | Deep playbooks: Web Scraping (Cheerio), Headless Browser (Puppeteer), and Private-API reverse engineering. |
| **Troubleshooting & Pitfalls** | [`references/troubleshooting_and_pitfalls.md`](references/troubleshooting_and_pitfalls.md) | The 5 failure categories (50% config, 20% connection, etc.) & Debugging Holy Trinity. |
| **Security & Production** | [`references/security_and_production.md`](references/security_and_production.md) | 6-layer defense in depth, secret masking, session caching, multi-stage Dockerfile. |
| **Checklists** | [`references/checklists.md`](references/checklists.md) | Platform evaluation, Pre-dev, Dev, Security, and Production release checklists. |
| **Scaffolding Tool** | [`scripts/mcp_scaffold.py`](scripts/mcp_scaffold.py) | CLI generator for Universal, Gateway, Stdio, HTTP, Private-API, and Browser servers. |
| **Protocol Verifier** | [`scripts/verify_mcp_server.py`](scripts/verify_mcp_server.py) | Automated stdio tester verifying handshake, ping, tool discovery, and stdout hygiene. |
| **Universal Adapter Template** | [`templates/universal-adapter/`](templates/universal-adapter/) | Dual stdio/HTTP server with ChatGPT Connectors `search`/`fetch` and resource-to-tool wrappers. |
| **MCP Gateway Template** | [`templates/mcp-gateway/`](templates/mcp-gateway/) | Context-optimized Meta-Tool gateway (`server.py`) and `aimcpgate.yaml` multi-server aggregator. |
| **TypeScript Stdio Template**| [`templates/typescript-stdio/`](templates/typescript-stdio/) | Production TypeScript + Zod + Stdio template for local agents. |
| **TypeScript HTTP Template** | [`templates/typescript-http/`](templates/typescript-http/) | Streamable HTTP (Express + SSE) template with Bearer auth and session routing. |
| **Python Stdio Template** | [`templates/python-stdio/`](templates/python-stdio/) | FastMCP starter with Pydantic typing and sys.stderr logging. |
| **Private-API Template** | [`templates/private-api/`](templates/private-api/) | Re-authenticating session portal client for un-API'd applications. |
| **Browser Automation Template**| [`templates/browser-automation/`](templates/browser-automation/) | Stealth Puppeteer headless browser tool with `--no-sandbox` flags. |

---

## 3. Platform Compatibility Decision Matrix

Before writing code, identify the target client environment and apply its specific architectural constraints:

```
Which AI Platform is the primary target?
  │
  ├── Claude Desktop / Cursor / VS Code / Antigravity
  │     └── Use stdio transport (fastest, zero network ports, 1:1 process model)
  │
  ├── OpenAI ChatGPT (Developer Mode / Connectors)
  │     ├── Remote HTTPS SSE ONLY (No local stdio supported!)
  │     ├── Tools ONLY (Must wrap Resources & Prompts as callable tools)
  │     ├── Implement standard `search` and `fetch` tools for Deep Research / Connectors
  │     └── Set `readOnlyHint: true` on all read tools to avoid manual confirmation prompts!
  │
  ├── Multi-Platform / Public Release
  │     └── Use the Universal Adapter Pattern (Dual stdio/HTTP + compatibility wrappers)
  │
  └── Aggregating 5+ MCP Servers
        └── Deploy an MCP Gateway with the Meta-Tool Pattern (Prevents 50k+ token context bloat)
```

---

## 4. Step-by-Step Execution Runbook

### Phase 1: Target Intake & Archetype Decision

Evaluate the target service and determine the integration archetype:
- **Archetype A: Official API Server** - Target provides documented REST/GraphQL/gRPC APIs with API keys or OAuth.
- **Archetype B: Web Scraping** - Target is public, read-only HTML content (use Axios + Cheerio).
- **Archetype C: Headless Browser** - Target requires rendering heavy client-side JavaScript or canvas (use Puppeteer).
- **Archetype D: Private-API Reverse Engineering** - Target is an authenticated internal web portal with un-documented XHR/fetch endpoints (best performance and stability for no-API apps).

### Phase 2: Platform Targeting & Transport Architecture

1. **For Local Agents (Claude Desktop, Cursor, Windsurf, VS Code)**:
   - Scaffold with `--type ts-stdio` or `--type py-stdio`.
2. **For OpenAI ChatGPT**:
   - Scaffold with `--type universal` or `--type ts-http` with `--platform chatgpt`.
   - Prepare tunnel via ngrok or Cloudflare Tunnel (`cloudflared tunnel --url http://localhost:3000`).
3. **For Universal Compatibility**:
   - Scaffold with `--type universal` (supports both `npm start` for stdio and `npm run start:http` for SSE).
4. **For Multi-Server Aggregation**:
   - Scaffold with `--type gateway` to merge multiple upstream servers behind a context-optimized router.

### Phase 3: Automated Scaffolding

Generate the project structure in one command:

```bash
# 1. Universal Cross-Platform Server (Claude + ChatGPT Connectors + IDEs):
python "C:/Users/tanuj/.gemini/config/skills/mcp-creator/scripts/mcp_scaffold.py" \
  --name "universal-toolset" \
  --type "universal" \
  --out "./universal-toolset"

# 2. Multi-Server Aggregation Gateway (Meta-Tool Context Optimization):
python "C:/Users/tanuj/.gemini/config/skills/mcp-creator/scripts/mcp_scaffold.py" \
  --name "central-gateway" \
  --type "gateway" \
  --out "./central-gateway"

# 3. Enterprise Private-API Portal Server:
python "C:/Users/tanuj/.gemini/config/skills/mcp-creator/scripts/mcp_scaffold.py" \
  --name "portal-mcp" \
  --type "private-api" \
  --out "./portal-mcp"
```

### Phase 4: Schema & Capability Engineering

1. **Tool Annotations (`annotations`)**:
   - Every read-only tool **MUST** specify `{ readOnlyHint: true, idempotentHint: true }`. This prevents ChatGPT from prompting the user with an approval modal before every call.
   - Every mutating tool should specify `{ destructiveHint: true }`.

2. **ChatGPT Connectors Compliance (`search` & `fetch`)**:
   - If providing document search or data lookups, implement:
     - `search(query: string, limit?: number)` ➔ returns list of `{ id, title, snippet }`.
     - `fetch(id: string)` ➔ returns complete item data.

3. **ChatGPT Resource & Prompt Fallbacks**:
   - For every Resource (e.g. `system://status`), expose a matching Tool (e.g. `get_resource_system_status`).
   - For every Prompt, expose a matching Tool (e.g. `run_prompt_<name>`).

### Phase 5: Context Optimization & Scaling (The Meta-Tool Pattern)

When scaling to 50–100+ tools across multiple services, do NOT load all raw schemas into the LLM context.
Deploy the **Meta-Tool Pattern** (`templates/mcp-gateway/server.py`):
1. Register only 4 meta-tools in client context:
   - `list_plugins()`: Lists high-level domains (e.g. `['github', 'database', 'slack']`).
   - `search_tools(query)`: Semantic keyword search across tools; returns candidate names.
   - `get_tool_schema(tool_name)`: Returns parameter schema on-demand for ONLY the targeted tool.
   - `call_tool(tool_name, arguments)`: Dispatches execution to the upstream server.
2. Context footprint drops from **~50,000 tokens to ~1,200 tokens** (97% savings).

### Phase 6: Implementation & Stderr Hygiene

> [!CRITICAL]
> **STDOUT IS RESERVED SOLELY FOR JSON-RPC 2.0 MESSAGES IN STDIO MODE.**
> Any `console.log()` or `print()` writing to stdout corrupts the JSON-RPC pipe and crashes the client connection!
> **ALL DIAGNOSTIC LOGGING MUST GO TO `stderr` (`console.error` in Node.js, `sys.stderr` in Python).**

Always wrap tool logic in `try...catch` and return structured errors:
```typescript
try {
  const result = await executeAction(input);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
} catch (error: any) {
  console.error(`[TOOL ERROR] ${error.message}`);
  return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
}
```

### Phase 7: No-API Integration Execution

- **Web Scraping**: Use `axios` with randomized realistic User-Agent headers, parse with `cheerio`, extract text, and strip script/style tags.
- **Headless Browser**: Launch Puppeteer with `--no-sandbox`, `--disable-setuid-sandbox`, wait for selectors (`page.waitForSelector`), and ensure `browser.close()` in a `finally` block.
- **Private-API Reverse Engineering**: Intercept XHR requests in DevTools, extract API endpoints, simulate headers/cookies, and implement auto-reauthentication upon `401 Unauthorized`.

### Phase 8: Defensive Security & Output Scrubbing

1. **Environment Variables**: Load secrets via `dotenv`; throw clear startup errors if missing.
2. **Output Sanitization**: Filter sensitive fields (`password`, `token`, `secret`, `apiKey`) before returning payloads to the LLM.
3. **Containerization**: Use multi-stage non-root Docker containers for cloud deployments.

### Phase 9: Automated Verification with Protocol Verifier

Run the automated protocol verifier to test handshake, ping, tool discovery, and verify zero stdout pollution:

```bash
python "C:/Users/tanuj/.gemini/config/skills/mcp-creator/scripts/verify_mcp_server.py" \
  --command "node build/index.js" \
  --cwd "./universal-toolset"
```

### Phase 10: Multi-Platform Host Registration

Provide exact host configurations with **ABSOLUTE PATHS** using forward slashes:

#### A. Claude Desktop (`claude_desktop_config.json`):
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["C:/absolute/path/to/my-server/build/index.js"],
      "env": {
        "SERVICE_API_KEY": "your-key"
      }
    }
  }
}
```

#### B. Cursor & Windsurf (`mcp.json`):
```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["C:/absolute/path/to/my-server/build/index.js"]
    }
  }
}
```

#### C. OpenAI ChatGPT (Developer Mode / Connectors):
1. Start server in HTTP mode: `npm run start:http` (runs on port 3000).
2. Expose HTTPS URL via tunnel: `cloudflared tunnel --url http://localhost:3000` or `ngrok http 3000`.
3. Enter the public SSE endpoint in ChatGPT Developer Settings:
   ```
   https://<your-subdomain>.ngrok-free.app/sse
   ```

---

## 5. Verification Checklist

Before releasing or delivering any MCP server:
- [ ] Platform target confirmed (Claude, ChatGPT, Cursor, Universal, or Gateway).
- [ ] If ChatGPT targeted: Remote HTTPS SSE configured, `readOnlyHint: true` set on all read tools, and Resources wrapped as fallback tools.
- [ ] If ChatGPT Connectors targeted: `search` and `fetch` tools implemented.
- [ ] If tool count > 50: Deferred loading or Meta-Tool Gateway pattern implemented to protect context window.
- [ ] Zero stdout pollution: All logging directed exclusively to `stderr`.
- [ ] Code compiles cleanly (`npm run build` or Python syntax check).
- [ ] Automated protocol verification passes via `scripts/verify_mcp_server.py`.
- [ ] Host configuration snippets provided with absolute paths.
