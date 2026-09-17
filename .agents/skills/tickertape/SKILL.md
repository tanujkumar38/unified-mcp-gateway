---
name: tickertape
title: Tickertape Financial Intelligence & Equity Screening
description: Professional procedural skill for executing stock screening, Market Mood Index (MMI) analysis, company fundamentals, real-time quotes, ETF metrics, and promoter pledge red-flag audits for Indian equities and US markets via the Tickertape MCP Server.
version: 1.2.0
author: Tanuj Kumar
license: MIT
tags: [finance, stock-screener, indian-equities, mmi, nse, bse, us-stocks, etf, mutual-funds, red-flag-audit, mcp]
requires: [tickertape-mcp]
inputs:
  - name: query
    type: string
    description: Company name, symbol, or search keyword (e.g. 'Reliance', 'TCS', 'AAPL', 'Gold ETF')
  - name: sid
    type: string
    description: Tickertape Security ID or ticker symbol (e.g. 'RELI', 'TATAMOTORS', '.NSEI')
  - name: sectors
    type: array
    description: Optional sectors for screening (e.g. ['Financials', 'Energy'])
outputs:
  - name: due_diligence_report
    type: markdown
    description: Structured multi-factor fundamental analysis report
  - name: sentiment_report
    type: json
    description: Market Mood Index score, zone, and constituent metrics
  - name: screener_results
    type: array
    description: Ranked list of stocks matching screening criteria
examples:
  - "Check current market mood on Tickertape and tell me if it's a good time to invest lump-sum in Nifty 50."
  - "Run a due diligence report on Reliance Industries (RELI) including valuation, RoE, and promoter pledged shares."
  - "Screen for top 10 large-cap Indian stocks with highest dividend yields and low debt."
  - "Get live quotes for Nifty 50 (.NSEI), Sensex (.BSESN), and top US tech stocks (AAPL, NVDA)."
---

# Tickertape Financial Intelligence & Equity Screening Skill

## Overview

This skill teaches AI agents how to perform professional-grade equity research, market sentiment timing, portfolio health audits, and custom equity screening using the **Tickertape MCP Server** ([tickertape.in](https://www.tickertape.in)). 

Adhering to the **Agent Skills Open Standard**, this skill uses a **three-tier progressive disclosure architecture**:
1. **Metadata Tier**: Rapid semantic discovery via frontmatter.
2. **Procedural Instructions Tier**: Concrete execution algorithms, tool invocation sequences, decision trees, and validation rules in this document.
3. **Deep Resource Tier**: Domain references and standardized report templates in `references/` and `assets/templates/`.

---

## Available MCP Tools

The agent must interact with the following registered MCP tools exposed by `tickertape-mcp`:

| Tool Name | Key Function | Primary Inputs | Expected Output |
| :--- | :--- | :--- | :--- |
| `get_market_mood_index` | Macro market sentiment (0–100 score, zone, 6 indicators) | None | Score, Zone, FII flow, India VIX, TRIN, Gold |
| `search_ticker` | Resolve symbols & discover `sid`s | `query: string`, `types?: string[]` | Array of matches with `sid`, ticker, price, sector |
| `get_stock_info` | Comprehensive fundamental ratios | `sid: string` | P/E, P/B, RoE, EPS, Div Yield, Market Cap, Beta |
| `get_live_quotes` | Batch real-time prices & 52W drawdowns | `sids: string[]` | Price, 1D/1W/1M change %, volume, 52W high/low |
| `run_stock_screener` | Filter equity universe by sector & ratios | `sectors?`, `sortBy?`, `limit?` | Filtered and ranked equity list |
| `get_shareholding_pattern` | Ownership & **Promoter Pledge Red Flag** | `sid: string` | Promoter %, **Pledged %**, Mutual Fund %, FII % |
| `get_etf_info` | ETF analytics | `sid: string` | AUM, Expense Ratio, Tracking Error, Liquidity |
| `get_us_market_quotes` | US equities & US ETFs | `tickers: string[]` | Live US quotes (AAPL, MSFT, NVDA, SPY, QQQ) |
| `get_forex_rates` | Real-time currency conversion | `pairs: string[]` | Currency exchange rates (e.g. `USDINR`) |

---

## Step-by-Step Execution Workflows

### Workflow 1: Macro Sentiment & Market Timing
When a user asks: *"How is the market today?"*, *"Is it a good time to buy?"*, or *"Check MMI"*:
1. Invoke `get_market_mood_index`.
2. Inspect `score` and `zone`:
   - **Extreme Fear (< 30)**: Recommend contrarian accumulation; market is oversold. High-quality blue chips (`.NSEI`) are primed for lump-sum entry.
   - **Fear (30 – 50)**: Recommend systematic SIP accumulation and selective value picking.
   - **Greed (50 – 70)**: Advise caution; valuations are expanding; enforce stop-losses.
   - **Extreme Greed (> 70)**: Issue frothy market warning; advise rebalancing, profit booking, and avoiding FOMO lump-sum entries.
3. Review underlying drivers: Check if FII flows are negative or if Gold demand is surging (flight to safety). Refer to [`references/mmi_indicators.md`](references/mmi_indicators.md) for detailed indicator mathematics.

---

### Workflow 2: End-to-End Stock Due Diligence
When a user asks to analyze, review, or evaluate an Indian equity (e.g. "Analyze Reliance", "Should I buy Tata Motors?"):
1. **Step 1: Resolve Security ID**:
   - If user provided a company name rather than an exact SID, call `search_ticker(query=name, types=['stock'])`.
   - Extract the canonical `sid` (e.g. `RELI` for Reliance, `TAMO` for Tata Motors).
2. **Step 2: Fetch Fundamentals & Multiples**:
   - Call `get_stock_info(sid)`.
   - Extract `pe`, `industryPe`, `pb`, `roe`, `eps`, `divYield`, and `marketCap`.
   - Compare `pe` against `industryPe`. If `pe < industryPe` and `roe > 15%`, highlight positive valuation efficiency.
3. **Step 3: Governance & Red Flag Audit**:
   - Call `get_shareholding_pattern(sid)`.
   - **Mandatory Red Flag Check**: Inspect `promoterPledgedPct`:
     - `0.0%`: Clean balance sheet governance.
     - `5.0% - 20.0%`: Moderate risk warning.
     - `> 20.0%`: **CRITICAL RED FLAG** — Warn user of margin-call liquidation danger.
4. **Step 4: Live Price Action & Drawdown**:
   - Call `get_live_quotes(sids=[sid])`.
   - Evaluate `away52wHigh` (drawdown from 52-week peak) and `volume`.
5. **Step 5: Synthesize Report**:
   - Format the response adhering to [`assets/templates/stock_due_diligence.md`](assets/templates/stock_due_diligence.md).

---

### Workflow 3: Custom Equity Screening
When asked to find, filter, or recommend stocks matching criteria (e.g., "Find high RoE companies", "Show me cheap tech stocks"):
1. Select target sectors and sorting metrics based on user intent or recipes in [`references/screener_recipes.md`](references/screener_recipes.md).
2. Call `run_stock_screener`:
   - E.g. for high quality: `sectors=["Information Technology", "Consumer Staples"]`, `sortBy="roe"`, `sortOrder="desc"`, `limit=15`.
   - E.g. for high dividend: `sortBy="divYield"`, `sortOrder="desc"`, `limit=15`.
3. Post-filter results to verify positive earnings and reasonable valuations.
4. Present findings in a structured comparison table with actionable takeaway notes.

---

### Workflow 4: Portfolio Governance & Red-Flag Audit
When a user provides a list of stocks in their portfolio (e.g., "Check my portfolio: RELI, ADANIENT, TCS, INFY"):
1. Query `get_market_mood_index` to assess the broader market risk posture.
2. Batch query `get_live_quotes(sids=list_of_sids)` to extract current prices and 52-week drawdowns.
3. Iteratively call `get_shareholding_pattern(sid)` for each stock to scan for pledged promoter shares.
4. Output a comprehensive audit using [`assets/templates/portfolio_audit.md`](assets/templates/portfolio_audit.md), highlighting any critical flags in red.

---

### Workflow 5: US Stocks & Global Comparison
When asked about US equities, global tech giants, or US ETFs (AAPL, MSFT, NVDA, SPY, QQQ):
1. Call `get_us_market_quotes(tickers=['AAPL', 'MSFT', 'NVDA'])`.
2. Compare intraday movement (`changePercent`), trading volume, and distance from previous close.
3. If user is considering currency impact, invoke `get_forex_rates(pairs=['USDINR'])` to factor in rupee depreciation/appreciation.

---

## Decision Trees & Error Handling

```
               [User Financial Query]
                         │
         Is it Macro, Stock, or Screener?
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
      [Macro]         [Stock]        [Screener]
         │               │               │
  get_market_mood   search_ticker   run_stock_screener
         │               │               │
  Evaluate 0-100    get_stock_info   Format Ranked Table
  Zones (0/30/50/70)     │
                    get_shareholding
                         │
                    get_live_quotes
                         │
                   Audit Red Flags
```

### Failure Recovery & Fallbacks
- **Unknown Symbol / 404**: If `get_stock_info` fails, invoke `search_ticker` to resolve the correct symbol or confirm if the entity is an ETF (calling `get_etf_info` instead).
- **Market Closed / Zero Volume**: Acknowledge that the exchange is closed and base pricing on the `close` / `lastClosePrice` values.
- **Batching & Rate Limit Safeguard**: Never exceed 30 symbols in a single `get_live_quotes` call. Split larger lists into chunks.

---

## Security & Input Validation

1. **Input Sanitization**: Strip dangerous punctuation, shell metacharacters, and limit queries to 100 alphanumeric characters.
2. **Least Privilege**: All tools are strictly read-only (`readOnlyHint: true`). The skill never attempts financial transactions or trades.
3. **Defensive Output Sanitization**: Never echo sensitive session cookies or internal headers into user-facing transcripts.

---

## Concrete Multi-Tool Examples

### Example 1: Evaluating TCS under Extreme Fear
**User**: "Nifty has crashed today. Should I buy TCS?"
**Agent Tool Execution**:
1. `get_market_mood_index()` -> Returns `score: 11.2, zone: 'Extreme Fear'`.
2. `get_stock_info(sid='TCS')` -> Returns `pe: 26.1, industryPe: 28.4, roe: 48.2%`.
3. `get_shareholding_pattern(sid='TCS')` -> Returns `promoterPledgedPct: 0.0%` (Clean).
4. `get_live_quotes(sids=['TCS', '.NSEI'])` -> Returns TCS price and drawdown from 52W high.
**Agent Response**: Synthesizes the finding: Macro sentiment is in **Extreme Fear**, presenting a statistically favorable accumulation window. TCS is fundamentally resilient with zero promoter pledge and a stellar 48% RoE, making it an attractive contrarian purchase.

---

## References & Templates

- **MMI Mechanics**: [`references/mmi_indicators.md`](references/mmi_indicators.md)
- **Metric Definitions**: [`references/metric_glossary.md`](references/metric_glossary.md)
- **Screener Recipes**: [`references/screener_recipes.md`](references/screener_recipes.md)
- **Due Diligence Template**: [`assets/templates/stock_due_diligence.md`](assets/templates/stock_due_diligence.md)
- **Portfolio Audit Template**: [`assets/templates/portfolio_audit.md`](assets/templates/portfolio_audit.md)
