#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import { registerAllTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";

/**
 * Creates and configures the Google Flow McpServer instance.
 */
export function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: "google-flow-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: { listChanged: false },
        resources: { listChanged: false, subscribe: false },
        prompts: { listChanged: false },
      },
    }
  );

  registerAllTools(server);
  registerResources(server);
  registerPrompts(server);

  return server;
}

import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

// Active SSE transport sessions by sessionId
const activeTransports = new Map<string, SSEServerTransport>();

async function main() {
  logger.info("Initializing Google Flow MCP Server v1.0.0 (Zero-Ban No-API Edition)...");

  // Determine transport mode from CLI arguments or environment variables
  const isHttpMode =
    config.enableHttpTransport ||
    process.argv.includes("--http") ||
    process.env.MCP_TRANSPORT === "sse" ||
    process.env.MCP_TRANSPORT === "http";

  const port = (() => {
    const portArgIdx = process.argv.indexOf("--port");
    if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
      return parseInt(process.argv[portArgIdx + 1], 10);
    }
    return config.httpPort;
  })();

  if (isHttpMode) {
    logger.info(`Starting Streamable HTTP/SSE transport on ${config.httpHost}:${port}...`);
    const app = express();
    app.use(express.json({ limit: "50mb" }));

    // Global CORS configuration for ChatGPT, Claude Web, and remote agents
    app.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-session-id");
      if (req.method === "OPTIONS") {
        res.sendStatus(204);
        return;
      }
      next();
    });

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        service: "google-flow-mcp-server",
        version: "1.0.0",
        transport: "sse",
        activeSessions: activeTransports.size,
        timestamp: new Date().toISOString(),
      });
    });

    // MCP SSE initiation endpoint (Claude API, ChatGPT Developer Mode, remote clients)
    app.get("/sse", async (req, res) => {
      logger.info("New SSE client connection initiating...");
      const server = createMcpServer();
      const transport = new SSEServerTransport("/messages", res);
      const sessionId = transport.sessionId;
      activeTransports.set(sessionId, transport);

      res.on("close", () => {
        logger.info(`SSE client session closed: ${sessionId}`);
        activeTransports.delete(sessionId);
      });

      await server.connect(transport);
      logger.info(`Google Flow MCP Server bound to SSE session: ${sessionId}`);
    });

    // MCP POST message endpoint for active SSE sessions
    app.post("/messages", async (req, res) => {
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

      await transport.handlePostMessage(req, res);
    });

    // Direct /mcp endpoint guidance
    app.all("/mcp", (req, res) => {
      res.json({
        service: "google-flow-mcp-server",
        status: "active",
        endpoints: {
          sse: `http://${config.httpHost}:${port}/sse`,
          messages: `http://${config.httpHost}:${port}/messages?sessionId=<SESSION_ID>`,
          health: `http://${config.httpHost}:${port}/health`,
        },
        chatgpt_configuration: {
          transport: "sse",
          url: `http://${config.httpHost}:${port}/sse`,
          note: "In ChatGPT Developer Mode, enter the /sse endpoint URL.",
        },
      });
    });

    app.listen(port, config.httpHost, () => {
      logger.info(`Google Flow MCP Server running on http://${config.httpHost}:${port}`);
      logger.info(`  • SSE endpoint:      http://${config.httpHost}:${port}/sse`);
      logger.info(`  • Messages endpoint: http://${config.httpHost}:${port}/messages`);
      logger.info(`  • Health check:      http://${config.httpHost}:${port}/health`);
    });
  } else {
    // Default: Stdio Transport (Claude Desktop, Cursor, VS Code, Windsurf)
    const server = createMcpServer();
    logger.info("Connecting StdioServerTransport (all diagnostic logs routed to stderr)...");
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info("Google Flow MCP Server successfully connected and listening on stdio.");
  }
}

// Graceful process termination
process.on("SIGINT", () => {
  logger.info("Received SIGINT. Shutting down Google Flow MCP server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Received SIGTERM. Shutting down Google Flow MCP server...");
  process.exit(0);
});

// Run directly if this module is the entry point
const currentFilePath = fileURLToPath(import.meta.url);
const isEntryPoint =
  process.argv[1] &&
  path.resolve(process.argv[1]).toLowerCase() === path.resolve(currentFilePath).toLowerCase();

if (isEntryPoint) {
  main().catch((err) => {
    logger.error("Fatal error during Google Flow MCP server startup:", err);
    process.exit(1);
  });
}
