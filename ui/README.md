# UI Directory

Presentation-layer files for the Figma plugin.

---

## Active Files

| File | Purpose |
|------|---------|
| `index.html` | **Main plugin UI** — loaded by Figma via `manifest.json`. Single-file with all CSS/JS inlined. Houses the tech stack selector, generate button, results panel, and creation links. |
| `dashboard-index.html` | Development dashboard hub — links to all dev/test pages |
| `ultimate-testing-dashboard.html` | Comprehensive test dashboard: system health, API tests, performance |
| `unified-testing-dashboard.html` | Alternate unified testing view |
| `figma-tester.html` | Figma API compatibility test page |
| `plugin-intelligence-test.html` | Plugin intelligence / context test page |

## Supporting Directories

| Directory | Contents |
|-----------|----------|
| `js/` | Client-side JavaScript modules |
| `styles/` | CSS stylesheets |
| `plugin/` | Figma plugin distribution files |
| `api-docs/` | API endpoint documentation |
| `archive/` | Archived / unused interface files |

---

## Key DOM IDs (`index.html`)

Verified IDs used by tests and the plugin core:

| ID | Element |
|----|---------|
| `#app` | Root container |
| `#serverStatus` | MCP server status wrapper |
| `#serverText` | Server status badge text |
| `#selectionInfo` | Figma frame selection info |
| `#techStack` | Tech stack textarea |
| `#activeCreation` | Auto-create Jira+Wiki checkbox |
| `#generateBtn` | Generate button |
| `#results` | Generated content panel |
| `#generatedContent` | AI-generated text output |
| `#creationLinks` | Created artefact links panel |
| `#jiraLink` | View Jira Ticket button |
| `#wikiLink` | View Implementation Plan button |
| `#qaLink` | View QA Test Case button |

---

## Build

`index.html` is served as-is by the MCP server. Only `code.ts` requires compilation:

```bash
npm run build
# writes: code.js  (Figma sandbox script, loaded via manifest.json)
```
