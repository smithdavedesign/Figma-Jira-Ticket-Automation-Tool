/**
 * API Usage Logging Utility
 * 
 * Enhanced logging utilities to differentiate between MCP server and REST API usage.
 * Provides analytics and monitoring for different protocol types.
 */

export class APIUsageLogger {
  constructor(logger) {
    this.logger = logger;
    this.metrics = {
      mcp: { requests: 0, tools: {}, errors: 0 },
      rest: { requests: 0, endpoints: {}, errors: 0 }
    };
  }

  /**
   * Log API request with protocol differentiation
   * @param {string} protocol - 'MCP' or 'REST'
   * @param {string} action - Action being performed
   * @param {Object} context - Additional context
   */
  logAPIRequest(protocol, action, context = {}) {
    const timestamp = new Date().toISOString();
    const protocolIcon = protocol === 'MCP' ? '🔌' : '🌐';
    
    this.logger.info(`${protocolIcon} [${protocol}] ${action}`, {
      timestamp,
      protocol,
      action,
      ...context
    });

    // Update metrics
    this.updateMetrics(protocol, action, context);
  }

  /**
   * Log MCP tool execution
   * @param {string} tool - MCP tool name
   * @param {Object} args - Tool arguments
   * @param {Object} result - Execution result
   */
  logMCPTool(tool, args, result) {
    this.logger.info(`🔌 [MCP TOOL] ${tool} executed`, {
      protocol: 'MCP',
      tool,
      hasArgs: !!args && Object.keys(args).length > 0,
      success: !!result,
      resultType: typeof result,
      timestamp: new Date().toISOString()
    });

    this.metrics.mcp.tools[tool] = (this.metrics.mcp.tools[tool] || 0) + 1;
  }

  /**
   * Log REST API endpoint usage
   * @param {string} endpoint - REST endpoint
   * @param {string} method - HTTP method
   * @param {Object} response - Response data
   */
  logRESTEndpoint(endpoint, method, response) {
    this.logger.info(`🌐 [REST API] ${method} ${endpoint}`, {
      protocol: 'REST',
      endpoint,
      method,
      statusCode: response?.statusCode || response?.status,
      responseSize: response?.data ? JSON.stringify(response.data).length : 0,
      timestamp: new Date().toISOString()
    });

    const key = `${method} ${endpoint}`;
    this.metrics.rest.endpoints[key] = (this.metrics.rest.endpoints[key] || 0) + 1;
  }

  /**
   * Update internal metrics
   * @private
   */
  updateMetrics(protocol, action, context) {
    if (protocol === 'MCP') {
      this.metrics.mcp.requests++;
      if (context.error) this.metrics.mcp.errors++;
    } else if (protocol === 'REST') {
      this.metrics.rest.requests++;
      if (context.error) this.metrics.rest.errors++;
    }
  }

  /**
   * Get usage metrics summary
   * @returns {Object} Metrics summary
   */
  getMetrics() {
    return {
      summary: {
        totalRequests: this.metrics.mcp.requests + this.metrics.rest.requests,
        mcpRequests: this.metrics.mcp.requests,
        restRequests: this.metrics.rest.requests,
        mcpErrorRate: this.metrics.mcp.requests > 0 ? 
          (this.metrics.mcp.errors / this.metrics.mcp.requests * 100).toFixed(2) + '%' : '0%',
        restErrorRate: this.metrics.rest.requests > 0 ? 
          (this.metrics.rest.errors / this.metrics.rest.requests * 100).toFixed(2) + '%' : '0%'
      },
      mcp: {
        requests: this.metrics.mcp.requests,
        errors: this.metrics.mcp.errors,
        popularTools: this.getTopItems(this.metrics.mcp.tools, 5)
      },
      rest: {
        requests: this.metrics.rest.requests,
        errors: this.metrics.rest.errors,
        popularEndpoints: this.getTopItems(this.metrics.rest.endpoints, 5)
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get top items from metrics object
   * @private
   */
  getTopItems(obj, limit = 5) {
    return Object.entries(obj)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([key, count]) => ({ name: key, count }));
  }

  /**
   * Log usage summary to console
   */
  logUsageSummary() {
    const metrics = this.getMetrics();
    
    this.logger.info('📊 API Usage Summary', {
      totalRequests: metrics.summary.totalRequests,
      protocolDistribution: {
        MCP: `${metrics.mcp.requests} requests (${metrics.summary.mcpErrorRate} error rate)`,
        REST: `${metrics.rest.requests} requests (${metrics.summary.restErrorRate} error rate)`
      },
      topMCPTools: metrics.mcp.popularTools,
      topRESTEndpoints: metrics.rest.popularEndpoints
    });
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      mcp: { requests: 0, tools: {}, errors: 0 },
      rest: { requests: 0, endpoints: {}, errors: 0 }
    };
    this.logger.info('📊 API usage metrics reset');
  }
}

export default APIUsageLogger;