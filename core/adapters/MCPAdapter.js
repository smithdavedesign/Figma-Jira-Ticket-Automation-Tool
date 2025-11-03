/**
 * MCP Adapter for Advanced Multi-Agent Workflows
 *
 * Optional adapter that provides MCP server integration when advanced features are needed:
 * - Multi-agent reasoning workflows
 * - Cross-tool integrations
 * - Complex AI orchestration
 * - External system connections
 *
 * Architecture:
 * Primary: Figma API → Context Layer → YAML Templates → Docs
 * Advanced: Context Layer → MCP Adapter → Multi-agent reasoning → Enhanced outputs
 */

import { Logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';

export class MCPAdapter {
  constructor(config = {}) {
    this.logger = new Logger('MCPAdapter');
    this.errorHandler = new ErrorHandler('MCPAdapter');

    this.config = {
      mcpServerUrl: config.mcpServerUrl || 'http://localhost:3000',
      enableMultiAgent: config.enableMultiAgent || false,
      enableCrossToolWorkflows: config.enableCrossToolWorkflows || false,
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      ...config
    };

    this.isAvailable = false;
    this.capabilities = new Set();
    this.connectedTools = new Map();
  }

  /**
   * Initialize MCP adapter and check server availability
   */
  async initialize() {
    this.logger.info('🔌 Initializing MCP Adapter for advanced workflows...');

    try {
      await this._checkMCPServerAvailability();
      await this._discoverCapabilities();

      if (this.isAvailable) {
        this.logger.info('✅ MCP Adapter initialized successfully', {
          capabilities: Array.from(this.capabilities),
          connectedTools: Array.from(this.connectedTools.keys())
        });
      } else {
        this.logger.warn('⚠️ MCP Adapter initialized but server unavailable');
      }
    } catch (error) {
      this.logger.warn('⚠️ MCP Adapter initialization failed:', error.message);
      this.isAvailable = false;
    }
  }

  /**
   * Check if MCP server is available for advanced workflows
   */
  async _checkMCPServerAvailability() {
    try {
      const response = await fetch(this.config.mcpServerUrl, {
        method: 'GET',
        timeout: 5000
      });

      if (response.ok) {
        const serverInfo = await response.json();
        this.isAvailable = true;
        this.serverInfo = serverInfo;

        this.logger.info('🔌 MCP Server available for advanced workflows', {
          version: serverInfo.version,
          tools: serverInfo.tools?.length || 0
        });
      } else {
        throw new Error(`MCP Server responded with ${response.status}`);
      }
    } catch (error) {
      this.logger.warn('❌ MCP Server not available:', error.message);
      this.isAvailable = false;
    }
  }

  /**
   * Discover MCP server capabilities for multi-agent workflows
   */
  async _discoverCapabilities() {
    if (!this.isAvailable) {return;}

    try {
      // Check for multi-agent reasoning capabilities
      if (this.serverInfo.tools?.includes('multi_agent_analysis')) {
        this.capabilities.add('multi-agent');
      }

      // Check for cross-tool workflow capabilities
      if (this.serverInfo.tools?.includes('workflow_orchestration')) {
        this.capabilities.add('cross-tool-workflows');
      }

      // Check for advanced AI analysis
      if (this.serverInfo.tools?.includes('advanced_ai_analysis')) {
        this.capabilities.add('advanced-ai');
      }

      // Check for external system integrations
      if (this.serverInfo.tools?.includes('external_system_integration')) {
        this.capabilities.add('external-systems');
      }

      this.logger.info('🔍 MCP capabilities discovered:', {
        capabilities: Array.from(this.capabilities)
      });

    } catch (error) {
      this.logger.warn('⚠️ Failed to discover MCP capabilities:', error.message);
    }
  }

  /**
   * Enhanced analysis using multi-agent reasoning
   * @param {Object} contextData - Rich context from Context Layer
   * @param {Object} request - Original generation request
   * @returns {Object} Enhanced analysis result
   */
  async enhanceWithMultiAgent(contextData, request) {
    if (!this.isAvailable || !this.capabilities.has('multi-agent')) {
      this.logger.warn('⚠️ Multi-agent enhancement not available');
      return contextData; // Return original context unchanged
    }

    this.logger.info('🤖 Enhancing context with multi-agent reasoning...');

    try {
      const response = await fetch(this.config.mcpServerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'multi_agent_analysis',
          params: {
            contextData,
            request,
            analysisType: 'design-intelligence',
            agents: [
              'design-system-expert',
              'accessibility-specialist',
              'performance-analyst',
              'user-experience-reviewer'
            ]
          }
        }),
        timeout: this.config.timeout
      });

      if (response.ok) {
        const result = await response.json();

        this.logger.info('✅ Multi-agent enhancement completed', {
          agentsInvolved: result.agentsInvolved?.length || 0,
          enhancementsApplied: result.enhancementsApplied?.length || 0
        });

        return this._mergeMultiAgentEnhancements(contextData, result);
      } else {
        throw new Error(`Multi-agent analysis failed: ${response.status}`);
      }

    } catch (error) {
      this.logger.warn('⚠️ Multi-agent enhancement failed:', error.message);
      return contextData; // Return original context on failure
    }
  }

  /**
   * Execute cross-tool workflows for complex integrations
   * @param {Object} contextData - Rich context data
   * @param {Array} tools - Tools to orchestrate
   * @returns {Object} Workflow execution result
   */
  async executeCrossToolWorkflow(contextData, tools = []) {
    if (!this.isAvailable || !this.capabilities.has('cross-tool-workflows')) {
      this.logger.warn('⚠️ Cross-tool workflows not available');
      return null;
    }

    this.logger.info('🔄 Executing cross-tool workflow...', {
      tools: tools.length
    });

    try {
      const response = await fetch(this.config.mcpServerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'workflow_orchestration',
          params: {
            contextData,
            tools,
            workflowType: 'design-to-code',
            orchestrationMode: 'sequential'
          }
        }),
        timeout: this.config.timeout
      });

      if (response.ok) {
        const result = await response.json();

        this.logger.info('✅ Cross-tool workflow completed', {
          toolsExecuted: result.toolsExecuted?.length || 0,
          workflowDuration: result.duration
        });

        return result;
      } else {
        throw new Error(`Workflow orchestration failed: ${response.status}`);
      }

    } catch (error) {
      this.logger.warn('⚠️ Cross-tool workflow failed:', error.message);
      return null;
    }
  }

  /**
   * Advanced AI analysis for complex design patterns
   * @param {Object} contextData - Rich context data
   * @param {string} analysisType - Type of analysis to perform
   * @returns {Object} Advanced analysis result
   */
  async performAdvancedAIAnalysis(contextData, analysisType = 'comprehensive') {
    if (!this.isAvailable || !this.capabilities.has('advanced-ai')) {
      this.logger.warn('⚠️ Advanced AI analysis not available');
      return null;
    }

    this.logger.info('🧠 Performing advanced AI analysis...', {
      analysisType,
      hasContextData: !!contextData
    });

    try {
      const response = await fetch(this.config.mcpServerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'advanced_ai_analysis',
          params: {
            contextData,
            analysisType,
            includePatternRecognition: true,
            includeAccessibilityAnalysis: true,
            includePerformanceRecommendations: true,
            includeDesignSystemCompliance: true
          }
        }),
        timeout: this.config.timeout
      });

      if (response.ok) {
        const result = await response.json();

        this.logger.info('✅ Advanced AI analysis completed', {
          patternsIdentified: result.patterns?.length || 0,
          recommendationsGenerated: result.recommendations?.length || 0,
          confidenceScore: result.confidence
        });

        return result;
      } else {
        throw new Error(`Advanced AI analysis failed: ${response.status}`);
      }

    } catch (error) {
      this.logger.warn('⚠️ Advanced AI analysis failed:', error.message);
      return null;
    }
  }

  /**
   * Integrate with external systems (Jira, Figma, Git, etc.)
   * @param {Object} contextData - Rich context data
   * @param {Array} systems - External systems to integrate with
   * @returns {Object} Integration results
   */
  async integrateWithExternalSystems(contextData, systems = []) {
    if (!this.isAvailable || !this.capabilities.has('external-systems')) {
      this.logger.warn('⚠️ External system integration not available');
      return null;
    }

    this.logger.info('🔗 Integrating with external systems...', {
      systems: systems.length
    });

    try {
      const response = await fetch(this.config.mcpServerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'external_system_integration',
          params: {
            contextData,
            systems,
            integrationType: 'bidirectional',
            syncMode: 'immediate'
          }
        }),
        timeout: this.config.timeout
      });

      if (response.ok) {
        const result = await response.json();

        this.logger.info('✅ External system integration completed', {
          systemsIntegrated: result.integratedSystems?.length || 0,
          dataExchanged: result.dataExchanged
        });

        return result;
      } else {
        throw new Error(`External system integration failed: ${response.status}`);
      }

    } catch (error) {
      this.logger.warn('⚠️ External system integration failed:', error.message);
      return null;
    }
  }

  /**
   * Merge multi-agent enhancements with original context
   * @param {Object} originalContext - Original context data
   * @param {Object} enhancements - Multi-agent enhancements
   * @returns {Object} Enhanced context data
   */
  _mergeMultiAgentEnhancements(originalContext, enhancements) {
    return {
      ...originalContext,

      // Add multi-agent insights
      multiAgentAnalysis: {
        designSystemCompliance: enhancements.designSystemCompliance,
        accessibilityScore: enhancements.accessibilityScore,
        performanceRecommendations: enhancements.performanceRecommendations,
        userExperienceInsights: enhancements.userExperienceInsights,
        agentsConsulted: enhancements.agentsInvolved
      },

      // Enhance calculated metrics with multi-agent insights
      calculated: {
        ...originalContext.calculated,
        confidence: Math.max(
          originalContext.calculated?.confidence || 0.85,
          enhancements.overallConfidence || 0.85
        ),
        complexity: enhancements.complexityAssessment || originalContext.calculated?.complexity,
        riskFactors: [
          ...(originalContext.calculated?.risk_factors || []),
          ...(enhancements.identifiedRisks || [])
        ],
        multiAgentScore: enhancements.overallScore
      },

      // Add enhanced design analysis
      designAnalysisEnhanced: enhancements.enhancedDesignAnalysis,

      // Add accessibility improvements
      accessibilityEnhancements: enhancements.accessibilityRecommendations,

      // Add performance optimizations
      performanceOptimizations: enhancements.performanceOptimizations
    };
  }

  /**
   * Check if specific capability is available
   * @param {string} capability - Capability to check
   * @returns {boolean} Whether capability is available
   */
  hasCapability(capability) {
    return this.isAvailable && this.capabilities.has(capability);
  }

  /**
   * Get adapter health status
   * @returns {Object} Health status
   */
  getHealthStatus() {
    return {
      isAvailable: this.isAvailable,
      serverUrl: this.config.mcpServerUrl,
      capabilities: Array.from(this.capabilities),
      connectedTools: Array.from(this.connectedTools.keys()),
      config: {
        multiAgentEnabled: this.config.enableMultiAgent,
        crossToolWorkflowsEnabled: this.config.enableCrossToolWorkflows,
        timeout: this.config.timeout
      },
      serverInfo: this.isAvailable ? this.serverInfo : null
    };
  }

  /**
   * Test MCP adapter functionality
   * @returns {Object} Test results
   */
  async runDiagnostics() {
    const diagnostics = {
      serverConnection: false,
      multiAgentCapability: false,
      crossToolWorkflows: false,
      advancedAI: false,
      externalSystems: false,
      errors: []
    };

    try {
      // Test server connection
      await this._checkMCPServerAvailability();
      diagnostics.serverConnection = this.isAvailable;

      if (this.isAvailable) {
        // Test capabilities
        diagnostics.multiAgentCapability = this.capabilities.has('multi-agent');
        diagnostics.crossToolWorkflows = this.capabilities.has('cross-tool-workflows');
        diagnostics.advancedAI = this.capabilities.has('advanced-ai');
        diagnostics.externalSystems = this.capabilities.has('external-systems');
      }

    } catch (error) {
      diagnostics.errors.push(error.message);
    }

    this.logger.info('🔍 MCP Adapter diagnostics completed', diagnostics);
    return diagnostics;
  }

  /**
   * Disable MCP adapter (switch to direct Context-Template flow only)
   */
  disable() {
    this.isAvailable = false;
    this.capabilities.clear();
    this.connectedTools.clear();
    this.logger.info('🔇 MCP Adapter disabled - using direct Context-Template flow only');
  }

  /**
   * Enable MCP adapter and reinitialize
   */
  async enable() {
    this.logger.info('🔊 Enabling MCP Adapter...');
    await this.initialize();
  }
}

export default MCPAdapter;