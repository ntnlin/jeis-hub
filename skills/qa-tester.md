# QA Tester Skill

**Trigger:** "qa test this", "find bugs on site", "test the site", "qa check", "quality check"  
**Source:** Adapted from gstack qa/SKILL.md  
**Version:** 1.0

---

## What This Skill Does

Systematically QA tests a web application across three tiers and produces a health score + ship-readiness verdict.

---

## Tiers

| Tier | Scope | Use When |
|---|---|---|
| Quick | Critical + High severity only | Pre-deploy fast check |
| Standard | + Medium severity | Regular QA cycle |
| Exhaustive | + Low + Cosmetic | Before major releases |

---

## Process

### Step 1: Scope
Ask Jei: "Which project? Which tier? Any specific flows to focus on?"

### Step 2: Test systematically
Work through these areas in order — do NOT skip:
1. **Core user flows** — can users do the main thing the product is for?
2. **Auth / access control** — login, logout, gating
3. **Data display** — numbers correct, no blank states broken
4. **Forms + inputs** — validation, error states, edge cases
5. **Mobile responsiveness** — at 375px, 768px, 1280px
6. **Error states** — 404, empty states, API failures
7. **Navigation** — all links work, no broken routes

### Step 3: Score each issue
```
[CRITICAL] Blocks core use — must fix before ship
[HIGH]     Degrades experience significantly — fix this sprint
[MEDIUM]   Noticeable but workaround exists — fix next sprint
[LOW]      Minor visual or UX issue
[COSMETIC] Pixel-level nitpick
```

### Step 4: Output report
```
Health Score: X/100
Ship-ready: YES / NO / YES WITH CAVEATS

CRITICAL (N):
- [description] | [location] | [steps to reproduce]

HIGH (N):
- ...

FIXES APPLIED (if in fix mode):
- ...
```

---

## Rules

- Test on real data, not mock/empty states
- Screenshot or describe evidence for each issue
- Fix CRITICAL before moving to HIGH
- Re-test after fixes — don't mark done until verified
- Never mark "passing" without actually testing the flow

---

## Projects Context

| Project | Key flows to test |
|---|---|
| Vezta | Market creation, trading, portfolio, sharp score, whale tracker |
| Tasmil | Chat interface, strategy browse, deposit execution flow |
| Syzy | Bot add flow, market creation, payment, resolution |
| Setlone | Membership, AI trading setup, staking, commerce checkout |
