# Institutional Strategies & Quantitative Execution

A comprehensive operational reference detailing institutional hedge fund architectures, statistical arbitrage, market making, algorithmic order execution, and modern portfolio construction.

---

## 1. Institutional Trading Desk Architecture

Institutional hedge funds, proprietary trading desks, and asset management firms operate specialized, segregated functional departments:

```
[Chief Investment Officer (CIO) / Investment Committee]
                         │
      ┌──────────────────┴──────────────────┐
      ▼                                     ▼
[Quantitative Research]               [Portfolio Managers (PMs)]
- Alpha generation                    - Capital allocation
- Statistical modeling                - Mandate compliance
      │                                     │
      └──────────────────┬──────────────────┘
                         ▼
             [Execution Trading Desk]
             - Algorithmic routing
             - Slippage / Market impact minimization
                         ▲
                         │
             [Chief Risk Officer (CRO) & Risk Management]
             - Real-time VaR, Greeks, Factor exposure limits
```

---

## 2. Quantitative Relative Value Strategies

Relative value strategies generate uncorrelated alpha by capturing structural mispricings between economically or statistically linked securities while hedging broad market directional risk.

### 1. Statistical Arbitrage (Stat Arb) & Pairs Trading
- **Hypothesis**: Two securities within the same sector (or index) sharing economic drivers exhibit a cointegrated price relationship. Temporary spread divergences revert to the long-term mean.
- **Workflow**:
  1. *Pair Selection*: Screen for cointegration using the **Engle-Granger Two-Step Method** or **Johansen Cointegration Test**.
  2. *Hedge Ratio Estimation*: Estimate $\beta$ via Ordinary Least Squares (OLS) or Dynamic Kalman Filtering:
     $$Y_t = \alpha + \beta X_t + \epsilon_t$$
  3. *Spread Construction*: Calculate the spread series $\epsilon_t = Y_t - \beta X_t$.
  4. *Z-Score Normalization*:
     $$Z_t = \frac{\epsilon_t - \mu_{\epsilon}}{\sigma_{\epsilon}}$$
  5. *Execution Rules*:
     - If $Z_t < -2.0$: **Long Asset $Y$ / Short $\beta$ units of Asset $X$**.
     - If $Z_t > +2.0$: **Short Asset $Y$ / Long $\beta$ units of Asset $X$**.
     - Exit Position when $Z_t$ reverts to $0.0$.
     - Hard Stop-Loss if $|Z_t| \ge 3.5$ (structural breakdown / divergence risk).

### 2. Equity Market Neutral (EMN)
- Establishes long positions in undervalued equities and simultaneous short positions in overvalued equities within the same industry sector.
- Maintains **Zero Beta ($\beta_{\text{portfolio}} = 0$)** and zero net dollar exposure:
  $$\text{Net Exposure} = \sum \text{Long Notional} - \sum \text{Short Notional} \approx 0$$
- Completely immunizes the portfolio from broad market bull/bear swings, isolating pure cross-sectional alpha.

### 3. Convertible Arbitrage
- Long undervalued convertible bonds of a corporation while simultaneously shorting the underlying common stock according to the bond's **Option Delta**:
  $$\text{Hedge Ratio} = \text{Delta} \times \text{Conversion Ratio}$$
- Captures fixed income coupon yield + mispriced implied volatility while remaining delta-neutral.

---

## 3. High-Frequency Market Making & Spread Capture

Market makers provide continuous passive two-sided quotes, monetizing the bid-ask spread while actively avoiding adverse selection.

### Avellaneda-Stoikov Model (2008)
The canonical mathematical model governing high-frequency market making under inventory risk.

1. **Reservation (Indifference) Price**:
   The internal price at which the market maker is indifferent to holding inventory:
   $$r(s, q, t) = s - q \cdot \gamma \cdot \sigma^2 \cdot (T - t)$$
   - $s$: Current mid-price.
   - $q$: Current net inventory (number of shares held).
   - $\gamma$: Market maker's risk-aversion parameter.
   - $\sigma$: Asset return volatility.
   - $T - t$: Time remaining in the trading session.
2. **Optimal Bid and Ask Spreads**:
   - When inventory is long ($q > 0$): Reservation price drops below mid-price $\rightarrow$ The market maker lowers quotes to discourage buyers and attract sellers, offloading inventory.
   - When inventory is short ($q < 0$): Reservation price rises above mid-price $\rightarrow$ The market maker raises quotes to attract buyers and cover the short.

---

## 4. Algorithmic Order Execution Frameworks

Large institutional orders cannot be executed as naive market orders without catastrophic price impact. Execution algorithms schedule and slice orders over time.

```
       Comparison of Execution Strategies:
       Execution Speed / Impact Trade-off
       High Market Impact / Low Timing Risk  <── Market Order / Aggressive Sweep
                            ▲
                            │   Implementation Shortfall (IS)
                            │   Almgren-Chriss Optimal Trajectory
                            │   VWAP (Volume-Weighted)
                            │   TWAP (Time-Weighted)
       Low Market Impact / High Timing Risk   <── Passive Iceberg Orders
```

### 1. Volume Weighted Average Price (VWAP) Algorithm
- Slices a large parent order into small child orders distributed across the day matching the asset's **historical U-shaped intraday volume curve** (heavy volume at open and close, light at midday).
- Benchmark: Compares executed average price against the market volume-weighted benchmark:
  $$\text{Slippage}_{\text{VWAP}} = \text{Average Fill Price} - \text{Market VWAP}$$

### 2. Time Weighted Average Price (TWAP) Algorithm
- Evenly divides order volume into static time slices across a designated execution window (e.g., executing 100 shares every 60 seconds for 2 hours). Used when volume profiles are erratic or illiquid.

### 3. Implementation Shortfall (Perold 1988)
- Measures total frictional cost of executing an institutional decision:
  $$\text{Total Cost} = \text{Execution Cost (Slippage)} + \text{Delay Cost} + \text{Opportunity Cost (Unfilled Orders)} + \text{Commissions}$$

### 4. Almgren-Chriss Optimal Execution Framework
Solves the fundamental trade-off between **Market Impact Cost** (rapid trading moves the market against the trader) and **Timing / Volatility Risk** (slow trading leaves the order exposed to adverse macroeconomic market drift):
$$\min_{x} E[x] + \lambda \cdot \text{Var}[x]$$
- Incorporates temporary market impact (transient order book disruption) and permanent market impact (informational price discovery).

---

## 5. Modern Portfolio Construction Methodologies

### 1. Markowitz Mean-Variance Optimization (MVO) & Limitations
- Solves for portfolio weights $w$ on the **Efficient Frontier**:
  $$\max_w \left( w^T \mu - \frac{\lambda}{2} w^T \Sigma w \right) \quad \text{s.t.} \quad \sum w_i = 1$$
- **The "Error Maximizer" Problem**: Classical MVO places extreme, concentrated weights on assets with slight estimation errors in expected return $\mu$ or covariance $\Sigma$.

### 2. Black-Litterman Model
- Starts with the **Market Equilibrium Portfolio** (reverse-engineered from market capitalization weights via CAPM).
- Blends investor subjective views $P$ with confidence matrix $\Omega$ using Bayesian updating:
  $$E[R] = \left[ (\tau \Sigma)^{-1} + P^T \Omega^{-1} P \right]^{-1} \left[ (\tau \Sigma)^{-1} \Pi + P^T \Omega^{-1} Q \right]$$
- Produces stable, diversified, intuitive asset allocations without extreme long/short corners.

### 3. Risk Parity
- Allocates capital such that every asset class (or factor) contributes an **equal share of total portfolio volatility risk**, rather than equal dollar weights:
  $$\text{Risk Contribution}_i = w_i \times \frac{(\Sigma w)_i}{\sigma_{\text{portfolio}}} = \frac{1}{N} \quad \forall i$$
- Typically uses leverage on low-volatility assets (e.g., sovereign bonds) to achieve target equity-like returns with significantly lower drawdown risk (e.g., Bridgewater All Weather).

### 4. Hierarchical Risk Parity (HRP - Lopez de Prado 2016)
Applies machine learning graph theory to solve covariance instability:
1. **Tree Clustering**: Computes correlation distance $d_{i,j} = \sqrt{\frac{1}{2}(1 - \rho_{i,j})}$ and clusters assets hierarchically.
2. **Quasi-Diagonalization**: Reorders the covariance matrix so that correlated assets are adjacent along the diagonal.
3. **Recursive Bisection**: Recursively splits clusters and allocates inverse-variance risk weights without requiring matrix inversion.
