# Scripts

Essential scripts for build, validation, testing, and deployment.

---

## Build and Development

| Script | Command | What it does |
|--------|---------|-------------|
| `build-simple.sh` | `npm run build` | Compile `code.ts` to `code.js` for Figma Desktop |

---

## Testing and Validation

| Script | Command | What it does |
|--------|---------|-------------|
| `validate-yaml.js` | `npm run validate:yaml` | Validate all YAML templates in `core/ai/templates/` |
| `fix-yaml.js` | `npm run fix:yaml` | Repair common YAML formatting issues |
| `test-external-mcp.js` | `npm run test:integration` | Smoke-test external MCP servers (Jira + Confluence connectivity) |
| `test-create-ticket.js` | `node scripts/test-create-ticket.js` | Manual: create a test Jira ticket via MCP |
| `test-create-wiki.js` | `node scripts/test-create-wiki.js` | Manual: create a test Confluence wiki page via MCP |

---

## Health and Monitoring

| Script | Command | What it does |
|--------|---------|-------------|
| `health-check.sh` | `npm run health` | Check server status and service availability |

---

## Deployment

| Script | Command | What it does |
|--------|---------|-------------|
| `deploy-production.sh` | `./scripts/deploy-production.sh` | Production Docker deployment and health verification |

---

## Quick Reference

```bash
npm run build            # Compile plugin for Figma Desktop
npm run validate:yaml    # Validate AI template YAML files
npm run fix:yaml         # Fix YAML formatting issues
npm run health           # Server health check
npm run test:integration # Test external MCP connectivity
```
