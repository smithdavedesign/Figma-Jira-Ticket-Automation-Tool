# AI Assistant Context Rules

## Project: Figma → Jira / Wiki Automation Tool

**Branch**: `feature/refactored`  
**Server**: `http://localhost:3000`  
**Last major refactor**: February 2026

---

## Architecture (current, accurate)

```
Figma Plugin (code.ts → code.js)
  └─ POST /api/generate
       └─ GeminiService (Gemini 2.0 Flash)
            └─ WorkItemOrchestrator (when enableActiveCreation = true)
                 ├─ MCPAdapter → Jira MCP   (creates ticket in AUTOMATION project)
                 ├─ MCPAdapter → Confluence (creates page in DCUX space)
                 └─ MCPAdapter → Git        (creates feature branch)
```

Fallback: When Gemini fails → `ContextTemplateBridge` → YAML templates (no AI).

---

## Services (11 registered at startup)

`redis`, `sessionManager`, `figmaSessionManager`, `configurationService`, `geminiService`, `screenshotService`, `contextManager`, `mcpAdapter`, `ticketGenerationService`, `ticketService`, `workItemOrchestrator`

---

## What Was Removed (do not re-add)

- Multi-strategy AI routing (AI orchestrator, visual AI service, hybrid strategies)
- RouteRegistry filesystem scanning
- AnalysisService, TestingService, AIPromptManager
- 55+ stale route files (plugin.js, enhanced.js, context.js, metrics.js, etc.)
- Swagger/OpenAPI docs
- Health monitoring service dashboard
- All test fixtures, archives, stale scripts

---

## MCP Access

- **Jira**: `https://mcp-jira.usm-cpr.corp.nandps.com/mcp/`
- **Confluence**: `https://mcp-confluence.usm-cpr.corp.nandps.com/mcp/`  
- Custom adapter: `core/adapters/MCPAdapter.js` (JSON-RPC 2.0 over HTTP/SSE)

---

## Documentation

- `README.md` — project overview + API reference  
- `docs/QUICK_START.md` — setup instructions
- `docs/architecture/ARCHITECTURE.md` — system design
- `.github/instructions/feature-mcp.md` — output format for ticket/wiki/branch

---

## Mandatory Rules

1. **No new AI providers** — Gemini 2.0 Flash only
2. **No strategy selectors** — single generation path
3. **No health dashboards** — the `/health` endpoint is sufficient
4. **Docs in docs/** — never create .md files in root (except README.md)
5. **Read ARCHITECTURE.md** before making structural changes
