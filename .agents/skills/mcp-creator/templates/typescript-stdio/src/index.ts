#!/usr/bin/env node

/**
 * Production-Grade Model Context Protocol (MCP) Server
 * Transport: Stdio (1:1 local subprocess)
 * 
 * CRITICAL RULE: In stdio mode, STDOUT is reserved exclusively for JSON-RPC messages.
 * NEVER use console.log(). All diagnostic and audit logs MUST go to STDERR (console.error).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as dotenv from "dotenv";

// Load environment variables for local testing
dotenv.config();

// Create the MCP Server instance
const server = new McpServer(
  {
    name: "production-stdio-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// ---------------------------------------------------------------------------
// 1. TOOLS (Executable Functions)
// ---------------------------------------------------------------------------

/**
 * Example Tool: Calculate / Perform an action
 */
server.tool(
  "calculate_metric",
  "Performs a verified calculation or data lookup",
  {
    value: z.coerce.number().describe("Base numerical value to process"),
    multiplier: z.coerce.number().default(1).describe("Multiplier coefficient"),
    label: z.string().min(1).max(100).optional().describe("Optional identifier tag"),
  },
  {
    title: "Calculate Metric",
    readOnlyHint: true,     // Does not mutate external system state
    idempotentHint: true,   // Identical inputs yield identical outputs
  },
  async ({ value, multiplier, label }) => {
    try {
      console.error(`[STDERR LOG] Executing calculate_metric: value=${value}, mult=${multiplier}`);

      const result = value * multiplier;
      const responseText = JSON.stringify({
        status: "success",
        label: label || "unlabeled",
        calculatedValue: result,
        timestamp: new Date().toISOString(),
      }, null, 2);

      return {
        content: [{ type: "text", text: responseText }],
      };
    } catch (error: any) {
      console.error(`[STDERR LOG] calculate_metric error:`, error);
      return {
        content: [{ type: "text", text: `Error calculating metric: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// 2. RESOURCES (Contextual Data Reading)
// ---------------------------------------------------------------------------

/**
 * Static Resource: Server Status & Metadata
 */
server.resource(
  "server_status",
  "system://status",
  { mimeType: "application/json" },
  async () => {
    console.error("[STDERR LOG] Reading system://status resource");
    return {
      contents: [
        {
          uri: "system://status",
          mimeType: "application/json",
          text: JSON.stringify({
            status: "healthy",
            uptime: process.uptime(),
            nodeVersion: process.version,
          }),
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// 3. PROMPTS (Workflow Blueprints)
// ---------------------------------------------------------------------------

server.prompt(
  "analyze_metrics",
  "Standard prompt for analyzing system metrics",
  {
    metricName: z.string().describe("Target metric to evaluate"),
  },
  ({ metricName }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please analyze the system metric '${metricName}' using the calculate_metric tool and summarize any anomalies.`,
        },
      },
    ],
  })
);

// ---------------------------------------------------------------------------
// 4. TRANSPORT CONNECTION & STARTUP
// ---------------------------------------------------------------------------

async function main() {
  console.error("[STDERR LOG] Initializing StdioServerTransport...");
  const transport = new StdioServerTransport();

  // Connect server to stdio transport
  await server.connect(transport);
  console.error("[STDERR LOG] MCP Server running cleanly on stdio.");
}

main().catch((error) => {
  console.error("[STDERR LOG] Fatal server initialization error:", error);
  process.exit(1);
});
