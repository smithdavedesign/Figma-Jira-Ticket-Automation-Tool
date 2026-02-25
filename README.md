# Figma → Jira / Wiki Automation

Select a frame. Pick a tech stack. Hit Generate.

The plugin fetches the Figma frame image via Figma's Export API, passes it to **Gemini 2.0 Flash** for vision-based analysis, generates structured documentation, then uses MCP to automatically create a **Jira ticket**, **Confluence wiki page**, and **Git branch** — no copy-pasting required.

---

## What Gets Created

When **Auto-create Jira + Wiki** is enabled, one click produces:

| Artifact | Contents |
|---|---|
| **Jira ticket** | AI-generated description (Jira wiki markup) + embedded design image + Related Resources section (wiki link, Storybook, QA placeholder) |
| **Confluence wiki page** | Full implementation spec in markdown, embedded design image, header with Figma/Jira/date/resource links |
| **Jira remote links** | 3 links in Jira's Links panel: Implementation Plan (wiki), Storybook (TBD), QA Test Case (TBD) |
| **Git branch** | `feature/<component-name>` (requires local Git MCP) |

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
             │     └─ createIssue()  (formatted Jira wiki markup)
             │     └─ updateDescription() with embedded design image
             │
             ├─ B. MCP → Confluence
             │     └─ createWikiPage()  (markdown, parent page DS space)
             │     └─ wiki header includes Figma link, Jira key, resources
             │     └─ embedded design image via CDN URL
             │
             ├─ C. Cross-linking
             │     └─ createRemoteLink() × 3  (wiki page, Storybook, QA)
             │     └─ updateJiraDescription() injects Related Resources h2
             │
             └─ D. MCP → Git
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

# MCP — Jira
JIRA_BASE_URL=https://jira.corp.com
JIRA_USERNAME=your_user
JIRA_API_TOKEN=your_token

# MCP — Confluence
CONFLUENCE_BASE_URL=https://confluence.corp.com
CONFLUENCE_USERNAME=your_user
CONFLUENCE_API_TOKEN=your_token

# Optional
PORT=3000
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

> **Note:** The env var for Figma is `FIGMA_API_KEY` (not `FIGMA_ACCESS_TOKEN` — old name).

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

