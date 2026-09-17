# Quantitative Mathematics, Statistics & Algorithmic Models

A rigorous quantitative guide to mathematical expectation, probability distributions, volatility modeling, time-series analysis, Monte Carlo simulation, and advanced institutional econometrics.

---

## 1. Probability, Expectancy & Mathematical Edge

Trading is an exercise in probability distribution management under conditions of uncertainty.

### 1. Expected Value (EV)
The mathematical expectation per trade:
$$\text{EV} = (P_{\text{win}} \times W) - (P_{\text{loss}} \times L)$$
- $P_{\text{win}}$: Probability of winning (Win Rate as decimal).
- $P_{\text{loss}} = 1 - P_{\text{win}}$: Probability of losing.
- $W$: Average profit on winning trades (in currency or R-multiples).
- $L$: Average loss on losing trades (in currency or R-multiples).

### 2. Expectancy (in R-multiples)
$$\text{Expectancy} = (P_{\text{win}} \times R) - (1 - P_{\text{win}})$$
- Where $R = \frac{W}{L}$ is the Risk-to-Reward ratio.
- **Rule**: If Expectancy $\le 0$, no position sizing, psychological fortitude, or money management can prevent account bankruptcy over a statistically large sample size ($N > 500$).

### 3. Break-Even Win Rate Matrix
$$\text{Break-Even Win Rate} = \frac{1}{1 + R}$$

| Risk-to-Reward ($R$) | Minimum Required Win Rate |
| :--- | :--- |
| **1 : 1.0** | 50.00% |
| **1 : 1.5** | 40.00% |
| **1 : 2.0** | 33.33% |
| **1 : 2.5** | 28.57% |
| **1 : 3.0** | 25.00% |
| **1 : 5.0** | 16.67% |

---

## 2. Quantitative Position Sizing Formulations

### 1. Fixed Fractional Sizing
Allocates risk as a strict constant percentage of total account equity:
$$\text{Position Size (Units)} = \frac{\text{Account Equity} \times \text{Risk \%}}{|\text{Entry Price} - \text{Stop Loss Price}|}$$

### 2. Volatility-Adjusted (ATR) Sizing
Protects against volatility contraction/expansion cycles by standardizing risk to current market noise:
$$\text{Stop Distance} = k \times \text{ATR}_{14} \quad (k \in [1.5, 2.5])$$
$$\text{Position Size} = \frac{\text{Account Equity} \times \text{Risk \%}}{k \times \text{ATR}_{14}}$$

### 3. Kelly Criterion & Half-Kelly
Derived by J.L. Kelly Jr. (1956) to maximize the long-term expected logarithmic growth rate of capital:
$$f^* = \frac{b \cdot p - q}{b} = \frac{p \cdot (b + 1) - 1}{b}$$
- $f^*$: Optimal fraction of total equity to wager.
- $p$: Probability of win.
- $q = 1 - p$: Probability of loss.
- $b$: Odds received on wager ($\text{Reward} / \text{Risk}$).

> [!WARNING]
> **Full Kelly Volatility Danger**: Full Kelly trading yields excessive drawdown swings ($\sim 50\%-70\%$ drawdowns) due to parameter estimation error. Institutional quantitative standards mandate **Half-Kelly**:
> $$f_{\text{safe}} = \frac{f^*}{2}$$

---

## 3. Compounding Dynamics & The Asymmetry of Losses

### Future Value Compounding Formula
$$\text{FV} = \text{PV} \times (1 + r)^n$$
- **Rule of 72**: Years/periods to double capital $\approx \frac{72}{\text{Annual Return \%}}$.

### The Asymmetry of Drawdown Recovery
Losses compound geometrically against account equity. As drawdowns deepen, the return required to return to breakeven escalates non-linearly:

| Drawdown Experienced | Return Required to Breakeven |
| :--- | :--- |
| **-10%** | +11.1% |
| **-20%** | +25.0% |
| **-30%** | +42.9% |
| **-40%** | +66.7% |
| **-50%** | **+100.0%** |
| **-70%** | **+233.3%** |
| **-90%** | **+900.0%** |

---

## 4. Probability Distributions & The Reality of Fat Tails

```
        Standard Normal vs Leptokurtic (Financial Market) Distribution
             Density
                ▲
                │          ▲  <- Higher Peak
                │         / \
                │        /   \     Normal Distribution (Gaussian)
                │       /  :  \ -- Leptokurtic Distribution (Fat Tails)
                │      /   :   \
                │    /     :     \
                │  /       :       \
             ───┴─'────────:────────'───► Returns
                Extreme Left Tail (Market Crash Risk)
```

### 1. Gaussian (Normal) Distribution Assumption vs Reality
- Classical finance (Black-Scholes, Markowitz MVO) assumes financial returns are normally distributed: $X \sim \mathcal{N}(\mu, \sigma^2)$.
- **Empirical Reality**: Asset returns are **Leptokurtic** (Excess Kurtosis $> 3$).
- *Implication*: Extreme tail events (4$\sigma$, 5$\sigma$, 6$\sigma$ market crashes like 1987 Black Monday, 2008 Lehman, 2020 COVID) occur thousands of times more frequently than Gaussian models predict.

### 2. Student's t & Power Law Distributions
- **Student's t-Distribution**: Features a degrees-of-freedom parameter $\nu$ controlling tail heaviness. As $\nu \to \infty$, it converges to Normal; for financial assets, empirical fit yields $\nu \in [3, 5]$.
- **Power Law / Pareto Tails**: Probability of extreme moves scales as $P(|X| > x) \sim x^{-\alpha}$.

---

## 5. Volatility Modeling: Historical, Implied & GARCH

### 1. Realized Volatility (Annualized)
$$\sigma_{\text{ann}} = \sqrt{252} \times \sqrt{\frac{1}{N-1} \sum_{t=1}^N (r_t - \bar{r})^2}$$

### 2. Volatility Clustering (Mandelbrot's Axiom)
- "Large changes tend to be followed by large changes, of either sign, and small changes tend to be followed by small changes."

### 3. GARCH(1,1) Model (Bollerslev 1986)
Quantifies time-varying conditional volatility with persistence and mean-reversion:
$$\sigma_t^2 = \omega + \alpha \cdot \epsilon_{t-1}^2 + \beta \cdot \sigma_{t-1}^2$$
- $\omega$: Baseline long-term variance weight ($\omega > 0$).
- $\alpha$: ARCH coefficient (reaction speed to recent shock $\epsilon_{t-1}^2$).
- $\beta$: GARCH coefficient (persistence of previous volatility $\sigma_{t-1}^2$).
- *Stationarity Condition*: $\alpha + \beta < 1$. The closer $\alpha + \beta$ is to 1, the longer volatility shocks persist.

---

## 6. Time-Series Modeling & Stationarity

### 1. Stationarity & Unit Root Testing
- Financial models require a **weakly stationary** time series:
  1. Constant mean: $E[X_t] = \mu \quad \forall t$.
  2. Constant variance: $\text{Var}(X_t) = \sigma^2 \quad \forall t$.
  3. Autocovariance depends only on lag $k$: $\text{Cov}(X_t, X_{t+k}) = \gamma_k$.
- Raw asset prices are non-stationary (Random Walk / $I(1)$). Returns $r_t = \ln(P_t / P_{t-1})$ are integrated of order zero ($I(0)$).
- **Augmented Dickey-Fuller (ADF) Test**: Evaluates null hypothesis $H_0$: Unit root present (non-stationary). If $p\text{-value} < 0.05$, reject $H_0$ and confirm stationarity.

### 2. ARIMA($p, d, q$)
- $p$: Autoregressive order (AR).
- $d$: Degree of differencing required for stationarity.
- $q$: Moving Average order (MA).

---

## 7. Monte Carlo Simulations & Value at Risk (VaR)

Monte Carlo simulations model probabilistic outcomes across tens of thousands of randomly generated trade paths.

### 1. Geometric Brownian Motion (GBM) Price Paths
$$S_{t+\Delta t} = S_t \exp\left( \left(\mu - \frac{\sigma^2}{2}\right)\Delta t + \sigma \sqrt{\Delta t} \cdot Z_t \right) \quad (Z_t \sim \mathcal{N}(0,1))$$

### 2. Value at Risk (VaR) & Expected Shortfall (CVaR)
- **Value at Risk ($\text{VaR}_\alpha$)**: The maximum monetary loss expected over a specific horizon $T$ at confidence level $1 - \alpha$ (typically 95% or 99%):
  $$\text{VaR}_{95\%} = -(\mu - 1.645 \cdot \sigma) \times \text{Portfolio Value}$$
- **Conditional Value at Risk / Expected Shortfall ($\text{CVaR}_\alpha$)**: The average expected loss *conditional upon* the loss exceeding the VaR threshold (superior metric for measuring tail risk).

---

## 8. Advanced Econometric & Quantitative Frameworks

### 1. Cointegration & Statistical Arbitrage (Engle-Granger)
- Two non-stationary time series $X_t \sim I(1)$ and $Y_t \sim I(1)$ are **cointegrated** if a linear combination is stationary:
  $$\epsilon_t = Y_t - \beta X_t \sim I(0)$$
- Spread $\epsilon_t$ possesses a constant mean and finite variance, enabling mean-reversion trading (Pairs Trading via Z-Score):
  $$Z_t = \frac{\epsilon_t - \mu_{\epsilon}}{\sigma_{\epsilon}}$$
  - Long Spread when $Z_t < -2.0$; Short Spread when $Z_t > +2.0$; Close at $Z_t = 0.0$.

### 2. Kalman Filter for Dynamic Hedge Ratios
- Rather than static linear regression $\beta$, the Kalman Filter dynamically estimates time-varying hedge ratios in real-time using recursive state-space equations (Update + Predict steps).

### 3. Hidden Markov Models (HMM) for Market Regimes
- Models the financial market as an unobserved (hidden) Markov process with discrete latent regimes (e.g., State 1: Bull Trend / Low Volatility; State 2: Bear Trend / High Volatility; State 3: Mean-Reverting Range). Transition probabilities govern regime shifts.

### 4. Copulas & Tail Dependence
- Sklar's Theorem decomposes joint multivariate distributions into marginal distributions and a copula $C(u_1, \dots, u_n)$.
- Clayton and Gumbel copulas model asymmetric tail dependence (e.g., assets correlate strongly during market crashes but uncouple during rallies).
