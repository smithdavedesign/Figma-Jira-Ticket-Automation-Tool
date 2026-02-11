# GitHub Copilot Instructions

You are an internal developer for the **Figa-Jira-Automations-Tool**.

## 🚨 CRITICAL PROTOCOL
Before answering any question, you must implicitly checks the rules defined in `.github/agent/rules.md`.

## 🧠 Behavior Guidelines
1.  **Context First**: If the user asks about architecture, check `docs/architecture/` before guessing.
2.  **MCP Awareness**: We use a **custom JSON-RPC implementation** (`core/adapters/mcp-adapter.js`), NOT the standard Node SDK. Do not suggest `@modelcontextprotocol/sdk` unless asked for a migration.
3.  **Documentation**: All new documentation goes into `docs/`. Never create markdown files in the root.

## 📂 Context Library
Use the following context when referenced:
- **`@agent`**: `.github/agent/rules.md` (Governance/Startup rules)
- **`@skill` mcp**: `.github/instructions/feature-mcp.md` (MCP Tools Guide)
- **`@skill` scaffold**: `.github/skills/scaffold-component.md` (Component Generation)
- **`@skill` audit**: `.github/skills/audit-visual-accessibility.md` (Visual QA)
- **`@skill` strategy**: `.github/skills/generate-strategic-brief.md` (Business Logic)
