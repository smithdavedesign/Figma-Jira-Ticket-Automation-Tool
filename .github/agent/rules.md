# AI Assistant Context Rules

## Project: Figma → Jira / Wiki / QA Automation Tool

**Server**: `http://localhost:3000`  
**Active branch**: `feature/post-mcp-code-generation`  
**Last major update**: February 2026

---

## Architecture (current, accurate)

```
Figma Plugin (code.ts → code.js)
  └─ POST /api/generate
       └─ GeminiService (Gemini 2.0 Flash — vision via CDN image URL)
            └─ WorkItemOrchestrator (when enableActiveCreation = true)
                 ├─ Step A: MCPAdapter → Jira      (ticket + image attachment)
                 ├─ Step B: MCPAdapter → Confluence (Implementation Plan wiki + image)
                 ├─ Step E: MCPAdapter → Confluence (QA Test Case wiki + image)
                 │            └─ back-patches Impl Plan with real QA link
                 ├─ Step C: MCPAdapter → Jira      (2 remote links + Related Resources)
                 └─ Step D: MCPAdapter → Git       (⚠️ OPTIONAL — skipped if GIT_MCP_URL is blank)
```

Fallback: When Gemini fails → `ContextTemplateBridge` → YAML templates (no AI).

---

## Services (10 registered at startup)

`sessionManager`, `figmaSessionManager`, `configurationService`, `geminiService`, `screenshotService`, `contextManager`, `mcpAdapter`, `ticketGenerationService`, `ticketService`, `workItemOrchestrator`

---

## Required Env Vars (source of truth: `.env.example`)

```
GEMINI_API_KEY, FIGMA_API_KEY
JIRA_BASE_URL, CONFLUENCE_BASE_URL          ← direct REST (image uploads)
MCP_JIRA_URL, MCP_JIRA_KEY
MCP_CONFLUENCE_URL, MCP_WIKI_KEY
JIRA_PROJECT_KEY, CONFLUENCE_SPACE_KEY
QA_WIKI_PARENT_ID                           ← Confluence page ID for QA parent
JIRA_ISSUE_TYPE, JIRA_DEFAULT_ASSIGNEE, JIRA_DEFAULT_EPIC
JIRA_STORY_POINTS, JIRA_DEFAULT_PRIORITY
GIT_MCP_URL                                 ← blank = git step skipped cleanly
```

Always check `.env.example` before hardcoding any project key, URL, or field value.

---

## What Was Removed (do not re-add)

- Multi-strategy AI routing (AI orchestrator, visual AI service, hybrid strategies)
- RouteRegistry filesystem scanning
- AnalysisService, TestingService, AIPromptManager
- 55+ stale route files (plugin.js, enhanced.js, context.js, metrics.js, etc.)
- Swagger/OpenAPI docs
- Health monitoring service dashboard
- All test fixtures, archives, stale scripts
- `about:blank` placeholder remote links (Storybook/QA now handled as text TBD until URL exists)

---

## MCP Access

- **Jira**: `https://mcp-jira.usm-cpr.corp.nandps.com/mcp/`
- **Confluence**: `https://mcp-confluence.usm-cpr.corp.nandps.com/mcp/`
- **Git**: controlled by `GIT_MCP_URL` — blank = skip (no error, no placeholder links)
- Custom adapter: `core/adapters/MCPAdapter.js` (JSON-RPC 2.0 over HTTP/SSE)

Corporate Confluence MCP rejects `content_format` and `version` params — `MCPAdapter` intentionally omits them.

---

## Documentation

- `README.md` — project overview + API reference + env vars
- `docs/QUICK_START.md` — setup instructions
- `docs/architecture/ARCHITECTURE.md` — system design + Mermaid diagrams
- `.github/instructions/feature-mcp.md` — artifact creation format (Jira/Wiki/QA)
- `.env.example` — canonical env var reference with comments

---

## Mandatory Rules

1. **No new AI providers** — Gemini 2.0 Flash only
2. **No strategy selectors** — single generation path: request → Gemini → Orchestrator
3. **No health dashboards** — `/health` endpoint is sufficient
4. **Docs in docs/** — never create `.md` files in root (except `README.md`)
5. **Git is optional** — always gate on `GIT_MCP_URL`; blank = clean skip
6. **No hardcoded project keys** — all project/space/parent IDs come from env vars
7. **Read ARCHITECTURE.md + `.env.example`** before making any structural changes
