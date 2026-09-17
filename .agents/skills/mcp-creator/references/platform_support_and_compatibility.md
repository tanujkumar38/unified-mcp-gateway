# MCP Platform Support & Cross-Platform Compatibility Guide

This reference provides an exhaustive comparison of Model Context Protocol (MCP) support across major AI platforms, detailed platform-specific requirements, and the universal compatibility patterns needed to build servers that work seamlessly everywhere.

---

## 1. Platform Support Matrix

| Feature / Primitive | Anthropic Claude (API / Desktop / Code) | OpenAI ChatGPT (Dev Mode / Connectors) | Mistral Vibe / Le Chat | Cursor AI & Windsurf | VS Code / GitHub Copilot | Antigravity / Gemini CLI |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tools (Function Calling)** |  Full |  Full |  Full |  Full |  Full |  Full |
| **Resources (Data context)** |  Full | ❌ None (Tools only) | ⚠️ Partial |  Full |  Full |  Full |
| **Prompts (Workflow schemas)**|  Full | ❌ None | ❓ Unconfirmed |  Full |  Full |  Full |
| **Sampling (Model in model)** |  Full | ❌ None | ❌ None | ⚠️ Limited | ⚠️ Limited |  Full |
| **Roots (Workspace paths)** |  Full | ❌ None | ❌ None |  Full |  Full |  Full |
| **Elicitation / UI Forms** |  Full | ❌ None | ❌ None | ❌ None | ❌ None |  Full |
| **Inline MCP Apps (GUI)** |  Supported | ❌ None | ❌ None | ❌ None | ❌ None |  Supported |
| **Stdio Transport (1:1 local)**|  Full (Primary) | ❌ **NOT SUPPORTED** |  Supported |  Full (Primary) |  Full (Primary) |  Full (Primary) |
| **Remote HTTPS / SSE Transport**|  Full |  **MANDATORY** |  Supported |  Supported |  Supported |  Supported |
| **Context Window Strategy** | Loads all tools; supports `defer_loading` | Loads active connector tools | Loads active tools | Loads configured workspace tools | Loads configured workspace tools | Dynamic loading via tools/skills |
| **Write Tool User Approval** | Configurable per tool/client | **Mandatory** unless `readOnlyHint: true` | Client prompt | IDE prompt on mutation | IDE prompt on mutation | Client permission prompt |

---

## 2. Platform-Specific Architectural Breakdown

### A. Anthropic Claude (The Gold Standard)
Claude boasts the most comprehensive MCP implementation across Desktop, CLI (`claude code`), API, and Web.
- **Transports**: Direct support for local `stdio` subprocesses and remote Streamable HTTP / SSE endpoints.
- **Capabilities**: Full implementation of Tools, Resources, Prompts, Roots, and Sampling.
- **Inline MCP Apps**: Supports custom visual UI widgets rendered directly inside Claude chat artifacts.
- **Context Bloat Warning**: By default, Claude imports the schema of *every* configured tool into the prompt context. If a user enables multiple large servers (e.g. 100+ tools), context token consumption can easily exceed 20,000–50,000 tokens before the conversation even begins!
- **Mitigation - Deferred Loading**:
  - Claude Messages API supports `defer_loading: true` inside `mcp_toolset`.
  - When enabled, tools are indexed via semantic search, and their full schemas are only loaded into context when the user request triggers relevant keywords.

### B. OpenAI ChatGPT (Developer Mode & Connectors)
ChatGPT implements a constrained, security-hardened subset of the MCP protocol.
- **CRITICAL RESTRICTION 1 - REMOTE HTTPS ONLY**:
  - ChatGPT **DOES NOT SUPPORT LOCAL `stdio` TRANSPORTS**.
  - All ChatGPT MCP servers must be hosted on a publicly accessible HTTPS endpoint or bridged via a tunneling solution (ngrok, Cloudflare Tunnel, or `mcp-remote`).
- **CRITICAL RESTRICTION 2 - TOOLS ONLY**:
  - ChatGPT completely ignores MCP Resources, Prompts, Roots, and Sampling.
  - If your server relies on Resources (e.g. `system://info`) or Prompts (e.g. `code_review_prompt`), ChatGPT will never see or use them.
- **CRITICAL REQUIREMENT 3 - CONNECTORS SEARCH & FETCH TOOLS**:
  - For deep research and connector indexing, ChatGPT expects servers to expose standardized search and retrieval tools:
    1. `search(query: string, limit?: number)`: Returns lightweight summaries, IDs, and titles.
    2. `fetch(id: string)`: Retrieves the full content or document by ID.
- **CRITICAL BEHAVIOR 4 - WRITE APPROVAL & `readOnlyHint`**:
  - ChatGPT inspects tool metadata. If a tool does **not** explicitly declare `{ readOnlyHint: true }`, ChatGPT will pause and force the user to manually click "Approve" before every single execution.
  - Non-mutating tools must always declare `readOnlyHint: true`.

### C. Mistral Vibe / Le Chat
Mistral's agent runtime provides expanding support for MCP:
- Supports both `stdio` and HTTP endpoints.
- Tools are fully functional with structured argument validation.
- Resources have basic support; Prompts and Sampling are currently unconfirmed.
- Requires standard error handling (`isError: true`) to avoid breaking the conversational loop.

### D. IDE Assistants: Cursor, Windsurf, & VS Code
- **Transports**: Primarily `stdio` (spawning child processes within the user's OS workspace).
- **Capabilities**: Strong support for Tools, Resources, and Roots (workspace folder paths).
- **Tool Discovery**: Handled automatically on project launch via configuration files (`.cursor/mcp.json`, `.windsurf/mcp.json`, or VS Code user settings).

---

## 3. The Universal Compatibility Strategy: "Build Once, Run Everywhere"

To build an MCP server that works flawlessly across Claude, ChatGPT, Cursor, VS Code, and custom agents without writing separate codebases, implement the **Universal Adapter Pattern**:

```
                              ┌──────────────────────────────┐
                              │     Target Service / API     │
                              └──────────────┬───────────────┘
                                             │
                              ┌──────────────▼───────────────┐
                              │    Universal Core Logic      │
                              │  - Unified business logic    │
                              │  - Input validation & auth   │
                              │  - Output sanitization       │
                              └──────────────┬───────────────┘
                                             │
                     ┌───────────────────────┴───────────────────────┐
                     ▼                                               ▼
         ┌───────────────────────┐                       ┌───────────────────────┐
         │    Stdio Transport    │                       │ Streamable HTTP / SSE │
         │ (Claude Desktop, IDEs)│                       │ (ChatGPT, Gateways)   │
         └───────────┬───────────┘                       └───────────┬───────────┘
                     │                                               │
                     ▼                                               ▼
        Supports: Tools, Resources,                      Auto-wraps Resources &
        Prompts, Roots, Sampling                         Prompts as callable Tools
```

### Rule 1: Dual-Transport Architecture
Export an entry point that boots either `stdio` or `Streamable HTTP` based on command-line flags or environment variables:
```typescript
const isHttp = process.env.MCP_TRANSPORT === "http" || process.argv.includes("--http");
const port = parseInt(process.env.PORT || "3000", 10);

if (isHttp) {
  // Mount Express + SSEServerTransport on port 3000 (ChatGPT / Remote)
  await startHttpServer(server, port);
} else {
  // Mount StdioServerTransport (Claude Desktop / Cursor / Local CLI)
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
```

### Rule 2: Automatic Resource-to-Tool and Prompt-to-Tool Wrappers
Because ChatGPT only reads Tools, wrap all Resources and Prompts into callable fallback tools so tools-only clients have 100% feature parity:
- Resource `docs://{topic}` ➔ Tool `get_resource_docs(topic: string)` with `readOnlyHint: true`.
- Prompt `generate_unit_tests` ➔ Tool `run_prompt_generate_unit_tests(code: string)` with `readOnlyHint: true`.

### Rule 3: Expose Standardized `search` and `fetch`
Implement ChatGPT Connectors compliance by providing standard discovery tools:
```typescript
server.tool(
  "search",
  "Search indexing endpoint for ChatGPT Connectors and agents",
  {
    query: z.string().describe("Search keywords or query"),
    limit: z.number().int().min(1).max(50).default(10).describe("Max results"),
  },
  { readOnlyHint: true },
  async ({ query, limit }) => {
    const results = await performSearch(query, limit);
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
    };
  }
);

server.tool(
  "fetch",
  "Fetch full item content by ID for ChatGPT Connectors",
  {
    id: z.string().describe("Unique identifier of the resource or document"),
  },
  { readOnlyHint: true },
  async ({ id }) => {
    const item = await getItemById(id);
    return {
      content: [{ type: "text", text: JSON.stringify(item, null, 2) }],
    };
  }
);
```

### Rule 4: Mandatory `readOnlyHint: true` on All Read Operations
Every read, search, list, or status check tool MUST declare:
```typescript
{
  readOnlyHint: true,
  idempotentHint: true,
}
```
This completely eliminates annoying ChatGPT permission approval prompts on benign queries.

---

## 4. Bridging Local MCP Servers to ChatGPT

If you have a local `stdio` server and need to connect it to ChatGPT without rebuilding it, use a secure tunnel bridge:

### Option A: `mcp-remote` Tunnel (Recommended)
`mcp-remote` creates an authenticated public HTTPS SSE gateway to a local stdio process:
```bash
npx mcp-remote --command "node /path/to/server/build/index.js" --port 8080
```
Then expose port 8080 via Cloudflare Tunnel:
```bash
cloudflared tunnel --url http://localhost:8080
```
Register the resulting `https://<random-id>.trycloudflare.com/sse` URL inside ChatGPT Developer Mode.

### Option B: Built-in Streamable HTTP + Ngrok
Run your server in HTTP mode:
```bash
MCP_TRANSPORT=http PORT=3000 node build/index.js
ngrok http 3000
```
Register the HTTPS tunnel endpoint in ChatGPT.
