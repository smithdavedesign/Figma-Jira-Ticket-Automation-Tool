# Skill: Run Validation Suite

**Trigger:** `run_validation_suite`, "Run tests", "Validate", "Check if everything works"
**Description:** Reference for the project's test and validation commands, mapped to their actual implementations.

## Working Commands

| Command | What it does | When to use |
|---------|-------------|-------------|
| `npm run lint` | ESLint with auto-fix | Before committing |
| `npm run test:run` | Vitest (all unit tests, no watch) | CI / quick check |
| `npm run test:coverage` | Vitest with coverage report | Before PR |
| `npm run test:watch` | Vitest watch mode | During development |
| `npm run build` | Build plugin (TSC + copy files) | After code.ts changes |
| `npm run build:ts` | TypeScript compile only | Quick TS check |
| `npm run validate:yaml` | Validate YAML template files | After editing `core/template/` |
| `npm run validate` | Full: test + build + validate:yaml | Pre-push check |
| `npm run audit` | npm security audit | Security review |
| `npm run test:mcp` | MCP server connectivity test | After MCP config changes |
| `npm run health` | Server health check script | Server troubleshooting |

## Recommended Pre-Push Sequence

```bash
npm run lint          # fix lint issues first
npm run test:run      # must pass
npm run build         # must succeed
npm run validate:yaml # catches broken templates
```

Or in one command: `npm run validate`

## Known Broken / Do Not Use

| Command | Why it's broken |
|---------|-----------------|
| `npm run test:browser:smoke/regression/ci/visual` | Playwright tests reference non-existent DOM IDs |
| `npm run test:all` | `scripts/test-orchestrator.js` imports removed modules |
| `npm run test:architecture` | References old architecture modules |
| `npm run test:hybrid` | References removed hybrid strategy layer |
| `npm run test:e2e:system` | References removed services |
| `npm run monitor` | `scripts/monitor-dashboard.js` is stale |

## Coverage Location

After `npm run test:coverage`:
- `coverage/coverage-summary.json` — JSON summary
- `coverage/lcov.info` — LCOV for editor integration

## Logic Reference

```javascript
// How to run tests programmatically if needed
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function runValidation(scope = 'unit') {
  const commands = {
    'unit':     'npm run test:run',
    'coverage': 'npm run test:coverage',
    'lint':     'npm run lint',
    'build':    'npm run build',
    'yaml':     'npm run validate:yaml',
    'full':     'npm run validate',
    'mcp':      'npm run test:mcp',
  };
  
  const cmd = commands[scope];
  if (!cmd) throw new Error(`Unknown scope: ${scope}. Valid: ${Object.keys(commands).join(', ')}`);
  
  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd: process.cwd() });
    return { status: 'PASS', output: stdout.slice(-1000) };
  } catch (error) {
    return { status: 'FAIL', error: error.message, output: error.stdout?.slice(-500) };
  }
}
```
