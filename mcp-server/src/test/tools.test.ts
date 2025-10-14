/**
 * Basic tests for MCP Server tools
 */

import { describe, it, expect } from 'vitest';
import { ProjectAnalyzer } from '../src/tools/project-analyzer.js';
import { TicketGenerator } from '../src/tools/ticket-generator.js';
import { ComplianceChecker } from '../src/tools/compliance-checker.js';

describe('MCP Server Tools', () => {
  const testFigmaUrl = 'https://www.figma.com/file/test123/Sample-Project';

  describe('ProjectAnalyzer', () => {
    it('should analyze a project successfully', async () => {
      const analyzer = new ProjectAnalyzer();
      const result = await analyzer.analyze({
        figmaUrl: testFigmaUrl,
        scope: 'file',
        includeCompliance: true,
        includeRelationships: true,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Project Analysis Results');
    });

    it('should handle invalid URLs gracefully', async () => {
      const analyzer = new ProjectAnalyzer();
      
      await expect(
        analyzer.analyze({ figmaUrl: 'invalid-url' })
      ).rejects.toThrow('Invalid Figma URL provided');
    });
  });

  describe('TicketGenerator', () => {
    it('should generate tickets successfully', async () => {
      const generator = new TicketGenerator();
      const result = await generator.generate({
        figmaUrl: testFigmaUrl,
        ticketType: 'story',
        platform: 'jira',
        includeSpecs: true,
        estimateEffort: true,
      });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Generated Ticket');
      expect(result.content[0].text).toContain('STORY Ticket');
    });

    it('should use default values for optional parameters', async () => {
      const generator = new TicketGenerator();
      const result = await generator.generate({
        figmaUrl: testFigmaUrl,
      });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Generated Ticket');
    });
  });

  describe('ComplianceChecker', () => {
    it('should check compliance successfully', async () => {
      const checker = new ComplianceChecker();
      const result = await checker.check({
        figmaUrl: testFigmaUrl,
        categories: ['colors', 'typography'],
        reportFormat: 'actionable',
      });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Design System Compliance Report');
      expect(result.content[0].text).toContain('Overall Compliance Score');
    });

    it('should handle all categories by default', async () => {
      const checker = new ComplianceChecker();
      const result = await checker.check({
        figmaUrl: testFigmaUrl,
      });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Color Compliance');
      expect(result.content[0].text).toContain('Typography Compliance');
    });
  });
});