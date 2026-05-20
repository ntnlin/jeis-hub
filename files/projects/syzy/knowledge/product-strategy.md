# Syzy — Product Strategy & Growth Direction

**Source:** Jei's internal strategy document  
**Last updated:** 2026-05-19  
**Confidence:** 100% (first-party document)

---

## What Syzy Is

**Telegram bot for community prediction markets.**

Community admins add Syzy bot to their Telegram group. Members create, join, pay for, and settle prediction markets — all inside the chat.

Backend settles on Stellar. Frontend feels like Web2.

---

## Problem It Solves

Telegram communities constantly make quick predictions (BTC up/down, which team scores, will milestone happen) but the flow is broken:
- Polls are too simple
- Comments hard to track
- Manual rewards are messy
- External platforms pull users away from the group
- Crypto payment too hard for normal users

**Real gap:** No Telegram bot lets communities run real prediction markets inside the chat, with easy payments and auto settlement.

---

## Core Features

### 1. Add Bot Into Telegram Community
- Admin adds Syzy bot → basic setup → community can create markets
- No new app, no community migration
- Distribution where users already are

### 2. Community-created Markets
**Example markets:**
- "BTC above/below $80K in 5 minutes?"
- "Next BTC 5-min candle: green or red?"
- "Will SOL be above $180 at 10:00 UTC?"
- "Will Team A score the next point?"

**Creation flow:** /create → choose template or write question → options (Yes/No, Over/Under) → set timer (5m/15m/1h/custom) → set entry amount → publish to group

Syzy handles: market card, countdown, entry locking, result submission, reward calculation.

### 3. Payment UX for Non-Crypto Users
**User sees:** simple balance, entry amount, reward status, withdraw flow.  
**User does NOT deal with:** wallets, seed phrases, gas fees, network selection.

Payment feels like a normal in-app action (top-up → join → receive reward).

### 4. Stellar Settlement Behind the Scenes
- Stellar used for: fast/low-cost settlement, USDC movement, treasury, micro-transactions
- Users never see or interact with Stellar directly
- Frontend = Web2 feel. Backend = Stellar.

---

## UX Principle

**Telegram-first.** Primary surfaces: Telegram bot commands, group messages, mini app for details/payment/history.

Core flow: Admin adds bot → creates market → bot posts card in group → user taps option → user pays/uses balance → timer ends → resolves → user gets reward.

AVOID: building a trading terminal, charts, forcing crypto understanding, sending users away from Telegram early.

---

## Vision

Syzy = default bot for Telegram communities that want to run prediction markets.
- Communities: add bot, create market, settle automatically
- Users: join from Telegram, pay without crypto complexity
- Syzy owns payment and settlement layer behind community markets

---

## Roadmap & KPIs

### P1 (May–Jul 2026): Bot MVP & First Markets
| Metric | Target |
|---|---|
| Telegram Communities | 20–50 |
| Markets Created | 300–1,000 |
| Active Participants | 1,000–3,000 |
| Paid Actions | 5,000–20,000 |
| Settlement Volume | $5K–$15K |
| Successful Resolutions | 90%+ |

**P1 Tactics:**
- Build shortest bot flow: add → /create → publish → tap → resolve
- Seed real communities: crypto + esports Telegram groups
- Work directly with admins, manually support first markets
- Show internal balance only, hide wallet mechanics

### P2 (Aug–Oct 2026): Payment UX & Community Scale
| Metric | Target |
|---|---|
| Telegram Communities | 100–300 monthly |
| Active Participants | 10,000–25,000 |
| Paid Actions | 75,000–250,000 |
| Settlement Volume | $50K–$150K |
| Repeat Communities | 40–60% |

**P2 Tactics:**
- Improve top-up/payment, reduce failed payments
- Quick market templates: price above/below, candle direction, tweet milestone, community milestone
- Admin tools: market history, resolution tools, reward status, basic analytics

### P3 (Nov 2026–Jan 2027): Default Telegram Market Bot
| Metric | Target |
|---|---|
| Telegram Communities | 500–1,000 total |
| Monthly Active Communities | 250–500 |
| Active Participants | 50,000–100,000 |
| Paid Actions | 1M+ |
| Settlement Volume | $250K+ |
| Repeat Participation | 45–60% |

---

## Content & Marketing Rules

**DO talk about:**
- Community prediction markets inside Telegram
- Easy market creation without crypto knowledge
- Telegram-native UX (no app download, no seed phrase)
- Community engagement, prediction accuracy
- Stellar settlement (as backend power, not user-facing story)
- Beta access, referral rewards
- XLM and USDC (for technical/crypto audience)

**Content angle:** Community activity angle — "your group already predicts, now you can bet on it." Telegram-first positioning. Easy wins over complex. Not "DeFi prediction market" — "Telegram prediction bot."
