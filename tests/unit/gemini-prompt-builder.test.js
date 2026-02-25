/**
 * GeminiService — Unit tests for pure prompt-building and formatting methods.
 *
 * These are all synchronous, deterministic helpers with no Gemini API calls.
 * We stub GoogleGenerativeAI so the constructor doesn't need a real key.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── Mock @google/generative-ai so constructor never tries to initialise the SDK
vi.mock('@google/generative-ai', () => {
  class GoogleGenerativeAI {
    constructor() {}
    getGenerativeModel() { return {}; }
  }
  return { GoogleGenerativeAI };
});

// ── Stub UnifiedContextBuilder to avoid Figma/file-system dependencies
vi.mock('../../core/data/unified-context-builder.js', () => {
  class UnifiedContextBuilder {
    constructor() {}
    buildUnifiedContext() { return Promise.resolve({}); }
  }
  return { UnifiedContextBuilder };
});

import { GeminiService } from '../../core/ai/GeminiService.js';

function makeService() {
  return new GeminiService({ apiKey: 'test-key-12345' });
}

// ── _buildFigmaDeepLink ───────────────────────────────────────────────────────

describe('GeminiService._buildFigmaDeepLink', () => {
  let svc;
  beforeEach(() => { svc = makeService(); });

  it('returns null when context is empty', () => {
    expect(svc._buildFigmaDeepLink({})).toBeNull();
  });

  it('returns figma.live_link when present and not the default placeholder', () => {
    const ctx = { figma: { live_link: 'https://www.figma.com/design/abc?node-id=1-2' } };
    expect(svc._buildFigmaDeepLink(ctx)).toBe('https://www.figma.com/design/abc?node-id=1-2');
  });

  it('ignores the default placeholder live_link', () => {
    const ctx = {
      figma: { live_link: 'https://www.figma.com/file/unknown', file_key: 'realKey' },
    };
    const result = svc._buildFigmaDeepLink(ctx);
    expect(result).toContain('realKey');
    expect(result).not.toBe('https://www.figma.com/file/unknown');
  });

  it('falls back to figma.url when live_link is absent', () => {
    const ctx = { figma: { url: 'https://www.figma.com/design/xyz', file_key: 'xyz' } };
    const result = svc._buildFigmaDeepLink(ctx);
    expect(result).toContain('xyz');
  });

  it('appends node-id from figma.frame_id', () => {
    const ctx = {
      figma: { file_key: 'k1', frame_id: '5:100' },
    };
    const result = svc._buildFigmaDeepLink(ctx);
    expect(result).toContain('node-id=5-100');
  });

  it('encodes semicolons in node-id to %3B', () => {
    const ctx = {
      figma: { file_key: 'k2', frame_id: '10:200;10:100' },
    };
    const result = svc._buildFigmaDeepLink(ctx);
    expect(result).toContain('%3B');
  });

  it('constructs URL from fileContext.fileKey when figma data is absent', () => {
    const ctx = { fileContext: { fileKey: 'myKey99' } };
    const result = svc._buildFigmaDeepLink(ctx);
    expect(result).toBe('https://www.figma.com/design/myKey99');
  });
});

// ── _extractFileKey ───────────────────────────────────────────────────────────

describe('GeminiService._extractFileKey', () => {
  let svc;
  beforeEach(() => { svc = makeService(); });

  it('prefers figma.file_key', () => {
    expect(svc._extractFileKey({ figma: { file_key: 'primary' } })).toBe('primary');
  });

  it('falls back to fileContext.fileKey', () => {
    expect(svc._extractFileKey({ fileContext: { fileKey: 'fc' } })).toBe('fc');
  });

  it('falls back to requestData.fileContext.fileKey', () => {
    const ctx = { requestData: { fileContext: { fileKey: 'rd' } } };
    expect(svc._extractFileKey(ctx)).toBe('rd');
  });

  it('returns "unknown" when nothing is present', () => {
    expect(svc._extractFileKey({})).toBe('unknown');
  });
});

// ── _systemPrompt ─────────────────────────────────────────────────────────────

describe('GeminiService._systemPrompt', () => {
  let svc;
  beforeEach(() => { svc = makeService(); });

  it('includes the tech stack in the output', () => {
    expect(svc._systemPrompt('React + TypeScript', 'Jira')).toContain('React + TypeScript');
  });

  it('includes the platform in the output', () => {
    expect(svc._systemPrompt('AEM', 'Confluence')).toContain('Confluence');
  });

  it('mentions senior technical analyst in the persona', () => {
    expect(svc._systemPrompt('Vue', 'Jira')).toContain('senior technical analyst');
  });
});

// ── _platformRules ────────────────────────────────────────────────────────────

describe('GeminiService._platformRules', () => {
  let svc;
  beforeEach(() => { svc = makeService(); });

  it('Jira rules mention h1. syntax', () => {
    expect(svc._platformRules('Jira', {})).toContain('h1.');
  });

  it('Wiki rules mention Confluence wiki markup', () => {
    expect(svc._platformRules('Wiki', {})).toContain('Confluence wiki markup');
  });

  it('Markdown rules mention # headings', () => {
    expect(svc._platformRules('Markdown', {})).toContain('#');
  });

  it('unknown platform falls back to Jira syntax', () => {
    // Falls to `rules[platform] || rules.Jira`
    expect(svc._platformRules('unknown-platform', {})).toContain('h1.');
  });
});

// ── _techStackRules ───────────────────────────────────────────────────────────

describe('GeminiService._techStackRules', () => {
  let svc;
  beforeEach(() => { svc = makeService(); });

  it('AEM: includes HTL and Sling Models', () => {
    const rules = svc._techStackRules('AEM 6.5');
    expect(rules).toContain('HTL');
    expect(rules).toContain('Sling Models');
  });

  it('React: mentions hooks', () => {
    expect(svc._techStackRules('React')).toContain('hooks');
  });

  it('TypeScript: mentions interfaces and no any types', () => {
    const rules = svc._techStackRules('TypeScript');
    expect(rules).toContain('TypeScript interfaces');
    expect(rules).toContain('no `any` types');
  });

  it('Vue 3: mentions Composition API', () => {
    expect(svc._techStackRules('vue 3')).toContain('Composition API');
  });

  it('Angular: mentions @Input/@Output', () => {
    expect(svc._techStackRules('Angular')).toContain('@Input/@Output');
  });

  it('Next.js: mentions App Router', () => {
    expect(svc._techStackRules('Next.js')).toContain('App Router');
  });

  it('unknown tech: includes generic best-practices line', () => {
    expect(svc._techStackRules('Svelte')).toContain('Svelte best practices');
  });

  it('accepts an array of tech stacks and combines rules', () => {
    const rules = svc._techStackRules(['React', 'TypeScript']);
    expect(rules).toContain('hooks');
    expect(rules).toContain('TypeScript interfaces');
  });
});

// ── _getMarkupHelpers ─────────────────────────────────────────────────────────

describe('GeminiService._getMarkupHelpers', () => {
  let svc;
  beforeEach(() => { svc = makeService(); });

  it('Jira h1 is "h1. "', () => {
    expect(svc._getMarkupHelpers('Jira').h1).toBe('h1. ');
  });

  it('Markdown h1 is "# "', () => {
    expect(svc._getMarkupHelpers('Markdown').h1).toBe('# ');
  });

  it('Jira link helper produces [text|url] syntax', () => {
    const { link } = svc._getMarkupHelpers('Jira');
    expect(link('Design', 'https://figma.com')).toBe('[Design|https://figma.com]');
  });

  it('Markdown link helper produces [text](url) syntax', () => {
    const { link } = svc._getMarkupHelpers('Markdown');
    expect(link('Design', 'https://figma.com')).toBe('[Design](https://figma.com)');
  });

  it('unknown platform defaults to Jira helpers', () => {
    expect(svc._getMarkupHelpers('unknown').h1).toBe('h1. ');
  });
});

// ── _cleanResponse ────────────────────────────────────────────────────────────

describe('GeminiService._cleanResponse', () => {
  let svc;
  beforeEach(() => { svc = makeService(); });

  it('strips leading ```markdown fence', () => {
    const raw = '```markdown\nh1. Title\n\nBody\n```';
    expect(svc._cleanResponse(raw)).toBe('h1. Title\n\nBody');
  });

  it('strips leading ```jira fence', () => {
    const raw = '```jira\nh1. Title\n```';
    expect(svc._cleanResponse(raw)).toBe('h1. Title');
  });

  it('strips leading plain ``` fence', () => {
    const raw = '```\ncontent here\n```';
    expect(svc._cleanResponse(raw)).toBe('content here');
  });

  it('removes trailing "Design Analysis" section', () => {
    const raw = 'h1. Ticket\n\nBody\n\n## Design Analysis\nsome notes';
    expect(svc._cleanResponse(raw)).not.toContain('Design Analysis');
    expect(svc._cleanResponse(raw)).toContain('h1. Ticket');
  });

  it('trims leading/trailing whitespace', () => {
    expect(svc._cleanResponse('\n\n  content  \n\n')).toBe('content');
  });

  it('leaves clean content unchanged', () => {
    const raw = 'h1. NavBar\n\nh2. Overview\nContent here.';
    expect(svc._cleanResponse(raw)).toBe(raw);
  });

  it('applies Jira bullet fix when platform is Jira', () => {
    const raw = '_ _Focus:* Show focus indicator.\n_ _Active:* No active state.';
    const result = svc._cleanResponse(raw, 'Jira');
    expect(result).toContain('** *Focus:*');
    expect(result).toContain('** *Active:*');
    expect(result).not.toMatch(/^_ _/m);
  });

  it('does NOT apply Jira bullet fix for non-Jira platforms', () => {
    const raw = '_ _Focus:* Show focus indicator.';
    const result = svc._cleanResponse(raw, 'Markdown');
    expect(result).toBe(raw);
  });
});

// ── _fixJiraBullets ───────────────────────────────────────────────────────────

describe('GeminiService._fixJiraBullets', () => {
  let svc;
  beforeEach(() => { svc = makeService(); });

  it('converts "_ _Label:* text" to "** *Label:* text"', () => {
    const input = '_ _Focus:* Show a clear focus indicator.';
    expect(svc._fixJiraBullets(input)).toBe('** *Focus:* Show a clear focus indicator.');
  });

  it('converts "_ _Label*: text" (asterisk before colon) to "** *Label:* text"', () => {
    const input = '_ _Hover*: Apply a visual cue on hover.';
    expect(svc._fixJiraBullets(input)).toBe('** *Hover:* Apply a visual cue on hover.');
  });

  it('converts full Interactive States block with asterisk-before-colon pattern', () => {
    const input = [
      '_ _Hover*: Apply a visual cue on hover.',
      '_ _Focus*: Use the standard focus ring.',
      '_ _Active*: Provide visual feedback when clicked.',
      '_ _Disabled*: Visually disable the button.',
    ].join('\n');
    const expected = [
      '** *Hover:* Apply a visual cue on hover.',
      '** *Focus:* Use the standard focus ring.',
      '** *Active:* Provide visual feedback when clicked.',
      '** *Disabled:* Visually disable the button.',
    ].join('\n');
    expect(svc._fixJiraBullets(input)).toBe(expected);
  });

  it('converts "_ _Label:_ text" to "** _Label:_ text"', () => {
    const input = '_ _Hover:_ Slightly darken the background.';
    expect(svc._fixJiraBullets(input)).toBe('** _Hover:_ Slightly darken the background.');
  });

  it('converts remaining "_ _text" lines to "** text"', () => {
    const input = '_ _Some unlabelled sub-item';
    expect(svc._fixJiraBullets(input)).toBe('** Some unlabelled sub-item');
  });

  it('converts "_ text" (underscore as bullet) to "* text"', () => {
    const input = '_ This was a top-level fake bullet.';
    expect(svc._fixJiraBullets(input)).toBe('* This was a top-level fake bullet.');
  });

  it('preserves correct "* item" and "** item" lines', () => {
    const input = '* First item\n** Nested item\n* Second item';
    expect(svc._fixJiraBullets(input)).toBe('* First item\n** Nested item\n* Second item');
  });

  it('handles the full Interactive States block', () => {
    const input = [
      'h2. Interactive States',
      '_Search Field:_',
      '_ _Focus:* Show a clear focus indicator.',
      '_ _Active:* No specific active state required.',
    ].join('\n');
    const result = svc._fixJiraBullets(input);
    expect(result).toContain('** *Focus:* Show a clear focus indicator.');
    expect(result).toContain('** *Active:* No specific active state required.');
    expect(result).not.toMatch(/^_ _/m);
  });
});

// ── _formatContext ────────────────────────────────────────────────────────────

describe('GeminiService._formatContext', () => {
  let svc;
  beforeEach(() => { svc = makeService(); });

  it('returns fallback message when context is empty', () => {
    const result = svc._formatContext({});
    expect(result).toContain('Context data limited');
  });

  it('includes component name from figma.component_name', () => {
    const ctx = { figma: { component_name: 'HeroCard', file_name: 'Design.fig' } };
    expect(svc._formatContext(ctx)).toContain('HeroCard');
  });

  it('includes color tokens from design.colors array', () => {
    const ctx = {
      design: { colors: ['#ff0000', '#00ff00'], typography: { fonts: ['Sora 32px'] } },
    };
    const result = svc._formatContext(ctx);
    expect(result).toContain('#ff0000');
    expect(result).toContain('#00ff00');
  });

  it('includes typography from design.typography.fonts', () => {
    const ctx = {
      design: { colors: ['#fff'], typography: { fonts: ['Inter 14px', 'Sora 32px'] } },
    };
    expect(svc._formatContext(ctx)).toContain('Inter 14px');
  });

  it('handles colors as a plain string', () => {
    const ctx = {
      design: { colors: '#4f00b5, #333333' },
    };
    // Should not throw and should include the string
    expect(svc._formatContext(ctx)).toContain('#4f00b5');
  });

  it('includes frame hierarchy from requestData.enhancedFrameData', () => {
    const ctx = {
      requestData: {
        enhancedFrameData: [{ name: 'Button', type: 'FRAME', width: 200, height: 48 }],
      },
    };
    expect(svc._formatContext(ctx)).toContain('Frame Hierarchy');
    expect(svc._formatContext(ctx)).toContain('Button');
  });

  it('includes tech stack from context.project', () => {
    const ctx = { project: { tech_stack: 'AEM 6.5', platform: 'web' } };
    expect(svc._formatContext(ctx)).toContain('AEM 6.5');
  });
});

// ── _buildPrompt (structural) ─────────────────────────────────────────────────

describe('GeminiService._buildPrompt', () => {
  let svc;
  beforeEach(() => { svc = makeService(); });

  const baseCtx = {
    figma: { live_link: 'https://www.figma.com/design/abc123?node-id=1-2', file_name: 'DesignFile' },
    project: { tech_stack: 'React' },
  };
  const baseOpts = { componentName: 'LoginButton', techStack: 'React', platform: 'Jira', documentType: 'component' };

  it('contains the component name', () => {
    expect(svc._buildPrompt(baseCtx, baseOpts)).toContain('LoginButton');
  });

  it('contains the tech stack', () => {
    expect(svc._buildPrompt(baseCtx, baseOpts)).toContain('React');
  });

  it('contains the Figma deep link', () => {
    const prompt = svc._buildPrompt(baseCtx, baseOpts);
    expect(prompt).toContain('https://www.figma.com/design/abc123');
  });

  it('Jira platform: uses [text|url] link syntax in Figma link text', () => {
    const prompt = svc._buildPrompt(baseCtx, baseOpts);
    expect(prompt).toContain('[View in Figma|');
  });

  it('Wiki platform: uses [text](url) link syntax', () => {
    const opts = { ...baseOpts, platform: 'Wiki' };
    const prompt = svc._buildPrompt(baseCtx, opts);
    expect(prompt).toContain('[View in Figma](');
  });

  it('includes "Return ONLY clean" instruction', () => {
    expect(svc._buildPrompt(baseCtx, baseOpts)).toContain('Return ONLY clean');
  });

  it('combines multi-tech stacks with " + "', () => {
    const opts = { ...baseOpts, techStack: ['React', 'TypeScript'] };
    const prompt = svc._buildPrompt(baseCtx, opts);
    expect(prompt).toContain('React + TypeScript');
  });
});
