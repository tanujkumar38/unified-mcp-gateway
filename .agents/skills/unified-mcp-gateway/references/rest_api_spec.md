# REST & Gateway API Specification

The Unified MCP Gateway exposes standard HTTP APIs alongside its Model Context Protocol SSE and stdio transports.

---

## 1. Health & Plugin Status

### `GET /health`
Returns the operational health, active sessions, and status of each loaded plugin.

**Response:**
```json
{
  "service": "unified-mcp-gateway",
  "version": "1.0.0",
  "status": "healthy",
  "uptimeSeconds": 850,
  "activeSessions": 1,
  "toolMode": "hybrid",
  "activeProfile": "all",
  "pluginsCount": 3,
  "plugins": {
    "google-flow": { "status": "degraded", "message": "Chrome not attached" },
    "tickertape": { "status": "healthy", "message": "API reachable" },
    "render": { "status": "healthy", "message": "Connected" }
  },
  "endpoints": {
    "sse": "/sse",
    "messages": "/messages?sessionId=<id>",
    "tools": "/api/tools",
    "config": "/api/config/:client"
  }
}
```

---

## 2. Server & Upstream Management

### `GET /api/servers`
Lists all registered MCP servers, metadata, description, and tool counts.

### `POST /api/servers/add`
Dynamically connects a new MCP server by URL, npm package, or GitHub repository.

**Request Body:**
```json
{
  "link": "https://mcp.render.com/mcp",
  "name": "Render Cloud MCP",
  "category": "cloud",
  "auth_token": "rnd_..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully connected and added MCP server: \"Render Cloud MCP\"",
  "server": {
    "id": "render-cloud-mcp",
    "name": "Render Cloud MCP",
    "category": "cloud",
    "transport": "sse"
  }
}
```

---

## 3. Tool Catalog

### `GET /api/tools`
Returns the full array of aggregated tools across all connected servers with JSON Schema parameter definitions.

### `GET /api/tools?query=screener`
Filters tools by keyword matching name, description, and categories.

---

## 4. MCP Streamable HTTP / SSE Transport

### `GET /sse`
Initializes a new Model Context Protocol SSE session.
- Client receives `event: endpoint` with URI `data: /messages?sessionId=<uuid>`.

### `POST /messages?sessionId=<uuid>`
Sends JSON-RPC 2.0 requests (`initialize`, `tools/list`, `tools/call`, `resources/list`, etc.) to the active session.
