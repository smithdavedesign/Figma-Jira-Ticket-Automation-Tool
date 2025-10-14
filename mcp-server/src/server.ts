#!/usr/bin/env node

/**
 * Figma AI Ticket Generator - MCP Server
 * 
 * Strategic design-to-code automation server implementing the Model Context Protocol.
 * This server provides project-level intelligence and workflow automation capabilities
 * that complement Figma's tactical MCP server for individual frame processing.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  ToolSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import dotenv from 'dotenv';

// Import our custom tools
import { ProjectAnalyzer } from './tools/project-analyzer.js';
import { BatchProcessor } from './tools/batch-processor.js';
import { TicketGenerator } from './tools/ticket-generator.js';
import { ComplianceChecker } from './tools/compliance-checker.js';
import { RelationshipMapper } from './tools/relationship-mapper.js';
import { EffortEstimator } from './tools/effort-estimator.js';

// Load environment variables
dotenv.config();

/**
 * Enhanced Figma AI Ticket Generator MCP Server
 * 
 * Provides strategic project-level automation tools for design-to-code workflows
 */
class FigmaAITicketMCPServer {
  private server: Server;
  private projectAnalyzer: ProjectAnalyzer;
  private batchProcessor: BatchProcessor;
  private ticketGenerator: TicketGenerator;
  private complianceChecker: ComplianceChecker;
  private relationshipMapper: RelationshipMapper;
  private effortEstimator: EffortEstimator;

  constructor() {
    this.server = new Server(
      {
        name: 'figma-ai-ticket-generator',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize tool modules
    this.projectAnalyzer = new ProjectAnalyzer();
    this.batchProcessor = new BatchProcessor();
    this.ticketGenerator = new TicketGenerator();
    this.complianceChecker = new ComplianceChecker();
    this.relationshipMapper = new RelationshipMapper();
    this.effortEstimator = new EffortEstimator();

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  /**
   * Define all available MCP tools
   */
  private getAvailableTools(): Tool[] {
    return [
      {
        name: 'analyze_project',
        description: 'Analyze entire Figma project for comprehensive insights, component inventory, and design system compliance',
        inputSchema: {
          type: 'object',
          properties: {
            figmaUrl: {
              type: 'string',
              description: 'URL to Figma file or project',
            },
            scope: {
              type: 'string',
              enum: ['file', 'page', 'selection'],
              description: 'Analysis scope',
              default: 'file',
            },
            includeCompliance: {
              type: 'boolean',
              description: 'Include design system compliance analysis',
              default: true,
            },
            includeRelationships: {
              type: 'boolean',
              description: 'Include component relationship mapping',
              default: true,
            },
          },
          required: ['figmaUrl'],
        },
      },
      {
        name: 'batch_process_frames',
        description: 'Process multiple frames or components in batch for efficient analysis and code generation',
        inputSchema: {
          type: 'object',
          properties: {
            figmaUrl: {
              type: 'string',
              description: 'URL to Figma file containing frames to process',
            },
            frameSelectors: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of frame IDs or names to process',
            },
            outputFormat: {
              type: 'string',
              enum: ['tickets', 'specifications', 'analysis', 'all'],
              description: 'Desired output format',
              default: 'all',
            },
            processingOptions: {
              type: 'object',
              properties: {
                maxConcurrency: { type: 'number', default: 3 },
                includeAssets: { type: 'boolean', default: true },
                generateSpecs: { type: 'boolean', default: true },
              },
            },
          },
          required: ['figmaUrl'],
        },
      },
      {
        name: 'generate_tickets',
        description: 'Generate structured tickets (Jira, Linear, etc.) from Figma designs with effort estimation and dependencies',
        inputSchema: {
          type: 'object',
          properties: {
            figmaUrl: {
              type: 'string',
              description: 'URL to Figma design or component',
            },
            ticketType: {
              type: 'string',
              enum: ['epic', 'story', 'task', 'bug', 'auto'],
              description: 'Type of ticket to generate',
              default: 'auto',
            },
            platform: {
              type: 'string',
              enum: ['jira', 'linear', 'asana', 'github', 'generic'],
              description: 'Target platform for ticket generation',
              default: 'generic',
            },
            includeSpecs: {
              type: 'boolean',
              description: 'Include technical specifications',
              default: true,
            },
            estimateEffort: {
              type: 'boolean',
              description: 'Include effort estimation',
              default: true,
            },
          },
          required: ['figmaUrl'],
        },
      },
      {
        name: 'check_compliance',
        description: 'Analyze design system compliance and generate detailed health reports with recommendations',
        inputSchema: {
          type: 'object',
          properties: {
            figmaUrl: {
              type: 'string',
              description: 'URL to Figma file or component',
            },
            designSystemUrl: {
              type: 'string',
              description: 'URL to design system reference (optional)',
            },
            categories: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['colors', 'typography', 'spacing', 'components', 'all'],
              },
              description: 'Compliance categories to check',
              default: ['all'],
            },
            reportFormat: {
              type: 'string',
              enum: ['summary', 'detailed', 'actionable'],
              description: 'Level of detail in compliance report',
              default: 'actionable',
            },
          },
          required: ['figmaUrl'],
        },
      },
      {
        name: 'map_relationships',
        description: 'Map component relationships, dependencies, and usage patterns across the project',
        inputSchema: {
          type: 'object',
          properties: {
            figmaUrl: {
              type: 'string',
              description: 'URL to Figma file or project',
            },
            analysisDepth: {
              type: 'string',
              enum: ['shallow', 'deep', 'complete'],
              description: 'Depth of relationship analysis',
              default: 'deep',
            },
            includeUsageStats: {
              type: 'boolean',
              description: 'Include usage statistics for components',
              default: true,
            },
            outputFormat: {
              type: 'string',
              enum: ['graph', 'tree', 'matrix', 'json'],
              description: 'Format for relationship output',
              default: 'graph',
            },
          },
          required: ['figmaUrl'],
        },
      },
      {
        name: 'estimate_effort',
        description: 'Estimate development effort and complexity for designs with breakdown by feature and role',
        inputSchema: {
          type: 'object',
          properties: {
            figmaUrl: {
              type: 'string',
              description: 'URL to Figma design or project',
            },
            estimationType: {
              type: 'string',
              enum: ['story-points', 'hours', 'complexity', 'all'],
              description: 'Type of estimation to perform',
              default: 'all',
            },
            teamProfile: {
              type: 'object',
              properties: {
                seniority: { type: 'string', enum: ['junior', 'mid', 'senior'], default: 'mid' },
                framework: { type: 'string', description: 'Primary development framework' },
                hasDesignSystem: { type: 'boolean', default: false },
              },
            },
            includeBreakdown: {
              type: 'boolean',
              description: 'Include detailed breakdown by component/feature',
              default: true,
            },
          },
          required: ['figmaUrl'],
        },
      },
    ];
  }

  /**
   * Setup tool request handlers
   */
  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getAvailableTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_project':
            return await this.projectAnalyzer.analyze(args);

          case 'batch_process_frames':
            return await this.batchProcessor.process(args);

          case 'generate_tickets':
            return await this.ticketGenerator.generate(args);

          case 'check_compliance':
            return await this.complianceChecker.check(args);

          case 'map_relationships':
            return await this.relationshipMapper.map(args);

          case 'estimate_effort':
            return await this.effortEstimator.estimate(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool "${name}": ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Setup error handling and logging
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Server Error]:', error);
    };

    process.on('SIGINT', async () => {
      console.log('\n🔄 Shutting down MCP server gracefully...');
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('🚀 Figma AI Ticket Generator MCP Server started');
    console.error('📋 Available tools:', this.getAvailableTools().map(t => t.name).join(', '));
    console.error('🔗 Strategic design-to-code automation ready!');
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new FigmaAITicketMCPServer();
  server.start().catch((error) => {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  });
}

export { FigmaAITicketMCPServer };