# Vezta — Platform Overview

**Network:** Solana  
**Type:** Prediction market platform  
**Core Loop:** browse markets → predict outcome → track position → collect payout

---

## What Vezta Is

Vezta is a prediction market platform on Solana where users trade on real-world outcomes — politics, sports, crypto price events, and more. Unlike pure DeFi, it's built for outcome traders who want an edge through data, AI, and social signals.

---

## Core Features

### Markets
- Multi-category prediction markets: politics, sports, crypto, real-world events
- Real-time market terminal with order book depth
- Market creation by verified users

### Trading Layer
- **Copy Trading** — follow and auto-mirror top performers
- **Top Traders Leaderboard** — ranked by Sharp Score
- **Sharp Score** — proprietary skill rating (separates luck from edge)
- **Arbitrage Detector** — surfaces price discrepancies across markets
- **Portfolio Tracker** — P&L, open positions, history

### AI Layer
- **AI Signals** — Claude-powered market outcome predictions based on available data
- **Volume Spike Detection** — alerts on unusual market activity before it trends
- **Whale Monitor** — tracks large wallet positions in real time

### Analytics
- Market analytics dashboard
- Position monitor (live tracking of open bets)
- Token trackers
- Historical performance data per market and user

### Social & Rewards
- Social layer: posts, follows, activity feed
- Rewards program for active traders
- Events and calendar (upcoming prediction opportunities)
- KYC for identity-verified users

---

## Positioning

**Versus Polymarket:** More AI tooling (signals, whale alerts), copy trading layer, Solana speed  
**Versus Kalshi:** On-chain, permissionless, crypto-native  
**Versus Drift Predictions:** Full-feature platform vs. sidebar feature

---

## Content Rules

**Always focus on:** prediction markets, Solana, AI signals, copy trading, Sharp Score  
**Never mention:** fabricated win rates, guaranteed returns, specific performance claims without data

---

## KPIs (populate when live data available)

```json
{
  "totalMarkets": null,
  "dailyActiveTraders": null,
  "totalVolume": null,
  "avgSharpScore": null,
  "topTrader30dReturn": null
}
```

---

## Whale Alert Logic

- Trigger: wallet moves >$X into single market within Y minutes
- Source: on-chain Solana transaction monitoring
- Output: alert to `database/whale-alerts.json` + Jei notification

---

*Last updated: 2026-05-19. Source: live frontend codebase. Metrics null until API connected.*
