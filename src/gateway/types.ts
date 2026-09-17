import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Tool metadata summary for the Gateway registry and discovery.
 */
export interface ToolMetadata {
  name: string;
  originalName: string;
  namespacedName: string;
  title?: string;
  description: string;
  pluginId: string;
  readOnly: boolean;
  category: string;
  parameters?: Record<string, any>;
}

/**
 * Interface for all plugins in the Unified MCP Gateway Hub.
 * Any new MCP server created in the future can implement this interface.
 */
export interface McpPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  tags: string[];

  /**
   * Registers tools, resources, and prompts onto the given McpServer.
   * If prefix is provided, tools should be namespaced (e.g. `prefix__toolName`).
   */
  register(server: McpServer, options?: { prefix?: string }): Promise<void> | void;

  /**
   * Returns list of tools provided by this plugin for indexing and schema discovery.
   */
  getTools(): ToolMetadata[];

  /**
   * Executes a tool directly by name with arguments.
   */
  callTool?(name: string, args: Record<string, any>): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }>;

  /**
   * Health check callback.
   */
  healthCheck?(): Promise<{ status: "healthy" | "degraded" | "unhealthy"; message?: string; details?: any }>;
}

/**
 * Gateway configuration schema
 */
export interface GatewayConfig {
  port: number;
  host: string;
  toolMode: "hybrid" | "meta" | "direct";
  activeProfile: string; // "all", "creative", "finance", etc.
  auth?: {
    enabled: boolean;
    apiKey?: string;
  };
  upstreams?: Array<{
    id: string;
    name: string;
    description: string;
    category?: string;
    transport: "stdio" | "http" | "sse";
    command?: string;
    args?: string[];
    url?: string;
    headers?: Record<string, string>;
  }>;
}
