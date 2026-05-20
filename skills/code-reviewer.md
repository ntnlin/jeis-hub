# Code Reviewer Skill

**Trigger:** "review this", "code review", "check my diff", "pre-landing review", "review PR"  
**Source:** Adapted from gstack review/SKILL.md + checklist.md  
**Version:** 1.0

---

## What This Skill Does

Two-pass review of code changes. Pass 1 catches blockers (CRITICAL). Pass 2 is informational.

---

## Pass 1 — CRITICAL (blockers, must fix before merge)

### SQL & Data Safety
- Raw string interpolation in queries → SQL injection
- Missing WHERE clause on UPDATE/DELETE
- No transaction on multi-table writes
- Missing index on columns used in WHERE/JOIN

### Race Conditions
- Check-then-act without lock (read balance → write balance)
- Non-atomic increment/decrement
- Concurrent writes to same record without conflict handling

### LLM Trust Boundary
- LLM output used directly in SQL query, shell command, eval
- No sanitization on AI-generated content before storage
- Prompt injection possible via user-supplied text in system prompt

### Shell Injection
- User input in exec/spawn without sanitization
- Template literals with user data in shell commands

### Data Loss
- Overwrite without backup
- Delete without soft-delete option
- Migration without rollback

---

## Pass 2 — INFORMATIONAL (flag but don't block)

### Async/Sync Mixing
- Async function in sync context without await
- Missing error handling on rejected promises

### Dead Code
- Unused imports, unreachable branches, commented-out blocks

### Magic Numbers / Strings
- Hardcoded values that should be constants or config

### LLM Prompt Issues
- System prompt contains user-supplied data unescaped
- No output length limits
- Missing stop conditions

### Type Safety
- `any` types where specific type possible
- Missing null checks on external data

---

## Design Check (for frontend changes)

**AI Slop Detection — fail these automatically:**
- Purple/blue gradients on hero sections
- Centered everything (no visual hierarchy)
- 3-column grids with icon + title + 2 lines
- Bubbly border-radius on everything
- Generic copy: "Empowering users to...", "Revolutionizing the way..."

**Typography:**
- Body text under 16px
- More than 3 font families
- Skipped heading hierarchy (h1 → h3)

---

## Output Format

```
PASS 1 — CRITICAL
[BLOCKER] {description}
  File: path/to/file.js:line
  Risk: {what breaks}
  Fix: {specific fix}

PASS 2 — INFORMATIONAL
[INFO] {description}
  File: path/to/file.js:line

DESIGN
[FAIL] {AI slop pattern detected}
[PASS] Design looks intentional

VERDICT: APPROVE / REQUEST CHANGES / BLOCK
```

---

## Rules

- Block on ANY critical issue — don't merge
- Informational items are suggestions, not blockers
- Be specific: name the file and line, not just the category
- Never approve code you haven't read
- For AI-generated code: be extra skeptical on trust boundaries
