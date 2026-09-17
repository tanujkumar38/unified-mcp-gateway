import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PluginRegistry } from "./registry.js";
import { CAMERA_PRESETS } from "../tools/camera-controls.js";
import { BrowserManager } from "../core/browser-manager.js";
import { FlowDriver } from "../core/flow-driver.js";
// @ts-ignore
import { TickertapeClient } from "tickertape-mcp";

export function registerGatewayMetaTools(server: McpServer, registry: PluginRegistry): void {
  const tickertapeClient = new TickertapeClient();

  /**
   * Meta-Tool 1: List all aggregated MCP Servers & Plugins
   */
  server.tool(
    "gateway_list_servers",
    "Discovers all connected Model Context Protocol (MCP) servers and plugins in this Unified Gateway Hub. Returns server names, IDs, capabilities, categories, and health states.",
    {},
    {
      title: "List Aggregated MCP Servers",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async () => {
      const plugins = registry.getAllPlugins();
      const health = await registry.healthCheckAll();

      const serverList = plugins.map((p) => ({
        id: p.id,
        name: p.name,
        version: p.version,
        category: p.category,
        tags: p.tags,
        description: p.description,
        toolCount: p.getTools().length,
        status: health.plugins[p.id]?.status || "healthy",
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                gatewayStatus: health.status,
                activeProfile: registry.getConfig().activeProfile,
                connectedServersCount: serverList.length,
                servers: serverList,
                guidance:
                  "Use 'gateway_search_tools' with your goal or task keyword to find specific tools provided by these servers without cluttering your context window.",
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  /**
   * Meta-Tool 2: Search Tools across all aggregated servers
   */
  server.tool(
    "gateway_search_tools",
    "Intelligently searches across all aggregated MCP servers for specific tools matching your intent. Eliminates context window bloat by discovering tools on-demand.",
    {
      query: z
        .string()
        .min(1)
        .describe("Task description, capability, or keyword (e.g. 'generate video', 'check stock sentiment', 'camera move', 'screener')"),
      server_id: z
        .string()
        .optional()
        .describe("Optional server ID filter (e.g. 'google-flow' or 'tickertape')"),
    },
    {
      title: "Search Aggregated Tools (Context Optimizer)",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async ({ query, server_id }) => {
      const allTools = registry.getAllTools();
      const q = query.toLowerCase().trim();

      const matches = allTools.filter((t) => {
        if (server_id && t.pluginId !== server_id) return false;

        return (
          t.name.toLowerCase().includes(q) ||
          t.originalName.toLowerCase().includes(q) ||
          t.namespacedName.toLowerCase().includes(q) ||
          (t.title && t.title.toLowerCase().includes(q)) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                query,
                serverFilter: server_id || "all",
                totalMatches: matches.length,
                tools: matches.map((m) => ({
                  name: m.originalName,
                  namespacedName: m.namespacedName,
                  server: m.pluginId,
                  title: m.title,
                  category: m.category,
                  readOnly: m.readOnly,
                  description: m.description,
                })),
                nextStep:
                  "Call 'gateway_get_tool_schema' with the chosen tool name to inspect arguments, or call 'gateway_call_tool' to execute directly.",
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  /**
   * Meta-Tool 3: Get Tool Schema on-demand
   */
  server.tool(
    "gateway_get_tool_schema",
    "Retrieves the detailed input schema, parameter types, defaults, and requirements for any aggregated tool before calling it.",
    {
      tool_name: z
        .string()
        .min(1)
        .describe("Exact tool name (e.g. 'google_flow_generate_video', 'get_stock_info', or 'flow__generate_video')"),
    },
    {
      title: "Get Tool Schema On-Demand",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async ({ tool_name }) => {
      const cleanName = tool_name.trim();

      // Check built-in gateway meta-tools
      const builtInMetaTools: Record<string, any> = {
        gateway_list_servers: {
          originalName: "gateway_list_servers",
          namespacedName: "gateway__list_servers",
          pluginId: "gateway",
          title: "List Aggregated MCP Servers",
          category: "meta",
          readOnly: true,
          description: "Discovers all connected Model Context Protocol (MCP) servers and plugins in this Unified Gateway Hub.",
          parameters: { type: "object", properties: {} },
        },
        gateway_search_tools: {
          originalName: "gateway_search_tools",
          namespacedName: "gateway__search_tools",
          pluginId: "gateway",
          title: "Search Aggregated MCP Tools",
          category: "meta",
          readOnly: true,
          description: "Intelligently searches across all aggregated MCP servers for specific tools matching your intent.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search query or keyword" },
              server: { type: "string", description: "Filter by server ID" },
            },
            required: ["query"],
          },
        },
        gateway_get_tool_schema: {
          originalName: "gateway_get_tool_schema",
          namespacedName: "gateway__get_tool_schema",
          pluginId: "gateway",
          title: "Get Tool Schema On-Demand",
          category: "meta",
          readOnly: true,
          description: "Retrieves the detailed input schema, parameter types, defaults, and requirements for any aggregated tool.",
          parameters: {
            type: "object",
            properties: {
              tool_name: { type: "string", description: "Exact tool name" },
            },
            required: ["tool_name"],
          },
        },
        gateway_call_tool: {
          originalName: "gateway_call_tool",
          namespacedName: "gateway__call_tool",
          pluginId: "gateway",
          title: "Call Aggregated Tool Dynamically",
          category: "meta",
          readOnly: false,
          description: "Dynamically dispatches and executes any tool on any connected MCP server by name.",
          parameters: {
            type: "object",
            properties: {
              tool_name: { type: "string", description: "The name of the tool to execute" },
              arguments: { type: "object", description: "Tool arguments" },
            },
            required: ["tool_name"],
          },
        },
        gateway_add_server: {
          originalName: "gateway_add_server",
          namespacedName: "gateway__add_server",
          pluginId: "gateway",
          title: "Add Pre-Built MCP Server by Link",
          category: "meta",
          readOnly: false,
          description: "Adds a pre-built Model Context Protocol (MCP) server from another developer, GitHub, npm/npx, or official platform by providing its link or URL.",
          parameters: {
            type: "object",
            properties: {
              link: { type: "string", description: "Remote SSE URL, GitHub repository, or npx package" },
              name: { type: "string", description: "Optional friendly name" },
              category: { type: "string", description: "Category for grouping" },
              auth_token: { type: "string", description: "Optional bearer token" },
            },
            required: ["link"],
          },
        },
      };

      if (builtInMetaTools[cleanName]) {
        const metaTool = builtInMetaTools[cleanName];
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  found: true,
                  name: metaTool.originalName,
                  namespacedName: metaTool.namespacedName,
                  server: metaTool.pluginId,
                  title: metaTool.title,
                  category: metaTool.category,
                  readOnly: metaTool.readOnly,
                  description: metaTool.description,
                  parameters: metaTool.parameters,
                  usageTip: `Gateway meta-tool available in all sessions.`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      const allTools = registry.getAllTools();
      const tool = allTools.find(
        (t) =>
          t.name === cleanName ||
          t.originalName === cleanName ||
          t.namespacedName === cleanName
      );

      if (!tool) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                found: false,
                error: `Tool '${cleanName}' not found across any connected MCP server. Call 'gateway_search_tools' to discover valid tool names.`,
              }),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                found: true,
                name: tool.originalName,
                namespacedName: tool.namespacedName,
                server: tool.pluginId,
                title: tool.title,
                category: tool.category,
                readOnly: tool.readOnly,
                description: tool.description,
                usageTip: `To execute this tool via the gateway, call: gateway_call_tool(tool_name: "${tool.originalName}", arguments: { ... })`,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  /**
   * Meta-Tool 4: Execute Tool Dynamically
   */
  server.tool(
    "gateway_call_tool",
    "Dynamically dispatches and executes any tool on any connected MCP server by name, returning the complete tool result.",
    {
      tool_name: z
        .string()
        .min(1)
        .describe("The name of the tool to execute (e.g. 'get_market_mood_index', 'google_flow_get_status', 'search_ticker')"),
      arguments: z
        .record(z.any())
        .optional()
        .default({})
        .describe("Key-value arguments conforming to the tool's schema"),
    },
    {
      title: "Call Aggregated Tool Dynamically",
      openWorldHint: true,
    },
    async ({ tool_name, arguments: args }) => {
      const cleanName = tool_name.trim();

      // Tickertape tools dispatch
      if (cleanName === "get_market_mood_index" || cleanName.includes("market_mood")) {
        const res = await tickertapeClient.getMarketMoodIndex();
        return { content: [{ type: "text" as const, text: JSON.stringify(res, null, 2) }] };
      }

      if (cleanName === "search_ticker" || cleanName === "tickertape_search") {
        const res = await tickertapeClient.search(args.query, args.types);
        return { content: [{ type: "text" as const, text: JSON.stringify(res, null, 2) }] };
      }

      if (cleanName === "get_stock_info" || cleanName === "tickertape_fetch") {
        const sid = args.sid || args.id;
        const res = await tickertapeClient.getStockInfo(sid);
        return { content: [{ type: "text" as const, text: JSON.stringify(res, null, 2) }] };
      }

      if (cleanName === "get_live_quotes") {
        const res = await tickertapeClient.getLiveQuotes(args.sids);
        return { content: [{ type: "text" as const, text: JSON.stringify(res, null, 2) }] };
      }

      if (cleanName === "run_stock_screener") {
        const res = await tickertapeClient.runScreener(args);
        return { content: [{ type: "text" as const, text: JSON.stringify(res, null, 2) }] };
      }

      if (cleanName === "get_shareholding_pattern") {
        const res = await tickertapeClient.getShareholding(args.sid);
        return { content: [{ type: "text" as const, text: JSON.stringify(res, null, 2) }] };
      }

      if (cleanName === "get_etf_info") {
        const res = await tickertapeClient.getEtfInfo(args.sid);
        return { content: [{ type: "text" as const, text: JSON.stringify(res, null, 2) }] };
      }

      if (cleanName === "get_us_market_quotes") {
        const res = await tickertapeClient.getUsQuotes(args.tickers);
        return { content: [{ type: "text" as const, text: JSON.stringify(res, null, 2) }] };
      }

      if (cleanName === "get_forex_rates") {
        const res = await tickertapeClient.getForexRates(args.pairs);
        return { content: [{ type: "text" as const, text: JSON.stringify(res, null, 2) }] };
      }

      // Google Flow tools dispatch
      if (cleanName === "google_flow_get_status" || cleanName === "flow__get_status") {
        const connected = await BrowserManager.isConnected();
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ browserConnected: connected, message: "Google Flow gateway status queried successfully" }, null, 2),
            },
          ],
        };
      }

      if (cleanName === "google_flow_control_camera" || cleanName === "flow__control_camera") {
        const presetKey = args.preset as keyof typeof CAMERA_PRESETS;
        const data = CAMERA_PRESETS[presetKey] || CAMERA_PRESETS.dolly_in;
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ preset: presetKey, data }, null, 2),
            },
          ],
        };
      }

      if (cleanName === "google_flow_estimate_credits" || cleanName === "flow__estimate_credits") {
        const est = FlowDriver.calculateCredits(args.model || "veo-3.1-fast", args.duration_seconds || 8);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(est, null, 2),
            },
          ],
        };
      }

      if (cleanName === "google_flow_storyboard_studio" || cleanName === "flow__storyboard_studio") {
        const panels = FlowDriver.createStoryboardPanels(args.script || "Sample scene", args.visual_style || "Cinematic Photoreal");
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ totalPanels: panels.length, panels }, null, 2),
            },
          ],
        };
      }

      if (cleanName === "google_flow_manage_character" || cleanName === "flow__manage_character") {
        const rig = FlowDriver.buildCharacterRig(args.character_name || "Hero", args.physical_description || "Young protagonist", args.wardrobe || "Cyberpunk jacket");
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ characterRig: rig }, null, 2),
            },
          ],
        };
      }

      // Check if tool exists in registry and dispatch to plugin
      const allTools = registry.getAllTools();
      const toolMatch = allTools.find(
        (t) => t.name === cleanName || t.originalName === cleanName || t.namespacedName === cleanName
      );

      if (toolMatch) {
        const plugin = registry.getPlugin(toolMatch.pluginId);
        if (plugin && plugin.callTool) {
          const res = await plugin.callTool(toolMatch.originalName, args);
          return res;
        }
      }

      if (!toolMatch) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Unknown tool '${cleanName}'. Use 'gateway_search_tools' to see available tools.`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              executedTool: cleanName,
              server: toolMatch.pluginId,
              status: "dispatched",
              message: `Executed tool '${cleanName}' on server '${toolMatch.pluginId}'.`,
            }, null, 2),
          },
        ],
      };
    }
  );

  /**
   * Meta-Tool 5: Add Pre-Built MCP Server by Link
   */
  server.tool(
    "gateway_add_server",
    "Adds a pre-built Model Context Protocol (MCP) server from another developer, GitHub, npm/npx, or official platform by providing its link or URL. Dynamically connects, discovers tools, and persists the configuration.",
    {
      link: z
        .string()
        .min(1)
        .describe(
          "Link to the pre-built MCP server: Remote SSE URL (e.g. 'https://mcp.example.com/sse'), GitHub link (e.g. 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch'), or npm/npx package (e.g. 'npx -y @modelcontextprotocol/server-memory')"
        ),
      name: z.string().optional().describe("Optional friendly display name for the server"),
      category: z.string().optional().default("community").describe("Category for tool grouping (e.g. 'productivity', 'database', 'developer')"),
      auth_token: z.string().optional().describe("Optional bearer token or API key for authenticating with the remote MCP server"),
    },
    {
      title: "Add Pre-Built MCP Server by Link",
      openWorldHint: true,
      readOnlyHint: false,
    },
    async ({ link, name, category, auth_token }) => {
      try {
        const headers = auth_token ? { Authorization: `Bearer ${auth_token}` } : undefined;
        const result = await registry.addUpstreamFromLink(link, { name, category, headers });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  message: `Successfully added and connected MCP server: "${result.plugin.name}"`,
                  serverId: result.plugin.id,
                  transport: result.plugin.descriptor.transport,
                  category: result.plugin.category,
                  discoveredToolsCount: result.tools.length,
                  tools: result.tools.map((t) => ({
                    name: t.originalName,
                    namespacedName: t.namespacedName,
                    description: t.description,
                  })),
                  guidance:
                    "The newly added tools are now immediately accessible via 'gateway_search_tools' and 'gateway_call_tool'.",
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: false,
                error: `Failed to add MCP server from link: ${err.message}`,
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // -------------------------------------------------------------------------
  // ChatGPT Connectors Standard: Unified search and fetch across ALL servers
  // -------------------------------------------------------------------------

  server.tool(
    "search",
    "Universal multi-server search across financial equities, ETFs, market indicators, video models, camera moves, and creative projects.",
    {
      query: z.string().min(1).describe("Keyword or entity to search (e.g. 'Reliance', 'Veo', 'dolly', 'energy stocks')"),
      category: z.string().optional().describe("Optional domain filter: 'finance', 'creative', 'models', 'stocks'"),
    },
    {
      title: "Universal Cross-Server Search (ChatGPT Connector)",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async ({ query, category }) => {
      const q = query.toLowerCase().trim();
      const combinedResults: Array<{ id: string; title: string; category: string; source: string; snippet: string }> = [];

      // 1. Search Creative & Google Flow Knowledge
      if (!category || category === "all" || category === "creative" || category === "models" || category === "presets") {
        for (const [key, preset] of Object.entries(CAMERA_PRESETS)) {
          if (key.toLowerCase().includes(q) || preset.motion.toLowerCase().includes(q) || preset.description.toLowerCase().includes(q)) {
            combinedResults.push({
              id: `flow:camera:${key}`,
              title: `Camera Preset: ${key.toUpperCase()}`,
              category: "camera_preset",
              source: "google-flow",
              snippet: `${preset.motion} - ${preset.description}`,
            });
          }
        }
      }

      // 2. Search Financial Equities via Tickertape
      if (!category || category === "all" || category === "finance" || category === "stocks") {
        try {
          const finResults = await tickertapeClient.search(query);
          for (const item of finResults.slice(0, 10)) {
            combinedResults.push({
              id: `finance:${item.sid}`,
              title: `${item.name} (${item.ticker})`,
              category: item.type || "stock",
              source: "tickertape",
              snippet: `Sector: ${item.sector || "N/A"} | Price: ₹${item.price || "N/A"} | Match: ${item.ticker}`,
            });
          }
        } catch {
          // Fallback if offline
        }
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                query,
                totalResults: combinedResults.length,
                results: combinedResults,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.tool(
    "fetch",
    "Universal fetch for specific financial data, company profile, MMI score, or creative video asset by URI/ID.",
    {
      id: z.string().min(1).describe("Entity identifier (e.g. 'finance:RELI', 'RELI', 'mmi', 'flow:camera:dolly_in', 'flow:status')"),
    },
    {
      title: "Universal Cross-Server Fetch (ChatGPT Connector)",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async ({ id }) => {
      const cleanId = id.trim();

      // Financial MMI fetch
      if (cleanId.toLowerCase() === "mmi" || cleanId.toLowerCase() === "finance:mmi") {
        const mmi = await tickertapeClient.getMarketMoodIndex();
        return { content: [{ type: "text" as const, text: JSON.stringify(mmi, null, 2) }] };
      }

      // Financial Stock fetch
      if (cleanId.startsWith("finance:") || !cleanId.includes(":")) {
        const sid = cleanId.replace("finance:", "");
        try {
          const info = await tickertapeClient.getStockInfo(sid);
          return { content: [{ type: "text" as const, text: JSON.stringify(info, null, 2) }] };
        } catch (err: any) {
          // Non-blocking fallback
        }
      }

      // Creative Camera Preset fetch
      if (cleanId.includes("camera:")) {
        const key = cleanId.split("camera:")[1] as keyof typeof CAMERA_PRESETS;
        const preset = CAMERA_PRESETS[key];
        if (preset) {
          return { content: [{ type: "text" as const, text: JSON.stringify({ id: cleanId, ...preset }, null, 2) }] };
        }
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ id: cleanId, found: false, message: `No data found for ID '${cleanId}'` }),
          },
        ],
        isError: true,
      };
    }
  );
}
