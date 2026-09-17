import fs from "node:fs";
import path from "node:path";
import { McpPlugin, ToolMetadata, GatewayConfig } from "./types.js";
import { GoogleFlowPlugin } from "./plugins/google-flow.plugin.js";
import { TickertapePlugin } from "./plugins/tickertape.plugin.js";
import { UpstreamManager, UpstreamMcpPlugin } from "./upstream-manager.js";
import { logger } from "../utils/logger.js";

export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<string, McpPlugin> = new Map();
  private config: GatewayConfig;

  private constructor() {
    this.config = this.loadConfig();
    this.loadBuiltinPlugins();
    this.loadUpstreamPlugins();
  }

  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  private loadConfig(): GatewayConfig {
    const defaultConfig: GatewayConfig = {
      port: parseInt(process.env.GATEWAY_PORT || process.env.PORT || "8080", 10),
      host: process.env.GATEWAY_HOST || process.env.HOST || "0.0.0.0",
      toolMode: (process.env.GATEWAY_TOOL_MODE as any) || "hybrid",
      activeProfile: process.env.GATEWAY_PROFILE || "all",
      auth: {
        enabled: process.env.GATEWAY_AUTH_ENABLED === "true",
        apiKey: process.env.GATEWAY_API_KEY,
      },
      upstreams: [],
    };

    const configPaths = [
      path.resolve(process.cwd(), "mcp-gateway.config.json"),
      path.resolve(process.cwd(), "config", "mcp-gateway.config.json"),
    ];

    for (const p of configPaths) {
      if (fs.existsSync(p)) {
        try {
          const raw = fs.readFileSync(p, "utf-8");
          const parsed = JSON.parse(raw);
          logger.info(`Loaded Gateway configuration from: ${p}`);
          return { ...defaultConfig, ...parsed };
        } catch (err: any) {
          logger.warn(`Failed to parse gateway config at ${p}: ${err.message}`);
        }
      }
    }

    return defaultConfig;
  }

  private loadBuiltinPlugins(): void {
    // 1. Google Flow Creative Studio MCP Plugin
    const googleFlow = new GoogleFlowPlugin();
    this.registerPlugin(googleFlow);

    // 2. Tickertape Financial MCP Plugin
    try {
      const tickertape = new TickertapePlugin();
      this.registerPlugin(tickertape);
    } catch (err: any) {
      logger.warn(`Failed to load Tickertape plugin: ${err.message}`);
    }
  }

  private loadUpstreamPlugins(): void {
    if (!this.config.upstreams || !Array.isArray(this.config.upstreams)) {
      return;
    }

    for (const upstream of this.config.upstreams) {
      if ((upstream as any).enabled === false) {
        continue;
      }
      logger.info(`Configuring external MCP upstream: '${upstream.name}' (${upstream.transport})`);
      const transport: "sse" | "stdio" = upstream.transport === "stdio" ? "stdio" : "sse";
      const resolvedHeaders: Record<string, string> | undefined = upstream.headers
        ? Object.fromEntries(
            Object.entries(upstream.headers).map(([k, v]) => [
              k,
              v.replace(/\$\{([a-zA-Z0-9_]+)\}/g, (_, varName) => process.env[varName] || ""),
            ])
          )
        : undefined;

      const descriptor = {
        id: upstream.id,
        name: upstream.name,
        category: upstream.category || "external",
        transport: (upstream.transport as any) || transport,
        url: upstream.url,
        command: upstream.command,
        args: upstream.args,
        headers: resolvedHeaders,
        originalLink: upstream.url || `${upstream.command} ${upstream.args?.join(" ")}`,
      };
      const upstreamPlugin = new UpstreamMcpPlugin(descriptor as any);
      this.registerPlugin(upstreamPlugin);

      // Asynchronously connect to upstream to discover tools on startup
      upstreamPlugin.connect().catch((err: any) => {
        logger.warn(`Could not connect immediately to upstream [${upstream.id}], will retry on-demand: ${err.message}`);
      });
    }
  }

  public async addUpstreamFromLink(
    link: string,
    options?: { name?: string; category?: string; headers?: Record<string, string> }
  ): Promise<{ plugin: UpstreamMcpPlugin; tools: ToolMetadata[] }> {
    const manager = UpstreamManager.getInstance();
    const result = await manager.addFromLink(link, options);
    this.registerPlugin(result.plugin);
    return result;
  }

  public removeUpstream(id: string): boolean {
    const manager = UpstreamManager.getInstance();
    manager.removeUpstream(id);
    return this.plugins.delete(id);
  }

  public registerPlugin(plugin: McpPlugin): void {
    logger.info(`Registering MCP Plugin: [${plugin.id}] "${plugin.name}" v${plugin.version}`);
    this.plugins.set(plugin.id, plugin);
  }

  public getPlugin(id: string): McpPlugin | undefined {
    return this.plugins.get(id);
  }

  public getAllPlugins(): McpPlugin[] {
    return Array.from(this.plugins.values());
  }

  public getActivePlugins(profile?: string): McpPlugin[] {
    const targetProfile = profile || this.config.activeProfile;
    if (!targetProfile || targetProfile === "all") {
      return this.getAllPlugins();
    }

    return this.getAllPlugins().filter((p) => {
      if (targetProfile === "creative" && p.category === "creative") return true;
      if (targetProfile === "finance" && p.category === "finance") return true;
      return p.category === targetProfile || p.tags.includes(targetProfile);
    });
  }

  public getAllTools(profile?: string): ToolMetadata[] {
    const plugins = this.getActivePlugins(profile);
    const tools: ToolMetadata[] = [];
    for (const p of plugins) {
      tools.push(...p.getTools());
    }
    return tools;
  }

  public getConfig(): GatewayConfig {
    return this.config;
  }

  public async healthCheckAll(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    uptime: number;
    plugins: Record<string, { status: string; message?: string; details?: any }>;
  }> {
    const results: Record<string, any> = {};
    let hasDegraded = false;
    let hasUnhealthy = false;

    for (const [id, plugin] of this.plugins.entries()) {
      if (plugin.healthCheck) {
        try {
          const res = await plugin.healthCheck();
          results[id] = res;
          if (res.status === "degraded") hasDegraded = true;
          if (res.status === "unhealthy") hasUnhealthy = true;
        } catch (err: any) {
          results[id] = { status: "unhealthy", message: err.message };
          hasUnhealthy = true;
        }
      } else {
        results[id] = { status: "healthy", message: "Ready" };
      }
    }

    const overallStatus = hasUnhealthy ? "unhealthy" : hasDegraded ? "degraded" : "healthy";
    return {
      status: overallStatus,
      uptime: process.uptime(),
      plugins: results,
    };
  }
}
