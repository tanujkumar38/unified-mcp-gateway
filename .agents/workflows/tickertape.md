---
name: tickertape
description: Institutional Indian stock screening, Market Mood Index (MMI), promoter pledge audits, and live equity analytics via Tickertape MCP.
---

# Tickertape Market Intelligence Workflow

Activate the tickertape skill and MCP tools to analyze Indian equities, ETFs, indices, and market sentiment:
1. Fetch live Market Mood Index (MMI) via get_market_mood_index to identify market emotion zone (Extreme Fear, Fear, Greed, Extreme Greed).
2. Search and resolve assets via search_ticker.
3. Fetch fundamental valuation ratios (P/E, P/B, RoE, 52W range) via get_stock_info.
4. Audit promoter shareholding and detect Pledged Promoter % red-flags (>15% danger) via get_shareholding_pattern.
5. Run sector screener filters via 
un_stock_screener.
6. Retrieve live quotes for NSE/BSE stocks and indices via get_live_quotes.
