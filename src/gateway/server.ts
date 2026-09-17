import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PluginRegistry } from "./registry.js";
import { registerGatewayMetaTools } from "./meta-tools.js";
import { logger } from "../utils/logger.js";

export interface CreateServerOptions {
  mode?: "hybrid" | "meta" | "direct";
  profile?: string;
}

/**
 * Creates and configures the Unified MCP Gateway Server instance.
 */
export function createGatewayMcpServer(options?: CreateServerOptions): McpServer {
  const registry = PluginRegistry.getInstance();
  const config = registry.getConfig();
  const mode = options?.mode || config.toolMode || "hybrid";
  const profile = options?.profile || config.activeProfile || "all";

  logger.info(`Initializing Unified MCP Gateway Server (Mode: ${mode}, Profile: ${profile})...`);

  const server = new McpServer(
    {
      name: "unified-mcp-gateway",
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

  // Safe tool registration wrapper to prevent duplicate tool collisions across plugins
  const originalTool = server.tool.bind(server);
  (server as any).tool = (name: string, ...args: any[]) => {
    if ((server as any)._registeredTools && (server as any)._registeredTools[name]) {
      logger.warn(`[GATEWAY] Skipping duplicate tool '${name}' to prevent namespace collision.`);
      return;
    }
    return (originalTool as any)(name, ...args);
  };

  // 1. In 'meta' or 'hybrid' mode: Register context-saving meta-tools
  if (mode === "meta" || mode === "hybrid") {
    logger.info("Registering Gateway Meta-Tools & ChatGPT Connectors (search/fetch)...");
    registerGatewayMetaTools(server, registry);
  }

  // 2. In 'direct' or 'hybrid' mode: Mount active plugins
  if (mode === "direct" || mode === "hybrid") {
    const activePlugins = registry.getActivePlugins(profile);
    for (const plugin of activePlugins) {
      logger.info(`Mounting plugin tools into Unified Gateway: [${plugin.id}] "${plugin.name}"`);
      plugin.register(server, { prefix: plugin.id });
    }
  }

  logger.info(`Unified MCP Gateway Server created successfully with mode='${mode}'`);
  return server;
}
