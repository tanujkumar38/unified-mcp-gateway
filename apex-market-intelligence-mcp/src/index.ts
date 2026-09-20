import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerApexTools } from "./tools.js";

dotenv.config();

export function createApexServer(): McpServer {
  const server = new McpServer({
    name: "apex-market-intelligence",
    version: "1.2.0",
  });
  registerApexTools(server);
  return server;
}

// Determine transport mode: stdio (default) or HTTP
const isHttpMode =
  process.argv.includes("--http") ||
  process.env.MCP_TRANSPORT === "http" ||
  Boolean(process.env.RENDER || process.env.PORT);

if (isHttpMode) {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8088;
  const activeSseTransports = new Map<string, SSEServerTransport>();

  app.use(express.json({ limit: "25mb" }));

  // Global CORS Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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

  // 1. Health Check
  app.get("/health", (req: Request, res: Response) => {
    res.json({
      status: "healthy",
      server: "apex-market-intelligence",
      version: "1.2.0",
      transport: "http",
      uptime: process.uptime(),
      toolsCount: 25,
      activeSseSessions: activeSseTransports.size,
      endpoints: {
        health: "/health",
        sse: "/sse",
        messages: "/message?sessionId=<id>",
        streamableHttp: "/mcp",
      },
    });
  });

  // 2. Streamable HTTP Transport (Claude.ai Custom Connectors & Modern Web Agents)
  const streamableTransport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });
  const streamableServer = createApexServer();
  streamableServer.connect(streamableTransport).catch((err) => {
    console.error(`[Apex-MCP] Failed to connect Streamable HTTP transport: ${err.message}`);
  });

  const handleStreamableRequest = async (req: Request, res: Response) => {
    try {
      await streamableTransport.handleRequest(req, res, req.body);
    } catch (err: any) {
      console.error(`[Apex-MCP] Streamable HTTP request error: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({ error: "Streamable HTTP error", message: err.message });
      }
    }
  };

  app.all("/mcp", handleStreamableRequest);

  // 3. SSE Transport (Cursor, Windsurf, Claude Desktop remote SSE)
  app.get("/sse", async (req: Request, res: Response) => {
    try {
      console.error("[Apex-MCP] New SSE client connection initiating...");
      const server = createApexServer();
      const transport = new SSEServerTransport("/message", res);
      const sessionId = transport.sessionId;
      activeSseTransports.set(sessionId, transport);

      res.on("close", () => {
        console.error(`[Apex-MCP] SSE session closed: ${sessionId}`);
        activeSseTransports.delete(sessionId);
      });

      await server.connect(transport);
      console.error(`[Apex-MCP] SSE session established: ${sessionId}`);
    } catch (err: any) {
      console.error(`[Apex-MCP] Error initiating SSE connection: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to establish SSE session", message: err.message });
      }
    }
  });

  app.post("/message", async (req: Request, res: Response) => {
    try {
      const sessionId = req.query.sessionId as string;
      const transport = sessionId
        ? activeSseTransports.get(sessionId)
        : activeSseTransports.values().next().value;

      if (!transport) {
        res.status(404).json({ error: "SSE session not found or expired" });
        return;
      }

      await transport.handlePostMessage(req, res, req.body);
    } catch (err: any) {
      console.error(`[Apex-MCP] Error processing message POST: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to process message", message: err.message });
      }
    }
  });

  // Root endpoint info
  app.get("/", (req: Request, res: Response) => {
    res.json({
      name: "Apex Market Intelligence MCP Cloud Service",
      description: "Autonomous Hyper-Local B2B Market Research & Commercial Feasibility Agent",
      version: "1.1.0",
      status: "operational",
      toolsCount: 17,
      connect: {
        sseUrl: `${req.protocol}://${req.get("host")}/sse`,
        streamableHttpUrl: `${req.protocol}://${req.get("host")}/mcp`,
        healthCheck: `${req.protocol}://${req.get("host")}/health`,
      },
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.error(`[Apex-MCP] Cloud Server listening on http://0.0.0.0:${PORT}`);
    console.error(`[Apex-MCP] Endpoints: /health, /sse, /message, /mcp`);
  });
} else {
  // Stdio Mode: STRICT STDERR HYGIENE
  console.error("[Apex-MCP] Starting Apex Market Intelligence MCP Server over Stdio...");
  const server = createApexServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[Apex-MCP] Stdio transport connected and ready for JSON-RPC 2.0 requests.");
}
