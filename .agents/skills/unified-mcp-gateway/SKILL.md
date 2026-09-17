---
name: unified-mcp-gateway
description: Master procedural skill for utilizing the Unified MCP Gateway Hub to access multi-server tools, dynamic upstreams, remote cloud execution, and context-optimized meta-tools across Claude, ChatGPT, Cursor, and agent runtimes. Use whenever an agent needs to connect to remote MCP servers, dynamically discover tools across servers, add new MCP servers by link or package, or route calls through the unified cloud gateway.
version: 1.0.0
author: Tanuj Kumar, AI Agent
license: MIT
metadata:
  cloud_url: "https://unified-mcp-gateway.onrender.com"
  sse_endpoint: "https://unified-mcp-gateway.onrender.com/sse"
  health_endpoint: "https://unified-mcp-gateway.onrender.com/health"
  local_url: "http://localhost:8080"
---

# Unified MCP Gateway Hub Skill

## Overview

The **Unified MCP Gateway Hub** is an enterprise-grade multi-server MCP aggregation gateway and intelligent routing layer. It federates multiple independent Model Context Protocol servers—such as **Google Flow** (creative video studio), **Tickertape** (financial intelligence), **Render Cloud** (infrastructure automation), and custom external upstreams—behind a single unified endpoint.

By applying the **Meta-Tool Pattern** (`uni-mcp-gateway` architecture), the gateway prevents context window degradation, eliminating prompt token bloat from 50+ tool schemas while preserving full execution fidelity.

```
                    ┌─────────────────────────┐
                    │     AI Agent / LLM      │
                    │  (Claude / GPT / Cursor)│
                    └────────────┬────────────┘
                                 │
                   Single MCP Endpoint (/sse or stdio)
                                 │
                    ┌────────────▼────────────┐
                    │ Unified MCP Gateway Hub │
                    │   (Meta-Tool Router)    │
                    └───┬────────┬────────┬───┘
                        │        │        │
        ┌───────────────┘        │        └────────────────┐
        ▼                        ▼                         ▼
┌───────────────┐        ┌───────────────┐        ┌────────────────┐
│  Google Flow  │        │  Tickertape   │        │  Render Cloud  │
│ Video Studio  │        │ Stock/Finance │        │ Infrastructure │
└───────────────┘        └───────────────┘        └────────────────┘
```

---

## 🌐 Endpoints & Connection Matrix

| Environment | Transport | Endpoint / Command | Target Clients |
| :--- | :--- | :--- | :--- |
| **Cloud Production** | Streamable HTTP/SSE | `https://unified-mcp-gateway.onrender.com/sse` | ChatGPT Dev Mode, Claude Web, Remote Agents |
| **Cloud Messages** | HTTP POST | `https://unified-mcp-gateway.onrender.com/messages?sessionId=<id>` | Bidirectional JSON-RPC channel |
| **Cloud Health** | HTTP GET | `https://unified-mcp-gateway.onrender.com/health` | Automated uptime & health probes |
| **Local Gateway** | HTTP/SSE | `http://localhost:8080/sse` | Local IDEs, Browser extensions |
| **Local Stdio** | Stdio CLI | `npm run gateway:stdio` | Claude Desktop, Cursor, VS Code, Cline |

---

## 🧠 The 3 Operating Modes

The gateway supports three dynamic operating modes configured via `mcp-gateway.config.json` or query parameter `?mode=`:

### 1. `meta` Mode (Context Window Optimized - Recommended for Agents)
- **Token Overhead**: < 200 prompt tokens (constant regardless of connected servers).
- Exposes only 4 lightweight meta-tools:
  - `gateway_list_servers`: Inspects connected servers, health, descriptions, and categories.
  - `gateway_search_tools`: Discovers tools dynamically using keyword semantic matching.
  - `gateway_get_tool_schema`: Fetches parameter schema and documentation on-demand.
  - `gateway_call_tool`: Dispatches the tool call to the appropriate upstream server.
  - `gateway_add_server`: Dynamically connects new pre-built MCP servers by link or package.

### 2. `hybrid` Mode (Default Production Mode)
- Combines the 4 meta-tools above with universal ChatGPT Connectors (`search` and `fetch`) plus direct tool aliases for high-frequency actions.

### 3. `direct` Mode (Zero-Hop Tool Exposure)
- Directly exposes all tools with namespacing (`flow__*`, `tickertape__*`, `render__*`). Best suited for desktop IDEs with 200k+ context windows.

---

## 📋 Agent Procedural Workflow

When an agent needs to execute tasks requiring capabilities across multiple servers, follow this decision algorithm:

```
[Agent Goal Received]
        │
        ▼
Is capability in known tools?
  ├── YES ──> Call tool directly (or via gateway_call_tool)
  └── NO  ──> Query `gateway_search_tools({ query: "keyword" })`
                    │
                    ▼
          Was a tool found?
            ├── YES ──> Inspect `gateway_get_tool_schema({ tool_name })`
            │                 │
            │                 ▼
            │           Execute `gateway_call_tool({ tool_name, arguments })`
            │
            └── NO  ──> Does an external MCP package or URL exist?
                              │
                              ▼
                        Call `gateway_add_server({ link, name, auth_token })`
                              │
                              ▼
                        Discover & execute newly registered tool
```

### Step 1: Discover Tools Without Prompt Bloat
Do NOT dump all schemas into context. Search for relevant tools dynamically:
```json
// Example: Searching for equity screening or market mood tools
{
  "name": "gateway_search_tools",
  "arguments": {
    "query": "stock screener sentiment"
  }
}
```

### Step 2: Fetch Parameter Schema On-Demand
Before calling unfamiliar tools, fetch the exact JSON Schema:
```json
{
  "name": "gateway_get_tool_schema",
  "arguments": {
    "tool_name": "run_stock_screener"
  }
}
```

### Step 3: Execute the Tool Call
Execute through the gateway router:
```json
{
  "name": "gateway_call_tool",
  "arguments": {
    "tool_name": "run_stock_screener",
    "arguments": {
      "sectors": ["Financials", "Information Technology"],
      "limit": 5
    }
  }
}
```

---

## 🚀 Adding Pre-Built MCP Servers Dynamically (By Link)

Agents can autonomously add new capabilities from official platforms, GitHub repositories, or remote URLs without restarting the gateway.

### Supported Link Formats:

| Source Type | Example Link | Gateway Behavior |
| :--- | :--- | :--- |
| **Remote SSE URL** | `https://mcp.notion.com/sse` | Connects over SSE with optional Bearer token |
| **Official MCP Server** | `https://github.com/modelcontextprotocol/servers/tree/main/src/fetch` | Resolves to `@modelcontextprotocol/server-fetch` |
| **Third-Party GitHub** | `https://github.com/developer/custom-mcp` | Runs via `npx -y github:developer/custom-mcp` |
| **npm / npx Package** | `@modelcontextprotocol/server-memory` | Runs via `npx -y @modelcontextprotocol/server-memory` |

### Method A: Via Meta-Tool Call
```json
{
  "name": "gateway_add_server",
  "arguments": {
    "link": "https://mcp.render.com/mcp",
    "name": "Render Cloud Infrastructure",
    "category": "cloud",
    "auth_token": "rnd_..."
  }
}
```

### Method B: Via REST API
```bash
curl -X POST https://unified-mcp-gateway.onrender.com/api/servers/add \
  -H "Content-Type: application/json" \
  -d '{
    "link": "https://mcp.render.com/mcp",
    "name": "Render Cloud Infrastructure",
    "category": "cloud",
    "auth_token": "rnd_..."
  }'
```

---

## 🛠️ Built-In Server Capabilities Reference

### 1. Google Flow Creative Studio (`google-flow`)
- `google_flow_generate_video`: Render clips with Veo 3.1 (Quality, Fast, Lite) and Gemini Omni Flash.
- `google_flow_scenebuilder`: Multi-clip narrative continuity & scene assembly.
- `google_flow_storyboard_studio`: Convert script into structured visual camera panels.
- `google_flow_control_camera`: Calibrate cinematic lens, FOV, and motion paths.
- `google_flow_estimate_credits`: Calculate compute quota & check peak hours.

### 2. Tickertape Financial Intelligence (`tickertape`)
- `get_market_mood_index`: Read Indian market macro sentiment (0-100 score, Extreme Greed/Fear zones).
- `search_ticker`: Resolve NSE/BSE security IDs (`sid`).
- `get_stock_info`: Fundamental metrics (P/E, P/B, RoE, EPS, 52W High/Low).
- `get_live_quotes`: Real-time prices, volume, and intraday changes.
- `run_stock_screener`: Quantitative multi-variable stock filter.
- `get_shareholding_pattern`: Promoter pledge red-flag auditor.

### 3. Render Cloud Platform (`render`)
- `list_workspaces` & `select_workspace`: Manage active infrastructure tenant.
- `list_services` & `get_service`: Inspect active cloud deployments.
- `create_web_service`: Provision new web applications on Render.
- `trigger_deploy`: Launch zero-downtime builds with optional cache clearance.
- `list_deploys` & `get_deploy`: Monitor real-time deployment status.

---

## 🩺 Health Check & Diagnostics Checklist

When encountering connection issues or degraded status:

1. **Verify Gateway Uptime**:
   ```bash
   curl -s https://unified-mcp-gateway.onrender.com/health
   ```
   Check `status` (`healthy` or `degraded`) and individual plugin messages.
2. **Inspect Upstream Servers**:
   ```bash
   curl -s https://unified-mcp-gateway.onrender.com/api/servers
   ```
3. **Verify SSE Handshake**:
   ```bash
   curl -N --max-time 3 https://unified-mcp-gateway.onrender.com/sse
   ```
   Must return:
   ```
   event: endpoint
   data: /messages?sessionId=<uuid>
   ```
4. **Google Flow Chrome Attachment**:
   In cloud headless environments, `google-flow` reports `degraded` because authentic Chrome requires a local display or CDP port 9222. Video prompt blueprints and schemas remain 100% operational.
