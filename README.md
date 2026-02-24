# Figma → Jira / Wiki Automation

Select a frame. Pick a tech stack. Hit Generate.

The plugin captures the Figma frame, calls **Gemini 2.0 Flash** to generate documentation, then uses MCP to automatically create a **Jira ticket**, **Confluence wiki page**, and **Git branch** — no copy-pasting required.

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Set GEMINI_API_KEY, FIGMA_ACCESS_TOKEN, JIRA/CONFLUENCE credentials

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

---

## How It Works

```
Figma Plugin
  └─ select frame + tech stack
  └─ POST /api/generate
        │
        ▼
  Express Server :3000
        │
        ├─ GeminiService (Gemini 2.0 Flash)
        │    └─ generates Jira/Wiki/branch content
        │
        └─ WorkItemOrchestrator  ← only when enableActiveCreation = true
             ├─ MCP → Jira      creates ticket
             ├─ MCP → Confluence creates wiki page
             └─ MCP → Git       creates branch
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
FIGMA_ACCESS_TOKEN=your_token

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
| MCP | JSON-RPC 2.0 over HTTP/SSE |
| Cache | Redis 7 (ioredis) |
| Templates | YAML (js-yaml) via UniversalTemplateEngine |

