# MCP Builder Skill

**Trigger:** "build mcp", "create mcp server", "mcp integration", "build api integration", "connect to X service"  
**Source:** Tasmil Finance Docs / mcp-builder-SKILL.md  
**Version:** 1.0

---

## What This Skill Does

Guides building a Model Context Protocol (MCP) server to connect the hub to external services (Gmail, X API, Telegram, Discord, etc.) in Phase 2.

---

## Technology Choice

| Scenario | Use |
|---|---|
| Remote server, multiple clients | TypeScript + Streamable HTTP transport |
| Local single-user tool | Python or TypeScript + stdio transport |
| Default for this hub | TypeScript + Streamable HTTP |

---

## Four-Phase Workflow

### Phase 1: Research & Plan
1. Identify what the service's API can do
2. Decide which operations to expose as tools (read-only first, write with confirmation)
3. Plan tool names: `{service}_{action}` (snake_case, e.g. `gmail_list_emails`, `x_post_tweet`)
4. Define input/output schemas with Zod (TypeScript) or Pydantic (Python)
5. Plan pagination strategy (limit + offset + has_more)

### Phase 2: Implement
**Project structure:**
```
src/
  index.ts          server init + tool registration
  tools/            one file per tool group
  services/         API client wrappers
  schemas/          Zod/Pydantic schemas
  types.ts          shared types
  constants.ts      config, limits
```

**Tool registration pattern (TypeScript):**
```typescript
server.registerTool("gmail_list_emails", {
  description: "List emails from specified Gmail account",
  inputSchema: z.object({
    account: z.enum(["lindotfun", "jeivyoung", "jei_vezta", "ntnlin9"]),
    limit: z.number().max(50).default(20),
    filter: z.string().optional()
  })
}, async (input) => { ... });
```

### Phase 3: Review & Test
1. Run: `npm run build` (TypeScript) or tests (Python)
2. Verify: each tool works with real API call in dry-run
3. Check: error handling for rate limits and auth failures
4. Verify: pagination returns correct `has_more` and `next_offset`

### Phase 4: Evaluation
Write 10 test questions — each must:
- Require multiple tool calls
- Have a single verifiable answer
- Be READ-ONLY and non-destructive
- Test a real use case (not synthetic)

---

## Tool Design Rules

**DO:**
- Return JSON for programmatic use + Markdown summary for human reading
- Implement `limit` parameter on all list operations
- Include `has_more`, `next_offset`, `total_count` on paginated results
- Prefix tool names with service name (`gmail_`, `x_`, `telegram_`)
- Handle rate limits with retry logic

**DON'T:**
- Use deprecated `addTool()` API — use `registerTool()`
- Return raw API responses without normalizing
- Skip error handling on auth failures
- Make destructive tools (send, delete, post) callable without Jei approval flag

---

## Hub Integration Priority (Phase 2 build order)

1. **Gmail MCP** — connect 4 email accounts (read + label, no auto-send)
2. **X API MCP** — timeline scan, post with approval, engagement metrics
3. **Telegram MCP** — monitor specified folders, classify messages
4. **Discord MCP** — DMs inbox monitor, classify, suggest replies

---

## Reference Docs (local)

Not stored in hub (too large). Reference online:
- MCP best practices: naming, pagination, response format
- TypeScript guide: McpServer, StreamableHTTPServerTransport, Zod schemas
- Python guide: FastMCP, Pydantic BaseModel, @mcp.tool() decorator
