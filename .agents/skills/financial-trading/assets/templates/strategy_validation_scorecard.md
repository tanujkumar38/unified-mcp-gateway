# Strategy Backtest & Validation Audit Scorecard

**Strategy Name**: `[e.g., Donchian Volatility Breakout System]`  
**Asset Class / Markets Tested**: `[e.g., US Equities / Nifty Futures / Forex Majors]`  
**Historical Backtest Period**: `[YYYY-MM-DD to YYYY-MM-DD (Minimum 5-10 years)]`  
**Data Resolution**: `[Tick / 1-Minute / Daily]`  
**Data Integrity**: `[Point-in-time, Survivorship-bias-free]`  

---

## 1. Backtest Performance Summary

| Metric | In-Sample (IS) Training | Out-of-Sample (OOS) Testing | Institutional Benchmark | Pass / Fail |
| :--- | :--- | :--- | :--- | :--- |
| **CAGR (Annual Return)** | `[0.0]%` | `[0.0]%` | $> 15.0\%$ | `[PASS/FAIL]` |
| **Sharpe Ratio** | `[0.00]` | `[0.00]` | $1.0 - 2.0$ | `[PASS/FAIL]` |
| **Sortino Ratio** | `[0.00]` | `[0.00]` | $> 1.50$ | `[PASS/FAIL]` |
| **Calmar Ratio** | `[0.00]` | `[0.00]` | $> 1.00$ | `[PASS/FAIL]` |
| **Max Drawdown (MDD)** | `-[0.0]%` | `-[0.0]%` | $< 25.0\%$ | `[PASS/FAIL]` |
| **Profit Factor** | `[0.00]` | `[0.00]` | $1.3 - 2.0$ | `[PASS/FAIL]` |
| **Win Rate** | `[0.0]%` | `[0.0]%` | $40\% - 65\%$ | `[PASS/FAIL]` |
| **Total Trades ($N$)** | `[0]` | `[0]` | $N > 300$ | `[PASS/FAIL]` |

---

## 2. Walk-Forward Analysis (WFA) Audit

- **Number of Rolling Windows**: `[e.g., 10 Windows]`
- **In-Sample Window Length**: `[e.g., 24 Months]`
- **Out-of-Sample Window Length**: `[e.g., 6 Months]`
- **Walk-Forward Efficiency (WFE)**: `[0.0]%`
  - *Standard*: $\text{WFE} \ge 60\%$ (Pass); $\text{WFE} < 40\%$ (Fail / Overfitted).
- **Consistency of OOS Windows**: `[e.g., 8 out of 10 windows profitable (80%)]`

---

## 3. Backtest Bias & Integrity Check

- `[ ]` **Survivorship Bias Eliminated**: Delisted and bankrupt securities included.
- `[ ]` **Look-Ahead Bias Eliminated**: All decision variables strictly lagged by 1 bar ($t-1$).
- `[ ]` **Realistic Friction Modeled**: Slippage and commissions subtracted from every trade.
- `[ ]` **Parameter Parsimony**: Strategy contains $\le 4$ free parameters.

---

## 4. Final Institutional Verdict

- `[ ]` **APPROVED FOR LIVE STAGED DEPLOYMENT** (Start with 25% allocation).
- `[ ]` **REVISE & RE-TEST** (Fails WFE or excessive OOS degradation).
- `[ ]` **REJECT** (Evidence of curve fitting or negative expectancy).
