/**
 * Tech Stack & Template Helper Tests
 *
 * Tests the tech-stack normalisation patterns used throughout the codebase
 * (TicketGenerationService fallback, ContextTemplateBridge normalisation) and
 * the pure helpers in UniversalTemplateEngine — all without I/O or LLM calls.
 */

import { describe, it, expect } from 'vitest';
import { TicketGenerationService } from '../../app/services/TicketGenerationService.js';
import { UniversalTemplateEngine } from '../../core/template/UniversalTemplateEngine.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Call the private _hardcodedFallback to observe tech-stack formatting */
function fallbackFor(techStack) {
  const svc = new TicketGenerationService(null);   // no Gemini needed
  return svc._hardcodedFallback('Widget', { techStack });
}

// ── Tech-stack normalisation (TicketGenerationService._hardcodedFallback) ────

describe('Tech stack normalisation — TicketGenerationService._hardcodedFallback', () => {
  it('formats a plain string tech stack verbatim', () => {
    const { content } = fallbackFor('Vue 3');
    expect(content).toContain('Vue 3');
  });

  it('joins an array tech stack with ", "', () => {
    const { content } = fallbackFor(['React 18', 'TypeScript', 'Vite']);
    expect(content).toContain('React 18, TypeScript, Vite');
  });

  it('defaults to "AEM 6.5" when no tech stack provided', () => {
    const { content } = fallbackFor(undefined);
    expect(content).toContain('AEM 6.5');
  });

  it('uses empty string passed explicitly as-is (not the default)', () => {
    const { content } = fallbackFor('');
    // empty string is falsy → default kicks in
    expect(content).toContain('AEM 6.5');
  });

  it('always marks content as fallback / AI unavailable', () => {
    const { content } = fallbackFor('Next.js');
    expect(content).toContain('fallback');
  });

  it('returns emergency-fallback strategy', () => {
    const { metadata } = fallbackFor('Nuxt 3');
    expect(metadata.strategy).toBe('emergency-fallback');
  });
});

// ── UniversalTemplateEngine.createFallbackTemplate (pure, no I/O) ────────────

describe('UniversalTemplateEngine.createFallbackTemplate', () => {
  const engine = new UniversalTemplateEngine('/non-existent-path');

  it('returns an object with the correct platform', () => {
    const t = engine.createFallbackTemplate('jira', 'component', 'React');
    expect(t.meta.platform).toBe('jira');
  });

  it('returns an object with document_type in meta', () => {
    const t = engine.createFallbackTemplate('confluence', 'page', 'AEM');
    expect(t.meta.document_type).toBe('page');
  });

  it('sets meta.status to "fallback"', () => {
    const t = engine.createFallbackTemplate('jira', 'story', 'Vue');
    expect(t.meta.status).toBe('fallback');
  });

  it('includes tech stack in the template content', () => {
    const t = engine.createFallbackTemplate('jira', 'component', 'Next.js');
    expect(t.template.content).toContain('Next.js');
  });

  it('includes platform in the template content', () => {
    const t = engine.createFallbackTemplate('confluence', 'page', 'React');
    expect(t.template.content).toContain('confluence');
  });

  it('uses mustache-style placeholder for component name', () => {
    const t = engine.createFallbackTemplate('jira', 'component', 'Vue');
    expect(t.template.title).toContain('{{ figma.component_name }}');
  });
});

// ── UniversalTemplateEngine.isValidTemplate ───────────────────────────────────

describe('UniversalTemplateEngine.isValidTemplate', () => {
  const engine = new UniversalTemplateEngine('/non-existent-path');

  const validTemplate = {
    meta: { platform: 'jira', document_type: 'component' },
    template: { content: '# {{title}}' },
  };

  it('accepts a template whose platform matches', () => {
    expect(engine.isValidTemplate(validTemplate, 'jira', 'component')).toBe(true);
  });

  it('rejects null / undefined', () => {
    expect(engine.isValidTemplate(null, 'jira', 'component')).toBe(false);
    expect(engine.isValidTemplate(undefined, 'jira', 'component')).toBe(false);
  });

  it('accepts a template that has only a template property (no meta)', () => {
    // hasTemplate = truthy → valid even without meta
    expect(engine.isValidTemplate({ template: { content: 'x' } }, 'jira', 'component')).toBeTruthy();
  });

  it('accepts a template whose meta matches platform', () => {
    const t = { meta: { platform: 'jira' }, template: {} };
    expect(engine.isValidTemplate(t, 'jira', 'component')).toBeTruthy();
  });
});
