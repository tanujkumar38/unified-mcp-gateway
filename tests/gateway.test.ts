import { describe, it, expect, beforeAll, afterAll } from "vitest";
import http from "node:http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { PluginRegistry } from "../src/gateway/registry.js";
import { createGatewayMcpServer } from "../src/gateway/server.js";
import { createGatewayHttpApp } from "../src/gateway/http-server.js";
import { parseMcpLink } from "../src/gateway/upstream-manager.js";

describe("Unified MCP Gateway Hub Test Suite", () => {
  let registry: PluginRegistry;

  beforeAll(() => {
    registry = PluginRegistry.getInstance();
  });

  describe("1. Plugin Registry & Multitenancy", () => {
    it("loads both Google Flow and Tickertape built-in plugins", () => {
      const plugins = registry.getAllPlugins();
      const pluginIds = plugins.map((p) => p.id);

      expect(pluginIds).toContain("google-flow");
      expect(pluginIds).toContain("tickertape");
    });

    it("filters active plugins by profile", () => {
      const creativePlugins = registry.getActivePlugins("creative");
      expect(creativePlugins.map((p) => p.id)).toContain("google-flow");
      expect(creativePlugins.map((p) => p.id)).not.toContain("tickertape");

      const financePlugins = registry.getActivePlugins("finance");
      expect(financePlugins.map((p) => p.id)).toContain("tickertape");
      expect(financePlugins.map((p) => p.id)).not.toContain("google-flow");
    });

    it("aggregates tools with correct metadata, categories, and namespacing", () => {
      const tools = registry.getAllTools();
      expect(tools.length).toBeGreaterThanOrEqual(25);

      const flowTool = tools.find((t) => t.originalName === "google_flow_generate_video");
      expect(flowTool).toBeDefined();
      expect(flowTool?.pluginId).toBe("google-flow");
      expect(flowTool?.readOnly).toBe(false);

      const finTool = tools.find((t) => t.originalName === "get_market_mood_index");
      expect(finTool).toBeDefined();
      expect(finTool?.pluginId).toBe("tickertape");
      expect(finTool?.readOnly).toBe(true);
    });

    it("runs health checks across all plugins", async () => {
      const health = await registry.healthCheckAll();
      expect(health).toBeDefined();
      expect(["healthy", "degraded"]).toContain(health.status);
      expect(health.plugins["google-flow"]).toBeDefined();
      expect(health.plugins["tickertape"]).toBeDefined();
    });
  });

  describe("2. Server Factory & Meta-Tool Architecture (Context Optimization)", () => {
    it("initializes in meta mode with only context-saving discovery tools", async () => {
      const server = createGatewayMcpServer({ mode: "meta" });
      const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });
      const [cTransport, sTransport] = InMemoryTransport.createLinkedPair();

      await server.connect(sTransport);
      await client.connect(cTransport);

      const toolsRes = await client.listTools();
      const toolNames = toolsRes.tools.map((t) => t.name);

      // Meta mode should only have 6 core discovery & ChatGPT tools
      expect(toolNames).toContain("gateway_list_servers");
      expect(toolNames).toContain("gateway_search_tools");
      expect(toolNames).toContain("gateway_get_tool_schema");
      expect(toolNames).toContain("gateway_call_tool");
      expect(toolNames).toContain("search");
      expect(toolNames).toContain("fetch");

      // Direct tool should NOT be in context (saves context window!)
      expect(toolNames).not.toContain("google_flow_generate_video");
      expect(toolNames).not.toContain("get_market_mood_index");

      await client.close();
      await server.close();
    });

    it("executes gateway_list_servers via MCP client", async () => {
      const server = createGatewayMcpServer({ mode: "meta" });
      const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });
      const [cTransport, sTransport] = InMemoryTransport.createLinkedPair();

      await server.connect(sTransport);
      await client.connect(cTransport);

      const result = await client.callTool({
        name: "gateway_list_servers",
        arguments: {},
      });

      expect(result.content).toBeDefined();
      const text = (result.content as any)[0].text;
      const parsed = JSON.parse(text);

      expect(parsed.connectedServersCount).toBeGreaterThanOrEqual(2);
      const serverIds = parsed.servers.map((s: any) => s.id);
      expect(serverIds).toContain("google-flow");
      expect(serverIds).toContain("tickertape");

      await client.close();
      await server.close();
    });

    it("executes gateway_search_tools to discover tools dynamically", async () => {
      const server = createGatewayMcpServer({ mode: "meta" });
      const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });
      const [cTransport, sTransport] = InMemoryTransport.createLinkedPair();

      await server.connect(sTransport);
      await client.connect(cTransport);

      // Search for video tools
      const videoResult = await client.callTool({
        name: "gateway_search_tools",
        arguments: { query: "video" },
      });
      const videoParsed = JSON.parse((videoResult.content as any)[0].text);
      expect(videoParsed.totalMatches).toBeGreaterThan(0);
      expect(videoParsed.tools.some((t: any) => t.name.includes("video"))).toBe(true);

      // Search for finance tools
      const finResult = await client.callTool({
        name: "gateway_search_tools",
        arguments: { query: "sentiment" },
      });
      const finParsed = JSON.parse((finResult.content as any)[0].text);
      expect(finParsed.totalMatches).toBeGreaterThan(0);
      expect(finParsed.tools.some((t: any) => t.name === "get_market_mood_index")).toBe(true);

      await client.close();
      await server.close();
    });

    it("executes gateway_get_tool_schema on-demand", async () => {
      const server = createGatewayMcpServer({ mode: "meta" });
      const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });
      const [cTransport, sTransport] = InMemoryTransport.createLinkedPair();

      await server.connect(sTransport);
      await client.connect(cTransport);

      const schemaResult = await client.callTool({
        name: "gateway_get_tool_schema",
        arguments: { tool_name: "get_market_mood_index" },
      });
      const parsed = JSON.parse((schemaResult.content as any)[0].text);

      expect(parsed.found).toBe(true);
      expect(parsed.server).toBe("tickertape");
      expect(parsed.readOnly).toBe(true);

      await client.close();
      await server.close();
    });

    it("executes universal search and fetch across servers (ChatGPT Connectors)", async () => {
      const server = createGatewayMcpServer({ mode: "meta" });
      const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });
      const [cTransport, sTransport] = InMemoryTransport.createLinkedPair();

      await server.connect(sTransport);
      await client.connect(cTransport);

      // Universal search for camera preset
      const searchRes = await client.callTool({
        name: "search",
        arguments: { query: "dolly" },
      });
      const searchParsed = JSON.parse((searchRes.content as any)[0].text);
      expect(searchParsed.totalResults).toBeGreaterThan(0);

      // Universal fetch for camera preset
      const fetchRes = await client.callTool({
        name: "fetch",
        arguments: { id: "flow:camera:dolly_in" },
      });
      const fetchParsed = JSON.parse((fetchRes.content as any)[0].text);
      expect(fetchParsed.motion).toBeDefined();

      await client.close();
      await server.close();
    });
  });

  describe("3. HTTP Server, SSE Endpoint & Web UI Dashboard", () => {
    let testServer: http.Server;
    let baseUrl: string;

    beforeAll(async () => {
      const app = createGatewayHttpApp();
      await new Promise<void>((resolve) => {
        testServer = app.listen(0, () => {
          const addr = testServer.address() as any;
          baseUrl = `http://127.0.0.1:${addr.port}`;
          resolve();
        });
      });
    });

    afterAll(async () => {
      await new Promise<void>((resolve) => testServer.close(() => resolve()));
    });

    it("returns healthy status at /health with all connected plugins", async () => {
      const res = await fetch(`${baseUrl}/health`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as any;
      expect(body.service).toBe("unified-mcp-gateway");
      expect(body.pluginsCount).toBeGreaterThanOrEqual(2);
      expect(body.plugins["google-flow"]).toBeDefined();
      expect(body.plugins["tickertape"]).toBeDefined();
    });

    it("returns tool catalog at /api/tools", async () => {
      const res = await fetch(`${baseUrl}/api/tools`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as any;
      expect(body.totalTools).toBeGreaterThanOrEqual(25);
      expect(Array.isArray(body.tools)).toBe(true);
    });

    it("generates platform-specific client configurations at /api/config/:client", async () => {
      const claudeRes = await fetch(`${baseUrl}/api/config/claude`);
      expect(claudeRes.status).toBe(200);
      const claudeBody = (await claudeRes.json()) as any;
      expect(claudeBody.mcpServers["unified-gateway"]).toBeDefined();

      const cursorRes = await fetch(`${baseUrl}/api/config/cursor`);
      expect(cursorRes.status).toBe(200);
      const cursorBody = (await cursorRes.json()) as any;
      expect(cursorBody.mcpServers["unified-gateway"].url).toContain("/sse");

      const chatgptRes = await fetch(`${baseUrl}/api/config/chatgpt`);
      expect(chatgptRes.status).toBe(200);
      const chatgptBody = (await chatgptRes.json()) as any;
      expect(chatgptBody.transport).toBe("sse");
      expect(chatgptBody.instructions.length).toBeGreaterThan(0);
    });

    it("serves HTML Web UI Dashboard at / with dynamic server cards & add form", async () => {
      const res = await fetch(`${baseUrl}/`);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/html");

      const text = await res.text();
      expect(text).toContain("Unified MCP Gateway Hub");
      expect(text).toContain("Google Flow Professional MCP");
      expect(text).toContain("Tickertape Financial MCP");
      expect(text).toContain("Connect Pre-Built MCP Server");
    });

    it("exposes /api/servers list endpoint with built-in and external servers", async () => {
      const res = await fetch(`${baseUrl}/api/servers`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as any;
      expect(body.count).toBeGreaterThanOrEqual(2);
      const serverIds = body.servers.map((s: any) => s.id);
      expect(serverIds).toContain("google-flow");
      expect(serverIds).toContain("tickertape");
    });

    it("validates required parameters on POST /api/servers/add", async () => {
      const res = await fetch(`${baseUrl}/api/servers/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
      const body = (await res.json()) as any;
      expect(body.error).toContain("Missing required 'link'");
    });

    it("returns 404 when removing a non-existent upstream server via DELETE /api/servers/:id", async () => {
      const res = await fetch(`${baseUrl}/api/servers/non-existent-server-id-123`, {
        method: "DELETE",
      });
      expect(res.status).toBe(404);
      const body = (await res.json()) as any;
      expect(body.success).toBe(false);
    });
  });

  describe("4. Dynamic Pre-built MCP Integration & Link Parser", () => {
    it("correctly parses official Model Context Protocol GitHub links", () => {
      const parsed = parseMcpLink("https://github.com/modelcontextprotocol/servers/tree/main/src/fetch");
      expect(parsed.id).toBe("official-fetch");
      expect(parsed.transport).toBe("stdio");
      expect(parsed.command).toBe("npx");
      expect(parsed.args).toEqual(["-y", "@modelcontextprotocol/server-fetch"]);
      expect(parsed.category).toBe("official");
    });

    it("correctly parses remote SSE endpoints with auto /sse appending", () => {
      const parsed = parseMcpLink("https://mcp.internal.company.com", "Company Cloud MCP", "cloud");
      expect(parsed.id).toBe("company-cloud-mcp");
      expect(parsed.name).toBe("Company Cloud MCP");
      expect(parsed.transport).toBe("sse");
      expect(parsed.url).toBe("https://mcp.internal.company.com/sse");
      expect(parsed.category).toBe("cloud");
    });

    it("correctly parses npx package commands and scoped npm packages", () => {
      const parsed = parseMcpLink("npx -y @modelcontextprotocol/server-memory");
      expect(parsed.transport).toBe("stdio");
      expect(parsed.command).toBe("npx");
      expect(parsed.args).toEqual(["-y", "@modelcontextprotocol/server-memory"]);

      const parsedPkg = parseMcpLink("@modelcontextprotocol/server-postgres");
      expect(parsedPkg.transport).toBe("stdio");
      expect(parsedPkg.args).toEqual(["-y", "@modelcontextprotocol/server-postgres"]);
    });

    it("correctly parses third-party GitHub repositories", () => {
      const parsed = parseMcpLink("https://github.com/developer/custom-mcp-tool");
      expect(parsed.transport).toBe("stdio");
      expect(parsed.command).toBe("npx");
      expect(parsed.args).toEqual(["-y", "github:developer/custom-mcp-tool"]);
    });

    it("includes gateway_add_server in meta mode tool suite and exposes schema", async () => {
      const server = createGatewayMcpServer({ mode: "meta" });
      const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });
      const [cTransport, sTransport] = InMemoryTransport.createLinkedPair();

      await server.connect(sTransport);
      await client.connect(cTransport);

      const toolsRes = await client.listTools();
      const toolNames = toolsRes.tools.map((t) => t.name);
      expect(toolNames).toContain("gateway_add_server");

      const schemaRes = await client.callTool({
        name: "gateway_get_tool_schema",
        arguments: { tool_name: "gateway_add_server" },
      });
      const parsed = JSON.parse((schemaRes.content as any)[0].text);
      expect(parsed.found).toBe(true);
      expect(parsed.description).toContain("pre-built");
      expect(parsed.parameters.properties.link).toBeDefined();

      await client.close();
      await server.close();
    });
  });
});
