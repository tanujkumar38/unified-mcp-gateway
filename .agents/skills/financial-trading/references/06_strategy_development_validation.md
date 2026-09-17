# Strategy Development, Backtesting & Validation Framework

A definitive operational guide to quantitative strategy formulation, algorithmic backtesting integrity, bias eradication, walk-forward analysis, and statistical performance evaluation.

---

## 1. Strategy Development Lifecycle

Every institutional trading strategy evolves through a formal, documented 7-stage lifecycle:

```
[1. Market & Regime Hypothesis] ──> [2. Rule Formalization (Entry/Exit)] ──> [3. Trade Filters & Sizing]
                                                                                        │
[7. Live Staged Deployment] <── [6. Walk-Forward / OOS Audit] <── [5. Bias-Free Backtest]
```

### Stage 1: Hypothesis Formulation
- Base the strategy on an authentic, persistent economic anomaly or behavioral market inefficiency:
  - *Structural*: Liquidity sweeps at market open due to retail stop placement.
  - *Statistical*: Cointegrated equity pair mean-reverting due to shared supply-chain fundamentals.
  - *Behavioral*: Post-earnings announcement drift (PEAD) or momentum persistence.

### Stage 2: Formalizing Objective Rules
- **Entry Rules**: Mathematical or rule-based triggers with zero subjectivity. (e.g., "Close > Upper 20-day Donchian Band AND 200 EMA slope > 0").
- **Stop-Loss Rules**: Predetermined point of invalidation placed upon entry. (e.g., "Lowest low of the past 10 candles OR Entry $- 2.0 \times \text{ATR}_{14}$").
- **Take-Profit Rules**: Target fixed R:R multiples (1:2 minimum) or exit upon dynamic indicator reversal (e.g., "Close < 10 EMA").

### Stage 3: Trade Filters
- **Trend Filter**: Only take long trades if daily price > 200 SMA.
- **Volatility Filter**: Invalidate entries if $\text{ATR}_{14} < \text{SMA}(\text{ATR}_{14}, 50)$ (avoid dead ranges).
- **Time/Event Filter**: Block all trade execution 30 minutes before and after high-impact macroeconomic data (FOMC, CPI, NFP).

---

## 2. The 4 Fatal Backtesting Biases

Most backtests fail in live execution because they inadvertently incorporate statistical biases that artificially inflate historical returns.

```
       The Bias Trap:
       Historical Data ──[Survivorship Bias: Only winners included]──┐
                       ──[Look-Ahead Bias: Future data leaked]──────┼──► Artificial "Holy Grail"
                       ──[Selection Bias: Snooped parameters]───────┤    (Crashes in Live Trading)
                       ──[Zero Cost Modeling: Friction ignored]─────┘
```

### 1. Survivorship Bias
- **Hazard**: Testing an equity strategy only on current S&P 500 or Nifty 50 constituents. Stocks that suffered bankruptcy, delisting, or severe drawdowns (e.g., Enron, Lehman Brothers, Yes Bank) are omitted from the sample.
- **Remedy**: Backtest strictly using **point-in-time, survivorship-bias-free datasets** (e.g., CRSP, Compustat, Norgate Data) that include all historically delisted companies.

### 2. Look-Ahead Bias
- **Hazard**: Leaking future information into the decision timestamp of a past bar.
  - *Examples*: Calculating an indicator using the current bar's `Close` price while executing orders at the current bar's `Open`; referencing end-of-day corporate earnings before official public announcement.
- **Remedy**: Always lag indicators by 1 period ($t-1$) for trade signals executing at time $t$. Ensure corporate actions use exact historical release timestamps.

### 3. Selection Bias & Data Snooping
- **Hazard**: Running thousands of indicator combinations across the same historical dataset until an arbitrary setup produces a high Sharpe ratio purely by random chance.
- **Remedy**: Apply **White's Reality Check** or the **Hansen Superior Predictive Ability (SPA) test**. Penalize multiple hypothesis testing using the Bonferroni correction:
  $$\alpha_{\text{adjusted}} = \frac{\alpha_{\text{base}}}{K} \quad (K = \text{number of models tested})$$

### 4. Zero-Friction Assumption
- **Hazard**: Backtesting without modeling commissions, exchange fees, bid-ask spreads, and realistic slippage.
- **Remedy**: Mandate conservative friction penalties:
  - Equities: 5–10 bps round-trip commission + 1–2 ticks slippage.
  - Forex/Futures: Full prevailing spread + 1 tick slippage per execution.

---

## 3. Overfitting & Curve Fitting Detection

Overfitting occurs when a mathematical model memorizes historical noise rather than learning the underlying market signal.

### Overfitting Red Flags Matrix

| Metric / Attribute | Institutional Safe Range | Overfitted / Dangerous Red Flag |
| :--- | :--- | :--- |
| **Sharpe Ratio** | 1.0 – 2.0 (Solid Edge) | **$> 3.0$** (Almost certainly overfitted) |
| **Max Drawdown** | 10% – 25% | **$< 5\%$** (Unrealistic curve fit) |
| **Win Rate** | 40% – 60% (Trend/Swing) | **$> 75\%$** (Curve-fitted stop manipulation) |
| **Parameter Count** | $\le 4$ free parameters | **$> 8 - 10$ parameters** |
| **IS vs OOS Degradation** | OOS Performance $\ge 70\%$ of IS | OOS Performance drops by $>50\%$ |

---

## 4. Advanced Validation: Walk-Forward Analysis (WFA)

Walk-Forward Analysis (Pardo 1992) is the industry standard for evaluating strategy robustness and parameter adaptability across shifting market regimes.

```
       Walk-Forward Analysis Architecture:
       Period 1: [--- In-Sample Training ---][-- OOS Test --]
       Period 2:         [--- In-Sample Training ---][-- OOS Test --]
       Period 3:                 [--- In-Sample Training ---][-- OOS Test --]
       Period 4:                         [--- In-Sample Training ---][-- OOS Test --]
                                         ═══════════════════════════
       Combined OOS Equity Curve = Stitch all Out-of-Sample periods sequentially
```

### Walk-Forward Procedure
1. Divide historical data into $M$ overlapping time segments.
2. Optimize parameters exclusively on **In-Sample (IS)** training window (e.g., 2 years).
3. Lock optimal parameters; execute out-of-sample forward test on untouched **Out-of-Sample (OOS)** window (e.g., 6 months).
4. Roll both windows forward by the step size (6 months) and repeat.
5. Concatenate all OOS results into a continuous **Walk-Forward Equity Curve**.

### Walk-Forward Efficiency (WFE)
$$\text{WFE} = \frac{\text{Annualized OOS Return}}{\text{Annualized IS Return}} \times 100$$
- **$\text{WFE} \ge 60\%$**: Highly robust strategy; genuine statistical edge.
- **$\text{WFE} < 40\%$**: Fragile, overfitted model; reject from live deployment.

---

## 5. Quantitative Performance Metrics Reference

### Return Metrics
- **CAGR (Compound Annual Growth Rate)**:
  $$\text{CAGR} = \left(\frac{\text{Ending Equity}}{\text{Starting Equity}}\right)^{\frac{1}{n}} - 1 \quad (n = \text{years})$$

### Risk-Adjusted Ratios
- **Sharpe Ratio (Annualized)**:
  $$\text{Sharpe} = \sqrt{252} \times \frac{\bar{r}_p - r_f}{\sigma_p}$$
- **Sortino Ratio**:
  Penalizes only downside (harmful) volatility, ignoring upside volatility:
  $$\text{Sortino} = \sqrt{252} \times \frac{\bar{r}_p - r_f}{\sigma_{\text{downside}}}$$
  $$\sigma_{\text{downside}} = \sqrt{\frac{1}{N} \sum_{t=1}^N \min(0, r_t - \tau)^2}$$
- **Calmar Ratio**:
  $$\text{Calmar} = \frac{\text{Annualized Return}}{\text{Maximum Drawdown \%}}$$
  - $\text{Calmar} > 1.0$: Acceptable; $\text{Calmar} > 2.0$: Institutional grade.

### Trade Level Metrics
- **Profit Factor (PF)**:
  $$\text{Profit Factor} = \frac{\sum \text{Gross Winning Trades}}{\sum |\text{Gross Losing Trades}|}$$
  - $\text{PF} < 1.0$: Losing strategy; $\text{PF} \in [1.3, 1.8]$: Sustainable edge; $\text{PF} > 2.5$: Investigate overfitting.
- **Maximum Drawdown (MDD)**:
  $$\text{MDD} = \max_{t \in [0, T]} \left( \frac{\text{Peak Value}_t - \text{Trough Value}_t}{\text{Peak Value}_t} \right)$$
