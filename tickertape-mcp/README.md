# Tickertape Model Context Protocol (MCP) Server

[![MCP Protocol](https://img.shields.io/badge/MCP-2024--11--05-blue.svg)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-grade **Model Context Protocol (MCP)** server providing AI assistants (Claude Desktop, Cursor, Antigravity, and custom agent runtimes) with real-time financial intelligence and screening tools for Indian equities, indices, mutual funds, ETFs, US stocks, and Forex rates via **Tickertape** ([tickertape.in](https://www.tickertape.in)).

---

## Capabilities Overview

- **Market Mood Index (MMI)**: Real-time 0–100 sentiment score (Extreme Fear, Fear, Greed, Extreme Greed) with 6 sub-indicators (FII futures flows, India VIX/Skew, Momentum, Market Breadth TRIN, Price Strength, Gold demand).
- **Multi-Asset Search**: Instant discovery of Indian stocks, ETFs, mutual funds, and indices with security IDs (`sid`).
- **Stock Fundamentals & Valuation**: P/E, P/B, RoE, EPS, Dividend Yield, Industry benchmark multiples, 52-week High/Low, Beta, and Market Cap.
- **Batch Live Quotes (Indian Equities & Indices)**: Real-time quotes for up to 30 symbols in a single call (e.g. `RELI`, `TCS`, `.NSEI` for Nifty 50, `.BSESN` for Sensex, `.NSEBANK` for Bank Nifty).
- **US Stocks & US ETFs**: Real-time quotes and daily changes for US market securities (`AAPL`, `MSFT`, `NVDA`, `TSLA`, `SPY`, `QQQ`).
- **Forex Exchange Rates**: Real-time currency conversion rates (e.g. `USDINR`).
- **Stock Screener Engine**: Query Indian stocks by sector, valuation, profitability, and market cap with sorting and pagination.
- **Shareholding & Red Flag Audit**: Quarterly institutional distributions and **promoter share pledge percentage** (vital governance red flag detection).
- **ETF Analytics**: AUM, expense ratios, tracking errors, liquidity ratings, and benchmark comparison.
- **Contextual Resources & Guided Prompts**: Real-time market mood resource, sectors taxonomy, benchmark indices reference, and structured prompt templates (`analyze_stock`, `audit_portfolio_risk`).

---

## Tool Reference (9 Tools)

### 1. `get_market_mood_index`
Fetches live Indian market sentiment and macro emotional indicators.
* **Inputs**: None
* **Annotations**: `readOnlyHint: true`, `openWorldHint: true`
* **Returns**: Score (0-100), emotion zone, contrarian actionable insight, and underlying metrics.

### 2. `search_ticker`
Finds securities across Indian markets.
* **Inputs**:
  * `query` (string, required): Company name, symbol, or keyword (e.g. `"Reliance"`, `"TCS"`, `"Gold ETF"`).
  * `types` (array, optional): Filter by `["stock", "etf", "mutualfund", "indices"]`.
* **Annotations**: `readOnlyHint: true`, `openWorldHint: true`

### 3. `get_stock_info`
Retrieves fundamental valuation and performance metrics.
* **Inputs**:
  * `sid` (string, required): Security ID or ticker (e.g. `"RELI"`, `"TCS"`, `"INFY"`).
* **Annotations**: `readOnlyHint: true`, `openWorldHint: true`

### 4. `get_live_quotes`
Fetches real-time price quotes for Indian equities and benchmark indices.
* **Inputs**:
  * `sids` (string[], required): Array of security IDs (e.g. `["RELI", "TCS", ".NSEI", ".BSESN", ".NSEBANK"]`).
* **Annotations**: `readOnlyHint: true`, `openWorldHint: true`

### 5. `run_stock_screener`
Runs custom screener queries against Tickertape's equity database.
* **Inputs**:
  * `sectors` (string[], optional): Filter by sector (e.g. `["Energy", "Financials"]`).
  * `sortBy` (enum, optional): `"marketCap"` | `"pe"` | `"roe"` | `"divYield"` | `"closePrice"` (default: `"marketCap"`).
  * `sortOrder` (enum, optional): `"desc"` | `"asc"` (default: `"desc"`).
  * `limit` (number, optional): Max results 1–50 (default: 15).
  * `offset` (number, optional): Pagination offset (default: 0).
* **Annotations**: `readOnlyHint: true`, `openWorldHint: true`

### 6. `get_shareholding_pattern`
Audits ownership and detects promoter pledging red flags.
* **Inputs**:
  * `sid` (string, required): Security ID or ticker (e.g. `"RELI"`, `"TATAMOTORS"`).
* **Annotations**: `readOnlyHint: true`, `openWorldHint: true`

### 7. `get_etf_info`
Retrieves ETF-specific data (AUM, expense ratio, tracking error).
* **Inputs**:
  * `sid` (string, required): ETF symbol or sid (e.g. `"HDGO"`, `"NIFTYBEES"`).
* **Annotations**: `readOnlyHint: true`, `openWorldHint: true`

### 8. `get_us_market_quotes`
Retrieves real-time price quotes for US equities and ETFs.
* **Inputs**:
  * `tickers` (string[], required): List of US tickers (e.g. `["AAPL", "MSFT", "NVDA", "SPY", "QQQ"]`).
* **Annotations**: `readOnlyHint: true`, `openWorldHint: true`

### 9. `get_forex_rates`
Retrieves real-time currency exchange rates.
* **Inputs**:
  * `pairs` (string[], required): Currency pair codes (e.g. `["USDINR"]`).
* **Annotations**: `readOnlyHint: true`, `openWorldHint: true`

---

## Resources & Prompts

### Resources
- `tickertape://market-mood`: Live Market Mood Index JSON resource.
- `tickertape://sectors`: Taxonomy reference of standard equity sectors.
- `tickertape://indices`: Reference list of key benchmark indices (`.NSEI`, `.BSESN`, `.NSEBANK`, `.CNXIT`).

### Prompts
- `analyze_stock`: Step-by-step thesis analysis prompt for any Indian stock.
- `audit_portfolio_risk`: Portfolio risk audit prompt checking MMI, promoter pledging, and 52W drawdowns.

---

## Quick Start & Build

```bash
# 1. Install dependencies
npm install

# 2. Compile TypeScript
npm run build

# 3. Test MCP Server with Inspector
npm run inspector
```

---

## Host Configuration

### Claude Desktop (`%APPDATA%\Claude\claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "tickertape": {
      "command": "node",
      "args": [
        "C:/Users/tanuj/Documents/antigravity/zealous-brahmagupta/tickertape-mcp/build/index.js"
      ]
    }
  }
}
```

### Antigravity / Cursor / VS Code (`mcp_config.json`)

```json
{
  "mcpServers": {
    "tickertape": {
      "command": "node",
      "args": [
        "C:/Users/tanuj/Documents/antigravity/zealous-brahmagupta/tickertape-mcp/build/index.js"
      ]
    }
  }
}
```
