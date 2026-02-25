# Quick Start

## Prerequisites

- Node.js 20+
- Redis running locally (`redis-server`) or via Docker
- Figma Desktop app
- Google Gemini API key (free at [makersuite.google.com](https://makersuite.google.com/app/apikey))

---

## 1. Install

```bash
cd figma-ticket-generator
npm install
```

---

## 2. Configure

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Minimum required:
```env
GEMINI_API_KEY=your_key_here
FIGMA_API_KEY=your_figma_personal_access_token
```

> `FIGMA_API_KEY` is your Figma personal access token (figma.com → Settings → Account → Personal access tokens). The old name `FIGMA_ACCESS_TOKEN` is no longer used.

For work item creation (Jira + Confluence via MCP):
```env
# Direct REST (required for image attachment uploads)
JIRA_BASE_URL=https://jira.corp.com
CONFLUENCE_BASE_URL=https://confluence.corp.com

# MCP servers (Enterprise SSE)
MCP_JIRA_URL=https://mcp-jira.corp.com/mcp/
MCP_JIRA_KEY=your_mcp_jira_token
MCP_CONFLUENCE_URL=https://mcp-confluence.corp.com/mcp/
MCP_WIKI_KEY=your_mcp_confluence_token

# Project keys
JIRA_PROJECT_KEY=PROJ
CONFLUENCE_SPACE_KEY=DS

# QA Test Case wiki parent page ID (from Confluence URL)
QA_WIKI_PARENT_ID=874419925

# Optional Jira field defaults
JIRA_ISSUE_TYPE=Story
JIRA_STORY_POINTS=1
```

For Git branch creation (optional — leave blank to skip):
```env
GIT_MCP_URL=http://localhost:3000/api/mcp
GIT_REPO_PATH=/path/to/repo
```

---

## 3. Start the Server

```bash
node app/server.js
```

You should see:

```
Server HTTP listening on port 3000
Server started in ~800ms — http://localhost:3000
```

The MCP 406 warnings on startup are **expected** — the enterprise MCP servers use SSE negotiation and will connect when requests are made.

---

## 4. Load the Figma Plugin

1. Open **Figma Desktop**
2. Go to **Plugins → Development → Import plugin from manifest**
3. Select `figma-ticket-generator/manifest.json`
4. The plugin appears as **"Figma Ticket Generator"**

---

## 5. Generate

1. Select a **frame** (or several frames) in your Figma file
2. Open the plugin panel
3. Enter your **tech stack** or click a preset pill (AEM, React, Vue, etc.)
4. Check **Enable Active Automation** to auto-create Jira + Wiki
5. Click **Generate**

After active creation completes, a green **✅ Created** panel appears with one-click links:
- **🎫 View Jira Ticket — PROJ-XXXX** → opens the ticket in your browser
- **📄 View Implementation Plan** → opens the Confluence wiki page
- **🧪 View QA Test Case** → opens the QA Test Case wiki page

If a step fails (e.g. Confluence is down), a red warning row is shown for that step while the rest still appear.
4. Toggle **"Auto-create Jira + Wiki"** if you want active creation
5. Click **Generate**

The plugin will:
- Fetch your frame as an image via **Figma's Export REST API** (CDN URL)
- Send the image URL + frame metadata to the local server
- Gemini 2.0 Flash performs vision-based analysis and generates structured documentation
- (If enabled) automatically create:
  - **Jira ticket** with embedded design image + Related Resources section (Figma link, wiki, Storybook TBD, QA link)
  - **Implementation Plan wiki** with embedded design image + resource links in header (QA link back-patched after QA page is created)
  - **QA Test Case wiki** under `QA_WIKI_PARENT_ID` with 8-row test table + embedded screenshot
  - **2 Jira remote links** (Implementation Plan, QA Test Case) visible in Jira’s Links panel
  - **Git branch** `feature/<component-name>` (only when `GIT_MCP_URL` is configured)

---

## Docker Alternative

```bash
docker-compose up
```

This starts the server + Redis together. Server available at `http://localhost:3000`.

---

## Troubleshooting

**Server won't start**
- Check Redis is running: `redis-cli ping` should return `PONG`
- Check `GEMINI_API_KEY` is set in `.env`

**Plugin can't connect to server**
- Make sure the server is running on port 3000
- The manifest allows `http://localhost:3000` in dev mode

**MCP errors (406)**
- Normal on startup; these are enterprise servers requiring SSE negotiation
- Active creation will still work once the server is fully up

**Wiki page creation fails**
- Ensure `parent_id` in `config/mcp.config.js` matches a real Confluence page ID
- Corporate Confluence MCP does **not** accept `content_format` or `version` params — the adapter handles this automatically

**Design image not showing in Jira/wiki**
- Verify `FIGMA_API_KEY` is set and has read access to the file
- Image is fetched via Figma Export API; ensure the frame is exportable
