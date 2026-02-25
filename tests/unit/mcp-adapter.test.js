/**
 * MCPAdapter — Unit tests for pure and near-pure methods.
 *
 * We mock the config import and any network calls so nothing hits a real server.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── Mock mcp.config so the constructor doesn't require env vars ───────────────
vi.mock('../../config/mcp.config.js', () => ({
  default: {
    servers: {
      jira: { url: 'http://jira.test/mcp/', auth: 'Token test-jira-key' },
      confluence: { url: 'http://confluence.test/mcp/', auth: 'Token test-wiki-key' },
      default: { url: 'http://localhost:3000/api/mcp', auth: null },
    },
    routes: {
      jira_create_issue: 'jira',
      jira_update_issue: 'jira',
      jira_search: 'jira',
      jira_get_all_projects: 'jira',
      confluence_create_page: 'confluence',
      confluence_update_page: 'confluence',
      git_create_branch: 'default',
    },
  },
}));

import { MCPAdapter } from '../../core/adapters/MCPAdapter.js';

function makeAdapter() {
  return new MCPAdapter({ timeout: 5000, retryAttempts: 1 });
}

// ── _getServerForMethod ───────────────────────────────────────────────────────

describe('MCPAdapter._getServerForMethod', () => {
  let adapter;
  beforeEach(() => { adapter = makeAdapter(); });

  it('routes jira_create_issue to the jira server', () => {
    const server = adapter._getServerForMethod('jira_create_issue');
    expect(server.url).toBe('http://jira.test/mcp/');
  });

  it('routes confluence_create_page to the confluence server', () => {
    const server = adapter._getServerForMethod('confluence_create_page');
    expect(server.url).toBe('http://confluence.test/mcp/');
  });

  it('routes git_create_branch to the default server', () => {
    const server = adapter._getServerForMethod('git_create_branch');
    expect(server.url).toBe('http://localhost:3000/api/mcp');
  });

  it('unknown method falls back to the default server', () => {
    const server = adapter._getServerForMethod('totally_unknown_method');
    expect(server.url).toBe('http://localhost:3000/api/mcp');
  });
});

// ── _parseResponse ────────────────────────────────────────────────────────────

describe('MCPAdapter._parseResponse', () => {
  let adapter;
  beforeEach(() => { adapter = makeAdapter(); });

  /** Helper: fake Response with .text() */
  function fakeResponse(body) {
    return { text: () => Promise.resolve(body) };
  }

  it('parses a plain JSON response and returns result', async () => {
    const body = JSON.stringify({ jsonrpc: '2.0', id: 1, result: { id: 'PROJ-1' } });
    const result = await adapter._parseResponse(fakeResponse(body));
    expect(result).toEqual({ id: 'PROJ-1' });
  });

  it('parses an SSE-format response (data: ... line)', async () => {
    const payload = JSON.stringify({ jsonrpc: '2.0', id: 2, result: { pageId: '999' } });
    const body = `event: message\ndata: ${payload}\n`;
    const result = await adapter._parseResponse(fakeResponse(body));
    expect(result).toEqual({ pageId: '999' });
  });

  it('returns null for an empty body', async () => {
    const result = await adapter._parseResponse(fakeResponse(''));
    expect(result).toBeNull();
  });

  it('throws when the response contains a JSON-RPC error', async () => {
    const body = JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      error: { code: -32600, message: 'Invalid Request' },
    });
    await expect(adapter._parseResponse(fakeResponse(body))).rejects.toThrow('MCP Error: Invalid Request');
  });

  it('throws on non-JSON body', async () => {
    await expect(adapter._parseResponse(fakeResponse('not json at all'))).rejects.toThrow('Invalid JSON Response');
  });
});

// ── updateJiraDescription — image markup construction ─────────────────────────

describe('MCPAdapter.updateJiraDescription', () => {
  let adapter;
  beforeEach(() => {
    adapter = makeAdapter();
    // Stub _callMCP so no network calls go out
    vi.spyOn(adapter, '_callMCP').mockResolvedValue({ success: true });
  });

  it('appends Jira wiki attachment markup for a plain filename', async () => {
    await adapter.updateJiraDescription('PROJ-1', 'Existing desc', 'preview-nav.png');

    expect(adapter._callMCP).toHaveBeenCalledOnce();
    const [, params] = adapter._callMCP.mock.calls[0];
    expect(params.fields.description).toContain('!preview-nav.png|thumbnail!');
  });

  it('appends markdown image markup when filename is a URL', async () => {
    await adapter.updateJiraDescription('PROJ-2', '', 'https://cdn.figma.com/image.png');

    const [, params] = adapter._callMCP.mock.calls[0];
    expect(params.fields.description).toContain('![Design Preview](https://cdn.figma.com/image.png)');
  });

  it('prepends the existing description before the image markup', async () => {
    await adapter.updateJiraDescription('PROJ-3', 'Previous body.', 'img.png');

    const [, params] = adapter._callMCP.mock.calls[0];
    expect(params.fields.description).toMatch(/^Previous body\./);
    expect(params.fields.description).toContain('!img.png|thumbnail!');
  });

  it('handles empty/null existing description gracefully', async () => {
    await adapter.updateJiraDescription('PROJ-4', null, 'img.png');

    const [, params] = adapter._callMCP.mock.calls[0];
    expect(params.fields.description).toContain('!img.png|thumbnail!');
  });

  it('targets the correct issue key', async () => {
    await adapter.updateJiraDescription('PROJ-42', '', 'img.png');

    const [, params] = adapter._callMCP.mock.calls[0];
    expect(params.issue_key).toBe('PROJ-42');
  });

  it('returns { success: true } on success', async () => {
    const result = await adapter.updateJiraDescription('PROJ-5', '', 'img.png');
    expect(result).toEqual({ success: true });
  });

  it('returns null (does not throw) when _callMCP rejects', async () => {
    adapter._callMCP.mockRejectedValueOnce(new Error('network error'));
    const result = await adapter.updateJiraDescription('PROJ-6', '', 'img.png');
    expect(result).toBeNull();
  });
});
