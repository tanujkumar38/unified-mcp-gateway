#!/usr/bin/env node

/**
 * Tickertape Model Context Protocol (MCP) Server
 * Transport: Dual-Transport (Stdio & Streamable HTTP/SSE)
 * 
 * CRITICAL RULE: In stdio mode, STDOUT is reserved exclusively for JSON-RPC messages.
 * NEVER use console.log(). All diagnostic and audit logs MUST go to STDERR (console.error).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import http from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { z } from "zod";
import * as dotenv from "dotenv";
import { TickertapeClient } from "./client.js";
export { TickertapeClient };

// Load environment variables
dotenv.config();

// ---------------------------------------------------------------------------
// 1. TOOL REGISTRATION
// ---------------------------------------------------------------------------

export function registerTickertapeTools(server: McpServer, client: TickertapeClient): void {
  /**
   * Tool 1: Get Live Market Mood Index (MMI)
   */
  server.tool(
    "get_market_mood_index",
    "Fetches the live Indian market sentiment score (0-100) from Tickertape's Market Mood Index (MMI), including emotional zones (Extreme Fear, Fear, Greed, Extreme Greed) and its 6 constituent indicators (FII activity, India VIX/Skew, Momentum, Market Breadth TRIN, 52W Price Strength, and Gold Demand).",
    {},
    {
      title: "Get Market Mood Index (MMI)",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async () => {
      try {
        console.error("[STDERR LOG] Executing get_market_mood_index");
        const mmi = await client.getMarketMoodIndex();
        return {
          content: [{ type: "text" as const, text: JSON.stringify(mmi, null, 2) }],
        };
      } catch (error: any) {
        console.error("[STDERR LOG] Error in get_market_mood_index:", error);
        return {
          content: [{ type: "text" as const, text: `Error fetching Market Mood Index: ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool 2: Search Ticker / Asset
   */
  server.tool(
    "search_ticker",
    "Searches Indian equities, ETFs, mutual funds, and indices by keyword or symbol (e.g., 'Reliance', 'Tata Motors', 'Nifty', 'HDFC Gold'). Returns Security IDs (sids), tickers, types, sectors, and latest quotes.",
    {
      query: z.string().min(1).describe("Search keyword, company name, or symbol"),
      types: z
        .array(z.enum(["stock", "etf", "mutualfund", "indices"]))
        .optional()
        .describe("Filter results by asset class (defaults to all types)"),
    },
    {
      title: "Search Ticker / Asset",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async ({ query, types }) => {
      try {
        console.error(`[STDERR LOG] Executing search_ticker: query="${query}", types=${types?.join(",")}`);
        const results = await client.search(query, types);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }],
        };
      } catch (error: any) {
        console.error("[STDERR LOG] Error in search_ticker:", error);
        return {
          content: [{ type: "text" as const, text: `Error searching tickers: ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool 3: Get Stock Info & Fundamental Ratios
   */
  server.tool(
    "get_stock_info",
    "Retrieves comprehensive company profile, sector, description, and key fundamental valuation & performance ratios (P/E, P/B, RoE, EPS, Dividend Yield, Industry P/E, 52-Week High/Low, Beta, Market Cap) for an Indian equity or index.",
    {
      sid: z.string().min(1).describe("Security ID (sid) or stock ticker symbol (e.g. 'RELI', 'TCS', 'INFY', or index '.NSEI')"),
    },
    {
      title: "Get Stock Fundamental Info",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async ({ sid }) => {
      try {
        console.error(`[STDERR LOG] Executing get_stock_info: sid="${sid}"`);
        const stockInfo = await client.getStockInfo(sid);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(stockInfo, null, 2) }],
        };
      } catch (error: any) {
        console.error("[STDERR LOG] Error in get_stock_info:", error);
        return {
          content: [{ type: "text" as const, text: `Error fetching stock info for '${sid}': ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool 4: Get Live Quotes (Batch Supported, Stocks & Indices)
   */
  server.tool(
    "get_live_quotes",
    "Retrieves real-time price quotes, intraday high/low, open, previous close, volume, 1D/1W/1M percentage changes, and distance from 52-week high/low for one or multiple securities or indices (e.g. ['RELI', 'TCS', '.NSEI', '.BSESN', '.NSEBANK']).",
    {
      sids: z
        .array(z.string().min(1))
        .min(1)
        .max(30)
        .describe("Array of Security IDs (sids) or stock/index tickers (e.g. ['RELI', 'TCS', '.NSEI', '.BSESN'])"),
    },
    {
      title: "Get Live Quotes",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async ({ sids }) => {
      try {
        console.error(`[STDERR LOG] Executing get_live_quotes for sids: ${sids.join(",")}`);
        const quotes = await client.getLiveQuotes(sids);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(quotes, null, 2) }],
        };
      } catch (error: any) {
        console.error("[STDERR LOG] Error in get_live_quotes:", error);
        return {
          content: [{ type: "text" as const, text: `Error fetching live quotes: ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool 5: Run Stock Screener
   */
  server.tool(
    "run_stock_screener",
    "Filters and screens Indian stocks using Tickertape's screener database based on sector, sorting metric, direction, and pagination.",
    {
      sectors: z
        .array(z.string())
        .optional()
        .describe("Optional sector filters (e.g. ['Energy', 'Financials', 'Information Technology'])"),
      sortBy: z
        .enum(["marketCap", "pe", "roe", "divYield", "closePrice"])
        .default("marketCap")
        .describe("Field to sort stocks by"),
      sortOrder: z.enum(["asc", "desc"]).default("desc").describe("Sort direction: 'desc' (highest first) or 'asc'"),
      limit: z.coerce.number().int().min(1).max(50).default(15).describe("Maximum number of results (1 to 50)"),
      offset: z.coerce.number().int().min(0).default(0).describe("Pagination offset"),
    },
    {
      title: "Run Stock Screener",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async ({ sectors, sortBy, sortOrder, limit, offset }) => {
      try {
        console.error(`[STDERR LOG] Executing run_stock_screener: sortBy=${sortBy}, limit=${limit}`);
        const results = await client.runScreener({ sectors, sortBy, sortOrder, limit, offset });
        return {
          content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }],
        };
      } catch (error: any) {
        console.error("[STDERR LOG] Error in run_stock_screener:", error);
        return {
          content: [{ type: "text" as const, text: `Error executing stock screener: ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool 6: Get Shareholding Pattern & Red Flag Audit
   */
  server.tool(
    "get_shareholding_pattern",
    "Fetches historical quarterly shareholding distributions (Promoter, Mutual Funds, DII, FII, Insurance) and automatically audits for pledged promoter equity red flags.",
    {
      sid: z.string().min(1).describe("Security ID or ticker symbol (e.g. 'RELI', 'TATAMOTORS')"),
    },
    {
      title: "Get Shareholding & Red Flag Audit",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async ({ sid }) => {
      try {
        console.error(`[STDERR LOG] Executing get_shareholding_pattern: sid="${sid}"`);
        const holdings = await client.getShareholding(sid);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(holdings, null, 2) }],
        };
      } catch (error: any) {
        console.error("[STDERR LOG] Error in get_shareholding_pattern:", error);
        return {
          content: [{ type: "text" as const, text: `Error fetching shareholding for '${sid}': ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool 7: Get ETF Information
   */
  server.tool(
    "get_etf_info",
    "Fetches ETF-specific data including Asset Under Management (AUM), Expense Ratio, Tracking Error, Liquidity classification, and 52-week pricing range.",
    {
      sid: z.string().min(1).describe("ETF Security ID or ticker (e.g. 'HDGO', 'NIFTYBEES')"),
    },
    {
      title: "Get ETF Info",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async ({ sid }) => {
      try {
        console.error(`[STDERR LOG] Executing get_etf_info: sid="${sid}"`);
        const etfInfo = await client.getEtfInfo(sid);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(etfInfo, null, 2) }],
        };
      } catch (error: any) {
        console.error("[STDERR LOG] Error in get_etf_info:", error);
        return {
          content: [{ type: "text" as const, text: `Error fetching ETF info for '${sid}': ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool 8: Get US Market Quotes (US Equities & US ETFs)
   */
  server.tool(
    "get_us_market_quotes",
    "Retrieves real-time price quotes, day change, volume, and last close for US stocks and US ETFs (e.g. AAPL, MSFT, NVDA, TSLA, SPY, QQQ, VOO) tracked by Tickertape's global market feed.",
    {
      tickers: z
        .array(z.string().min(1))
        .min(1)
        .max(25)
        .describe("List of US stock/ETF tickers (e.g. ['AAPL', 'MSFT', 'NVDA', 'SPY'])"),
    },
    {
      title: "Get US Market Quotes",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async ({ tickers }) => {
      try {
        console.error(`[STDERR LOG] Executing get_us_market_quotes for: ${tickers.join(",")}`);
        const quotes = await client.getUsQuotes(tickers);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(quotes, null, 2) }],
        };
      } catch (error: any) {
        console.error("[STDERR LOG] Error in get_us_market_quotes:", error);
        return {
          content: [{ type: "text" as const, text: `Error fetching US market quotes: ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool 9: Get Forex Rates
   */
  server.tool(
    "get_forex_rates",
    "Retrieves real-time currency exchange rates and intraday changes for major currency pairs (e.g. 'USDINR', 'EURINR') tracked by Tickertape.",
    {
      pairs: z
        .array(z.string().min(3))
        .min(1)
        .max(10)
        .describe("Currency pair codes (e.g. ['USDINR'])"),
    },
    {
      title: "Get Forex Rates",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async ({ pairs }) => {
      try {
        console.error(`[STDERR LOG] Executing get_forex_rates for: ${pairs.join(",")}`);
        const rates = await client.getForexRates(pairs);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(rates, null, 2) }],
        };
      } catch (error: any) {
        console.error("[STDERR LOG] Error in get_forex_rates:", error);
        return {
          content: [{ type: "text" as const, text: `Error fetching forex rates: ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  // -------------------------------------------------------------------------
  // ChatGPT Connectors & Deep Research Standard: search & fetch tools
  // -------------------------------------------------------------------------

  const searchHandler = async ({ query, types }: { query: string; types?: string[] }) => {
    try {
      console.error(`[STDERR LOG] Executing standard search: query="${query}"`);
      const results = await client.search(query, types as any);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                query,
                count: results.length,
                results,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error: any) {
      console.error("[STDERR LOG] Error in search:", error);
      return {
        content: [{ type: "text" as const, text: `Error searching financial assets: ${error.message}` }],
        isError: true,
      };
    }
  };

  server.tool(
    "tickertape_search",
    "Searches Indian equities, ETFs, mutual funds, and indices for ChatGPT Connectors & Deep Research.",
    {
      query: z.string().min(1).describe("Search keyword, company name, or symbol"),
      types: z.array(z.enum(["stock", "etf", "mutualfund", "indices"])).optional().describe("Asset classes"),
    },
    {
      title: "Search Financial Assets",
      readOnlyHint: true,
      openWorldHint: true,
    },
    searchHandler
  );

  // Expose universal 'search' alias
  server.tool(
    "search",
    "Universal search across Indian stocks, ETFs, mutual funds, and market indicators for ChatGPT Deep Research.",
    {
      query: z.string().min(1).describe("Search term or company"),
      types: z.array(z.string()).optional().describe("Asset types filter"),
    },
    {
      title: "Universal Financial Search (ChatGPT Connector)",
      readOnlyHint: true,
      openWorldHint: true,
    },
    searchHandler
  );

  const fetchHandler = async ({ id }: { id: string }) => {
    try {
      console.error(`[STDERR LOG] Executing standard fetch: id="${id}"`);
      const trimmedId = id.trim().toUpperCase();

      if (trimmedId === "MMI" || trimmedId === "MARKET_MOOD" || trimmedId === "MARKET-MOOD") {
        const mmi = await client.getMarketMoodIndex();
        return {
          content: [{ type: "text" as const, text: JSON.stringify(mmi, null, 2) }],
        };
      }

      // Fetch stock info by default
      const stockInfo = await client.getStockInfo(trimmedId);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(stockInfo, null, 2) }],
      };
    } catch (error: any) {
      console.error("[STDERR LOG] Error in fetch:", error);
      return {
        content: [{ type: "text" as const, text: `Error fetching financial data for '${id}': ${error.message}` }],
        isError: true,
      };
    }
  };

  server.tool(
    "tickertape_fetch",
    "Fetches comprehensive company fundamentals or MMI sentiment by identifier for ChatGPT Connectors.",
    {
      id: z.string().min(1).describe("Security ID / symbol (e.g. 'RELI', 'TCS') or 'MMI'"),
    },
    {
      title: "Fetch Financial Asset Details",
      readOnlyHint: true,
      openWorldHint: true,
    },
    fetchHandler
  );

  // Expose universal 'fetch' alias
  server.tool(
    "fetch",
    "Universal fetch for specific stock fundamentals or market sentiment by symbol/id for ChatGPT Deep Research.",
    {
      id: z.string().min(1).describe("Security ID or 'MMI'"),
    },
    {
      title: "Universal Financial Fetch (ChatGPT Connector)",
      readOnlyHint: true,
      openWorldHint: true,
    },
    fetchHandler
  );
}

// ---------------------------------------------------------------------------
// 2. RESOURCES REGISTRATION
// ---------------------------------------------------------------------------

export function registerTickertapeResources(server: McpServer, client: TickertapeClient): void {
  server.resource(
    "market_mood_resource",
    "tickertape://market-mood",
    { mimeType: "application/json", description: "Real-time Indian market sentiment index" },
    async () => {
      console.error("[STDERR LOG] Reading resource tickertape://market-mood");
      try {
        const mmi = await client.getMarketMoodIndex();
        return {
          contents: [
            {
              uri: "tickertape://market-mood",
              mimeType: "application/json",
              text: JSON.stringify(mmi, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          contents: [
            {
              uri: "tickertape://market-mood",
              mimeType: "application/json",
              text: JSON.stringify({ error: err.message }),
            },
          ],
        };
      }
    }
  );

  server.resource(
    "sectors_taxonomy",
    "tickertape://sectors",
    { mimeType: "application/json", description: "Indian market sector definitions" },
    async () => {
      console.error("[STDERR LOG] Reading resource tickertape://sectors");
      const sectors = [
        "Financials",
        "Information Technology",
        "Energy",
        "Consumer Staples",
        "Consumer Discretionary",
        "Materials",
        "Industrials",
        "Healthcare",
        "Utilities",
        "Communication Services",
        "Real Estate",
      ];
      return {
        contents: [
          {
            uri: "tickertape://sectors",
            mimeType: "application/json",
            text: JSON.stringify({ availableSectors: sectors }, null, 2),
          },
        ],
      };
    }
  );

  server.resource(
    "benchmark_indices",
    "tickertape://indices",
    { mimeType: "application/json", description: "Key benchmark and sectoral indices" },
    async () => {
      console.error("[STDERR LOG] Reading resource tickertape://indices");
      const indices = [
        { name: "Nifty 50", sid: ".NSEI", exchange: "NSE" },
        { name: "BSE Sensex", sid: ".BSESN", exchange: "BSE" },
        { name: "Nifty Bank", sid: ".NSEBANK", exchange: "NSE" },
        { name: "Nifty IT", sid: ".CNXIT", exchange: "NSE" },
        { name: "Nifty Next 50", sid: ".NN50", exchange: "NSE" },
        { name: "Nifty Midcap 100", sid: ".NIFMD100", exchange: "NSE" },
      ];
      return {
        contents: [
          {
            uri: "tickertape://indices",
            mimeType: "application/json",
            text: JSON.stringify({ majorIndices: indices }, null, 2),
          },
        ],
      };
    }
  );
}

// ---------------------------------------------------------------------------
// 3. PROMPTS REGISTRATION
// ---------------------------------------------------------------------------

export function registerTickertapePrompts(server: McpServer): void {
  server.prompt(
    "analyze_stock",
    {
      ticker: z.string().describe("Stock ticker symbol or sid (e.g. RELI, TCS)"),
    },
    ({ ticker }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Conduct a comprehensive investment due-diligence report on the Indian equity "${ticker}".
Follow these steps using the Tickertape MCP server tools:
1. Fetch live market sentiment with 'get_market_mood_index' to understand macro environment.
2. Fetch company fundamentals with 'get_stock_info' (check P/E vs Industry P/E, RoE, and 52W range).
3. Retrieve latest quote and price action using 'get_live_quotes'.
4. Audit promoter pledge risk and institutional ownership using 'get_shareholding_pattern'.
5. Synthesize a structured recommendation outlining Valuation, Quality, Red Flags, and Risk-Reward.`,
          },
        },
      ],
    })
  );

  server.prompt(
    "audit_portfolio_risk",
    {
      symbols: z.string().describe("Comma-separated list of stock tickers to audit (e.g. RELI, TCS, INFY)"),
    },
    ({ symbols }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Perform a portfolio health audit for the following symbols: ${symbols}.
1. Check current macro market sentiment using 'get_market_mood_index'.
2. For each stock in the list, use 'get_shareholding_pattern' to verify whether any promoter shares are pledged.
3. Check 52-week high/low drawdown using 'get_live_quotes'.
4. Flag any critical governance or solvency risks and summarize portfolio diversification.`,
          },
        },
      ],
    })
  );
}

// ---------------------------------------------------------------------------
// 4. FACTORY & LIFECYCLE
// ---------------------------------------------------------------------------

export function createTickertapeServer(clientInstance?: TickertapeClient): McpServer {
  const server = new McpServer(
    {
      name: "tickertape-mcp",
      version: "1.2.0",
    },
    {
      capabilities: {
        tools: { listChanged: false },
        resources: { listChanged: false, subscribe: false },
        prompts: { listChanged: false },
      },
    }
  );

  const client = clientInstance || new TickertapeClient();
  registerTickertapeTools(server, client);
  registerTickertapeResources(server, client);
  registerTickertapePrompts(server);

  return server;
}

// ---------------------------------------------------------------------------
// 5. SERVER RUNNER (Dual Transport: stdio or HTTP/SSE)
// ---------------------------------------------------------------------------

async function runServer() {
  const isHttp =
    process.argv.includes("--http") ||
    process.env.ENABLE_HTTP === "true" ||
    process.env.MCP_TRANSPORT === "sse" ||
    process.env.MCP_TRANSPORT === "http";

  const portArgIdx = process.argv.indexOf("--port");
  const port =
    portArgIdx !== -1 && process.argv[portArgIdx + 1]
      ? parseInt(process.argv[portArgIdx + 1], 10)
      : parseInt(process.env.PORT || "3001", 10);

  const host = process.env.HOST || "127.0.0.1";

  if (isHttp) {
    console.error(`[STDERR LOG] Starting Tickertape MCP Server over HTTP/SSE on http://${host}:${port}...`);
    const activeTransports = new Map<string, SSEServerTransport>();

    const httpServer = http.createServer(async (req, res) => {
      // CORS headers for ChatGPT and browser clients
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-session-id");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
      const pathname = parsedUrl.pathname;

      if (pathname === "/health" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            status: "healthy",
            service: "tickertape-mcp",
            version: "1.2.0",
            transport: "sse",
            activeSessions: activeTransports.size,
            timestamp: new Date().toISOString(),
          })
        );
        return;
      }

      if (pathname === "/sse" && req.method === "GET") {
        console.error("[STDERR LOG] Client connected to Tickertape SSE transport");
        const server = createTickertapeServer();
        const transport = new SSEServerTransport("/messages", res);
        const sessionId = transport.sessionId;
        activeTransports.set(sessionId, transport);

        res.on("close", () => {
          console.error(`[STDERR LOG] Tickertape SSE session closed: ${sessionId}`);
          activeTransports.delete(sessionId);
        });

        await server.connect(transport);
        return;
      }

      if (pathname === "/messages" && req.method === "POST") {
        const sessionId = parsedUrl.searchParams.get("sessionId");
        if (!sessionId) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing sessionId query parameter" }));
          return;
        }

        const transport = activeTransports.get(sessionId);
        if (!transport) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: `Session '${sessionId}' not found` }));
          return;
        }

        await transport.handlePostMessage(req, res);
        return;
      }

      if (pathname === "/mcp") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            service: "tickertape-mcp",
            status: "active",
            sse_endpoint: `http://${host}:${port}/sse`,
            messages_endpoint: `http://${host}:${port}/messages`,
            health_endpoint: `http://${host}:${port}/health`,
          })
        );
        return;
      }

      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found", validEndpoints: ["/sse", "/messages", "/health", "/mcp"] }));
    });

    httpServer.listen(port, host, () => {
      console.error(`[STDERR LOG] Tickertape MCP Server running on http://${host}:${port}`);
      console.error(`  • SSE endpoint:      http://${host}:${port}/sse`);
      console.error(`  • Messages endpoint: http://${host}:${port}/messages`);
      console.error(`  • Health check:      http://${host}:${port}/health`);
    });
  } else {
    // Default: Stdio transport (Claude Desktop, Cursor, VS Code)
    console.error("[STDERR LOG] Initializing Tickertape MCP Server (Transport: stdio)...");
    const server = createTickertapeServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[STDERR LOG] Tickertape MCP Server connected to stdio and listening for JSON-RPC 2.0 messages.");
  }
}

// Direct execution check
const currentFilePath = fileURLToPath(import.meta.url);
const isEntryPoint =
  process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === path.resolve(currentFilePath).toLowerCase();

if (isEntryPoint) {
  runServer().catch((error) => {
    console.error("[STDERR FATAL] Server startup failure:", error);
    process.exit(1);
  });
}
