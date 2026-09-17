#!/usr/bin/env python3
"""
Financial Trading Mathematics & Position Size Calculator
A deterministic, cross-platform CLI tool for calculating:
- Fixed Fractional Position Sizing
- ATR Volatility Position Sizing
- Kelly Criterion & Half-Kelly Fractions
- Expected Value (EV) & Break-Even Win Rate
- Statistical Risk of Ruin
"""

import argparse
import sys
import math

def calculate_fixed_risk(equity: float, risk_pct: float, entry: float, stop: float):
    if entry <= 0 or stop <= 0 or equity <= 0:
        raise ValueError("Prices and equity must be strictly positive.")
    risk_distance = abs(entry - stop)
    if risk_distance == 0:
        raise ValueError("Entry price and Stop-Loss price cannot be identical.")
    
    cash_risk = equity * (risk_pct / 100.0)
    position_units = cash_risk / risk_distance
    notional_value = position_units * entry
    effective_leverage = notional_value / equity

    print("=" * 60)
    print("FIXED FRACTIONAL POSITION SIZING")
    print("=" * 60)
    print(f"Account Equity:           ${equity:,.2f}")
    print(f"Risk Percentage:          {risk_pct:.2f}%")
    print(f"Monetary Risk at Stop:    ${cash_risk:,.2f}")
    print(f"Entry Price:              ${entry:,.4f}")
    print(f"Stop-Loss Price:          ${stop:,.4f}")
    print(f"Per-Unit Stop Distance:   ${risk_distance:,.4f} ({(risk_distance / entry) * 100:.2f}%)")
    print("-" * 60)
    print(f"Recommended Position:     {position_units:,.2f} units / shares")
    print(f"Total Notional Value:     ${notional_value:,.2f}")
    print(f"Effective Leverage:       {effective_leverage:.2f}x")
    print("=" * 60)

def calculate_atr_risk(equity: float, risk_pct: float, entry: float, atr: float, multiplier: float, direction: str):
    if equity <= 0 or entry <= 0 or atr <= 0 or multiplier <= 0:
        raise ValueError("Arguments must be positive numbers.")
    
    stop_distance = atr * multiplier
    if direction.lower() == "long":
        stop_price = entry - stop_distance
    else:
        stop_price = entry + stop_distance
    
    cash_risk = equity * (risk_pct / 100.0)
    position_units = cash_risk / stop_distance
    notional_value = position_units * entry

    print("=" * 60)
    print("ATR VOLATILITY POSITION SIZING")
    print("=" * 60)
    print(f"Account Equity:           ${equity:,.2f}")
    print(f"Risk Percentage:          {risk_pct:.2f}% (${cash_risk:,.2f})")
    print(f"Entry Price:              ${entry:,.4f}")
    print(f"ATR (14-period):          ${atr:,.4f}")
    print(f"Multiplier:               {multiplier:.2f}x")
    print(f"Calculated Stop Distance: ${stop_distance:,.4f} ({(stop_distance / entry) * 100:.2f}%)")
    print(f"Calculated Stop-Loss:     ${stop_price:,.4f}")
    print("-" * 60)
    print(f"Recommended Position:     {position_units:,.2f} units / shares")
    print(f"Total Notional Value:     ${notional_value:,.2f}")
    print("=" * 60)

def calculate_kelly(win_rate: float, risk_reward: float, half_kelly: bool):
    if not (0.0 < win_rate < 1.0):
        raise ValueError("Win rate must be between 0 and 1 (e.g. 0.55 for 55%).")
    if risk_reward <= 0:
        raise ValueError("Risk/Reward must be positive.")
    
    p = win_rate
    q = 1.0 - p
    b = risk_reward
    
    # Kelly Formula: f* = (b*p - q) / b
    kelly_f = (b * p - q) / b
    half_f = kelly_f / 2.0

    print("=" * 60)
    print("KELLY CRITERION CAPITAL ALLOCATION")
    print("=" * 60)
    print(f"Win Probability (p):      {p * 100:.1f}%")
    print(f"Loss Probability (q):     {q * 100:.1f}%")
    print(f"Risk/Reward Ratio (b):    1 : {b:.2f}")
    print("-" * 60)
    if kelly_f <= 0:
        print("RESULT: NEGATIVE EXPECTANCY!")
        print("Do NOT trade this system. Optimal wager fraction is 0%.")
    else:
        print(f"Full Kelly Fraction (f*): {kelly_f * 100:.2f}% of capital")
        print(f"Half-Kelly (Institutional):{half_f * 100:.2f}% of capital")
        recommended = half_f if half_kelly else kelly_f
        print(f"\n=> Recommended Allocation: {recommended * 100:.2f}% of equity per trade")
    print("=" * 60)

def calculate_ev(win_rate: float, avg_win: float, avg_loss: float):
    if not (0.0 < win_rate < 1.0):
        raise ValueError("Win rate must be between 0 and 1.")
    if avg_win <= 0 or avg_loss <= 0:
        raise ValueError("Average win and average loss must be positive.")
    
    p_win = win_rate
    p_loss = 1.0 - p_win
    ev = (p_win * avg_win) - (p_loss * avg_loss)
    rr = avg_win / avg_loss
    be_win_rate = 1.0 / (1.0 + rr)
    expectancy_r = (p_win * rr) - p_loss

    print("=" * 60)
    print("EXPECTED VALUE (EV) & EXPECTANCY ANALYSIS")
    print("=" * 60)
    print(f"Win Rate:                 {p_win * 100:.1f}%")
    print(f"Average Win:              ${avg_win:,.2f}")
    print(f"Average Loss:             ${avg_loss:,.2f}")
    print(f"Payoff Ratio (Win/Loss):  {rr:.2f} : 1")
    print(f"Break-Even Win Rate:      {be_win_rate * 100:.2f}%")
    print("-" * 60)
    print(f"Expected Value (EV):      ${ev:,.2f} per trade")
    print(f"Expectancy (in R):        {expectancy_r:.2f}R per trade")
    if ev > 0:
        print("Verdict: POSITIVE EDGE - Mathematically Viable System")
    else:
        print("Verdict: NEGATIVE EDGE - Statistically Destined to Lose")
    print("=" * 60)

def calculate_risk_of_ruin(win_rate: float, risk_reward: float, risk_pct: float):
    if not (0.0 < win_rate < 1.0) or risk_reward <= 0 or risk_pct <= 0:
        raise ValueError("Invalid parameters for Risk of Ruin calculation.")
    
    p = win_rate
    b = risk_reward
    edge = (p * b) - (1.0 - p)
    
    if edge <= 0:
        ror = 1.0
    else:
        # Approximate discrete risk of ruin formula
        capital_units = 100.0 / risk_pct
        base = (1.0 - edge) / (1.0 + edge)
        if base <= 0:
            ror = 0.0
        else:
            ror = math.pow(base, capital_units)

    print("=" * 60)
    print("STATISTICAL RISK OF RUIN (RoR)")
    print("=" * 60)
    print(f"Win Probability:          {p * 100:.1f}%")
    print(f"Risk/Reward:              1 : {b:.2f}")
    print(f"Expectancy Edge:          {edge:.3f}R")
    print(f"Risk Per Trade:           {risk_pct:.2f}%")
    print("-" * 60)
    print(f"Probability of Ruin:      {ror * 100:.4f}%")
    if ror < 0.01:
        print("Safety Rating: EXTREMELY SAFE (<1% Ruin Risk)")
    elif ror < 0.05:
        print("Safety Rating: MODERATE (1-5% Ruin Risk)")
    else:
        print("Safety Rating: DANGEROUS HIGH RISK (>5% Ruin Risk)")
    print("=" * 60)

def main():
    parser = argparse.ArgumentParser(description="Financial Trading Math & Position Sizing Calculator")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # 1. Fixed Risk
    p_fixed = subparsers.add_parser("fixed-risk", help="Fixed fractional position sizing")
    p_fixed.add_argument("--equity", type=float, required=True, help="Total account equity")
    p_fixed.add_argument("--risk-pct", type=float, default=1.0, help="Risk percentage (e.g. 1.0 for 1%)")
    p_fixed.add_argument("--entry", type=float, required=True, help="Entry price")
    p_fixed.add_argument("--stop", type=float, required=True, help="Stop-loss price")

    # 2. ATR Risk
    p_atr = subparsers.add_parser("atr-risk", help="ATR volatility position sizing")
    p_atr.add_argument("--equity", type=float, required=True, help="Total account equity")
    p_atr.add_argument("--risk-pct", type=float, default=1.0, help="Risk percentage (e.g. 1.0 for 1%)")
    p_atr.add_argument("--entry", type=float, required=True, help="Entry price")
    p_atr.add_argument("--atr", type=float, required=True, help="14-period ATR value")
    p_atr.add_argument("--multiplier", type=float, default=2.0, help="ATR multiplier for stop distance")
    p_atr.add_argument("--direction", type=str, default="long", choices=["long", "short"], help="Trade direction")

    # 3. Kelly
    p_kelly = subparsers.add_parser("kelly", help="Kelly Criterion capital allocation")
    p_kelly.add_argument("--win-rate", type=float, required=True, help="Historical win rate (0.0 to 1.0)")
    p_kelly.add_argument("--risk-reward", type=float, required=True, help="Risk to reward payoff ratio (b)")
    p_kelly.add_argument("--half-kelly", action="store_true", default=True, help="Use conservative Half-Kelly")

    # 4. EV
    p_ev = subparsers.add_parser("ev", help="Expected Value and Expectancy calculator")
    p_ev.add_argument("--win-rate", type=float, required=True, help="Historical win rate (0.0 to 1.0)")
    p_ev.add_argument("--avg-win", type=float, required=True, help="Average winning trade profit ($)")
    p_ev.add_argument("--avg-loss", type=float, required=True, help="Average losing trade loss ($)")

    # 5. Risk of Ruin
    p_ror = subparsers.add_parser("risk-of-ruin", help="Risk of Ruin probability")
    p_ror.add_argument("--win-rate", type=float, required=True, help="Historical win rate (0.0 to 1.0)")
    p_ror.add_argument("--risk-reward", type=float, required=True, help="Reward to risk ratio")
    p_ror.add_argument("--risk-pct", type=float, default=1.0, help="Risk percentage per trade")

    args = parser.parse_args()

    try:
        if args.command == "fixed-risk":
            calculate_fixed_risk(args.equity, args.risk_pct, args.entry, args.stop)
        elif args.command == "atr-risk":
            calculate_atr_risk(args.equity, args.risk_pct, args.entry, args.atr, args.multiplier, args.direction)
        elif args.command == "kelly":
            calculate_kelly(args.win_rate, args.risk_reward, args.half_kelly)
        elif args.command == "ev":
            calculate_ev(args.win_rate, args.avg_win, args.avg_loss)
        elif args.command == "risk-of-ruin":
            calculate_risk_of_ruin(args.win_rate, args.risk_reward, args.risk_pct)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
