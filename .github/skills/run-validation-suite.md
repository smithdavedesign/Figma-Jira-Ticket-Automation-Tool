# Skill: Run Validation Suite

**Trigger:** `run_validation_suite`, "Run tests", "Validate system health"
**Description:** Orchestrates the project's multi-layered testing framework (Unit, Integration, E2E, API) via a single unified interface.

## 🛠️ Usage Specification

Acts as an execution facade over the `scripts/` directory and `package.json` test runners.

### Inputs
*   `scope` (string, required):
    *   `full`: Runs the complete suite (`scripts/run-all-tests.sh`).
    *   `smoke`: Runs critical path sanity checks (`scripts/health-check.sh`).
    *   `mcp-only`: Validates MCP server connectivity (`scripts/test-external-mcp.js`).
    *   `ui-browser`: Runs Playwright E2E tests (`npm run test:browser`).
    *   `api-contract`: Validates Swagger/OpenAPI specs (`validate-yaml.js`).
*   `targetEnv` (string): `local` (default) or `production`.
*   `includeReport` (boolean): Returns parsed test summary JSON if true.

### 🧠 Logic Flow
1.  **Resolve Command:** Map `scope` to the corresponding shell script or npm command.
2.  **Environment Setup:** Load `.env` or `.env.production` based on `targetEnv`.
3.  **Execute:** Run command using `child_process.exec` or `spawn`.
4.  **Parse Output:** Capture `stdout`/`stderr`. If `includeReport` is true, parse JUnit XML or JSON reporters.
5.  **Return:** Structued JSON: `{ status: 'PASS'|'FAIL', duration: '2ms', failedTests: [] }`.

## 💻 Implementation Snippet (Reference)
```javascript
// app/routes/figma/mcp.js - NEW TOOL IMPLEMENTATION
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function runValidation(scope) {
  const commands = {
    'full': './scripts/run-all-tests.sh',
    'ui-browser': 'npm run test:browser',
    'mcp-only': 'npm run test:integration:mcp'
  };
  
  try {
    const { stdout } = await execAsync(commands[scope]);
    return { status: 'PASS', logs: stdout.slice(-500) };
  } catch (error) {
    return { status: 'FAIL', error: error.message };
  }
}
```
