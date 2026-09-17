import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpPlugin, ToolMetadata } from "../types.js";
// @ts-ignore - imported from local package
import { registerTickertapeTools, registerTickertapeResources, registerTickertapePrompts, TickertapeClient } from "tickertape-mcp";

export class TickertapePlugin implements McpPlugin {
  public readonly id = "tickertape";
  public readonly name = "Tickertape Financial MCP";
  public readonly version = "1.2.0";
  public readonly description = "Real-time Indian equities intelligence, Market Mood Index (MMI) sentiment, fundamentals, screener, shareholding red-flag audits, ETFs, and forex data.";
  public readonly category = "finance";
  public readonly tags = ["indian-equities", "stock-screener", "market-mood-index", "fundamentals", "forex", "nse", "bse"];

  private client: any;

  constructor() {
    this.client = new TickertapeClient();
  }

  public register(server: McpServer, _options?: { prefix?: string }): void {
    registerTickertapeTools(server, this.client);
    registerTickertapeResources(server, this.client);
    registerTickertapePrompts(server);
  }

  public getTools(): ToolMetadata[] {
    return [
      {
        name: "get_market_mood_index",
        originalName: "get_market_mood_index",
        namespacedName: "tickertape__get_market_mood_index",
        title: "Get Market Mood Index (MMI)",
        description: "Fetches the live Indian market sentiment score (0-100) from Tickertape's Market Mood Index (MMI), emotional zones, and 6 constituent indicators.",
        pluginId: this.id,
        readOnly: true,
        category: "market-sentiment",
      },
      {
        name: "search_ticker",
        originalName: "search_ticker",
        namespacedName: "tickertape__search_ticker",
        title: "Search Ticker / Asset",
        description: "Searches Indian equities, ETFs, mutual funds, and indices by keyword or symbol (e.g. 'Reliance', 'Tata Motors', 'Nifty').",
        pluginId: this.id,
        readOnly: true,
        category: "search",
      },
      {
        name: "get_stock_info",
        originalName: "get_stock_info",
        namespacedName: "tickertape__get_stock_info",
        title: "Get Stock Fundamental Info",
        description: "Retrieves company profile, sector, description, and fundamental valuation & performance ratios (P/E, P/B, RoE, EPS, 52W High/Low).",
        pluginId: this.id,
        readOnly: true,
        category: "fundamentals",
      },
      {
        name: "get_live_quotes",
        originalName: "get_live_quotes",
        namespacedName: "tickertape__get_live_quotes",
        title: "Get Live Quotes",
        description: "Retrieves real-time price quotes, intraday high/low, open, previous close, volume, and changes for securities or indices.",
        pluginId: this.id,
        readOnly: true,
        category: "quotes",
      },
      {
        name: "run_stock_screener",
        originalName: "run_stock_screener",
        namespacedName: "tickertape__run_stock_screener",
        title: "Run Stock Screener",
        description: "Filters and screens Indian stocks using Tickertape's screener database based on sector, sorting metric, and direction.",
        pluginId: this.id,
        readOnly: true,
        category: "screener",
      },
      {
        name: "get_shareholding_pattern",
        originalName: "get_shareholding_pattern",
        namespacedName: "tickertape__get_shareholding_pattern",
        title: "Get Shareholding & Red Flag Audit",
        description: "Fetches historical quarterly shareholding distributions and audits for pledged promoter equity red flags.",
        pluginId: this.id,
        readOnly: true,
        category: "governance",
      },
      {
        name: "get_etf_info",
        originalName: "get_etf_info",
        namespacedName: "tickertape__get_etf_info",
        title: "Get ETF Info",
        description: "Fetches ETF-specific data including AUM, Expense Ratio, Tracking Error, Liquidity classification, and 52-week pricing range.",
        pluginId: this.id,
        readOnly: true,
        category: "etf",
      },
      {
        name: "get_us_market_quotes",
        originalName: "get_us_market_quotes",
        namespacedName: "tickertape__get_us_market_quotes",
        title: "Get US Market Quotes",
        description: "Retrieves real-time price quotes, day change, volume, and last close for US stocks and US ETFs (AAPL, NVDA, SPY).",
        pluginId: this.id,
        readOnly: true,
        category: "us-markets",
      },
      {
        name: "get_forex_rates",
        originalName: "get_forex_rates",
        namespacedName: "tickertape__get_forex_rates",
        title: "Get Forex Rates",
        description: "Retrieves real-time currency exchange rates and intraday changes for major currency pairs (e.g. USDINR, EURINR).",
        pluginId: this.id,
        readOnly: true,
        category: "forex",
      },
      {
        name: "tickertape_search",
        originalName: "tickertape_search",
        namespacedName: "tickertape__search",
        title: "Search Financial Assets",
        description: "Searches Indian equities, ETFs, mutual funds, and indices for ChatGPT Connectors & Deep Research.",
        pluginId: this.id,
        readOnly: true,
        category: "search",
      },
      {
        name: "tickertape_fetch",
        originalName: "tickertape_fetch",
        namespacedName: "tickertape__fetch",
        title: "Fetch Financial Asset Details",
        description: "Fetches comprehensive company fundamentals or MMI sentiment by identifier for ChatGPT Connectors.",
        pluginId: this.id,
        readOnly: true,
        category: "fetch",
      },
    ];
  }

  public async healthCheck(): Promise<{ status: "healthy" | "degraded" | "unhealthy"; message?: string; details?: any }> {
    try {
      const mmi = await this.client.getMarketMoodIndex();
      return {
        status: "healthy",
        message: "Tickertape market data API reachable and active",
        details: { currentMmi: mmi.currentValue, zone: mmi.currentZone },
      };
    } catch (err: any) {
      return {
        status: "degraded",
        message: `Tickertape API transient warning: ${err.message}`,
      };
    }
  }
}
