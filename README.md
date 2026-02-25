# Figma → Jira / Wiki / QA Automation

Select a frame. Pick a tech stack. Hit Generate.

The plugin fetches the Figma frame image via Figma’s Export API, passes it to **Gemini 2.0 Flash** for vision-based analysis, generates structured documentation, then uses MCP to automatically create a **Jira ticket**, **Confluence Implementation Plan wiki**, **QA Test Case wiki**, and optionally a **Git branch** — no copy-pasting required.

---

## What Gets Created

When **Auto-create Jira + Wiki** is enabled, one click produces:

| Artifact | Contents |
|---|---|
| **Jira ticket** | AI-generated description (Jira wiki markup) + embedded design image + **Related Resources** section (Figma link, Implementation Plan, Storybook TBD, QA Test Case link) |
| **Implementation Plan wiki** | Full technical spec in markdown — embedded design image, header with Figma link / Jira key / date / resource links, **QA Test Case link back-patched** after QA page is created |
| **QA Test Case wiki** | Blank test case page under the QA parent — header with links to Jira + Implementation Plan + Storybook TBD, 8-row test scenario table, embedded design screenshot at bottom |
| **Jira remote links** | 2 live links in Jira’s Links panel: **Implementation Plan** (wiki) + **QA Test Case** (wiki). Storybook added manually once URL is known. |
| **Git branch** | `feature/<component-name>` (only when `GIT_MCP_URL` is configured) |

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Set GEMINI_API_KEY, FIGMA_API_KEY, JIRA/CONFLUENCE credentials

# 3. Start
node app/server.js
# → http://localhost:3000

# 4. Load plugin in Figma Desktop
# Plugins → Development → Import from manifest
# Point to: figma-ticket-generator/manifest.json
```

Then in Figma: select a frame → choose tech stack → click **Generate**.

---

## Requirements

| | |
|---|---|
| Node.js | 20+ |
| Redis | 7+ (running locally or via Docker) |
| Figma Desktop | Latest |
| Google Gemini API key | [Get free key](https://makersuite.google.com/app/apikey) |
| Figma API key | Personal access token from figma.com/settings |

---

## How It Works

```
Figma Plugin
  └─ select frame + tech stack
  └─ fetchFigmaExportUrl() → Figma Export REST API → CDN image URL
  └─ POST /api/generate  { frameData, exportUrl, techStack, ... }
        │
        ▼
  Express Server :3000
        │
        ├─ GeminiService (Gemini 2.0 Flash)
        │    └─ vision analysis of CDN image URL
        │    └─ generates Jira/Wiki content (markdown)
        │
        └─ WorkItemOrchestrator  ← only when enableActiveCreation = true
             │
             ├─ A. MCP → Jira
             │     └─ createIssue()  env-var-driven type/assignee/epic/priority
             │     └─ updateDescription() with embedded design image
             │
             ├─ B. MCP → Confluence — Implementation Plan
             │     └─ createWikiPage()  title: "Implementation Plan: [Frame] — [Page]"
             │     └─ embed design image; header: Figma/Jira/date/resources
             │
             ├─ E. MCP → Confluence — QA Test Case
             │     └─ createWikiPage()  under QA_WIKI_PARENT_ID
             │     └─ title: "[PageName] - [JIRA-KEY] - [ComponentName]"
             │     └─ content: metadata header + 8-row test table + screenshot
             │     └─ back-patches Implementation Plan wiki with real QA link
             │
             ├─ C. Cross-linking
             │     └─ createRemoteLink() x2  (Implementation Plan, QA Test Case)
             │     └─ updateJiraDescription() injects Related Resources h2
             │           (Figma link, wiki, Storybook TBD, QA link)
             │     └─ strips AI’s duplicate “Design References” section
             │
             └─ D. MCP → Git  (skipped when GIT_MCP_URL is blank)
                   └─ createBranch()  feature/<component-name>
```

Full details: [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)

---

## API

| Method | Path | What it does |
|---|---|---|
| `POST` | `/api/generate` | Generate content + optionally create Jira/Wiki/branch |
| `GET/POST` | `/api/figma/screenshot` | Capture a Figma frame as PNG |
| `GET` | `/api/figma/health` | Figma service status |
| `GET` | `/health` | Server health |

### POST /api/generate

```json
{
  "frameData": [...],          // from plugin
  "screenshot": "data:image...", // base64 PNG
  "techStack": "AEM 6.5",
  "platform": "Jira",
  "documentType": "component",
  "enableActiveCreation": true, // set true to auto-create Jira + Wiki + branch
  "ticketProjectKey": "AUTOMATION",
  "wikiSpace": "DCUX"
}
```

---

## MCP Servers

Configured in `config/mcp.config.js`:

| Server | URL |
|---|---|
| Jira | `https://mcp-jira.usm-cpr.corp.nandps.com/mcp/` |
| Confluence | `https://mcp-confluence.usm-cpr.corp.nandps.com/mcp/` |
| Git (local) | `http://localhost:3000/api/mcp` |

> The 406 warnings on startup are normal — MCP servers negotiate via SSE and connect properly when requests are made.

---

## Environment Variables

```env
# Required
GEMINI_API_KEY=your_key
FIGMA_API_KEY=your_figma_personal_access_token

# Direct Jira/Confluence REST (for image attachment uploads)
JIRA_BASE_URL=https://jira.corp.com
CONFLUENCE_BASE_URL=https://confluence.corp.com

# MCP servers
MCP_JIRA_URL=https://mcp-jira.corp.com/mcp/
MCP_JIRA_KEY=your_mcp_jira_token
MCP_CONFLUENCE_URL=https://mcp-confluence.corp.com/mcp/
MCP_WIKI_KEY=your_mcp_confluence_token

# Project defaults
JIRA_PROJECT_KEY=PROJ
CONFLUENCE_SPACE_KEY=DS

# QA Test Case wiki parent page (page ID from Confluence URL)
QA_WIKI_PARENT_ID=874419925

# Jira ticket field defaults (all optional — override per-project)
JIRA_ISSUE_TYPE=Story
JIRA_DEFAULT_ASSIGNEE=
JIRA_DEFAULT_EPIC=
JIRA_STORY_POINTS=1
JIRA_DEFAULT_PRIORITY=

# Git branch creation — leave blank to skip cleanly (no errors)
GIT_MCP_URL=
GIT_REPO_PATH=/path/to/repo

# Optional
PORT=3000
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

---

## Project Layout

```
figma-ticket-generator/
│
├── code.ts              ← Figma plugin source (TypeScript)
├── code.js              ← Compiled plugin (do not edit)
├── manifest.json        ← Figma plugin manifest
├── ui/index.html        ← Plugin UI
│
├── app/
│   ├── server.js            ← Express server (~250 lines)
│   ├── routes/
│   │   ├── generate.js      ← POST /api/generate
│   │   ├── health.js        ← GET /health
│   │   ├── BaseRoute.js     ← Base class
│   │   └── figma/
│   │       ├── core.js      ← screenshot endpoints
│   │       └── base.js      ← Figma route base class
│   ├── services/
│   │   ├── TicketGenerationService.js
│   │   ├── ScreenshotService.js
│   │   └── ConfigurationService.js
│   └── controllers/
│       └── ServiceContainer.js  ← dependency injection
│
├── core/
│   ├── ai/
│   │   └── GeminiService.js          ← Gemini 2.0 Flash
│   ├── adapters/
│   │   └── MCPAdapter.js             ← multi-server MCP client
│   ├── orchestration/
│   │   └── WorkItemOrchestrator.js   ← Jira + Wiki + Git
│   ├── bridge/
│   │   └── ContextTemplateBridge.js  ← YAML fallback (no AI)
│   ├── context/                      ← Figma data extractors
│   ├── data/                         ← Redis, sessions, context builder
│   ├── template/
│   │   └── UniversalTemplateEngine.js
│   └── utils/
│       ├── logger.js
│       └── error-handler.js
│
├── config/
│   ├── mcp.config.js
│   ├── ai.config.js
│   ├── server.config.js
│   └── tsconfig.json        ← compiles code.ts → code.js
│
├── scripts/                 ← build, deploy, test utilities
├── tests/
│   ├── unit/
│   ├── smoke/
│   └── redis/
└── docs/
    ├── QUICK_START.md
    └── architecture/
        └── ARCHITECTURE.md
```

---

## Plugin Development

```bash
# Edit logic
code code.ts

# Compile
npx tsc -p config/tsconfig.json

# Watch mode
npx tsc -p config/tsconfig.json --watch
```

---

## Docker

```bash
# Start server + Redis
docker-compose up

# Rebuild after dependency changes
docker-compose up --build
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Plugin | TypeScript → ES2017 (Figma API) |
| Server | Node.js 20, Express 4, ES modules |
| AI | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Image source | Figma Export REST API → CDN URL (not base64) |
| MCP | JSON-RPC 2.0 over HTTP/SSE |
| Cache | Redis 7 (ioredis) |
| Templates | YAML (js-yaml) via UniversalTemplateEngine |

---

## Known Limitations

- **Git branch creation** requires a local Git MCP server at `http://localhost:3000/api/mcp` — this endpoint is not bundled and will log a non-fatal 404 if unavailable.
- **Corporate Confluence MCP** (`confluence_create_page`, `confluence_update_page`) does not accept `content_format` or `version` params; the server defaults to markdown and auto-increments versions.

