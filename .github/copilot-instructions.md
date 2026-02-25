# GitHub Copilot Instructions

You are an internal developer for the **Figma → Jira / Wiki Automation Tool**.

## Project Summary

A Figma plugin + Express server that generates Jira tickets, Confluence wiki pages, and Git branches from Figma frame selections in one click.

**Flow:**
1. User selects frame + tech stack in Figma plugin
2. Plugin POSTs frame data + screenshot to local server (port 3000)  
3. Server calls **Gemini 2.0 Flash** to generate documentation
4. **WorkItemOrchestrator** uses MCP to create Jira ticket + Confluence page + Git branch
5. Result returned to plugin UI

## Architecture

```
code.ts (Figma plugin) → POST /api/generate → GeminiService → WorkItemOrchestrator
                                                                  ├─ MCP → Jira
                                                                  ├─ MCP → Confluence
                                                                  └─ MCP → Git
```

## Key Files

| File | Role |
|---|---|
| `app/server.js` | Express server (~250 lines) |
| `app/routes/generate.js` | POST /api/generate |
| `core/ai/GeminiService.js` | Gemini 2.0 Flash |
| `core/adapters/MCPAdapter.js` | JSON-RPC 2.0 MCP client (custom, not SDK) |
| `core/orchestration/WorkItemOrchestrator.js` | Jira + Confluence + Git creation |
| `config/mcp.config.js` | MCP server URLs |
| `code.ts` | Figma plugin source |
| `ui/index.html` | Plugin UI |

## MCP Servers

- **Jira**: `https://mcp-jira.usm-cpr.corp.nandps.com/mcp/`
- **Confluence**: `https://mcp-confluence.usm-cpr.corp.nandps.com/mcp/`
- **Git (local)**: `http://localhost:3000/api/mcp`

We use a **custom JSON-RPC 2.0 implementation** (`core/adapters/MCPAdapter.js`). Do NOT suggest `@modelcontextprotocol/sdk`.

## Coding Rules

1. **One AI**: Gemini 2.0 Flash only. No OpenAI/Anthropic/multi-model routing.
2. **Simple flow**: request → GeminiService → response. Don't add strategy layers.
3. **MCP calls**: Use `MCPAdapter.callTool(server, tool, params)`.
4. **Docs in docs/**: All markdown goes in `docs/`. Never in root (except README.md).
5. **Context first**: Check `docs/architecture/ARCHITECTURE.md` before guessing structure.

## Skills

- **`@skill` mcp**: `.github/instructions/feature-mcp.md` — output format for Jira/Wiki/Git
- **`@skill` scaffold**: `.github/skills/scaffold-component.md` — component generation
- **`@skill` audit**: `.github/skills/audit-visual-accessibility.md` — visual QA
- **`@skill` validate**: `.github/skills/run-validation-suite.md` — testing
