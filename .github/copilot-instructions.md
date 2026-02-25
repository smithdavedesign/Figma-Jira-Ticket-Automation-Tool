# GitHub Copilot Instructions

You are an internal developer for the **Figma → Jira / Wiki / QA Automation Tool**.

## Project Summary

A Figma plugin + Express server that auto-creates Jira tickets, Confluence Implementation Plan wikis, Confluence QA Test Case wikis, and optionally Git branches from Figma frame selections in one click.

**Flow:**
1. User selects frame + tech stack in Figma plugin
2. Plugin POSTs frame data + Figma export URL to local server (port 3000)
3. Server calls **Gemini 2.0 Flash** (vision) to generate documentation
4. **WorkItemOrchestrator** uses MCP to create all artifacts automatically
5. Plugin UI displays live links to every created artifact

## Architecture

```
code.ts (Figma plugin) → POST /api/generate → GeminiService → WorkItemOrchestrator
                                                                  ├─ Step A: MCP → Jira (ticket + image)
                                                                  ├─ Step B: MCP → Confluence (Implementation Plan)
                                                                  ├─ Step E: MCP → Confluence (QA Test Case + back-patch impl wiki)
                                                                  ├─ Step C: MCP → Jira (2 remote links + Related Resources)
                                                                  └─ Step D: MCP → Git (skipped when GIT_MCP_URL is blank)
```

## Key Files

| File | Role |
|---|---|
| `app/server.js` | Express server (~250 lines) |
| `app/routes/generate.js` | POST /api/generate |
| `core/ai/GeminiService.js` | Gemini 2.0 Flash (vision analysis) |
| `core/adapters/MCPAdapter.js` | JSON-RPC 2.0 MCP client — custom, NOT `@modelcontextprotocol/sdk` |
| `core/orchestration/WorkItemOrchestrator.js` | Full Jira + Impl Wiki + QA Wiki + cross-links + Git (~903 lines) |
| `config/mcp.config.js` | MCP server URLs |
| `code.ts` | Figma plugin source |
| `ui/index.html` | Plugin UI (3 creation link buttons: Jira, Wiki, QA) |
| `.env.example` | All required env vars with comments — always check this first |

## MCP Servers

- **Jira**: `https://mcp-jira.usm-cpr.corp.nandps.com/mcp/`
- **Confluence**: `https://mcp-confluence.usm-cpr.corp.nandps.com/mcp/`
- **Git**: controlled by `GIT_MCP_URL` env var — **leave blank to skip git step cleanly**

We use a **custom JSON-RPC 2.0 implementation** in `MCPAdapter.js`. Never suggest `@modelcontextprotocol/sdk`.

## Coding Rules

1. **One AI**: Gemini 2.0 Flash only. No OpenAI/Anthropic/multi-model routing.
2. **Simple flow**: request → GeminiService → WorkItemOrchestrator. No strategy selectors.
3. **MCP calls**: Always use `MCPAdapter.callTool(server, tool, params)`.
4. **Git is optional**: Git step must check `GIT_MCP_URL` — blank = skip without error.
5. **Docs in docs/**: All markdown goes in `docs/`. Never create `.md` files in root (except `README.md`).
6. **Context first**: Check `docs/architecture/ARCHITECTURE.md` and `.env.example` before guessing.
7. **No new services**: Do not add new registered services without a concrete reason.

## Skills

- **`@skill` mcp**: `.github/instructions/feature-mcp.md` — artifact creation format (Jira/Wiki/QA)
- **`@skill` scaffold**: `.github/skills/scaffold-component.md` — component file generation
- **`@skill` audit**: `.github/skills/audit-visual-accessibility.md` — visual WCAG QA
- **`@skill` validate**: `.github/skills/run-validation-suite.md` — test + lint + build commands
