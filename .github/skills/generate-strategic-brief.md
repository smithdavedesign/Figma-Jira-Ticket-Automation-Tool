# Skill: Debug Orchestration Pipeline

**Trigger:** `debug_orchestration`, "Why did creation fail", "Orchestration debug"
**Description:** Diagnoses partial failures in the Jira + Wiki + QA creation pipeline by
inspecting logs, server response shape, and MCP adapter state.

## Usage Specification

### When to use
- A creation run completed but one artifact is missing (e.g. QA wiki not created)
- The plugin shows a red failure row for a specific step
- Server logs show an MCP error but the overall request succeeded
- You want to test the full pipeline without touching Figma

### Logic Flow
1. **Check server log**: `tail -100 /tmp/server.log | grep -E 'ERROR|WARN|Step [ABCDE]'`
2. **Identify which step failed**: Steps A/B/E/C/D — each logs its success/failure independently
3. **Check MCP connectivity**: `curl -s http://localhost:3000/health` → verify all services healthy
4. **Re-run minimal test payload** if needed (see below)
5. **Inspect response shape**: look for `metadata.orchestration.{jira,wiki,qa}.status`

### Common failure patterns

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Wiki created but QA not | `QA_WIKI_PARENT_ID` missing or wrong | Check `.env` |
| Jira created, wiki fails | Confluence MCP rejecting `content_format` param | `MCPAdapter` should omit it |
| Remote links missing | Step C ran before Step E resolved | Check orchestration step order |
| Image not in wiki | Direct REST attachment failed AND MCP fallback failed | Check `CONFLUENCE_BASE_URL` + token |
| Git step errors | `GIT_MCP_URL` set to invalid URL | Set to blank to skip cleanly |

## Test Payload Reference

Minimal payload to test `POST /api/generate` without Figma:

```bash
curl -s -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "componentName": "Debug Component",
    "platform": "jira",
    "documentType": "component",
    "techStack": "React",
    "figmaUrl": "https://www.figma.com/design/FILEKEY/FileName",
    "enableActiveCreation": true
  }' | python3 -c "
import sys, json
d = json.load(sys.stdin)
o = d.get(\'data\',{}).get(\'metadata\',{}).get(\'orchestration\',{})
for k,v in o.items():
    print(k, \'-\', v.get(\'status\'), v.get(\'url\',\'\'[:60]))
"
```

## Key files for debugging

| File | What to look for |
|------|------------------|
| `/tmp/server.log` | Step A/B/E/C/D success/failure + MCP call details |
| `core/orchestration/WorkItemOrchestrator.js` | Step implementation + error handling |
| `core/adapters/MCPAdapter.js` | MCP call construction + response parsing |
| `.env` | All required vars — compare against `.env.example` |
