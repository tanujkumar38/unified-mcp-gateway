---
name: financial-trading
description: Master financial trading and quantitative research skill covering market fundamentals, technical analysis, advanced price action (BOS, CHOCH, MSS, liquidity sweeps), mathematical modeling (EV, Kelly criterion, distributions, Bayesian reasoning, GARCH, copulas), institutional strategies (statistical arbitrage, pairs trading, market making, VWAP/TWAP/Almgren-Chriss execution, risk parity), strategy validation (bias-free backtesting, walk-forward analysis, Sharpe/Sortino metrics), and professional risk management and trading psychology.
metadata:
  version: "1.0.0"
  author: "Tanuj Kumar, AI Agent"
  license: "MIT"
  platforms: ["windows", "linux", "macos"]
  archetype: "hybrid"
---

# Financial Trading: From Fundamentals to Professional Mastery

An institutional-grade trading and quantitative reasoning system designed for AI agents executing financial research, strategy development, backtesting validation, risk management, and market analysis across equities, forex, futures, options, commodities, and digital assets.

---

## 🧭 Progressive Disclosure Architecture

To maintain optimal agent context efficiency, deep domain specifications are separated into modular references:

| Knowledge Domain | Reference Document | Key Content |
| :--- | :--- | :--- |
| **Market Mechanics** | [`references/01_market_fundamentals.md`](./references/01_market_fundamentals.md) | Instruments, participants (HFT/MM), order book depth, spreads, slippage, margin & sessions. |
| **Technical Analysis** | [`references/02_technical_analysis.md`](./references/02_technical_analysis.md) | S/R role reversal, channels, chart patterns, candlestick statistics, volume profile, indicator suites. |
| **Advanced Price Action** | [`references/03_advanced_price_action.md`](./references/03_advanced_price_action.md) | Market structure (HH/HL/LH/LL), BOS, CHOCH, MSS, liquidity sweeps, Supply & Demand, Auction Market Theory. |
| **Quantitative Mathematics** | [`references/04_quantitative_methods_and_math.md`](./references/04_quantitative_methods_and_math.md) | Expected Value, Kelly criterion, fat tails, Bayesian updating, GARCH, Monte Carlo, cointegration, HMM. |
| **Institutional Strategies** | [`references/05_institutional_strategies.md`](./references/05_institutional_strategies.md) | Stat Arb, pairs trading, market making, Almgren-Chriss execution, Risk Parity, Black-Litterman, HRP. |
| **Strategy Validation** | [`references/06_strategy_development_validation.md`](./references/06_strategy_development_validation.md) | Regime detection, entry/exit rules, stop/target models, bias elimination, walk-forward, performance metrics. |
| **Risk & Psychology** | [`references/07_risk_management_and_psychology.md`](./references/07_risk_management_and_psychology.md) | Capital preservation, VaR, Risk of Ruin, daily loss limits, 10 cognitive biases, trading journal protocol. |

---

## ⚙️ Standard Operating Procedures (SOPs)

Whenever conducting a market analysis, designing a strategy, or reviewing a trade setup, execute the following 6-step discipline:

```
[1. Macro & Regime Context] ──> [2. Market Structure & Liquidity] ──> [3. Mathematical Edge (EV)]
                                                                               │
[6. Psychological De-biasing] <── [5. Trade Execution & Protection] <── [4. Position Sizing (Kelly/ATR)]
```

### SOP 1: Pre-Market Context & Regime Identification
1. **Determine Active Session**: Asian, London, New York, or London-NY Overlap (highest liquidity & volatility).
2. **Identify Market Regime**:
   - *Trending*: Higher Highs/Lows (Uptrend) or Lower Highs/Lows (Downtrend), ADX > 25, price aligned with 50/200 EMA.
   - *Ranging/Mean-Reverting*: Flat swings, Bollinger Band squeeze, ADX < 20.
   - *High Volatility / Compressed*: Check ATR relative to 30-day baseline and VIX levels.
3. *Rule*: Never apply mean-reversion systems in explosive trending regimes, and never trade trend-following breakouts inside compressed, low-volume ranges.

### SOP 2: Advanced Price Action & Liquidity Audit
1. **Analyze Higher Timeframe (HTF) Structure**:
   - Establish current swing points (HH, HL, LH, LL).
   - Detect recent **Break of Structure (BOS)** confirming trend continuation.
   - Watch for **Change of Character (CHOCH)** and **Market Structure Shift (MSS)** with displacement confirming reversal.
2. **Locate Institutional Liquidity Pools**:
   - Identify clustered stops: Buy-Side Liquidity (BSL) above swing highs and Sell-Side Liquidity (SSL) below swing lows.
   - Identify recent **Liquidity Sweeps** (false breakouts that sweep stops and reverse sharply).
3. **Map Supply & Demand Zones**:
   - Trace origin of aggressive imbalances (tight consolidation base followed by 2–5 explosive expansion candles).
   - Check Auction Market metrics: Point of Control (POC) and Value Area (70% volume range).

### SOP 3: Mathematical Edge & Expectancy Verification
1. **Calculate Risk-to-Reward (R:R)**: Minimum required R:R is **1:1.5**; institutional target is **1:2 to 1:3**.
2. **Calculate Break-Even Win Rate**:
   $$\text{Break-Even Win Rate} = \frac{\text{Risk}}{\text{Risk} + \text{Reward}}$$
3. **Verify Positive Expected Value (EV)**:
   $$\text{EV} = (P(\text{Win}) \times \text{Avg Win}) - (P(\text{Loss}) \times \text{Avg Loss}) > 0$$
   *Action*: If calculated EV is zero or negative, immediately reject the trade setup.

### SOP 4: Dynamic Volatility & Kelly Position Sizing
1. **Calculate Volatility Distance (ATR)**: Set stop-loss based on structural invalidation + buffer ($1.5 \times \text{ATR}$ to $2.0 \times \text{ATR}$).
2. **Calculate Maximum Allowable Capital at Risk**:
   - Conservative: 0.5% of total equity.
   - Standard: 1.0% of total equity.
   - Hard Ceiling: Never exceed 2.0% on any single trade.
3. **Run Position Sizing Tool**:
   ```bash
   python scripts/position_size_calculator.py fixed-risk --equity 10000 --risk-pct 1.0 --entry 100 --stop 95
   ```
4. **Fractional Kelly Boundary**: When using Kelly Criterion, always use **Half-Kelly ($f^* / 2$)** to eliminate tail-risk ruin.

### SOP 5: Trade Execution & Protection
1. **Entry Order Selection**:
   - Liquid breakout: Limit order on pullback to broken structure (re-test of demand/supply).
   - High urgency: Market order only when spread is tight (<0.05%) and liquidity is verified.
2. **Stop-Loss Implementation**:
   - Hard structural stop placed simultaneously with entry. No mental stops.
   - Never widen a stop-loss after order entry under any circumstance.
3. **Profit Taking Strategy**:
   - Scale out: 50% at 1:1.5 or next liquidity pool; move remaining stop to Breakeven (BE).
   - Trail balance with $2 \times \text{ATR}$ or structural swing lows/highs.

### SOP 6: Post-Trade Audit & Psychological De-biasing
1. **Log Trade**: Record complete execution details in [`assets/templates/trade_journal_entry.md`](./assets/templates/trade_journal_entry.md).
2. **Audit Cognitive Biases**:
   - *Confirmation Bias*: Did I seek disconfirming data before entry?
   - *Loss Aversion*: Did I hesitate to cut a losing trade?
   - *Revenge Trading / FOMO*: Was this trade planned or an impulsive reaction to a prior loss or sudden candle?
3. **Enforce Circuit Breakers**:
   - Daily Loss Limit: **-2% to -3%** $\rightarrow$ Terminate all trading for the session.
   - Weekly Loss Limit: **-5%** $\rightarrow$ Mandatory 48-hour strategy review.

---

## 🛠️ Deterministic Helper Tools

Execute the bundled Python script for error-free financial mathematics:

```bash
# Fixed Fractional Position Sizing
python scripts/position_size_calculator.py fixed-risk --equity 25000 --risk-pct 1.0 --entry 182.50 --stop 176.00

# ATR Volatility Position Sizing
python scripts/position_size_calculator.py atr-risk --equity 25000 --risk-pct 1.0 --entry 182.50 --atr 4.25 --multiplier 1.5

# Kelly Criterion & Half-Kelly Calculation
python scripts/position_size_calculator.py kelly --win-rate 0.55 --risk-reward 1.8 --half-kelly

# Expected Value (EV) & Expectancy Verification
python scripts/position_size_calculator.py ev --win-rate 0.52 --avg-win 350 --avg-loss 175

# Risk of Ruin Probability
python scripts/position_size_calculator.py risk-of-ruin --win-rate 0.50 --risk-reward 1.5 --risk-pct 1.0
```

---

## 📋 Hard Risk Rules & Guardrails

> [!CAUTION]
> 1. **Zero-Secret & Capital Preservation Rule**: Never risk more than 2% of total equity on any trade. Survival is prerequisite to compounding.
> 2. **No Unverified Backtests**: Every algorithmic strategy must survive Walk-Forward Analysis and Out-of-Sample testing with transaction costs and slippage modeled.
> 3. **Overfitting Rejection**: Any backtest exhibiting Sharpe > 3.0, Max Drawdown < 5%, or Win Rate > 75% on daily/intraday equities is assumed overfitted until proven otherwise.
> 4. **Disclaimer**: All outputs generated by this skill constitute technical, mathematical, and market structure analysis, not personalized SEBI/SEC financial advice.
