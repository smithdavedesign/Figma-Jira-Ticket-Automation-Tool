# Infrastructure Setup & Portability Report
*Date: January 7, 2026*

## 📊 Infrastructure Readiness Ratings

| Category | Rating | Status | Notes |
| :--- | :---: | :--- | :--- |
| **Docker Readiness** | 🟢 **A+** | Excellent | `docker-compose.yml` and `Dockerfile` are production-ready. Full stack (Node + Redis) launches in minutes. |
| **Config Portability** | 🟢 **A** | **Improved** | Standardized `.env` usage. Created `.env.example` to guide new users. |
| **Authentication** | 🟡 **B+** | Good | Secure token handling via env vars. Clear instructions added for Gemini, Figma, and Jira tokens. |
| **External Dependencies** | 🔴 **C** | **Complex** | "Active Orchestration" (Automatic Jira/Confluence creation) requires access to private MCP servers. |
| **Figma Plugin** | 🟡 **B** | Standard | Requires manual `manifest.json` import in Figma Desktop (Standard platform constraint). |

## 🛠️ Actions Taken for Portability
To ensure smooth onboarding for other teams, we have:

1.  **Standardized Configuration**: Created `.env.example` in the root directory. This serves as a definitive template for all required keys.
2.  **Graceful Fallbacks**: The system defaults to "Passive Mode" (Text Generation only) if external MCP servers are unreachable, ensuring the tool is useful even without full enterprise infrastructure.

## 🚀 Setup Guide for New Users

### 1. Installation & Config
```bash
git clone [repo-url]
cd figma-ticket-generator
cp .env.example .env
# Edit .env to add your API Keys (Gemini, Figma)
```

### 2. Launch
```bash
docker-compose up -d
# Server is live at localhost:3000
```

### 3. Usage
*   Open Figma Desktop.
*   Go to **Plugins > Development > Import plugin from manifest...**
*   Select the `manifest.json` file from the project root.
*   Run the plugin "Design Intelligence Platform".

## ⚠️ Requirements for Active Automation
To enable the **"One-Click Jira Creation"** features, users must provide:
*   `MCP_JIRA_URL`: Endpoint for a compatible Jira MCP server.
*   `MCP_CONFLUENCE_URL`: Endpoint for a compatible Confluence MCP server.
*   `MCP_JIRA_KEY` / `MCP_WIKI_KEY`: Valid Personal Access Tokens (PAT).

*Note: Without these, the tool performs all analysis and generation steps but stops short of creating the remote assets.*
