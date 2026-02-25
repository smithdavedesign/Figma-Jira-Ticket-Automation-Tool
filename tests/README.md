# Tests

Three test categories, one command each.

---

## Quick Start

```bash
npm test
npm run test:smoke
npm run test:integration
```

---

## Unit Tests (60 tests, always passing)

- `vitest-integration.test.mjs` — 12 tests, logger/utils
- `TicketGenerationService.test.js` — 12 tests, generateTicket + fallback
- `orchestrator-formatting.test.js` — 20 tests, _buildFigmaDeepLink, _buildQaWikiContent, _formatForWiki
- `tech-stack-helpers.test.js` — 16 tests, normalisation + template engine

**Runner:** Vitest v4 | ~150ms | no I/O

```bash
npm test          # unit only
npm run test:run  # same via vitest run
npm run test:coverage
```

---

## Smoke Tests

**Runner:** Playwright | **Requires:** server on `http://localhost:3000`

```bash
npm start &
npm run test:smoke
```

DOM IDs: `#app`, `#serverStatus`, `#serverText`, `#techStack`, `#generateBtn`, `#results`, `#creationLinks`  (all verified against `ui/index.html`).

---

## Integration Tests

Requires MCP server running. See `scripts/test-external-mcp.js`.

```bash
npm run test:integration
```
