import express, { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { PluginRegistry } from "./registry.js";
import { createGatewayMcpServer } from "./server.js";
import { logger } from "../utils/logger.js";

export function createGatewayHttpApp() {
  const app = express();
  const registry = PluginRegistry.getInstance();
  const config = registry.getConfig();
  const activeTransports = new Map<string, SSEServerTransport>();

  app.use(express.json({ limit: "50mb" }));

  // Global CORS Middleware for ChatGPT, Claude Web, and IDE browsers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-session-id, mcp-session-id, accept"
    );
    res.setHeader("Access-Control-Expose-Headers", "mcp-session-id");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Optional API Key Authentication
  const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!config.auth?.enabled) {
      return next();
    }

    const authHeader = req.headers.authorization;
    const apiKey = authHeader ? authHeader.replace(/^Bearer\s+/i, "") : (req.query.api_key as string);

    if (!apiKey || apiKey !== config.auth.apiKey) {
      res.status(401).json({ error: "Unauthorized: Invalid or missing API key" });
      return;
    }

    next();
  };

  // -------------------------------------------------------------------------
  // 1. HEALTH CHECK & STATUS
  // -------------------------------------------------------------------------
  app.get("/health", async (req: Request, res: Response) => {
    const health = await registry.healthCheckAll();
    const plugins = registry.getAllPlugins();
    res.json({
      service: "unified-mcp-gateway",
      version: "1.0.0",
      status: health.status,
      uptimeSeconds: Math.floor(health.uptime),
      activeSessions: activeTransports.size,
      toolMode: config.toolMode,
      activeProfile: config.activeProfile,
      pluginsCount: plugins.length,
      plugins: health.plugins,
      endpoints: {
        sse: "/sse",
        messages: "/messages?sessionId=<id>",
        tools: "/api/tools",
        config: "/api/config/:client",
      },
    });
  });

  // -------------------------------------------------------------------------
  // 2. MCP STREAMABLE HTTP / SSE TRANSPORT (Claude API, ChatGPT Dev Mode)
  // -------------------------------------------------------------------------
  app.get("/sse", authMiddleware, async (req: Request, res: Response) => {
    try {
      logger.info("New SSE client connection initiating on Unified Gateway...");
      const server = createGatewayMcpServer();
      const transport = new SSEServerTransport("/messages", res);
      const sessionId = transport.sessionId;
      activeTransports.set(sessionId, transport);

      res.on("close", () => {
        logger.info(`Unified Gateway SSE session closed: ${sessionId}`);
        activeTransports.delete(sessionId);
      });

      await server.connect(transport);
      logger.info(`Unified Gateway bound to SSE session: ${sessionId}`);
    } catch (err: any) {
      logger.error(`Error initiating SSE connection: ${err.message}`, { stack: err.stack });
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to establish SSE session", message: err.message });
      }
    }
  });

  app.post("/messages", async (req: Request, res: Response) => {
    try {
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        res.status(400).json({ error: "Missing required 'sessionId' query parameter" });
        return;
      }

      const transport = activeTransports.get(sessionId);
      if (!transport) {
        res.status(404).json({ error: `Session '${sessionId}' not found or expired` });
        return;
      }

      await transport.handlePostMessage(req, res, req.body);
    } catch (err: any) {
      logger.error(`Error processing message post: ${err.message}`, { stack: err.stack });
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to process message", message: err.message });
      }
    }
  });

  // -------------------------------------------------------------------------
  // 2B. STREAMABLE HTTP TRANSPORT (Claude.ai Custom Connectors /modern MCP)
  // -------------------------------------------------------------------------
  const streamableTransport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });
  const streamableServer = createGatewayMcpServer();
  streamableServer.connect(streamableTransport).catch((err) => {
    logger.warn(`Failed to connect Streamable HTTP transport: ${err.message}`);
  });

  const handleStreamableRequest = async (req: Request, res: Response) => {
    try {
      await streamableTransport.handleRequest(req, res, req.body);
    } catch (err: any) {
      logger.error(`Error in Streamable HTTP request: ${err.message}`, { stack: err.stack });
      if (!res.headersSent) {
        res.status(500).json({ error: "Streamable HTTP error", message: err.message });
      }
    }
  };

  app.all("/mcp", authMiddleware, handleStreamableRequest);
  app.post("/mcp", authMiddleware, handleStreamableRequest);
  app.get("/mcp", authMiddleware, handleStreamableRequest);

  // Fallback for root POST requests (Claude.ai root discovery)
  app.post("/", (req: Request, res: Response, next: NextFunction) => {
    if (req.body?.jsonrpc || req.headers["mcp-session-id"]) {
      return handleStreamableRequest(req, res);
    }
    next();
  });

  // -------------------------------------------------------------------------
  // 3. PRE-BUILT UPSTREAM MANAGEMENT APIS (Add by Link / URL / Package)
  // -------------------------------------------------------------------------
  app.get("/api/servers", async (req: Request, res: Response) => {
    const plugins = registry.getAllPlugins();
    const health = await registry.healthCheckAll();
    const servers = plugins.map((p) => ({
      id: p.id,
      name: p.name,
      version: p.version,
      description: p.description,
      category: p.category,
      tags: p.tags,
      toolsCount: p.getTools().length,
      status: health.plugins[p.id]?.status || "healthy",
      message: health.plugins[p.id]?.message,
    }));
    res.json({ count: servers.length, servers });
  });

  app.post("/api/servers/add", async (req: Request, res: Response) => {
    try {
      const { link, name, category, auth_token, headers } = req.body;
      if (!link || typeof link !== "string") {
        res.status(400).json({ error: "Missing required 'link' string parameter" });
        return;
      }

      logger.info(`Received request to add MCP server by link: ${link}`);
      const reqHeaders = headers || (auth_token ? { Authorization: `Bearer ${auth_token}` } : undefined);
      const result = await registry.addUpstreamFromLink(link, { name, category, headers: reqHeaders });

      res.json({
        success: true,
        message: `Successfully connected and added MCP server: "${result.plugin.name}"`,
        server: {
          id: result.plugin.id,
          name: result.plugin.name,
          category: result.plugin.category,
          transport: result.plugin.descriptor.transport,
        },
        toolsCount: result.tools.length,
        tools: result.tools.map((t) => ({
          name: t.originalName,
          namespacedName: t.namespacedName,
          description: t.description,
        })),
      });
    } catch (err: any) {
      logger.error(`Failed to add MCP server by link: ${err.message}`);
      res.status(500).json({
        success: false,
        error: `Failed to add MCP server from link: ${err.message}`,
      });
    }
  });

  app.delete("/api/servers/:id", (req: Request, res: Response) => {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const removed = registry.removeUpstream(id);
    if (removed) {
      res.json({ success: true, message: `Removed MCP server '${id}'` });
    } else {
      res.status(404).json({ success: false, error: `MCP server '${id}' not found` });
    }
  });

  // -------------------------------------------------------------------------
  // 4. API & TOOL CATALOG
  // -------------------------------------------------------------------------
  app.get("/api/tools", (req: Request, res: Response) => {
    const tools = registry.getAllTools();
    res.json({
      totalTools: tools.length,
      tools,
    });
  });

  // Client configuration generator
  app.get("/api/config/:client", (req: Request, res: Response) => {
    const rawClient = req.params.client;
    const client = (Array.isArray(rawClient) ? rawClient[0] : rawClient || "").toLowerCase();
    const host = req.headers.host || `localhost:${config.port}`;
    const baseUrl = `http://${host}`;

    switch (client) {
      case "claude":
      case "claude-desktop":
        res.json({
          mcpServers: {
            "unified-gateway": {
              command: "node",
              args: [process.argv[1] || "dist/gateway/index.js", "--stdio"],
              env: {},
            },
          },
        });
        return;

      case "cursor":
        res.json({
          mcpServers: {
            "unified-gateway": {
              url: `${baseUrl}/sse`,
              headers: config.auth?.enabled ? { Authorization: `Bearer ${config.auth.apiKey}` } : {},
            },
          },
        });
        return;

      case "vscode":
        res.json({
          "mcp.servers": {
            "unified-gateway": {
              url: `${baseUrl}/sse`,
            },
          },
        });
        return;

      case "chatgpt":
        res.json({
          platform: "ChatGPT Developer Mode",
          transport: "sse",
          endpointUrl: `${baseUrl}/sse`,
          instructions: [
            "1. In ChatGPT, navigate to Settings → Connectors → Advanced → Developer Mode.",
            "2. Click 'Add Connector' or 'Add MCP Server'.",
            `3. Set Server URL to: ${baseUrl}/sse (ensure HTTPS if accessing over remote network).`,
            "4. Enabled tools include 'search' and 'fetch' for native ChatGPT Deep Research integration.",
            "5. All query tools have 'readOnlyHint: true' for seamless zero-approval execution.",
          ],
        });
        return;

      default:
        res.json({
          supportedClients: ["claude", "cursor", "vscode", "chatgpt"],
          url: `${baseUrl}/sse`,
        });
    }
  });

  // -------------------------------------------------------------------------
  // 4. WEB UI MANAGEMENT DASHBOARD
  // -------------------------------------------------------------------------
  app.get("/", async (req: Request, res: Response) => {
    const plugins = registry.getAllPlugins();
    const tools = registry.getAllTools();
    const health = await registry.healthCheckAll();
    const host = req.headers.host || `localhost:${config.port}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unified MCP Gateway Hub</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #111827;
      --card-border: #1f2937;
      --accent: #3b82f6;
      --accent-hover: #2563eb;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --success: #10b981;
      --warning: #f59e0b;
      --font: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: var(--bg); color: var(--text); font-family: var(--font); padding: 2rem; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--card-border); padding-bottom: 1.5rem; }
    .title-group h1 { font-size: 1.8rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 0.75rem; }
    .badge { padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .badge-success { background: rgba(16, 185, 129, 0.2); color: var(--success); border: 1px solid var(--success); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); }
    .card h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.75rem; color: #fff; display: flex; justify-content: space-between; align-items: center; }
    .card p { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem; }
    .metric { display: flex; justify-content: space-between; padding: 0.5rem 0; border-top: 1px solid var(--card-border); font-size: 0.85rem; }
    .metric span:first-child { color: var(--text-muted); }
    .code-box { background: #000; border: 1px solid #2d3748; border-radius: 0.5rem; padding: 1rem; font-family: monospace; font-size: 0.8rem; color: #a3e635; overflow-x: auto; position: relative; margin-top: 0.5rem; }
    .copy-btn { position: absolute; top: 0.5rem; right: 0.5rem; background: var(--accent); color: #fff; border: none; border-radius: 0.3rem; padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer; }
    .copy-btn:hover { background: var(--accent-hover); }
    .tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; border-bottom: 1px solid var(--card-border); padding-bottom: 0.5rem; }
    .tab { background: transparent; border: none; color: var(--text-muted); padding: 0.5rem 1rem; cursor: pointer; font-weight: 600; border-radius: 0.3rem; }
    .tab.active { background: var(--accent); color: #fff; }
    .tool-list { max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; }
    .tool-item { background: rgba(255,255,255,0.02); border: 1px solid var(--card-border); padding: 0.75rem; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center; }
    .tool-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .tool-name { font-weight: 600; font-family: monospace; color: #60a5fa; font-size: 0.9rem; }
    .tool-desc { color: var(--text-muted); font-size: 0.8rem; }
    .search-input { width: 100%; padding: 0.75rem 1rem; background: #000; border: 1px solid var(--card-border); border-radius: 0.5rem; color: #fff; margin-bottom: 1rem; font-size: 0.9rem; }
    .search-input:focus { outline: none; border-color: var(--accent); }
    .btn { background: var(--accent); color: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
    .btn:hover { background: var(--accent-hover); }
  </style>
</head>
<body>
  <div class="header">
    <div class="title-group">
      <h1>🚀 Unified MCP Gateway Hub</h1>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">
        Single Accessible Endpoint for Google Flow, Tickertape & Pluggable Future MCPs
      </p>
    </div>
    <div style="display: flex; gap: 1rem; align-items: center;">
      <span class="badge badge-success">Status: ${health.status}</span>
      <span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid #3b82f6;">
        Mode: ${config.toolMode}
      </span>
    </div>
  </div>

  <div class="grid">
    ${plugins
      .map(
        (p) => `
      <div class="card">
        <h2>${p.id === "google-flow" ? "🎬" : p.id === "tickertape" ? "📈" : "🔌"} ${p.name} <span class="badge badge-success">v${p.version}</span></h2>
        <p>${p.description}</p>
        <div class="metric"><span>Category</span><span>${p.category}</span></div>
        <div class="metric"><span>Status</span><span>${health.plugins[p.id]?.message || "Operational"}</span></div>
        <div class="metric"><span>Tools</span><span>${p.getTools().length} tools available</span></div>
        ${
          p.id !== "google-flow" && p.id !== "tickertape"
            ? `<div style="margin-top: 1rem; text-align: right;"><button class="btn" style="background: #ef4444; font-size: 0.75rem; padding: 0.3rem 0.6rem;" onclick="removeServer('${p.id}')">Disconnect</button></div>`
            : ""
        }
      </div>
    `
      )
      .join("")}
  </div>

  <!-- Add Pre-Built MCP Server Form -->
  <div class="card" style="margin-bottom: 2rem; border: 1px solid #3b82f6;">
    <h2>🔗 Connect Pre-Built MCP Server (by Link / URL / Package)</h2>
    <p>Add pre-built MCP servers from other developers, official platforms, or remote endpoints simply by pasting their link or package identifier.</p>
    
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
      <span style="font-size: 0.8rem; color: var(--text-muted); align-self: center;">Quick Presets:</span>
      <button class="btn" style="background: rgba(255,255,255,0.06); font-size: 0.75rem; padding: 0.3rem 0.6rem;" onclick="fillPreset('@modelcontextprotocol/server-memory', 'Official Memory MCP', 'productivity')">🧠 Memory</button>
      <button class="btn" style="background: rgba(255,255,255,0.06); font-size: 0.75rem; padding: 0.3rem 0.6rem;" onclick="fillPreset('@modelcontextprotocol/server-fetch', 'Official Fetch MCP', 'network')">🌐 Web Fetch</button>
      <button class="btn" style="background: rgba(255,255,255,0.06); font-size: 0.75rem; padding: 0.3rem 0.6rem;" onclick="fillPreset('@modelcontextprotocol/server-filesystem', 'Official Filesystem MCP', 'system')">📁 Filesystem</button>
      <button class="btn" style="background: rgba(255,255,255,0.06); font-size: 0.75rem; padding: 0.3rem 0.6rem;" onclick="fillPreset('@modelcontextprotocol/server-postgres', 'Official Postgres MCP', 'database')">🐘 PostgreSQL</button>
      <button class="btn" style="background: rgba(255,255,255,0.06); font-size: 0.75rem; padding: 0.3rem 0.6rem;" onclick="fillPreset('https://mcp.render.com/mcp', 'Render Cloud MCP', 'cloud')">☁️ Render Cloud</button>
    </div>

    <form id="add-server-form" onsubmit="submitAddServer(event)" style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 0.75rem; align-items: end;">
      <div>
        <label style="display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.25rem;">Server Link / Remote SSE URL / Package</label>
        <input type="text" id="new-server-link" class="search-input" style="margin-bottom: 0;" placeholder="e.g. https://mcp.notion.com/sse or npx -y @modelcontextprotocol/server-memory" required>
      </div>
      <div>
        <label style="display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.25rem;">Friendly Name (Optional)</label>
        <input type="text" id="new-server-name" class="search-input" style="margin-bottom: 0;" placeholder="e.g. Notion Workspace">
      </div>
      <div>
        <label style="display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.25rem;">Auth Token / API Key (Optional)</label>
        <input type="password" id="new-server-token" class="search-input" style="margin-bottom: 0;" placeholder="Bearer token">
      </div>
      <div>
        <button type="submit" id="add-btn" class="btn" style="height: 42px; display: flex; align-items: center; gap: 0.5rem;">
          ⚡ Connect & Add
        </button>
      </div>
    </form>
    <div id="add-status" style="margin-top: 0.75rem; font-size: 0.85rem; display: none;"></div>
  </div>

  <!-- Endpoints & One-Click Config -->
  <div class="card" style="margin-bottom: 2rem;">
    <h2>🔌 Client Connection Hub (Single Endpoint)</h2>
    <p>Configure any AI platform (Claude Desktop, Cursor, VS Code, ChatGPT Developer Mode, Vibe) using the single gateway endpoint below.</p>
    
    <div class="tabs">
      <button class="tab active" onclick="showConfig('claude')">Claude Desktop</button>
      <button class="tab" onclick="showConfig('cursor')">Cursor</button>
      <button class="tab" onclick="showConfig('vscode')">VS Code</button>
      <button class="tab" onclick="showConfig('chatgpt')">ChatGPT (Dev Mode)</button>
    </div>

    <div id="config-content" class="code-box">
      <button class="copy-btn" onclick="copyConfig()">Copy</button>
      <pre id="config-code">// Loading...</pre>
    </div>
  </div>

  <!-- Tool Explorer & Live Search -->
  <div class="card">
    <h2>🛠️ Aggregated Tool Catalog (${tools.length} Tools)</h2>
    <p>All tools feature explicit <code>readOnlyHint</code> annotations for zero-approval execution in ChatGPT & Claude, plus <code>search</code> and <code>fetch</code> ChatGPT Connectors standard.</p>
    <input type="text" id="tool-search" class="search-input" placeholder="🔍 Search all aggregated tools by keyword, intent, or server..." onkeyup="filterTools()">
    
    <div class="tool-list" id="tools-container">
      ${tools
        .map(
          (t) => `
        <div class="tool-item" data-search="${t.name} ${t.description} ${t.pluginId}">
          <div class="tool-info">
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <span class="tool-name">${t.originalName}</span>
              <span class="badge" style="background: rgba(255,255,255,0.08); font-size: 0.7rem;">${t.pluginId}</span>
              <span class="badge ${t.readOnly ? "badge-success" : ""}" style="font-size: 0.7rem;">${t.readOnly ? "read-only" : "action"}</span>
            </div>
            <span class="tool-desc">${t.description}</span>
          </div>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">${t.namespacedName}</span>
        </div>
      `
        )
        .join("")}
    </div>
  </div>

  <script>
    const configs = {
      claude: JSON.stringify({
        "mcpServers": {
          "unified-gateway": {
            "command": "node",
            "args": ["${process.argv[1]?.replace(/\\/g, "/") || "dist/gateway/index.js"}", "--stdio"]
          }
        }
      }, null, 2),
      cursor: JSON.stringify({
        "mcpServers": {
          "unified-gateway": {
            "url": "http://${host}/sse"
          }
        }
      }, null, 2),
      vscode: JSON.stringify({
        "mcp.servers": {
          "unified-gateway": {
            "url": "http://${host}/sse"
          }
        }
      }, null, 2),
      chatgpt: JSON.stringify({
        "developerMode": {
          "serverUrl": "http://${host}/sse",
          "transport": "sse",
          "note": "ChatGPT Developer Mode requires remote HTTPS endpoint (use ngrok or local tunnel for testing)."
        }
      }, null, 2)
    };

    function showConfig(client) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById('config-code').textContent = configs[client];
    }

    function copyConfig() {
      const code = document.getElementById('config-code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
      });
    }

    function filterTools() {
      const query = document.getElementById('tool-search').value.toLowerCase();
      const items = document.querySelectorAll('.tool-item');
      items.forEach(item => {
        const text = item.getAttribute('data-search').toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
      });
    }

    function fillPreset(link, name, cat) {
      document.getElementById('new-server-link').value = link;
      document.getElementById('new-server-name').value = name;
    }

    async function submitAddServer(e) {
      e.preventDefault();
      const link = document.getElementById('new-server-link').value.trim();
      const name = document.getElementById('new-server-name').value.trim();
      const authToken = document.getElementById('new-server-token').value.trim();
      const statusDiv = document.getElementById('add-status');
      const btn = document.getElementById('add-btn');

      if (!link) return;

      btn.disabled = true;
      btn.textContent = 'Connecting...';
      statusDiv.style.display = 'block';
      statusDiv.style.color = '#60a5fa';
      statusDiv.textContent = 'Connecting to upstream MCP server and discovering tools...';

      try {
        const res = await fetch('/api/servers/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ link, name: name || undefined, auth_token: authToken || undefined })
        });
        const data = await res.json();
        if (data.success) {
          statusDiv.style.color = '#10b981';
          statusDiv.textContent = '✅ ' + data.message + ' (' + data.toolsCount + ' tools discovered)! Reloading...';
          setTimeout(() => window.location.reload(), 1500);
        } else {
          statusDiv.style.color = '#ef4444';
          statusDiv.textContent = '❌ ' + (data.error || 'Failed to add server');
          btn.disabled = false;
          btn.textContent = '⚡ Connect & Add';
        }
      } catch (err) {
        statusDiv.style.color = '#ef4444';
        statusDiv.textContent = '❌ Network error: ' + err.message;
        btn.disabled = false;
        btn.textContent = '⚡ Connect & Add';
      }
    }

    async function removeServer(id) {
      if (!confirm('Disconnect and remove server ' + id + '?')) return;
      try {
        const res = await fetch('/api/servers/' + id, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          window.location.reload();
        } else {
          alert('Error: ' + data.error);
        }
      } catch (err) {
        alert('Failed to delete: ' + err.message);
      }
    }

    // Initialize with Claude Desktop
    document.getElementById('config-code').textContent = configs.claude;
  </script>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  });

  return app;
}
