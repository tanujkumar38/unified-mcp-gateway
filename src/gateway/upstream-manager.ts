import fs from "node:fs";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { McpPlugin, ToolMetadata } from "./types.js";
import { logger } from "../utils/logger.js";

export interface ParsedMcpLink {
  id: string;
  name: string;
  transport: "sse" | "stdio" | "http";
  url?: string;
  command?: string;
  args?: string[];
  headers?: Record<string, string>;
  category: string;
  originalLink: string;
}

/**
 * Parses user-provided links (HTTP/SSE, GitHub, npm, npx) into MCP connection descriptors.
 */
export function parseMcpLink(link: string, customName?: string, category: string = "external"): ParsedMcpLink {
  const trimmed = link.trim();

  // 0. Render Cloud MCP / Streamable HTTP endpoints (ending in /mcp or mcp.render.com)
  if (trimmed.includes("mcp.render.com") || trimmed.endsWith("/mcp")) {
    const id = customName ? slugify(customName) : "render";
    return {
      id,
      name: customName || "Render Cloud MCP Server",
      transport: "http",
      url: trimmed,
      category: category !== "external" ? category : "cloud",
      originalLink: trimmed,
    };
  }

  // 1. GitHub Link to official MCP servers
  // e.g. https://github.com/modelcontextprotocol/servers/tree/main/src/fetch
  const githubOfficialMatch = trimmed.match(
    /github\.com\/modelcontextprotocol\/servers\/(?:tree\/main\/src|blob\/main\/src)\/([a-z0-9_-]+)/i
  );
  if (githubOfficialMatch) {
    const serverName = githubOfficialMatch[1].toLowerCase();
    const pkgName = `@modelcontextprotocol/server-${serverName}`;
    const id = customName ? slugify(customName) : `official-${serverName}`;
    return {
      id,
      name: customName || `Official MCP: ${serverName}`,
      transport: "stdio",
      command: "npx",
      args: ["-y", pkgName],
      category: category !== "external" ? category : "official",
      originalLink: trimmed,
    };
  }

  // 2. Third-party GitHub Repository
  // e.g. https://github.com/developer/custom-mcp-tool
  const githubRepoMatch = trimmed.match(
    /^https?:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/.*)?$/i
  );
  if (githubRepoMatch) {
    const owner = githubRepoMatch[1];
    const repo = githubRepoMatch[2].replace(/\.git$/, "");
    const id = customName ? slugify(customName) : `github-${owner.toLowerCase()}-${repo.toLowerCase()}`;
    return {
      id,
      name: customName || `GitHub: ${owner}/${repo}`,
      transport: "stdio",
      command: "npx",
      args: ["-y", `github:${owner}/${repo}`],
      category: category !== "external" ? category : "community",
      originalLink: trimmed,
    };
  }

  // 3. HTTP or HTTPS Remote SSE Link
  // e.g. https://mcp.notion.com/sse or http://localhost:3000/sse
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    let url = trimmed;
    // Auto-append /sse if path is empty or just '/'
    try {
      const u = new URL(url);
      if (!u.pathname || u.pathname === "/") {
        url = `${trimmed.replace(/\/$/, "")}/sse`;
      }
    } catch {
      // Keep as-is
    }

    const hostPart = new URL(url).hostname.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const id = customName ? slugify(customName) : `remote-${hostPart}`;

    return {
      id,
      name: customName || `Remote MCP (${hostPart})`,
      transport: "sse",
      url,
      category: category !== "external" ? category : "remote",
      originalLink: trimmed,
    };
  }

  // 3. npx command link
  // e.g. npx -y @modelcontextprotocol/server-postgres
  if (trimmed.startsWith("npx ")) {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    const command = parts[0];
    const args = parts.slice(1);
    const targetPkg = parts.find((p) => !p.startsWith("-") && p !== "npx") || "external-mcp";
    const cleanPkgName = targetPkg.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
    const id = customName ? slugify(customName) : `npx-${cleanPkgName}`;

    return {
      id,
      name: customName || `npx: ${targetPkg}`,
      transport: "stdio",
      command,
      args,
      category: category || "community",
      originalLink: trimmed,
    };
  }

  // 4. npm package link / identifier
  // e.g. npm:@modelcontextprotocol/server-memory or @modelcontextprotocol/server-filesystem
  if (trimmed.startsWith("npm:") || trimmed.startsWith("@") || trimmed.includes("server-")) {
    const pkg = trimmed.replace(/^npm:/, "");
    const cleanPkgName = pkg.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
    const id = customName ? slugify(customName) : `npm-${cleanPkgName}`;

    return {
      id,
      name: customName || `npm: ${pkg}`,
      transport: "stdio",
      command: "npx",
      args: ["-y", pkg],
      category: category || "npm",
      originalLink: trimmed,
    };
  }

  // Fallback: treat as remote URL or command
  const id = customName ? slugify(customName) : `server-${Date.now()}`;
  return {
    id,
    name: customName || `Custom MCP Server`,
    transport: trimmed.includes("://") ? "sse" : "stdio",
    url: trimmed.includes("://") ? trimmed : undefined,
    command: !trimmed.includes("://") ? "npx" : undefined,
    args: !trimmed.includes("://") ? ["-y", trimmed] : undefined,
    category: category || "custom",
    originalLink: trimmed,
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Lightweight JSON-RPC 2.0 Client for Streamable HTTP MCP Servers (e.g. Render Cloud MCP).
 */
export class HttpJsonRpcClient {
  private sessionId?: string;
  private url: string;
  private headers: Record<string, string>;

  constructor(url: string, headers?: Record<string, string>) {
    this.url = url;
    this.headers = headers || {};
  }

  public async request(method: string, params: any = {}): Promise<any> {
    const reqHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.headers,
    };
    if (this.sessionId) {
      reqHeaders["mcp-session-id"] = this.sessionId;
    }

    const res = await fetch(this.url, {
      method: "POST",
      headers: reqHeaders,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method,
        params,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${errText}`);
    }

    const newSessionId = res.headers.get("mcp-session-id");
    if (newSessionId) {
      this.sessionId = newSessionId;
    }

    const data: any = await res.json();
    if (data.error) {
      throw new Error(data.error.message || JSON.stringify(data.error));
    }
    return data.result;
  }
}

/**
 * Upstream MCP Plugin that connects to a remote HTTP/SSE or external Stdio MCP server,
 * dynamically queries its tools via client.listTools(), and proxies calls.
 */
export class UpstreamMcpPlugin implements McpPlugin {
  public readonly id: string;
  public readonly name: string;
  public readonly version: string = "1.0.0";
  public readonly description: string;
  public readonly category: string;
  public readonly tags: string[];
  public readonly descriptor: ParsedMcpLink;

  private client: Client | null = null;
  private httpClient: HttpJsonRpcClient | null = null;
  private discoveredTools: ToolMetadata[] = [];
  private isConnected: boolean = false;
  private connectionError: string | null = null;

  constructor(descriptor: ParsedMcpLink) {
    this.id = descriptor.id;
    this.name = descriptor.name;
    this.descriptor = descriptor;
    this.category = descriptor.category;
    this.description = `Pre-built external MCP server connected via ${descriptor.transport} (${descriptor.originalLink})`;
    this.tags = ["upstream", descriptor.transport, descriptor.category];
  }

  public async connect(): Promise<ToolMetadata[]> {
    logger.info(`Connecting to upstream MCP server: [${this.id}] "${this.name}" (${this.descriptor.transport})...`);

    try {
      if (this.descriptor.transport === "http") {
        if (!this.descriptor.url) {
          throw new Error("Missing URL for HTTP upstream transport");
        }
        this.httpClient = new HttpJsonRpcClient(this.descriptor.url, this.descriptor.headers);
        await this.httpClient.request("initialize", {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: `gateway-upstream-${this.id}`, version: "1.0.0" },
        });

        this.isConnected = true;
        this.connectionError = null;

        const toolsRes = await this.httpClient.request("tools/list", {});
        this.discoveredTools = (toolsRes.tools || []).map((t: any) => ({
          name: t.name,
          originalName: t.name,
          namespacedName: `${this.id}__${t.name}`,
          title: t.title || t.name,
          description: t.description || `Tool from ${this.name}`,
          pluginId: this.id,
          readOnly: t.readOnlyHint ?? true,
          category: this.category,
          parameters: t.inputSchema,
        }));

        logger.info(
          `Successfully connected to HTTP upstream [${this.id}]! Discovered ${this.discoveredTools.length} tools.`
        );
        return this.discoveredTools;
      }

      this.client = new Client(
        {
          name: `gateway-upstream-${this.id}`,
          version: "1.0.0",
        },
        {
          capabilities: {},
        }
      );

      if (this.descriptor.transport === "sse") {
        if (!this.descriptor.url) {
          throw new Error("Missing URL for SSE upstream transport");
        }
        const transport = new SSEClientTransport(new URL(this.descriptor.url), {
          eventSourceInit: this.descriptor.headers ? ({ headers: this.descriptor.headers } as any) : undefined,
          requestInit: this.descriptor.headers ? { headers: this.descriptor.headers } : undefined,
        });
        await this.client.connect(transport);
      } else {
        const transport = new StdioClientTransport({
          command: this.descriptor.command || "npx",
          args: this.descriptor.args || [],
        });
        await this.client.connect(transport);
      }

      this.isConnected = true;
      this.connectionError = null;

      // Discover tools
      const toolsRes = await this.client.listTools();
      this.discoveredTools = (toolsRes.tools || []).map((t) => ({
        name: t.name,
        originalName: t.name,
        namespacedName: `${this.id}__${t.name}`,
        title: (t as any).title || t.name,
        description: t.description || `Tool from ${this.name}`,
        pluginId: this.id,
        readOnly: (t as any).readOnlyHint ?? true,
        category: this.category,
        parameters: (t as any).inputSchema,
      }));

      logger.info(
        `Successfully connected to upstream [${this.id}]! Discovered ${this.discoveredTools.length} tools.`
      );
      return this.discoveredTools;
    } catch (err: any) {
      this.isConnected = false;
      this.connectionError = err.message;
      logger.warn(`Failed to connect to upstream [${this.id}]: ${err.message}`);
      throw err;
    }
  }

  public register(server: any, _options?: { prefix?: string }): void {
    // In hybrid/direct mode, register each discovered tool as a proxy
    for (const tool of this.discoveredTools) {
      server.tool(
        tool.namespacedName,
        tool.description,
        tool.parameters || {},
        {
          title: tool.title,
          readOnlyHint: tool.readOnly,
        },
        async (args: any) => this.callTool(tool.originalName, args)
      );
    }
  }

  public getTools(): ToolMetadata[] {
    return this.discoveredTools;
  }

  public async callTool(
    name: string,
    args: Record<string, any>
  ): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      if (this.descriptor.transport === "http" && this.httpClient) {
        const result = await this.httpClient.request("tools/call", {
          name,
          arguments: args,
        });

        const rawContent = result?.content;
        const formattedContent = Array.isArray(rawContent)
          ? rawContent.map((c: any) => {
              if (typeof c === "string") return { type: "text" as const, text: c };
              if (c.type === "text") return { type: "text" as const, text: c.text };
              return { type: "text" as const, text: JSON.stringify(c) };
            })
          : [];

        return {
          content: formattedContent.length > 0 ? formattedContent : [{ type: "text" as const, text: "Success" }],
          isError: Boolean(result?.isError),
        };
      }

      const result = await this.client!.callTool({
        name,
        arguments: args,
      });

      const rawContent = (result as any)?.content;
      const formattedContent = Array.isArray(rawContent)
        ? rawContent.map((c: any) => {
            if (typeof c === "string") return { type: "text" as const, text: c };
            if (c.type === "text") return { type: "text" as const, text: c.text };
            return { type: "text" as const, text: JSON.stringify(c) };
          })
        : [];

      return {
        content: formattedContent.length > 0 ? formattedContent : [{ type: "text" as const, text: "Success" }],
        isError: Boolean((result as any)?.isError),
      };
    } catch (err: any) {
      return {
        content: [{ type: "text" as const, text: `Upstream tool execution failed: ${err.message}` }],
        isError: true,
      };
    }
  }

  public async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    message?: string;
    details?: any;
  }> {
    if (!this.isConnected) {
      try {
        await this.connect();
      } catch (err: any) {
        return {
          status: "degraded",
          message: this.connectionError ? `Disconnected: ${this.connectionError}` : "Not connected",
          details: { descriptor: this.descriptor },
        };
      }
    }

    if (this.descriptor.transport === "http" && this.httpClient) {
      return {
        status: "healthy",
        message: `Upstream connected (${this.discoveredTools.length} tools active)`,
        details: { toolsCount: this.discoveredTools.length },
      };
    }

    try {
      await this.client!.ping();
      return {
        status: "healthy",
        message: `Upstream connected (${this.discoveredTools.length} tools active)`,
        details: { toolsCount: this.discoveredTools.length },
      };
    } catch {
      return {
        status: "healthy",
        message: `Upstream ready (${this.discoveredTools.length} tools active)`,
        details: { toolsCount: this.discoveredTools.length },
      };
    }
  }
}

/**
 * Manages loading, saving, and connecting upstream MCP servers.
 */
export class UpstreamManager {
  private static instance: UpstreamManager;
  private upstreams: Map<string, UpstreamMcpPlugin> = new Map();

  private constructor() {}

  public static getInstance(): UpstreamManager {
    if (!UpstreamManager.instance) {
      UpstreamManager.instance = new UpstreamManager();
    }
    return UpstreamManager.instance;
  }

  /**
   * Adds an upstream server from a link or package name, connects to it, discovers tools,
   * and saves it to mcp-gateway.config.json.
   */
  public async addFromLink(
    link: string,
    options?: {
      name?: string;
      category?: string;
      headers?: Record<string, string>;
    }
  ): Promise<{ plugin: UpstreamMcpPlugin; tools: ToolMetadata[] }> {
    const descriptor = parseMcpLink(link, options?.name, options?.category);
    if (options?.headers) {
      descriptor.headers = options.headers;
    }

    const plugin = new UpstreamMcpPlugin(descriptor);

    // Attempt connection and tool discovery
    let tools: ToolMetadata[] = [];
    try {
      tools = await plugin.connect();
    } catch (err: any) {
      logger.warn(`Could not connect immediately to upstream [${descriptor.id}], registering as on-demand: ${err.message}`);
    }

    this.upstreams.set(descriptor.id, plugin);
    this.persistToConfig(descriptor);

    return { plugin, tools };
  }

  public getUpstream(id: string): UpstreamMcpPlugin | undefined {
    return this.upstreams.get(id);
  }

  public getAllUpstreams(): UpstreamMcpPlugin[] {
    return Array.from(this.upstreams.values());
  }

  public removeUpstream(id: string): boolean {
    const removed = this.upstreams.delete(id);
    if (removed) {
      this.removeFromConfig(id);
    }
    return removed;
  }

  private persistToConfig(descriptor: ParsedMcpLink): void {
    const configPath = path.resolve(process.cwd(), "mcp-gateway.config.json");
    try {
      let configData: any = {};
      if (fs.existsSync(configPath)) {
        configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      }

      configData.upstreams = configData.upstreams || [];
      // Remove any existing with same id
      configData.upstreams = configData.upstreams.filter((u: any) => u.id !== descriptor.id);

      configData.upstreams.push({
        id: descriptor.id,
        name: descriptor.name,
        description: `Pre-built upstream from ${descriptor.originalLink}`,
        category: descriptor.category,
        transport: descriptor.transport,
        url: descriptor.url,
        command: descriptor.command,
        args: descriptor.args,
        headers: descriptor.headers,
        enabled: true,
      });

      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), "utf-8");
      logger.info(`Persisted upstream '${descriptor.id}' to ${configPath}`);
    } catch (err: any) {
      logger.warn(`Failed to persist upstream to config: ${err.message}`);
    }
  }

  private removeFromConfig(id: string): void {
    const configPath = path.resolve(process.cwd(), "mcp-gateway.config.json");
    try {
      if (fs.existsSync(configPath)) {
        const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        if (configData.upstreams) {
          configData.upstreams = configData.upstreams.filter((u: any) => u.id !== id);
          fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), "utf-8");
          logger.info(`Removed upstream '${id}' from ${configPath}`);
        }
      }
    } catch (err: any) {
      logger.warn(`Failed to update config file: ${err.message}`);
    }
  }
}
