# Financial Metrics & Risk Audit Glossary

This glossary defines key financial terms, valuation multiples, and risk flags returned by the Tickertape MCP Server tools.

---

## 1. Valuation & Pricing Multiples

| Metric | Field in MCP | Ideal / Benchmark Range | Description & Interpretation |
| :--- | :--- | :--- | :--- |
| **Price-to-Earnings (P/E)** | `pe` | Sector dependent (Typically `< 25x` for value) | Stock price divided by Earnings Per Share (EPS). Compare with `industryPe`. If `pe < industryPe` with equal or superior RoE, stock may be undervalued. |
| **Price-to-Book (P/B)** | `pb` | `< 3.0x` for asset-heavy; higher for tech | Market price divided by Book Value per Share. Compare against `industryPb`. Useful for capital-intensive sectors, manufacturing, and banks. |
| **Earnings Per Share (EPS)** | `eps` | Positive & growing YoY | Net profit attributable to common shareholders divided by weighted average outstanding shares. |
| **Dividend Yield** | `divYield` | `> 2.5%` for income | Annual dividend payment divided by current stock price. High dividend yield provides a buffer during volatile markets. |
| **Market Capitalization** | `marketCap` | In Crore (₹ Cr) | Total dollar/rupee value of outstanding shares. Large-cap: `> ₹20,000 Cr`, Mid-cap: `₹5,000 - ₹20,000 Cr`, Small-cap: `< ₹5,000 Cr`. |
| **Beta** | `beta` | `< 1.0` (Defensive), `> 1.0` (Aggressive) | Measure of systematic volatility relative to the Nifty 50. A beta of `0.8` means the stock fluctuates 20% less than the market index. |

---

## 2. Quality & Capital Efficiency Ratios

| Metric | Field in MCP | Target Threshold | Description & Interpretation |
| :--- | :--- | :--- | :--- |
| **Return on Equity (RoE)** | `roe` | `> 15.0%` | Net income divided by shareholders' equity. Indicates management's ability to generate profits from equity capital. |
| **3-Month Average Volume**| `threeMonthAvgVolume` | High liquidity | Average daily trading volume over past 90 days. High volume prevents slippage on institutional orders. |
| **52-Week Range Drawdown**| `away52wHigh` | `< 15%` (Strong), `> 30%` (Deep dip) | Percentage distance from the 52-week peak. Used to assess accumulation opportunity or downtrend severity. |

---

## 3. Governance & Red Flag Audit Criteria

The **Red Flag Audit** is a critical differentiator in the Tickertape ecosystem. Always evaluate these criteria before executing or recommending an investment.

| Red Flag Check | Target Value | Risk Severity | Failure Consequence |
| :--- | :--- | :--- | :--- |
| **Promoter Pledging %** (`promoterPledgedPct`) | `0.0%` (Acceptable: `< 5.0%`) | **CRITICAL RED FLAG** if `> 20%`<br>**MODERATE RISK** if `> 5%` | High pledge indicates promoter borrowing against equity. Sharp market dips trigger margin calls and forced selling cascades. |
| **Promoter Holding Trend** | Stable or Increasing | **HIGH RISK** if decreasing over 3 consecutive quarters | Disinvestment by founders may indicate internal governance trouble or weakening cash flows. |
| **Institutional Inflows** (`mutualFundPct`, `foreignInstTotalPct`)| Increasing | **MODERATE RISK** if institutional flight observed | FII and DII accumulation signals institutional backing and balance-sheet validation. |
| **Regulatory Surveillance (ASM / GSM)** | Must be **CLEAN** | **CRITICAL RED FLAG** | Securities in Additional Surveillance Measure (ASM) or Graded Surveillance Measure (GSM) face trading restrictions, high margins, and price band limits. |

---

## 4. ETF-Specific Metrics

| Metric | Field in MCP | Target Threshold | Interpretation |
| :--- | :--- | :--- | :--- |
| **Asset Under Management (AUM)**| `aum` | `> ₹500 Cr` | Larger AUM ensures trading liquidity and tighter bid-ask spreads on the exchange. |
| **Expense Ratio** | `expenseRatio` | Lower is better (Compare with `industryExpenseRatio`)| Annual fee charged by the AMC to manage the fund. In passive index funds, target `< 0.20%`. |
| **Tracking Error** | `trackingError` | Lowest in peer group | Standard deviation of excess returns between the ETF and its underlying benchmark. Lower tracking error denotes superior replication fidelity. |
| **Liquidity Rating** | `liquidityRating` | `"High"` | Assessment of market maker depth and intraday traded volume. |
