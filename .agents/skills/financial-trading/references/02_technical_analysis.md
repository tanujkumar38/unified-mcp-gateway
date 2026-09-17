# Technical Analysis & Indicator Systems

A comprehensive reference for classical technical analysis, chart patterns, candlestick mechanics, volume diagnostics, and mathematical oscillators.

---

## 1. Classical Foundations & Core Axioms

Technical analysis rests upon three foundational Dow Theory postulates:
1. **The Market Discounts Everything**: All known fundamentals, macroeconomic data, insider knowledge, and market sentiment are already priced into the current quotation.
2. **Prices Move in Trends**: Price action does not evolve completely at random; it exhibits persistent directional momentum interrupted by consolidation or counter-trend pullbacks.
3. **History Repeats Itself**: Human fear, greed, and behavioral psychology produce identifiable, recurring geometric price structures.

---

## 2. Support, Resistance & The Polarity Principle

### Definitions & Structural Confluence
- **Support**: A price tier where aggregate buying interest is dense enough to overcome selling pressure, arresting or reversing downward momentum.
- **Resistance**: A price tier where aggregate selling pressure overcomes buying enthusiasm, halting or turning an upward advance.
- **Confluence Rule**: Never treat support or resistance as single hairline prices. Treat them as **Zones (Buffers)**. The strongest zones possess confluence across:
  1. Major multi-touch horizontal swing extremes.
  2. Dynamic Moving Average overlays (e.g., 50 EMA, 200 SMA).
  3. Key Fibonacci Retracement levels (38.2%, 50%, 61.8%).
  4. Psychological round numbers (e.g., $100, $500, 25,000 index levels).

### The Principle of Role Reversal (Polarity)
- When a confirmed horizontal support zone is convincingly breached to the downside, the previous floor converts into a ceiling (**broken support becomes new resistance**).
- Conversely, when resistance is cleared with institutional volume, subsequent retests of that level reliably act as support.

---

## 3. Trend Architecture, Channels & Donchian Breakouts

### Trend Characterization
- **Uptrend**: A sustained sequence of Higher Highs (HH) and Higher Lows (HL).
- **Downtrend**: A sustained sequence of Lower Highs (LH) and Lower Lows (LL).
- **Consolidation / Range**: Symmetrical oscillations trapped between horizontal boundaries without directional displacement.
- **Average Directional Index (ADX)**:
  - $\text{ADX} > 25$: Confirmed strong trending regime.
  - $\text{ADX} < 20$: Range-bound, choppy, mean-reverting regime.

### Donchian Channels
- **Formula**:
  - $\text{Upper Band} = \max(\text{High}, N)$
  - $\text{Lower Band} = \min(\text{Low}, N)$
  - $\text{Middle Band} = \frac{\text{Upper Band} + \text{Lower Band}}{2}$
- Standard parameter: $N = 20$ or $N = 55$ periods.
- **Turtle Trading Strategy**: Enter long when price exceeds the 20-day high; enter short when price breaches the 20-day low.

---

## 4. Chart Geometry & Structural Patterns

### Continuation Patterns (Trend Resumption)

| Pattern | Geometric Structure | Target Projection Rule | Volume Profile |
| :--- | :--- | :--- | :--- |
| **Bull / Bear Flag** | Sharp directional impulse pole followed by a tight counter-trend channel. | Measure pole height; project from breakout point. | Decays during flag formation; surges on breakout. |
| **Pennant** | Converging trendlines forming a small symmetrical triangle after a rapid surge. | Measure flagpole height; add to breakout tier. | Contracting volume inside pennant; explosive breakout volume. |
| **Ascending Triangle** | Flat horizontal resistance roof with rising swing lows. Bullish bias. | Height of triangle base added to the breakout level. | Decreases toward triangle apex; expands on upward break. |
| **Descending Triangle**| Flat horizontal support floor with descending swing highs. Bearish bias. | Height of triangle base subtracted from breakdown level. | Decreases toward triangle apex; expands on downward break. |
| **Symmetrical Triangle**| Symmetrical converging trendlines. Neutral until breakout direction confirmed. | Widest vertical distance of pattern projected from breakout. | Volume dries up inside compression; expands on direction. |

### Reversal Patterns (Trend Exhaustion)

| Pattern | Prior Trend | Key Confirmation Trigger | Target Rule |
| :--- | :--- | :--- | :--- |
| **Head and Shoulders** | Extended Uptrend | Decisive close below the horizontal or upward-sloping **Neckline**. | Vertical distance from Head peak to Neckline subtracted from break. |
| **Inverse H&S** | Extended Downtrend | Decisive close above Neckline with volume surge. | Vertical distance from Head trough to Neckline added to break. |
| **Double Top ("M")** | Uptrend | Price fails twice at resistance peak; breaks intermediate trough. | Height of peaks subtracted from valley floor. |
| **Double Bottom ("W")**| Downtrend | Price tests support floor twice; breaks intermediate peak resistance. | Depth of troughs added to breakout level. |

---

## 5. Candlestick Patterns & Reliability Matrix

### Single Candlestick Setups
- **Hammer**: Small body near high, lower shadow $\ge 2 \times \text{body length}$, minimal upper wick. Bullish reversal after downtrend.
- **Shooting Star**: Small body near low, upper shadow $\ge 2 \times \text{body length}$, minimal lower wick. Bearish reversal after uptrend.
- **Marubozu**: Full directional candle with zero wicks. Uncontested institutional momentum in direction of close.
- **Doji**: Open and close virtually identical. Signifies market equilibrium / indecision; reliable only at key structural turning points.

### Multi-Candlestick Setups
- **Bullish Engulfing**: A small bearish candle completely enclosed by a subsequent massive bullish real body. Highly reliable at major support.
- **Bearish Engulfing**: A small bullish candle completely engulfed by an expansive bearish candle. Highly reliable at major resistance.
- **Morning Star**: 3-candle sequence (long bear candle $\rightarrow$ compressed star gap $\rightarrow$ strong bull candle closing $>50\%$ of candle 1). Institutional bullish reversal.
- **Evening Star**: 3-candle sequence (long bull candle $\rightarrow$ compressed star gap $\rightarrow$ strong bear candle closing $>50\%$ of candle 1). Institutional bearish reversal.
- **Inside Bar**: High and Low completely contained within previous candle's range. Represents price contraction preparing for explosive volatility breakout.

---

## 6. Volume Diagnostics & Profile Analysis

Volume represents the institutional fuel driving price displacement.

### Principles of Volume Diagnostics
1. **Price Rise + Volume Expansion**: Healthy institutional accumulation (bullish trend confirmation).
2. **Price Rise + Volume Contraction**: Weak retail buying / lack of institutional interest (bearish divergence warning).
3. **Price Decline + Volume Expansion**: Heavy institutional liquidation (bearish trend confirmation).
4. **Price Decline + Volume Contraction**: Orderly pullback / lack of selling enthusiasm (bullish re-entry setup).
5. **Volume Climax**: Massive off-the-charts volume spike accompanying an outsized directional candle. Signals immediate trend exhaustion and imminent reversal.

### Quantitative Volume Indicators
- **On-Balance Volume (OBV)**:
  $$\text{OBV}_t = \text{OBV}_{t-1} + \begin{cases} \text{Volume}_t & \text{if } P_t > P_{t-1} \\ 0 & \text{if } P_t = P_{t-1} \\ -\text{Volume}_t & \text{if } P_t < P_{t-1} \end{cases}$$
- **Money Flow Index (MFI)**: Volume-weighted RSI. Values $>80$ indicate overbought institutional exhaustion; $<20$ indicate oversold capitulation.
- **Volume Profile**: Horizontal histogram mapping cumulative volume executed at each price increment across the visible range. Identifies institutional liquidity nodes.

---

## 7. Oscillators & Technical Indicators

### 1. Moving Averages (Trend & Dynamic Support)
- **Simple Moving Average (SMA)**: Unweighted arithmetic average of last $N$ periods.
- **Exponential Moving Average (EMA)**:
  $$\text{EMA}_t = \left(P_t \times \frac{2}{N+1}\right) + \left(\text{EMA}_{t-1} \times \left(1 - \frac{2}{N+1}\right)\right)$$
- **Institutional Benchmarks**:
  - 20 EMA: Short-term momentum guide.
  - 50 EMA: Intermediate swing trend filter.
  - 200 SMA: Macro institutional boundary (Golden Cross: 50 crosses above 200; Death Cross: 50 crosses below 200).

### 2. Relative Strength Index (RSI - 14 Periods)
- **Calculation**: $\text{RSI} = 100 - \left(\frac{100}{1 + \text{RS}}\right)$, where $\text{RS} = \frac{\text{Avg Gain}}{\text{Avg Loss}}$.
- **Thresholds**: Overbought $> 70$; Oversold $< 30$.
- **RSI Divergences**:
  - *Regular Bullish Divergence*: Price makes Lower Low (LL) while RSI forms a Higher Low (HL) $\rightarrow$ Impending upward reversal.
  - *Regular Bearish Divergence*: Price makes Higher High (HH) while RSI forms a Lower High (LH) $\rightarrow$ Impending downward reversal.

### 3. Moving Average Convergence Divergence (MACD)
- **MACD Line**: $12\text{ EMA} - 26\text{ EMA}$.
- **Signal Line**: $9\text{ EMA of MACD Line}$.
- **Histogram**: $\text{MACD Line} - \text{Signal Line}$.
- Crossover above signal line confirms momentum acceleration; divergence indicates momentum decay.

### 4. Bollinger Bands (Volatility & Mean Reversion)
- **Middle Band**: $20\text{ SMA}$.
- **Upper Band**: $20\text{ SMA} + (2 \times \sigma)$.
- **Lower Band**: $20\text{ SMA} - (2 \times \sigma)$.
- **Bollinger Squeeze**: Bands contract to multi-month low width, signaling an imminent explosive breakout.

### 5. Average True Range (ATR - 14 Periods)
- Quantifies volatility in absolute price units:
  $$\text{TR} = \max\left[(\text{High} - \text{Low}), |\text{High} - \text{Close}_{\text{prev}}|, |\text{Low} - \text{Close}_{\text{prev}}|\right]$$
  $$\text{ATR} = \text{EMA}(\text{TR}, 14)$$
- Crucial for objective volatility-based stop-loss placement ($1.5 \times \text{ATR}$ to $2.5 \times \text{ATR}$).

### 6. Volume Weighted Average Price (VWAP)
- Institutional benchmark for intraday execution:
  $$\text{VWAP} = \frac{\sum (\text{Price} \times \text{Volume})}{\sum \text{Volume}}$$
- Trading above VWAP signals bullish institutional control; trading below indicates seller dominance.

### 7. Fibonacci Ratios
- **Retracements**: $23.6\%, 38.2\%, 50.0\%, 61.8\%$ (Golden Ratio), $78.6\%$.
- **Extensions**: $127.2\%, 161.8\%, 261.8\%$.
