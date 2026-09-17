#!/usr/bin/env node

/**
 * Unified MCP Gateway Hub - Main Entry Point
 * Single Accessible Endpoint aggregating Google Flow, Tickertape & future MCPs.
 * 
 * Supports:
 * - Streamable HTTP/SSE transport (Claude API, ChatGPT Developer Mode, Vibe)
 * - Stdio transport (Claude Desktop, Claude Code, Cursor, VS Code)
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { PluginRegistry } from "./registry.js";
import { createGatewayMcpServer } from "./server.js";
import { createGatewayHttpApp } from "./http-server.js";
import { logger } from "../utils/logger.js";

async function main() {
  const registry = PluginRegistry.getInstance();
  const config = registry.getConfig();

  const isStdioMode =
    process.argv.includes("--stdio") ||
    process.env.MCP_TRANSPORT === "stdio";

  if (isStdioMode) {
    // -----------------------------------------------------------------------
    // Stdio Transport: 1:1 local subprocess for Claude Desktop, Cursor, VS Code
    // -----------------------------------------------------------------------
    logger.info("Initializing Unified MCP Gateway in STDIO mode...");
    const server = createGatewayMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info("Unified MCP Gateway successfully connected to stdio and listening for JSON-RPC 2.0.");
  } else {
    // -----------------------------------------------------------------------
    // HTTP/SSE Transport: Single accessible endpoint for ChatGPT Dev Mode & Web UI
    // -----------------------------------------------------------------------
    logger.info("Initializing Unified MCP Gateway in HTTP/SSE mode...");
    const app = createGatewayHttpApp();

    const port = (() => {
      if (process.env.PORT) {
        return parseInt(process.env.PORT, 10);
      }
      const portArgIdx = process.argv.indexOf("--port");
      if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
        return parseInt(process.argv[portArgIdx + 1], 10);
      }
      return config.port;
    })();

    app.listen(port, config.host, () => {
      console.log("\n==================================================================");
      console.log(`🚀 Unified MCP Gateway Hub running on http://${config.host}:${port}`);
      console.log("==================================================================");
      console.log(`  🌐 Web UI Dashboard:     http://localhost:${port}/`);
      console.log(`  📡 MCP SSE Endpoint:     http://localhost:${port}/sse`);
      console.log(`  📨 MCP Messages:         http://localhost:${port}/messages?sessionId=...`);
      console.log(`  🩺 Health & Plugins:     http://localhost:${port}/health`);
      console.log(`  🛠️  Tool Catalog API:     http://localhost:${port}/api/tools`);
      console.log("==================================================================\n");
    });
  }
}

// Graceful process termination
process.on("SIGINT", () => {
  logger.info("Received SIGINT. Shutting down Unified MCP Gateway...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Received SIGTERM. Shutting down Unified MCP Gateway...");
  process.exit(0);
});

// Run directly if this module is the entry point
const currentFilePath = fileURLToPath(import.meta.url);
const isEntryPoint =
  process.argv[1] &&
  path.resolve(process.argv[1]).toLowerCase() === path.resolve(currentFilePath).toLowerCase();

if (isEntryPoint) {
  main().catch((err) => {
    logger.error("Fatal error during Unified MCP Gateway startup:", err);
    process.exit(1);
  });
}
