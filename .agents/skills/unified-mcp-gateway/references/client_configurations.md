# Client Configurations Reference for Unified MCP Gateway

This document provides ready-to-use configuration blocks for connecting various AI agent clients to the Unified MCP Gateway Hub (both Cloud Production and Local Stdio).

---

## 1. ChatGPT Developer Mode / Custom Actions

1. In ChatGPT (Plus/Pro/Team/Enterprise), navigate to **Settings** -> **Developer Mode** / **Custom MCP**.
2. Click **Add New Server**:
   - **Name**: `Unified MCP Gateway`
   - **Type**: `SSE (Server-Sent Events)`
   - **Endpoint URL**: `https://unified-mcp-gateway.onrender.com/sse`
   - **Authentication**: None (or Bearer token if auth enabled)
3. ChatGPT will perform an initial handshake and discover universal tools (`search`, `fetch`, `gateway_search_tools`, `gateway_call_tool`).

---

## 2. Claude Desktop

Add to your `claude_desktop_config.json`:

### Path:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Option A: Cloud Remote SSE (Recommended)
```json
{
  "mcpServers": {
    "unified-gateway": {
      "url": "https://unified-mcp-gateway.onrender.com/sse"
    }
  }
}
```

### Option B: Local In-Process Stdio (Zero Latency)
```json
{
  "mcpServers": {
    "unified-gateway": {
      "command": "node",
      "args": [
        "C:\\Users\\tanuj\\Documents\\antigravity\\zealous-brahmagupta\\dist\\gateway\\index.js",
        "--stdio"
      ]
    }
  }
}
```

---

## 3. Cursor IDE

In `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "unified-gateway": {
      "url": "https://unified-mcp-gateway.onrender.com/sse"
    }
  }
}
```

---

## 4. Google Antigravity & Gemini CLI

In `~/.gemini/config/mcp_config.json`:

```json
{
  "mcpServers": {
    "unified-gateway": {
      "command": "node",
      "args": [
        "C:\\Users\\tanuj\\Documents\\antigravity\\zealous-brahmagupta\\dist\\gateway\\index.js",
        "--stdio"
      ]
    }
  }
}
```

---

## 5. VS Code (Copilot / Continue Extension)

In `~/.continue/config.json`:

```json
{
  "mcpServers": [
    {
      "name": "unified-gateway",
      "type": "sse",
      "url": "https://unified-mcp-gateway.onrender.com/sse"
    }
  ]
}
```
