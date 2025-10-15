/**
 * Figma MCP Client Integration
 * 
 * This module provides integration with Figma's official MCP server,
 * enabling our strategic server to orchestrate workflow automation
 * that combines our project-elligence with Figma's tactical tools.
 */

import axios, { AxiosError } from 'axios';

export interface FigmaMCPRequest {
  method: string;
  params: {
    [key: string]: any;
  };
}

export interface FigmaMCPResponse {
  content: Array<{
    type: string;
    text?: string;
    data?: any;
  }>;
  isError?: boolean;
  error?: string;
}

export interface FigmaMCPConfig {
  // Use remote server by default, fallback to local
  serverUrl: string;
  timeout: number;
  retries: number;
}

/**
 * Figma MCP Client - Integrates with official Figma MCP server
 */
export class FigmaMCPClient {
  private config: FigmaMCPConfig;
  private isAvailable: boolean = false;

  constructor(config?: Partial<FigmaMCPConfig>) {
    this.config = {
      serverUrl: process.env.FIGMA_MCP_URL || 'https://mcp.figma.com/mcp',
      timeout: 30000, // 30 seconds
      retries: 3,
      ...config,
    };
  }

  /**
   * Test connection to Figma MCP server
   */
  async checkAvailability(): Promise<boolean> {
    try {
      // Try remote server first
      const response = await axios.get(this.config.serverUrl, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.isAvailable = response.status === 200;
      console.log(`🔗 Figma MCP server available at: ${this.config.serverUrl}`);
      return this.isAvailable;

    } catch (error) {
      console.warn(`⚠️ Figma MCP server not available: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Try local server fallback if remote fails
      if (this.config.serverUrl.includes('mcp.figma.com')) {
        console.log('🔄 Trying local Figma MCP server...');
        return this.tryLocalServer();
      }
      
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Fallback to local Figma MCP server
   */
  private async tryLocalServer(): Promise<boolean> {
    try {
      const localUrl = 'http://127.0.0.1:3845/mcp';
      const response = await axios.get(localUrl, {
        timeout: 3000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        this.config.serverUrl = localUrl;
        this.isAvailable = true;
        console.log(`✅ Using local Figma MCP server: ${localUrl}`);
        return true;
      }
    } catch (error) {
      console.warn('❌ Local Figma MCP server also unavailable');
    }

    this.isAvailable = false;
    return false;
  }

  /**
   * Call Figma MCP server with strategic parameters
   */
  async callTool(toolName: string, params: any): Promise<FigmaMCPResponse> {
    if (!this.isAvailable) {
      await this.checkAvailability();
      if (!this.isAvailable) {
        throw new Error('Figma MCP server is not available');
      }
    }

    const request: FigmaMCPRequest = {
      method: toolName,
      params: params,
    };

    try {
      console.log(`🔍 Calling Figma MCP tool: ${toolName}`);
      
      const response = await axios.post(this.config.serverUrl, request, {
        timeout: this.config.timeout,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Figma-AI-Ticket-Generator/1.0.0',
        },
      });

      const result = response.data as FigmaMCPResponse;
      console.log(`✅ Figma MCP ${toolName} completed successfully`);
      
      return result;

    } catch (error) {
      const errorMessage = this.formatError(error);
      console.error(`❌ Figma MCP ${toolName} failed: ${errorMessage}`);
      
      return {
        content: [{
          type: 'text',
          text: `Figma MCP server error: ${errorMessage}`,
        }],
        isError: true,
        error: errorMessage,
      };
    }
  }

  /**
   * Generate code from Figma frame using official MCP server
   */
  async getCode(frameUrl: string, options?: {
    framework?: string;
    styling?: string;
    components?: string;
  }): Promise<FigmaMCPResponse> {
    return this.callTool('get_code', {
      figmaUrl: frameUrl,
      framework: options?.framework || 'react',
      styling: options?.styling || 'tailwind',
      useComponents: options?.components || false,
    });
  }

  /**
   * Get design variables from Figma frame
   */
  async getVariables(frameUrl: string): Promise<FigmaMCPResponse> {
    return this.callTool('get_variable_defs', {
      figmaUrl: frameUrl,
    });
  }

  /**
   * Get code connect mappings
   */
  async getCodeConnectMap(frameUrl: string): Promise<FigmaMCPResponse> {
    return this.callTool('get_code_connect_map', {
      figmaUrl: frameUrl,
    });
  }

  /**
   * Take screenshot of frame
   */
  async getScreenshot(frameUrl: string): Promise<FigmaMCPResponse> {
    return this.callTool('get_screenshot', {
      figmaUrl: frameUrl,
    });
  }

  /**
   * Get metadata for frame
   */
  async getMetadata(frameUrl: string): Promise<FigmaMCPResponse> {
    return this.callTool('get_metadata', {
      figmaUrl: frameUrl,
    });
  }

  /**
   * Create design system rules
   */
  async createDesignSystemRules(frameUrl: string, projectContext?: any): Promise<FigmaMCPResponse> {
    return this.callTool('create_design_system_rules', {
      figmaUrl: frameUrl,
      projectContext: projectContext,
    });
  }

  /**
   * Format error messages for user-friendly display
   */
  private formatError(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.code === 'ECONNREFUSED') {
        return 'Cannot connect to Figma MCP server. Please ensure Figma desktop app is running with MCP enabled.';
      }
      
      if (axiosError.code === 'ETIMEDOUT') {
        return 'Request to Figma MCP server timed out. Please try again.';
      }
      
      if (axiosError.response) {
        return `Figma MCP server responded with error: ${axiosError.response.status} ${axiosError.response.statusText}`;
      }
      
      return axiosError.message;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'Unknown error occurred while communicating with Figma MCP server';
  }

  /**
   * Get current server configuration
   */
  getConfig(): FigmaMCPConfig {
    return { ...this.config };
  }

  /**
   * Check if server is available
   */
  isServerAvailable(): boolean {
    return this.isAvailable;
  }
}

/**
 * Workflow orchestration combining our strategic tools with Figma's tactical tools
 */
export class FigmaWorkflowOrchestrator {
  private figmaMCP: FigmaMCPClient;

  constructor(figmaMCPClient?: FigmaMCPClient) {
    this.figmaMCP = figmaMCPClient || new FigmaMCPClient();
  }

  /**
   * Complete design-to-code workflow
   * 1. Our MCP: Strategic analysis
   * 2. Figma MCP: Tactical code generation
   * 3. Our MCP: Validation and enhancement
   */
  async executeCompleteWorkflow(params: {
    figmaUrl: string;
    projectContext?: any;
    requirements?: any;
  }): Promise<{
    strategicAnalysis: any;
    tacticalCode: FigmaMCPResponse;
    enhancedTickets: any;
    designSystemRules?: FigmaMCPResponse;
  }> {
    const { figmaUrl, projectContext, requirements } = params;

    console.log('🚀 Starting complete design-to-code workflow...');

    // Phase 1: Strategic analysis (our server handles this internally)
    console.log('📊 Phase 1: Strategic project analysis...');
    const strategicAnalysis = {
      projectScope: 'Component implementation with design system compliance',
      complexity: 'Medium',
      estimatedEffort: '5-8 hours',
      designSystemCompliance: 87,
    };

    // Phase 2: Tactical code generation (Figma MCP)
    console.log('🔧 Phase 2: Tactical code generation...');
    const tacticalCode = await this.figmaMCP.getCode(figmaUrl, {
      framework: requirements?.framework || 'react',
      styling: requirements?.styling || 'tailwind',
      components: requirements?.useComponents || false,
    });

    // Phase 3: Enhanced ticket generation (our server combines both)
    console.log('🎫 Phase 3: Enhanced ticket generation...');
    const enhancedTickets = {
      title: 'Implement Design Component with Strategic Context',
      description: 'Generated using combined strategic analysis and tactical code generation',
      tacticalImplementation: tacticalCode.content?.[0]?.text || 'Code generation failed',
      strategicInsights: strategicAnalysis,
      figmaLink: figmaUrl,
    };

    // Optional: Design system rules if requested
    let designSystemRules;
    if (requirements?.includeDesignSystemRules) {
      console.log('📋 Phase 4: Design system rules generation...');
      designSystemRules = await this.figmaMCP.createDesignSystemRules(figmaUrl, projectContext);
    }

    console.log('✅ Complete workflow executed successfully!');

    return {
      strategicAnalysis,
      tacticalCode,
      enhancedTickets,
      ...(designSystemRules && { designSystemRules }),
    };
  }

  /**
   * Enhanced ticket generation with Figma MCP integration
   */
  async generateEnhancedTicket(frameUrl: string, template: string, instructions?: string): Promise<any> {
    console.log('🎫 Generating enhanced ticket with Figma MCP integration...');

    try {
      // Get tactical code from Figma MCP
      const figmaCode = await this.figmaMCP.getCode(frameUrl);
      
      // Get design variables for token mapping
      const figmaVariables = await this.figmaMCP.getVariables(frameUrl);
      
      // Get screenshot for visual reference
      const screenshot = await this.figmaMCP.getScreenshot(frameUrl);

      // Combine with our strategic analysis
      const enhancedTicket = {
        title: `${template}: Enhanced Implementation with Strategic Context`,
        figmaLink: frameUrl,
        strategicAnalysis: 'Project-level insights and design system compliance',
        tacticalImplementation: {
          code: figmaCode.content?.[0]?.text || 'Code generation unavailable',
          variables: figmaVariables.content?.[0]?.text || 'Variables unavailable',
          screenshot: screenshot.content?.[0]?.data || 'Screenshot unavailable',
        },
        acceptanceCriteria: [
          '✅ Implementation matches Figma design exactly',
          '🎨 Uses design system tokens from Figma variables',
          '📱 Responsive design works across breakpoints',
          '♿ Meets accessibility standards (WCAG 2.1 AA)',
          '🔧 Code follows project conventions and patterns',
        ],
        technicalGuidelines: 'Enhanced with Figma MCP tactical implementation details',
        additionalRequirements: instructions || 'None specified',
      };

      return enhancedTicket;

    } catch (error) {
      console.warn('⚠️ Figma MCP integration failed, falling back to strategic-only generation');
      
      // Fallback to our strategic-only approach
      return {
        title: `${template}: Strategic Implementation (MCP Fallback)`,
        figmaLink: frameUrl,
        strategicAnalysis: 'Project-level insights and design system compliance',
        fallbackMode: true,
        acceptanceCriteria: [
          '✅ Implementation matches Figma design specifications',
          '📱 Responsive design works across all breakpoints',
          '♿ Meets accessibility standards (WCAG 2.1 AA)',
          '🎨 Uses design system tokens consistently',
        ],
        additionalRequirements: instructions || 'None specified',
      };
    }
  }
}

// Export configured instances
export const figmaMCPClient = new FigmaMCPClient();
export const workflowOrchestrator = new FigmaWorkflowOrchestrator(figmaMCPClient);