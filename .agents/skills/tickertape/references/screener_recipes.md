# Ready-to-Use Screener Recipes & Screening Strategies

These recipes define battle-tested investment criteria that agents can execute against the `run_stock_screener` MCP tool.

---

## Recipe 1: Quality Compounders (Buffett & Lynch Style)

**Objective**: Identify resilient, highly profitable businesses with strong balance sheets and high capital efficiency.

- **Target Sectors**: `["Information Technology", "Consumer Staples", "Healthcare", "Financials"]`
- **Screener Parameters**:
  - `sortBy`: `"marketCap"`
  - `sortOrder`: `"desc"`
  - `limit`: `20`
- **Post-Query Filters**:
  - Return on Equity (`RoE`): `> 18.0%`
  - Debt-to-Equity: `< 0.5`
  - Promoter Pledged Holdings: `0.0%`
  - 5-Year Sales CAGR: `> 12%`

---

## Recipe 2: Deep Value & Mean-Reversion Screen

**Objective**: Spot profitable companies trading at discounts to their peer group or historical multiples with low downside risk.

- **Target Sectors**: `["Energy", "Materials", "Industrials", "Utilities"]`
- **Screener Parameters**:
  - `sortBy`: `"pe"`
  - `sortOrder`: `"asc"`
  - `limit`: `25`
- **Post-Query Filters**:
  - Price-to-Earnings (`pe`): `< Industry P/E` and `> 5.0` (exclude loss-makers)
  - Price-to-Book (`pb`): `< 2.5`
  - Dividend Yield: `> 2.0%`
  - Solvency: Positive operating cash flow over past 3 years

---

## Recipe 3: High-Yield Dividend Cash Cows

**Objective**: Screen for cash-generative equities with high, sustainable shareholder distributions.

- **Target Sectors**: `["Utilities", "Energy", "Financials", "Consumer Staples"]`
- **Screener Parameters**:
  - `sortBy`: `"divYield"`
  - `sortOrder`: `"desc"`
  - `limit`: `20`
- **Post-Query Filters**:
  - Dividend Yield (`divYield`): `> 3.5%`
  - RoE: `> 12.0%`
  - Pledged Promoter Holdings: `< 5.0%`
  - Dividend Payout Ratio: Between `25%` and `75%` (avoids unsustainable debt-funded payouts)

---

## Recipe 4: Growth at a Reasonable Price (GARP)

**Objective**: Balance earnings expansion rates with valuation multiples to avoid speculative bubbles.

- **Target Sectors**: `["Information Technology", "Consumer Discretionary", "Healthcare"]`
- **Screener Parameters**:
  - `sortBy`: `"roe"`
  - `sortOrder`: `"desc"`
  - `limit`: `25`
- **Post-Query Filters**:
  - PEG Ratio (`P/E / Growth`): `< 1.5`
  - RoE: `> 20.0%`
  - Promoter Holding: `> 50.0%`
  - 52-Week High Drawdown: Within `20%` of 52-week peak
