# Unified MCP Gateway Hub & Cross-Platform Integration Guide

> **Single Accessible Endpoint** aggregating Google Flow, Tickertape, and pluggable future MCP servers with **Intelligent Tool Selection**, **Context Window Optimization**, and **100% Cross-Platform Compatibility** (Claude, ChatGPT Developer Mode, Cursor, VS Code, Vibe).

---

## 🚀 Quick Start

### 1. Start the Unified Gateway (Single HTTP/SSE Endpoint + Web Dashboard)
```bash
npm run gateway
```
* **Web UI Dashboard**: [`http://localhost:8080/`](http://localhost:8080/)
* **Unified MCP SSE Endpoint**: `http://localhost:8080/sse`
* **Health & Diagnostics**: `http://localhost:8080/health`
* **Tool Catalog**: `http://localhost:8080/api/tools`

### 2. Start the Unified Gateway in Stdio Mode (for IDEs / Local Agents)
```bash
npm run gateway:stdio
```

### 3. Run Individual MCP Servers Standalone (if ever needed)
| Server | Stdio Mode | Remote HTTP/SSE Mode |
| :--- | :--- | :--- |
| **Google Flow MCP** | `npm run flow:stdio` | `npm run flow:http` (port 3000) |
| **Tickertape MCP** | `npm run tickertape:stdio` | `npm run tickertape:http` (port 3001) |

---

## 🌐 Platform-by-Platform Integration

### 1. Claude Desktop & Claude Code
Add to your Claude Desktop configuration (`%APPDATA%\Claude\claude_desktop_config.json` on Windows or `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "unified-gateway": {
      "command": "node",
      "args": [
        "c:/Users/tanuj/Documents/antigravity/zealous-brahmagupta/dist/gateway/index.js",
        "--stdio"
      ]
    }
  }
}
```

### 2. ChatGPT Developer Mode (OpenAI)
> **Key Rule from Research**: ChatGPT only accepts **remote HTTPS endpoints** (no direct local stdio) and supports **tool calls only**. All tools in this Gateway feature explicit `readOnlyHint: true` to prevent repetitive approval dialogs.

1. In ChatGPT, open **Settings → Connectors → Advanced → Developer Mode**.
2. Click **Add Connector**.
3. Point to your Gateway SSE endpoint:
   - For local development: Use Cloudflare Tunnel or ngrok: `ngrok http 8080`
   - Enter your public HTTPS URL: `https://your-domain.ngrok-free.app/sse`
4. **ChatGPT Deep Research & Connectors**: The Gateway implements native `search` and `fetch` tools:
   - `search`: Searches equities, market indicators, video models, and camera presets.
   - `fetch`: Fetches detailed financials, stock fundamentals, or video specifications by ID/symbol.

### 3. Cursor Editor
Add to `.cursor/mcp.json` or Cursor settings:

```json
{
  "mcpServers": {
    "unified-gateway": {
      "url": "http://localhost:8080/sse"
    }
  }
}
```
*Or using stdio:*
```json
{
  "mcpServers": {
    "unified-gateway": {
      "command": "node",
      "args": ["c:/Users/tanuj/Documents/antigravity/zealous-brahmagupta/dist/gateway/index.js", "--stdio"]
    }
  }
}
```

### 4. VS Code
Add to `.vscode/settings.json`:

```json
{
  "mcp.servers": {
    "unified-gateway": {
      "url": "http://localhost:8080/sse"
    }
  }
}
```

### 5. Claude Messages API (Deferred Loading / Tool Search)
```python
import anthropic

client = anthropic.Anthropic()

response = client.beta.messages.create(
    model="claude-3-7-sonnet-20250219",
    max_tokens=4096,
    messages=[
        {"role": "user", "content": "What is the market mood in India right now and what Veo camera preset should I use for a cinematic drone shot?"}
    ],
    mcp_servers=[
        {
            "type": "url",
            "url": "http://localhost:8080/sse",
            "name": "unified-gateway"
        }
    ],
    tools=[
        {
            "type": "mcp_toolset",
            "mcp_server_name": "unified-gateway",
            "default_config": {
                "defer_loading": True  # Context window optimizer!
            }
        }
    ],
    betas=["mcp-client-2025-11-20"]
)
```

---

## 🧠 Context Window Optimization & Intelligent Tool Selection

When you combine multiple MCP servers, exposing 30–100+ tools simultaneously can consume 10,000–50,000 tokens before your agent even starts reasoning. 

The Gateway solves this via **3 operating modes** configurable in `mcp-gateway.config.json` (`toolMode`):

### Mode 1: Meta-Tool Architecture (`toolMode: "meta"`)
Only **4 lightweight tools** are placed in the LLM's initial context window:
1. `gateway_list_servers`: Lists active MCP servers, operational status, descriptions, and categories.
2. `gateway_search_tools`: Discovers tools by task keyword or intent (e.g. `gateway_search_tools(query: "market sentiment")`).
3. `gateway_get_tool_schema`: Dynamically retrieves input parameters and JSON schema for a specific tool.
4. `gateway_call_tool`: Dispatches the call to the appropriate server and returns results.
*Plus universal `search` and `fetch` tools for ChatGPT Deep Research.*

### Mode 2: Direct Namespaced Mode (`toolMode: "direct"`)
All tools are mounted directly into the MCP catalog with namespaces (`flow__*`, `tickertape__*`). You can filter by profile using `GATEWAY_PROFILE=finance` or `GATEWAY_PROFILE=creative`.

### Mode 3: Hybrid Mode (`toolMode: "hybrid"`, Default)
Both discovery meta-tools and direct namespaced tools are available.

---

## ➕ How to Add Pre-Built MCP Servers (by Link / URL / Package)

The Unified Gateway features a dynamic upstream manager that allows you or your AI agent to connect **any pre-built MCP server** from another developer, official repository, or cloud provider simply by providing its **link**.

### 3 Ways to Connect Pre-Built Servers:

#### 1. Via the Web UI Dashboard (Recommended for Users)
1. Open [`http://localhost:8080/`](http://localhost:8080/) in your browser.
2. In the **"🔗 Connect Pre-Built MCP Server (by Link / URL / Package)"** section, paste any link or click one of the quick presets (Memory, Web Fetch, Filesystem, PostgreSQL).
3. Click **⚡ Connect & Add**. The Gateway instantly connects, runs the MCP handshake, discovers all available tools, and hot-mounts them into your endpoint without restarting.
4. Added servers feature a **Disconnect** button to remove them at any time.

#### 2. Directly by the AI Agent (Meta-Tool `gateway_add_server`)
Your AI agent can autonomously install MCP servers on demand:
```json
{
  "tool": "gateway_add_server",
  "arguments": {
    "link": "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
    "name": "Official Web Fetch",
    "category": "network"
  }
}
```

#### 3. Via REST API
```bash
curl -X POST http://localhost:8080/api/servers/add \
  -H "Content-Type: application/json" \
  -d '{
    "link": "https://mcp.notion.com/sse",
    "name": "Notion Workspace",
    "auth_token": "secret_abc123"
  }'
```

---

### Supported Link & Identifier Formats:

| Link Format | Example | How the Gateway Handles It |
| :--- | :--- | :--- |
| **Remote SSE URL** | `https://mcp.notion.com/sse` or `http://localhost:4000` | Connects via `SSEClientTransport` with optional Bearer auth headers. Auto-appends `/sse` if omitted. |
| **Official MCP GitHub** | `https://github.com/modelcontextprotocol/servers/tree/main/src/fetch` | Parses the component name (`fetch`) and runs `npx -y @modelcontextprotocol/server-fetch`. |
| **Community GitHub Repo**| `https://github.com/developer/custom-mcp` | Runs via `npx -y github:developer/custom-mcp`. |
| **npx Command** | `npx -y @modelcontextprotocol/server-filesystem` | Spawns a child process using `StdioClientTransport`. |
| **npm Package Name** | `@modelcontextprotocol/server-memory` | Translates to `npx -y @modelcontextprotocol/server-memory`. |

> [!TIP]
> **Persistent Configuration**: When you add a server via the Web UI, REST API, or `gateway_add_server`, it is automatically persisted to `mcp-gateway.config.json` under `upstreams`, ensuring it reconnects automatically whenever the Gateway restarts.

---

## 🛠️ Adding Custom In-Process Plugins (for Developers)

If you are developing a brand new MCP server from scratch in TypeScript, you can also write an in-process plugin:

### Method A: Add an External Server via `mcp-gateway.config.json` (Zero Code)
Simply open `mcp-gateway.config.json` and add an entry to the `upstreams` array:

#### To plug in a local Stdio server (Python, Go, Node, Docker):
```json
{
  "id": "github-mcp",
  "name": "GitHub MCP Server",
  "description": "Repo management and issues",
  "category": "development",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "enabled": true
}
```

#### To plug in an external remote HTTP/SSE server:
```json
{
  "id": "notion-mcp",
  "name": "Notion Remote MCP",
  "description": "Notion workspace search and pages",
  "category": "productivity",
  "transport": "sse",
  "url": "https://mcp.notion.com/sse",
  "headers": {
    "Authorization": "Bearer NOTION_SECRET"
  },
  "enabled": true
}
```

---

### Method B: Add an In-Process TypeScript Plugin
Create a new file in `src/gateway/plugins/my-server.plugin.ts`:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpPlugin, ToolMetadata } from "../types.js";
import { z } from "zod";

export class MyServerPlugin implements McpPlugin {
  public readonly id = "my-server";
  public readonly name = "My Custom MCP Server";
  public readonly version = "1.0.0";
  public readonly description = "Custom capabilities";
  public readonly category = "general";
  public readonly tags = ["custom", "productivity"];

  public register(server: McpServer): void {
    server.tool(
      "my_custom_tool",
      "Executes custom logic",
      { param: z.string() },
      { title: "Custom Tool", readOnlyHint: true },
      async ({ param }) => ({
        content: [{ type: "text" as const, text: `Processed ${param}` }],
      })
    );
  }

  public getTools(): ToolMetadata[] {
    return [
      {
        name: "my_custom_tool",
        originalName: "my_custom_tool",
        namespacedName: "my_server__my_custom_tool",
        title: "Custom Tool",
        description: "Executes custom logic",
        pluginId: this.id,
        readOnly: true,
        category: "general",
      },
    ];
  }

  public async healthCheck() {
    return { status: "healthy" as const, message: "Operational" };
  }
}
```
Then register it in `src/gateway/registry.ts` inside `loadBuiltinPlugins()`:
```typescript
this.registerPlugin(new MyServerPlugin());
```

---

## 🔒 Security & Best Practices

1. **Authentication**: Enable API Key protection in `mcp-gateway.config.json` by setting `"auth": { "enabled": true, "apiKey": "your-secret-key" }` or via `GATEWAY_API_KEY=your-secret-key`.
2. **CORS Protected**: Pre-configured with wildcard CORS for seamless connection from web LLM interfaces.
3. **Audit Logging**: All diagnostics go to STDERR to ensure the STDOUT JSON-RPC pipe remains strictly valid JSON.
