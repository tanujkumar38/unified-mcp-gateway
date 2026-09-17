# Market Mood Index (MMI) Comprehensive Reference

The **Market Mood Index (MMI)** is Tickertape's proprietary sentiment indicator designed to quantify the prevailing emotional state of the Indian equity market on a continuous scale of **0 to 100**.

---

## 1. The Four Emotional Zones & Actionable Playbook

```
  0 ────────── 30 ──────────────── 50 ──────────────── 70 ────────── 100
 [ EXTREME FEAR ]   [    FEAR    ]   [    GREED   ]   [ EXTREME GREED ]
     Oversold          Cautious          Optimistic         Frothy / Top
  Lump-Sum Buy       SIP Accumulate     Avoid FOMO        Take Profits
```

### Zone 1: Extreme Fear (Score: 0 – 29.99)
- **Market Psychology**: Widespread panic, capitulation, extreme pessimism, retail sell-offs.
- **Valuation State**: Equities are heavily oversold; high-quality businesses frequently trade at deep discounts.
- **Actionable Playbook**: 
  - **Aggressive Accumulation**: Historically, extreme fear represents the highest risk-reward window for lump-sum equity deployment.
  - **Focus**: Large-cap compounders, blue chips, and broad index ETFs (`.NSEI`, `.BSESN`).
  - **Avoid**: Leveraged shorting or panic-selling existing long-term holdings.

### Zone 2: Fear (Score: 30 – 49.99)
- **Market Psychology**: Caution prevails. Investors are hesitant after corrections or volatile macroeconomic prints.
- **Valuation State**: Multiples are normalizing toward historical medians.
- **Actionable Playbook**:
  - **Systematic Investment Plan (SIP)**: Maintain disciplined regular purchases.
  - **Quality Filtering**: Screen for companies with high Return on Equity (`RoE > 15%`) and low leverage.

### Zone 3: Greed (Score: 50 – 69.99)
- **Market Psychology**: Broad optimism, steady capital inflows, retail participation surges.
- **Valuation State**: Valuation multiples expand; stocks trade near or slightly above fair intrinsic value.
- **Actionable Playbook**:
  - **Selective Stock Picking**: Avoid broad market chasing; focus on specific lagging sectors.
  - **Discipline**: Enforce strict stop-losses; refrain from FOMO entries at 52-week highs.

### Zone 4: Extreme Greed (Score: 70 – 100)
- **Market Psychology**: Euphoria, speculative frenzy, ungrounded price targets, complacency.
- **Valuation State**: Markets are statistically overbought; high risk of sharp mean-reversion corrections.
- **Actionable Playbook**:
  - **Defensive Posture**: Pause aggressive lump-sum deployments.
  - **Profit Booking**: Rebalance portfolio, trim speculative low-conviction small-caps, and raise cash buffers.
  - **Risk Management**: Tighten trailing stop-losses on swing trades.

---

## 2. The 6 Equal-Weighted Underlying Indicators (~16.67% each)

| Indicator | Metric Field | Data Source | Interpretation & Mechanics |
| :--- | :--- | :--- | :--- |
| **1. FII Activity** | `fii` | NSE Index Futures | Measures net open interest and flow of Foreign Institutional Investors. Heavy net buying pushes score toward Greed; sustained institutional outflows drive Fear. |
| **2. Volatility & Skew** | `skew` | India VIX & Options Chain | **India VIX**: Reflects 30-day forward annualized implied volatility. High VIX = Fear.<br>**Skew**: Difference between OTM Put IV and OTM Call IV. High put demand indicates hedging against sharp drops. |
| **3. Momentum** | `momentum` | Nifty 50 Moving Averages | Computes `(EMA_30 - EMA_90) / EMA_90`. A widening positive gap signals powerful bullish momentum (Greed); a negative crossover indicates breakdown (Fear). |
| **4. Market Breadth** | `trin` | Advance/Decline & Volume | **Modified Arms Index (TRIN)**: `(Advances / Declines) / (Advance Volume / Decline Volume)`. Values below `1.0` indicate volume-backed participation across broad sectors. |
| **5. Price Strength** | `extrema` | 52-Week Highs/Lows | Calculates `(% Stocks near 52W High) - (% Stocks near 52W Low)`. High positive values indicate broad structural market strength. |
| **6. Demand for Gold** | `goldOnNifty`| MCX Gold vs Nifty 50 | Compares 2-week rolling returns of Gold relative to the Nifty 50. Strong gold outperformance indicates capital flight to safe havens, increasing the Fear score. |

---

## 3. Recommended Multi-Factor Check Matrix

Always evaluate individual equities against the prevailing MMI environment:

```
IF MMI in "Extreme Fear":
    Prioritize: Intrinsic Value undervaluation + High Interest Coverage (> 4.0)
    Execution: Lump-sum or multi-tranche accumulation
ELSE IF MMI in "Extreme Greed":
    Prioritize: Debt-to-Equity (< 0.5) + Low Beta (< 0.9) + Low Pledged Shares (0%)
    Execution: Tight trailing stop-losses, take profits into strength
```
