import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "127.0.0.1";
const AUTH_TOKEN = process.env.AUTH_BEARER_TOKEN;

// 1. Initialize MCP Server
const server = new McpServer(
  {
    name: "production-http-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Define example tool
server.tool(
  "remote_echo",
  "Echoes input text with remote server metadata",
  {
    message: z.string().min(1).describe("Message string to echo"),
  },
  {
    title: "Remote Echo",
    readOnlyHint: true,
  },
  async ({ message }) => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            echo: message,
            host: HOST,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    };
  }
);

// 2. Setup Express Web Server
const app = express();

// Security: Enable CORS with restricted origin in production
app.use(cors({
  origin: "*", // Restrict to specific origins in production
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Mcp-Session-Id"],
}));

// Optional Bearer Authentication Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!AUTH_TOKEN) return next(); // Skip if no auth token configured

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ") || authHeader.substring(7) !== AUTH_TOKEN) {
    res.status(401).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Unauthorized: Invalid or missing Bearer token" },
      id: null,
    });
    return;
  }
  next();
});

// Map to track active SSE sessions
const transports = new Map<string, SSEServerTransport>();

// SSE Endpoint for Client Connection
app.get("/sse", async (req: Request, res: Response) => {
  console.error(`[HTTP] New SSE connection request from ${req.ip}`);
  const transport = new SSEServerTransport("/messages", res);
  
  transports.set(transport.sessionId, transport);
  res.setHeader("Mcp-Session-Id", transport.sessionId);

  transport.onclose = () => {
    console.error(`[HTTP] Session closed: ${transport.sessionId}`);
    transports.delete(transport.sessionId);
  };

  await server.connect(transport);
});

// Messages Endpoint for Client POST Requests
app.post("/messages", express.json(), async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string || (req.headers["mcp-session-id"] as string);
  if (!sessionId || !transports.has(sessionId)) {
    res.status(400).send("Session not found or missing sessionId");
    return;
  }

  const transport = transports.get(sessionId)!;
  await transport.handlePostMessage(req, res);
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "healthy", activeSessions: transports.size });
});

app.listen(PORT, HOST, () => {
  console.error(`[HTTP] MCP Server listening on http://${HOST}:${PORT}`);
  console.error(`[HTTP] SSE Endpoint: http://${HOST}:${PORT}/sse`);
  console.error(`[HTTP] Health Check: http://${HOST}:${PORT}/health`);
});
