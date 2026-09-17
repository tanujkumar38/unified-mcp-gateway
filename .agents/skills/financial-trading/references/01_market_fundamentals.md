# Market Fundamentals & Microstructure

A comprehensive reference for financial market mechanics, instrument classes, participant hierarchies, order book dynamics, and liquidity infrastructure.

---

## 1. Financial Market Functions

Financial markets serve four primary systemic economic functions:
1. **Price Discovery**: Continuous real-time determination of asset fair value driven by aggregated buying and selling interest.
2. **Liquidity Provision**: The facility enabling market participants to buy or sell securities rapidly with minimal market impact / price dislocation.
3. **Risk Transfer**: Mechanisms allowing commercial hedgers to shift price, currency, interest rate, and commodity risk to speculative participants willing to bear it.
4. **Capital Allocation**: Steering economic capital toward productive enterprises through primary market underwriting and secondary market valuation.

### Market Architectures
- **Exchange-Traded (Centralized)**: Standardized contracts, centralized clearinghouse (guaranteeing against counterparty default), multilateral continuous double-auction limit order books (e.g., NYSE, CME, NSE).
- **Over-The-Counter (OTC)**: Decentralized, bilateral dealer networks quoting bid/ask prices directly (e.g., Spot FX, Interest Rate Swaps, bespoke forward contracts).
- **Primary Markets**: Initial capital issuance (IPOs, FPOs, sovereign/corporate debt issuances).
- **Secondary Markets**: Trading of existing, outstanding securities between investors and traders.

---

## 2. Asset Class Specifications

| Asset Class | Underlying Vehicle | Trading Venue | Leverage Profile | Settlement & Mechanics |
| :--- | :--- | :--- | :--- | :--- |
| **Equities (Stocks)** | Fractional equity ownership in corporations. | Centralized exchanges (NSE, BSE, NYSE, NASDAQ). | Cash (1:1) to Intraday Margin (4:1 - 5:1). | T+1 rolling settlement. Entitled to dividends, voting rights, and corporate actions. |
| **Indices** | Capitalization-weighted or price-weighted equity baskets (e.g., Nifty 50, S&P 500). | Traded via ETFs, Index Futures, and Index Options. | High (via Futures & Options). | Cash-settled. Used for macroeconomic benchmarking and broad portfolio hedging. |
| **Foreign Exchange (Forex)** | Bilateral currency pairs (EUR/USD, USD/INR, USD/JPY). | Global decentralized 24/5 interbank OTC network. | 20:1 to 100:1+. | Spot (T+2), Forwards, and Currency Futures. Quoted in base/quote currency pips. |
| **Commodities** | Physical raw materials: Energy (Crude, Gas), Metals (Gold, Silver, Copper), Agri. | Commodity exchanges (MCX, CME, NYMEX, LME). | High (via Futures). | Cash-settled or physical delivery on contract expiration. Sensitive to seasonality and geopolitical supply shocks. |
| **Futures** | Legally binding standardized forward commitments. | Derivatives exchanges. | High (initial margin typically 5%–20%). | Daily mark-to-market variation margin. Specified expiry dates, contract sizes, and tick sizes. |
| **Options** | Right, but not obligation, to buy (Call) or sell (Put) an underlying asset. | Options exchanges. | Non-linear leverage (Greeks: Delta, Gamma, Theta, Vega). | American (exercise anytime prior to expiry) vs European (exercise only on expiration date). Premium = Intrinsic + Extrinsic Time Value. |
| **Cryptocurrencies** | Decentralized digital cryptographic ledger tokens (BTC, ETH). | 24/7 Spot and Perpetual Swap exchanges. | Variable (1:1 Spot to 10:1 - 50:1 Perps). | T+0 instant blockchain or custodial internal ledger settlement. Extreme volatility. |

---

## 3. Market Participant Typology & Order Hierarchy

```
[Institutional Asset Managers / Sovereign Funds]  <── Massive size, slow execution (VWAP/TWAP)
                     │
[Hedge Funds & Proprietary Desks]                <── Alpha seeking, Stat-Arb, Directional Macro
                     │
[Market Makers (MMs) & High-Frequency Traders]   <── Passive liquidity providers, spread capture
                     │
[Retail Traders & Small Speculators]              <── Directional liquidity consumers, price takers
```

### Market Makers (MMs)
- **Role**: Continuously publish two-sided quotes (simultaneous Bid and Ask prices), guaranteeing market depth and earning the bid-ask spread.
- **Risk Exposure**:
  - *Inventory Risk*: Accumulating undesirable directional exposure during persistent one-sided market trends.
  - *Adverse Selection*: Trading against better-informed market participants (institutional news traders or quantitative funds).

### High-Frequency Trading (HFT)
- Utilizes co-located exchange server architecture, specialized FPGA hardware, and sub-millisecond execution speeds.
- Employs ultra-low latency statistical arbitrage, latency arbitrage, order book reconstruction, and high-speed passive market making.

---

## 4. Market Microstructure: Order Books, Spreads & Slippage

### The Limit Order Book (LOB)
- A dynamic, continuous queue of resting, passive buy orders (**Bids**) and sell orders (**Asks** / Offers) sorted by **Price-Time Priority (FIFO)**.
- **Market Depth (Level 2 / Level 3)**: Cumulative volume of limit orders resting at incremental price tiers above and below the current market price.

### Bid-Ask Spread Dynamics
$$\text{Absolute Spread} = \text{Ask Price} - \text{Bid Price}$$
$$\text{Percentage Spread} = \frac{\text{Ask Price} - \text{Bid Price}}{\text{Ask Price}} \times 100$$
- **Tight Spreads**: High market liquidity, intense market-maker competition, low volatility (e.g., EUR/USD, Nifty Index Futures).
- **Wide Spreads**: Illiquidity, elevated volatility, or impending macroeconomic announcements.

### Slippage Mechanics & Mitigation
- **Definition**: The difference between expected execution price and actual executed fill price.
- **Causes**:
  1. *Volatility Spikes*: Price moves during order transmission latency.
  2. *Market Orders in Thin Depth*: Consuming multiple price levels in the order book to satisfy an aggressive order.
- **Mitigation Rules**:
  - Use **Limit Orders** or **Stop-Limit Orders** instead of naked Market Orders.
  - Break large institutional orders into automated slices using execution algorithms (VWAP/TWAP/Iceberg).
  - Avoid entering during high-impact macroeconomic releases (CPI, Non-Farm Payrolls, RBI/Fed Interest Rate announcements).

---

## 5. Margin, Leverage & Liquidation Mathematics

### Leverage Ratio
$$\text{Leverage} = \frac{\text{Total Position Notional Value}}{\text{Account Equity}}$$
$$\text{Margin Requirement \%} = \frac{1}{\text{Leverage}} \times 100$$

### Margin Classifications
- **Initial Margin**: The minimum collateral balance required by exchange or broker to open a position.
- **Maintenance Margin**: The lowest equity threshold an account must sustain before triggering a margin call.
- **Variation Margin**: Daily cash flow settlement debiting losses or crediting profits from mark-to-market valuations.

### Liquidation / Margin Call Price (Long Position)
$$\text{Liquidation Price} = \text{Entry Price} \times \left(1 - \frac{\text{Initial Margin \%} - \text{Maintenance Margin \%}}{100}\right)$$

---

## 6. Global Trading Sessions & Overlaps

| Session | Hours (UTC) | Dominant Markets | Key Volatility Characteristics |
| :--- | :--- | :--- | :--- |
| **Asian Session** | 00:00 – 09:00 UTC | Tokyo, Hong Kong, Singapore, Sydney | Lower volatility; consolidation and mean-reverting ranges; sets daily initial balance. |
| **European Session** | 07:00 – 16:00 UTC | London, Frankfurt, Zurich, Paris | High volume; institutional breakouts; establishes primary intra-day directional trends. |
| **US Session** | 13:30 – 20:00 UTC | New York (NYSE, NASDAQ, CME) | Highest daily volume and liquidity; sharp reactions to US economic indicators and earnings. |
| **London–NY Overlap** | **13:30 – 16:00 UTC** | London + New York concurrent | **Peak global liquidity window**; lowest spreads; optimal window for institutional trend execution. |
