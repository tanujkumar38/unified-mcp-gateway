# Trade Journal Entry & Post-Mortem Audit

**Trade ID**: `[TRD-YYYYMMDD-001]`  
**Date & Time of Entry**: `[YYYY-MM-DD HH:MM UTC]`  
**Date & Time of Exit**: `[YYYY-MM-DD HH:MM UTC]`  
**Instrument / Ticker**: `[e.g., NIFTY, AAPL, EURUSD]`  
**Direction**: `[LONG / SHORT]`  

---

## 1. Trade Execution Summary

| Parameter | Planned | Executed | Variance / Slippage |
| :--- | :--- | :--- | :--- |
| **Entry Price** | `$[0.00]` | `$[0.00]` | `$[0.00]` |
| **Stop-Loss Price** | `$[0.00]` | `$[0.00]` | `$[0.00]` |
| **Take-Profit Price** | `$[0.00]` | `$[0.00]` | `$[0.00]` |
| **Position Size** | `[0] units` | `[0] units` | `[0] units` |
| **Cash Risk ($)** | `$[0.00]` | `$[0.00]` | `$[0.00]` |
| **Risk-to-Reward ($R$)**| `1 : [0.00]` | `1 : [0.00]` | `[0.00]R` |

---

## 2. Trade Outcome

- **Outcome**: `[WIN / LOSS / BREAKEVEN]`
- **Realized P&L ($)**: `$[+/- 0.00]`
- **Realized R-Multiple**: `[+/- 0.00]R`
- **Total Frictional Costs**: `$[0.00]` *(Commissions + Slippage + Financing)*
- **Holding Period Duration**: `[e.g., 2 hours 15 minutes]`

---

## 3. Post-Trade Technical Review

- **Did price respect the structural invalidation level?**: `[Yes / No / Early Exit]`
- **Was the exit executed according to the plan?**: `[Yes / No (Tampered with stop/target)]`
- **Order Flow Behavior during Trade**:
  - `[e.g., CVD showed aggressive absorption against our position prior to reversal]`
- **Trade Classification**:
  - `[ ]` **Good Trade / Win**: Followed 100% of rules, positive outcome.
  - `[ ]` **Good Trade / Loss**: Followed 100% of rules, normal statistical variance.
  - `[ ]` **Bad Trade / Win**: Broke rules (e.g., chased, widened stop) but got lucky. *(Dangerous)*
  - `[ ]` **Bad Trade / Loss**: Broke rules, suffered emotional punishment. *(Audit required)*

---

## 4. Psychological & Behavioral Audit

- **Emotional State Before Entry (Scale 1–10)**: `[1=Completely Calm, 10=Frantic/FOMO]`
- **Emotional State During Trade**: `[Detached / Anxious / Urge to close early]`
- **Cognitive Biases Detected**:
  - `[ ]` None (Fully disciplined)
  - `[ ]` Loss Aversion (Hesitated to take loss)
  - `[ ]` FOMO (Entered without full structural confirmation)
  - `[ ]` Overconfidence / Revenge Trading (Sized up after prior win/loss)
- **Key Lesson Learned**:
  - `[Detailed takeaway for future trading sessions]`
