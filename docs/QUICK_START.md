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

For work item creation (Jira + Confluence):
```env
JIRA_BASE_URL=https://jira.corp.com
JIRA_USERNAME=your_user
JIRA_API_TOKEN=your_token

CONFLUENCE_BASE_URL=https://confluence.corp.com
CONFLUENCE_USERNAME=your_user
CONFLUENCE_API_TOKEN=your_token
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
4. Toggle **"Auto-create Jira + Wiki"** if you want active creation
5. Click **Generate**

The plugin will:
- Fetch your frame as an image via **Figma's Export REST API** (CDN URL)
- Send the image URL + frame metadata to the local server
- Gemini 2.0 Flash performs vision-based analysis and generates structured documentation
- (If enabled) automatically create:
  - **Jira ticket** with embedded design image + Related Resources section
  - **Confluence wiki page** with embedded design image + resource links in header
  - **3 Jira remote links** (Implementation Plan wiki, Storybook placeholder, QA Test Case placeholder)
  - **Git branch** `feature/<component-name>`

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
