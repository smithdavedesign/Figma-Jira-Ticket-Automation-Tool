# GitHub Copilot Knowledge Transfer: Advanced Workflows
> **Goal:** Move beyond "autocomplete" to using Copilot as a pairing partner, architect, and navigation tool.

This document serves as a guide for our interactive session. We will explore Copilot features using our own **Model Context Protocol (MCP)** implementation as the case study.

---

## 1. The Core Modes

### 💬 Ask (Chat)
*   **Shortcut:** `Cmd+Opt+I` (Inline) or `Cmd+Shift+I` (Panel)
*   **Use Case:** Explaining code, generating unit tests, quick refactors.
*   **Demo:** Open [core/adapters/MCPAdapter.js](core/adapters/MCPAdapter.js).
    *   *Prompt:* "Explain how the `connect` method handles the JSON-RPC handshake."

### 📝 Plan (Edits)
*   **Interaction:** "Edit" button in Chat or `Cmd+Shift+I` -> "Edit Mode" (Preview)
*   **Use Case:** Multi-file changes, implementing features across MVC layers.
*   **Demo:**
    *   *Prompt:* "Plan a refactor to add a 'Slack' server to [config/mcp.config.js](config/mcp.config.js) and update the `ActionRouting` object to send 'notify_channel' actions to it."

### 🤖 Agent (Workspace)
*   **Interaction:** `@workspace` in Chat.
*   **Use Case:** Answering questions that require global project knowledge.
*   **Demo:**
    *   *Prompt:* "@workspace How does the project distinguish between the 'jira' and 'confluence' MCP servers in the configuration?"

---

## 2. Deep Dive: Model Context Protocol (MCP) in Our Project

We use a **custom JSON-RPC implementation** of MCP to connect Figma to external tools (Jira, Confluence).

### 📍 Key Files
1.  **Direct the Routing:** [config/mcp.config.js](config/mcp.config.js)
    *   This file maps "actions" (like `jira_create_ticket`) to specific servers.
    *   *Copilot Trick:* Highlight the `ActionRouting` object and ask: "Generate a TypeScript interface for this configuration object."

2.  **The Engine:** [core/adapters/MCPAdapter.js](core/adapters/MCPAdapter.js)
    *   This is our custom driver. It doesn't use the official SDK.
    *   *Copilot Trick:* Ask Copilot to "Compare this strict implementation with the official @modelcontextprotocol/sdk client."

3.  **The "System Prompt":** [instructions-feature-mcp.md](instructions-feature-mcp.md)
    *   This markdown file acts as a system instruction for our *manual* agent workflow.
    *   *Copilot Trick:* Open this file and type `@file instructions-feature-mcp.md Generate a prompt that would trigger the 'GIT BRANCH PLAN' section for a 'Login Modal' component.`

---

## 3. Practical Exercises

### Exercise A: The "Context-Aware" Refactor
**Scenario:** We need to add error handling for when the MCP server returns a 503.
1.  Open [core/adapters/MCPAdapter.js](core/adapters/MCPAdapter.js).
2.  Open Chat Panel.
3.  Type: `@file MCPAdapter.js Modify the request execution logic to implement exponential backoff if the server returns a 503 status.`

### Exercise B: Generating Tests from Config
**Scenario:** We want to ensure our routing config is valid.
1.  Open [config/mcp.config.js](config/mcp.config.js).
2.  Type: `@workspace Generate a Vitest test suite that validates that every URL in mcp.config.js is a valid format and that all actions map to defined servers.`

### Exercise C: "Plan Mode" Architecture
**Scenario:** We want to replace our custom adapter with the official SDK.
1.  Switch to **Edits/Plan Mode**.
2.  Prompt: "Review [core/adapters/MCPAdapter.js](core/adapters/MCPAdapter.js) and [package.json](package.json). Plan the steps required to replace our custom implementation with `@modelcontextprotocol/sdk`. Identify which methods would need to change."

---

## 4. Tip: Mastering Context
Copilot is only as smart as the context you give it.

*   **Bad Prompt:** "Fix this function."
*   **Good Prompt:** "Fix the `connect` function in [core/adapters/MCPAdapter.js](core/adapters/MCPAdapter.js) to handle timeouts. Reference the timeout settings in [config/mcp.config.js](config/mcp.config.js)."

<!-- COPILOT_INSTRUCTION: When asked about this file, emphasize that it is a living document for team training. -->
// ...existing code...
*   **Good Prompt:** "Fix the `connect` function in [core/adapters/MCPAdapter.js](core/adapters/MCPAdapter.js) to handle timeouts. Reference the timeout settings in [config/mcp.config.js](config/mcp.config.js)."

---

## 5. Project Implementation: MCP Architecture

This section details exactly how **Figa-Jira-Automations-Tool** leverages the Model Context Protocol.

### The Problem
We need to connect a static design tool (Figma) to dynamic backend systems (Jira, Confluence, GitHub) without bloating the plugin with heavy SDKs.

### The Solution: "Lightweight Client"
We implemented a custom, lightweight JSON-RPC client instead of the full MCP Node.js SDK to keep the bundle size small for the Figma sandbox environment.

### 📂 Files of Interest & Their Roles

| File | Role | Description |
| :--- | :--- | :--- |
| **`core/adapters/mcp-adapter.js`** | **The Driver** | *("The Hands")* Implements the JSON-RPC 2.0 protocol. It handles the raw TCP/Websocket connection, message framing, and request/response correlation. |
| **`config/mcp.config.js`** | **The Router** | *("The Brain")* A configuration map that tells the system *where* to send specific actions. <br>Ex: `ticket_create` → `jira-mcp-server`. |
| **`instructions-feature-mcp.md`** | **The Prompt** | *("The Conscience")* A system instruction file used by the AI Agent to understand *how* to construct valid payloads for the tools. It enforces rules like "Do not create empty descriptions." |
| **`scripts/test-external-mcp.js`** | **The Verifier** | *("The Test")* A standalone script to verify connectivity to local MCP servers before deploying the plugin. |

### 🧠 Copilot Use Case: Understanding the Flow
To visualize this architecture, ask Copilot:
> "@workspace Explain how a 'create_ticket' action flows from the UI, through the `mcp-adapter.js`, and how `mcp.config.js` determines the destination URL."

<!-- COPILOT_INSTRUCTION: When asked about this file, emphasize that it is a living document for team training. -->

---

## 6. Extending Skills (Tools)

In the Model Context Protocol (MCP), "Skills" (or Tools) are the executable functions that an AI agent can call. Because this project has a complex testing ecosystem—spanning server-side API tests, client-side browser tests, and integration verification—we need a unified skill to manage it.

### Proposed Skill: `run_validation_suite`
**Purpose:** Orchestrate the project's multi-layered testing framework without requiring the user to memorize individual `npm` scripts or shell arguments.

**Logic Mapping:**
This skill acts as a facade over your `scripts/` directory and `package.json` commands:
*   **Unit/Core:** Maps to `npm run test` (Vitest).
*   **Integration:** Maps to `npm run test:integration:mcp`.
*   **UI/E2E:** Maps to `npm run test:browser` (Playwright) and serves `tests/integration/test-consolidated-suite.html`.
*   **API Contract:** Validates against `ui/api-docs/swagger.yaml`.

### Schema Definition
You can ask Copilot to generate the implementation for this skill using the following structure:

```javascript
{
  name: "run_validation_suite",
  description: "Executes specific test layers to validate system health, API contracts, or UI functionality.",
  inputSchema: {
    type: "object",
    properties: {
      scope: {
        type: "string",
        enum: ["full", "smoke", "mcp-only", "ui-browser", "api-contract"],
        description: "The depth of testing required."
      },
      targetEnv: {
        type: "string",
        enum: ["local", "production"],
        default: "local"
      },
      includeReport: {
        type: "boolean",
        description: "If true, parses the JUnit/Playwright report and returns a summary."
      }
    },
    required: ["scope"]
  }
}
```

### 🧠 Copilot Use Case: Generating the Skill Logic
To implement this, you would leverage the existing scripts. Try this prompt in **Edit Mode**:

> "Create a new tool implementation in [`app/routes/figma/mcp.js`](app/routes/figma/mcp.js) called `run_validation_suite`. It should switch on the `scope` argument:
> 1. If 'full', execute [`scripts/run-all-tests.sh`](scripts/run-all-tests.sh).
> 2. If 'ui-browser', run [`npm run test:browser`](package.json).
> 3. If 'mcp-only', run [`npm run test:integration:mcp`](package.json).
> 4. Ensure it parses the output and returns a structured JSON response indicating pass/fail status."