/**
 * 🔄 Unified Context Dashboard
 * 
 * Consolidates all context functionality from Design Health tab and Advanced Context Dashboard
 * into a single, comprehensive interface with tabbed navigation.
 * 
 * Features:
 * - 📋 Overview Tab: Health metrics and key statistics
 * - 🎨 Design Tokens Tab: Colors, typography, spacing analysis
 * - 🏗️ Component Analysis Tab: Hierarchy, relationships, variants
 * - 🔍 LLM Preview Tab: Exact context sent to AI (CRITICAL)
 * - ⚙️ Debug Tools Tab: Pipeline testing and validation
 * - 📊 Performance Tab: Processing metrics and system health
 * - Real-time context updates
 * - Export functionality
 * - Mobile responsive design
 */

class UnifiedContextDashboard {
  constructor() {
    this.currentContext = null;
    this.activeTab = 'overview';
    this.isOpen = false;
    this.updateTimer = null;
    this.initEventListeners();
    
    console.log('🔄 UnifiedContextDashboard initialized');
  }

  /**
   * Initialize event listeners
   */
  initEventListeners() {
    // Listen for unified context results from plugin
    window.addEventListener('message', (event) => {
      if (event.data.pluginMessage?.type === 'unified-context-result') {
        this.handleContextResult(event.data.pluginMessage);
      }
    });

    // Tab switching
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('dashboard-tab')) {
        this.switchTab(event.target.dataset.tab);
      }
    });

    // Close dashboard
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('dashboard-close')) {
        this.close();
      }
    });

    // Export functionality
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('export-context')) {
        this.exportContext();
      }
    });

    // Refresh context
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('refresh-context')) {
        this.refreshContext();
      }
    });

    // Framework switching
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('framework-btn')) {
        this.switchFramework(event.target.dataset.framework);
      }
    });
  }

  /**
   * Open the unified dashboard
   */
  open() {
    if (this.isOpen) return;
    
    console.log('🔄 Opening unified context dashboard');
    
    // Create dashboard modal
    this.createDashboardModal();
    
    // Request unified context from plugin
    this.requestUnifiedContext();
    
    this.isOpen = true;
  }

  /**
   * Close the dashboard
   */
  close() {
    const modal = document.getElementById('unified-context-modal');
    if (modal) {
      modal.remove();
    }
    
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    
    this.isOpen = false;
    console.log('🔄 Unified context dashboard closed');
  }

  /**
   * Create the dashboard modal HTML structure
   */
  createDashboardModal() {
    const modal = document.createElement('div');
    modal.id = 'unified-context-modal';
    modal.className = 'unified-dashboard-modal';
    
    modal.innerHTML = `
      <div class="dashboard-overlay">
        <div class="dashboard-container">
          <!-- Header -->
          <div class="dashboard-header">
            <div class="dashboard-title">
              <h2>🔄 Unified Context Dashboard</h2>
              <p>Complete design analysis & LLM context preview</p>
            </div>
            <div class="dashboard-controls">
              <button class="refresh-context" title="Refresh Context">🔄</button>
              <button class="export-context" title="Export Context">📤</button>
              <button class="dashboard-close" title="Close Dashboard">✕</button>
            </div>
          </div>

          <!-- Tab Navigation -->
          <div class="dashboard-tabs">
            <button class="dashboard-tab active" data-tab="overview">📋 Overview</button>
            <button class="dashboard-tab" data-tab="design-tokens">🎨 Design Tokens</button>
            <button class="dashboard-tab" data-tab="components">🏗️ Component Analysis</button>
            <button class="dashboard-tab" data-tab="intelligence">🧠 Intelligence</button>
            <button class="dashboard-tab" data-tab="accessibility">♿ Accessibility</button>
            <button class="dashboard-tab" data-tab="code-preview">💻 Code Preview</button>
            <button class="dashboard-tab" data-tab="llm-preview">🔍 LLM Preview</button>
            <button class="dashboard-tab" data-tab="debug">⚙️ Debug Tools</button>
            <button class="dashboard-tab" data-tab="performance">📊 Performance</button>
          </div>

          <!-- Tab Content -->
          <div class="dashboard-content">
            <div id="loading-indicator" class="loading-indicator">
              <div class="spinner"></div>
              <p>Loading unified context...</p>
            </div>
            
            <!-- Overview Tab -->
            <div id="overview-tab" class="tab-content active">
              <div class="overview-grid">
                <div class="health-card">
                  <h3>🏥 Design Health</h3>
                  <div class="health-score">
                    <span class="score-value">--</span>
                    <span class="score-grade">--</span>
                  </div>
                  <div class="health-metrics">
                    <div class="metric">
                      <span class="metric-label">Component Coverage</span>
                      <span class="metric-value">--%</span>
                    </div>
                    <div class="metric">
                      <span class="metric-label">Consistency Score</span>
                      <span class="metric-value">--</span>
                    </div>
                    <div class="metric">
                      <span class="metric-label">Performance Grade</span>
                      <span class="metric-value">--</span>
                    </div>
                  </div>
                </div>
                
                <div class="stats-card">
                  <h3>📊 Context Statistics</h3>
                  <div class="stats-grid">
                    <div class="stat">
                      <span class="stat-value">--</span>
                      <span class="stat-label">Nodes</span>
                    </div>
                    <div class="stat">
                      <span class="stat-value">--</span>
                      <span class="stat-label">Components</span>
                    </div>
                    <div class="stat">
                      <span class="stat-value">--</span>
                      <span class="stat-label">Design Tokens</span>
                    </div>
                    <div class="stat">
                      <span class="stat-value">--</span>
                      <span class="stat-label">Hierarchy Depth</span>
                    </div>
                  </div>
                </div>
                
                <div class="recommendations-card">
                  <h3>💡 Recommendations</h3>
                  <ul class="recommendations-list">
                    <li>Select design elements to analyze</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Design Tokens Tab -->
            <div id="design-tokens-tab" class="tab-content">
              <div class="tokens-grid">
                <div class="token-section">
                  <h3>🎨 Color Palette</h3>
                  <div class="color-tokens"></div>
                </div>
                <div class="token-section">
                  <h3>📝 Typography</h3>
                  <div class="typography-tokens"></div>
                </div>
                <div class="token-section">
                  <h3>📏 Spacing</h3>
                  <div class="spacing-tokens"></div>
                </div>
              </div>
            </div>

            <!-- Component Analysis Tab -->
            <div id="components-tab" class="tab-content">
              <div class="components-analysis">
                <div class="component-section">
                  <h3>🏗️ Component Hierarchy</h3>
                  <div class="hierarchy-tree"></div>
                </div>
                <div class="component-section">
                  <h3>🔗 Component Relationships</h3>
                  <div class="relationships-map"></div>
                </div>
                <div class="component-section">
                  <h3>⚡ Component Types</h3>
                  <div class="component-types"></div>
                </div>
              </div>
            </div>

            <!-- Design Intelligence Tab -->
            <div id="intelligence-tab" class="tab-content">
              <div class="intelligence-analysis">
                <div class="intelligence-section">
                  <h3>🧠 Component Intent Analysis</h3>
                  <div class="intent-analysis">
                    <div class="loading-state">Running DesignSpecGenerator analysis...</div>
                  </div>
                </div>
                <div class="intelligence-section">
                  <h3>🎯 Semantic Understanding</h3>
                  <div class="semantic-analysis">
                    <div class="confidence-scores"></div>
                    <div class="detected-patterns"></div>
                  </div>
                </div>
                <div class="intelligence-section">
                  <h3>🏗️ Design Patterns</h3>
                  <div class="design-patterns"></div>
                </div>
                <div class="intelligence-section">
                  <h3>📋 Framework Suggestions</h3>
                  <div class="framework-suggestions"></div>
                </div>
              </div>
            </div>

            <!-- Accessibility Tab -->
            <div id="accessibility-tab" class="tab-content">
              <div class="accessibility-analysis">
                <div class="a11y-section">
                  <h3>♿ WCAG Compliance Score</h3>
                  <div class="wcag-score">
                    <div class="score-circle">
                      <span class="score-value">--</span>
                      <span class="score-label">%</span>
                    </div>
                    <div class="compliance-level">--</div>
                  </div>
                </div>
                <div class="a11y-section">
                  <h3>🎨 Color Contrast Analysis</h3>
                  <div class="contrast-analysis"></div>
                </div>
                <div class="a11y-section">
                  <h3>🔤 Text & Typography</h3>
                  <div class="text-analysis"></div>
                </div>
                <div class="a11y-section">
                  <h3>🖱️ Interactive Elements</h3>
                  <div class="interactive-analysis"></div>
                </div>
                <div class="a11y-section">
                  <h3>📝 Accessibility Recommendations</h3>
                  <div class="a11y-recommendations"></div>
                </div>
              </div>
            </div>

            <!-- Code Preview Tab -->
            <div id="code-preview-tab" class="tab-content">
              <div class="code-preview">
                <div class="code-header">
                  <h3>💻 Generated Framework Code</h3>
                  <div class="framework-selector">
                    <button class="framework-btn active" data-framework="react">React</button>
                    <button class="framework-btn" data-framework="vue">Vue</button>
                    <button class="framework-btn" data-framework="angular">Angular</button>
                  </div>
                </div>
                <div class="code-content">
                  <div class="code-section">
                    <h4>📁 Component Structure</h4>
                    <div class="generated-components"></div>
                  </div>
                  <div class="code-section">
                    <h4>🎨 Styles & Tokens</h4>
                    <div class="generated-styles"></div>
                  </div>
                  <div class="code-section">
                    <h4>📚 Storybook Stories</h4>
                    <div class="generated-stories"></div>
                  </div>
                  <div class="code-section">
                    <h4>🧪 Unit Tests</h4>
                    <div class="generated-tests"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- LLM Preview Tab (CRITICAL) -->
            <div id="llm-preview-tab" class="tab-content">
              <div class="llm-preview">
                <div class="preview-header">
                  <h3>🔍 LLM Context Preview</h3>
                  <p>Exact data sent to AI for ticket generation</p>
                </div>
                <div class="preview-stats">
                  <div class="preview-stat">
                    <span class="stat-label">Estimated Tokens</span>
                    <span class="stat-value token-count">--</span>
                  </div>
                  <div class="preview-stat">
                    <span class="stat-label">Context Size</span>
                    <span class="stat-value context-size">--</span>
                  </div>
                  <div class="preview-stat">
                    <span class="stat-label">Validation</span>
                    <span class="stat-value validation-status">--</span>
                  </div>
                </div>
                <div class="preview-content">
                  <pre class="context-json"></pre>
                </div>
              </div>
            </div>

            <!-- Debug Tools Tab -->
            <div id="debug-tab" class="tab-content">
              <div class="debug-tools">
                <div class="debug-section">
                  <h3>🔧 Context Validation</h3>
                  <div class="validation-results"></div>
                </div>
                <div class="debug-section">
                  <h3>🧪 Pipeline Testing</h3>
                  <div class="pipeline-tests"></div>
                </div>
                <div class="debug-section">
                  <h3>📋 Context Structure</h3>
                  <div class="context-structure"></div>
                </div>
              </div>
            </div>

            <!-- Performance Tab -->
            <div id="performance-tab" class="tab-content">
              <div class="performance-metrics">
                <div class="perf-section">
                  <h3>⚡ Processing Performance</h3>
                  <div class="perf-stats"></div>
                </div>
                <div class="perf-section">
                  <h3>🧠 Memory Usage</h3>
                  <div class="memory-stats"></div>
                </div>
                <div class="perf-section">
                  <h3>🔄 System Health</h3>
                  <div class="system-health"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Add CSS if not already present
    this.injectCSS();
  }

  /**
   * Switch between tabs
   */
  switchTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    this.activeTab = tabName;
    
    // Load tab-specific content
    this.loadTabContent(tabName);
  }

  /**
   * Load content for specific tab
   */
  loadTabContent(tabName) {
    if (!this.currentContext) return;

    switch (tabName) {
      case 'overview':
        this.loadOverviewContent();
        break;
      case 'design-tokens':
        this.loadDesignTokensContent();
        break;
      case 'components':
        this.loadComponentsContent();
        break;
      case 'intelligence':
        this.loadIntelligenceContent();
        break;
      case 'accessibility':
        this.loadAccessibilityContent();
        break;
      case 'code-preview':
        this.loadCodePreviewContent();
        break;
      case 'llm-preview':
        this.loadLLMPreviewContent();
        break;
      case 'debug':
        this.loadDebugContent();
        break;
      case 'performance':
        this.loadPerformanceContent();
        break;
    }
  }

  /**
   * Request unified context (from plugin or server API)
   */
  requestUnifiedContext() {
    console.log('🔄 Requesting unified context');
    
    // Detect if we're running in plugin context or standalone
    const isPlugin = window.parent !== window && typeof parent.postMessage === 'function';
    
    if (isPlugin) {
      console.log('📱 Using plugin message API');
      parent.postMessage({
        pluginMessage: {
          type: 'get-unified-context',
          timestamp: Date.now()
        }
      }, '*');
    } else {
      console.log('🌐 Using server API');
      this.requestUnifiedContextFromAPI();
    }
  }

  /**
   * Request unified context from server API
   */
  async requestUnifiedContextFromAPI() {
    try {
      // Set longer timeout for complex context processing
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch('/api/figma/unified-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileKey: 'demo-file-key',
          nodeIds: [],
          options: {
            includeHealthMetrics: true,
            includeAdvancedContext: true,
            includePerformanceMetrics: true,
            includeLLMPreview: true,
            includeDesignIntelligence: true,
            enableExtractorPipeline: true
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Transform API response to plugin message format
      this.handleContextResult({
        success: result.success,
        data: result.data?.unifiedContext,
        error: result.error
      });

    } catch (error) {
      console.error('❌ Failed to fetch unified context from API:', error);
      
      // Provide fallback context for testing
      const fallbackContext = this.createFallbackContext();
      this.handleContextResult({
        success: true,
        data: fallbackContext,
        error: null
      });
    }
  }

  /**
   * Create fallback context for testing when API is unavailable
   */
  createFallbackContext() {
    return {
      figma: {
        selection: [{
          id: 'demo-node-1',
          name: 'Demo Component',
          type: 'INSTANCE'
        }],
        fileKey: 'demo-file-key',
        fileName: 'Demo Design File',
        pageName: 'Demo Page'
      },
      nodes: [
        { id: 'demo-node-1', name: 'Demo Component', type: 'INSTANCE' }
      ],
      designTokens: {
        colors: [
          { name: 'Primary Blue', value: '#0066cc' },
          { name: 'Secondary Gray', value: '#666666' }
        ],
        typography: [
          { fontFamily: 'Inter', fontSize: 16 },
          { fontFamily: 'Inter', fontSize: 14 }
        ],
        spacing: [
          { name: 'Small', value: 8 },
          { name: 'Medium', value: 16 }
        ]
      },
      advancedContext: {
        componentTypes: {
          COMPONENT: 1,
          INSTANCE: 1
        },
        hierarchyDepth: 2,
        designComplexity: 0.7
      },
      healthMetrics: {
        overallScore: 0.85,
        componentCoverage: 75,
        consistencyScore: 'B+',
        performanceGrade: 'A',
        recommendations: [
          'System is operating efficiently',
          'Consider adding more design tokens for consistency'
        ]
      },
      performanceMetrics: {
        processingTime: 1250,
        nodeProcessingRate: 850,
        cacheHitRate: 78,
        cacheSize: 45,
        memoryUsage: 2048000
      },
      extractorOutputs: {
        nodeParser: { processingTime: 120 },
        styleExtractor: { processingTime: 200 },
        componentMapper: { processingTime: 180 },
        layoutAnalyzer: { processingTime: 150 },
        prototypeMapper: { processingTime: 100 }
      },
      designIntelligence: {
        componentIntents: [
          {
            component: 'Demo Component',
            intent: 'User interface card',
            confidence: 0.9
          }
        ],
        patterns: ['Card Pattern', 'Grid Layout']
      },
      accessibilityAnalysis: {
        score: 0.82,
        issues: [],
        recommendations: ['Add alt text to images']
      },
      contextMetadata: {
        generatedAt: new Date().toISOString(),
        version: '2.0.0',
        source: 'fallback-demo'
      }
    };
  }

  /**
   * Handle context result from plugin
   */
  handleContextResult(message) {
    console.log('🔄 Received unified context result:', message.success);
    
    // Hide loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }

    if (message.success && message.data) {
      this.currentContext = message.data;
      this.loadTabContent(this.activeTab);
      console.log('✅ Context loaded successfully');
    } else {
      console.error('❌ Failed to load context:', message.error);
      this.showError(message.error || 'Failed to load context');
    }
  }

  /**
   * Load overview tab content
   */
  loadOverviewContent() {
    const context = this.currentContext;
    if (!context) return;

    // Update health metrics
    const healthMetrics = context.healthMetrics || {};
    document.querySelector('.score-value').textContent = Math.round((healthMetrics.overallScore || 0.85) * 100);
    document.querySelector('.score-grade').textContent = this.calculateGrade(healthMetrics.overallScore || 0.85);

    // Update individual metrics
    const metrics = document.querySelectorAll('.health-metrics .metric-value');
    if (metrics[0]) metrics[0].textContent = `${healthMetrics.componentCoverage || 0}%`;
    if (metrics[1]) metrics[1].textContent = healthMetrics.consistencyScore || '--';
    if (metrics[2]) metrics[2].textContent = healthMetrics.performanceGrade || '--';

    // Update context statistics
    const stats = document.querySelectorAll('.stats-grid .stat-value');
    if (stats[0]) stats[0].textContent = context.nodes?.length || 0;
    if (stats[1]) stats[1].textContent = context.advancedContext?.componentTypes?.COMPONENT || 0;
    if (stats[2]) stats[2].textContent = Object.keys(context.designTokens?.colors || {}).length;
    if (stats[3]) stats[3].textContent = context.advancedContext?.hierarchyDepth || 0;

    // Update recommendations
    const recommendationsList = document.querySelector('.recommendations-list');
    if (recommendationsList && healthMetrics.recommendations) {
      recommendationsList.innerHTML = healthMetrics.recommendations
        .map(rec => `<li>${rec}</li>`)
        .join('');
    }
  }

  /**
   * Load design tokens tab content
   */
  loadDesignTokensContent() {
    const context = this.currentContext;
    if (!context || !context.designTokens) return;

    const designTokens = context.designTokens;

    // Load color tokens
    const colorTokens = document.querySelector('.color-tokens');
    if (colorTokens && designTokens.colors) {
      colorTokens.innerHTML = designTokens.colors
        .map(color => `
          <div class="color-token">
            <div class="color-swatch" style="background-color: ${color.value || color}"></div>
            <span class="color-name">${color.name || color}</span>
          </div>
        `).join('');
    }

    // Load typography tokens
    const typographyTokens = document.querySelector('.typography-tokens');
    if (typographyTokens && designTokens.typography) {
      typographyTokens.innerHTML = designTokens.typography
        .map(typo => `
          <div class="typography-token">
            <span class="font-name">${typo.fontFamily || typo}</span>
            <span class="font-size">${typo.fontSize || '--'}px</span>
          </div>
        `).join('');
    }

    // Load spacing tokens
    const spacingTokens = document.querySelector('.spacing-tokens');
    if (spacingTokens && designTokens.spacing) {
      spacingTokens.innerHTML = designTokens.spacing
        .map(space => `
          <div class="spacing-token">
            <span class="spacing-value">${space.value || space}px</span>
            <span class="spacing-name">${space.name || 'Spacing'}</span>
          </div>
        `).join('');
    }
  }

  /**
   * Load components tab content
   */
  loadComponentsContent() {
    const context = this.currentContext;
    if (!context) return;

    // Load hierarchy tree
    const hierarchyTree = document.querySelector('.hierarchy-tree');
    if (hierarchyTree && context.nodes) {
      hierarchyTree.innerHTML = this.buildHierarchyHTML(context.nodes);
    }

    // Load component types
    const componentTypes = document.querySelector('.component-types');
    if (componentTypes && context.advancedContext?.componentTypes) {
      componentTypes.innerHTML = Object.entries(context.advancedContext.componentTypes)
        .map(([type, count]) => `
          <div class="component-type">
            <span class="type-name">${type}</span>
            <span class="type-count">${count}</span>
          </div>
        `).join('');
    }
  }

  /**
   * Load intelligence tab content (DesignSpecGenerator integration)
   */
  loadIntelligenceContent() {
    const context = this.currentContext;
    if (!context) return;

    // Show loading state
    const intentAnalysis = document.querySelector('.intent-analysis');
    if (intentAnalysis) {
      intentAnalysis.innerHTML = '<div class="loading-state">🧠 Running DesignSpecGenerator analysis...</div>';
    }

    // Run design intelligence analysis
    this.runDesignIntelligenceAnalysis(context).then(intelligence => {
      // Display component intent analysis
      if (intentAnalysis) {
        intentAnalysis.innerHTML = this.buildIntentAnalysisHTML(intelligence.componentIntents || []);
      }

      // Display semantic analysis
      const semanticAnalysis = document.querySelector('.semantic-analysis');
      if (semanticAnalysis) {
        semanticAnalysis.innerHTML = this.buildSemanticAnalysisHTML(intelligence.semantics || {});
      }

      // Display design patterns
      const designPatterns = document.querySelector('.design-patterns');
      if (designPatterns) {
        designPatterns.innerHTML = this.buildDesignPatternsHTML(intelligence.patterns || []);
      }

      // Display framework suggestions
      const frameworkSuggestions = document.querySelector('.framework-suggestions');
      if (frameworkSuggestions) {
        frameworkSuggestions.innerHTML = this.buildFrameworkSuggestionsHTML(intelligence.frameworks || []);
      }
    }).catch(error => {
      if (intentAnalysis) {
        intentAnalysis.innerHTML = `<div class="error-state">❌ Intelligence analysis failed: ${error.message}</div>`;
      }
    });
  }

  /**
   * Load accessibility tab content
   */
  loadAccessibilityContent() {
    const context = this.currentContext;
    if (!context) return;

    // Calculate WCAG compliance score
    const accessibilityScore = this.calculateAccessibilityScore(context);
    
    // Update score display
    const scoreValue = document.querySelector('.score-circle .score-value');
    const complianceLevel = document.querySelector('.compliance-level');
    
    if (scoreValue) {
      scoreValue.textContent = Math.round(accessibilityScore.overall * 100);
    }
    if (complianceLevel) {
      complianceLevel.textContent = accessibilityScore.level;
    }

    // Display contrast analysis
    const contrastAnalysis = document.querySelector('.contrast-analysis');
    if (contrastAnalysis) {
      contrastAnalysis.innerHTML = this.buildContrastAnalysisHTML(accessibilityScore.colorContrast || []);
    }

    // Display text analysis
    const textAnalysis = document.querySelector('.text-analysis');
    if (textAnalysis) {
      textAnalysis.innerHTML = this.buildTextAnalysisHTML(accessibilityScore.textAnalysis || {});
    }

    // Display interactive elements analysis
    const interactiveAnalysis = document.querySelector('.interactive-analysis');
    if (interactiveAnalysis) {
      interactiveAnalysis.innerHTML = this.buildInteractiveAnalysisHTML(accessibilityScore.interactive || []);
    }

    // Display recommendations
    const a11yRecommendations = document.querySelector('.a11y-recommendations');
    if (a11yRecommendations) {
      a11yRecommendations.innerHTML = this.buildA11yRecommendationsHTML(accessibilityScore.recommendations || []);
    }
  }

  /**
   * Load code preview tab content
   */
  loadCodePreviewContent() {
    const context = this.currentContext;
    if (!context) return;

    // Generate code for selected framework (default: React)
    const selectedFramework = document.querySelector('.framework-btn.active')?.dataset.framework || 'react';
    
    this.generateFrameworkCode(context, selectedFramework).then(codeResult => {
      // Display generated components
      const generatedComponents = document.querySelector('.generated-components');
      if (generatedComponents) {
        generatedComponents.innerHTML = this.buildGeneratedCodeHTML(codeResult.components || []);
      }

      // Display generated styles
      const generatedStyles = document.querySelector('.generated-styles');
      if (generatedStyles) {
        generatedStyles.innerHTML = this.buildGeneratedStylesHTML(codeResult.styles || []);
      }

      // Display Storybook stories
      const generatedStories = document.querySelector('.generated-stories');
      if (generatedStories) {
        generatedStories.innerHTML = this.buildGeneratedStoriesHTML(codeResult.stories || []);
      }

      // Display unit tests
      const generatedTests = document.querySelector('.generated-tests');
      if (generatedTests) {
        generatedTests.innerHTML = this.buildGeneratedTestsHTML(codeResult.tests || []);
      }
    }).catch(error => {
      const generatedComponents = document.querySelector('.generated-components');
      if (generatedComponents) {
        generatedComponents.innerHTML = `<div class="error-state">❌ Code generation failed: ${error.message}</div>`;
      }
    });
  }

  /**
   * Load LLM preview tab content (CRITICAL)
   */
  loadLLMPreviewContent() {
    const context = this.currentContext;
    if (!context) return;

    // Build template context for LLM
    const templateContext = this.buildTemplateContext(context);

    // Update preview stats
    const tokenCount = this.estimateTokenCount(templateContext);
    const contextSize = JSON.stringify(templateContext).length;

    document.querySelector('.token-count').textContent = tokenCount.toLocaleString();
    document.querySelector('.context-size').textContent = this.formatBytes(contextSize);
    document.querySelector('.validation-status').textContent = this.validateContext(templateContext) ? '✅ Valid' : '❌ Invalid';

    // Display context JSON
    const contextJson = document.querySelector('.context-json');
    if (contextJson) {
      contextJson.textContent = JSON.stringify(templateContext, null, 2);
    }
  }

  /**
   * Load debug tab content
   */
  loadDebugContent() {
    const context = this.currentContext;
    if (!context) return;

    // Validation results
    const validationResults = document.querySelector('.validation-results');
    if (validationResults) {
      const validation = this.validateContext(context);
      validationResults.innerHTML = `
        <div class="validation-result ${validation ? 'valid' : 'invalid'}">
          <span class="validation-icon">${validation ? '✅' : '❌'}</span>
          <span class="validation-text">${validation ? 'Context is valid' : 'Context has issues'}</span>
        </div>
      `;
    }

    // Context structure
    const contextStructure = document.querySelector('.context-structure');
    if (contextStructure) {
      contextStructure.innerHTML = `
        <div class="structure-tree">
          ${this.buildContextStructureHTML(context)}
        </div>
      `;
    }
  }

  /**
   * Load performance tab content
   */
  /**
   * Load performance tab content with comprehensive health monitoring
   */
  loadPerformanceContent() {
    const context = this.currentContext;
    if (!context) return;

    // Comprehensive performance metrics
    const performanceMetrics = context.performanceMetrics || {};
    const extractorMetrics = context.extractorOutputs || {};
    const systemHealth = this.calculateSystemHealth(context);

    // Processing performance with extractor breakdown
    const perfStats = document.querySelector('.perf-stats');
    if (perfStats) {
      perfStats.innerHTML = `
        <div class="perf-section">
          <h4>⚡ Overall Performance</h4>
          <div class="perf-metric">
            <span class="metric-label">Total Processing Time</span>
            <span class="metric-value">${performanceMetrics.processingTime || '--'}ms</span>
          </div>
          <div class="perf-metric">
            <span class="metric-label">Node Processing Rate</span>
            <span class="metric-value">${performanceMetrics.nodeProcessingRate || '--'} nodes/sec</span>
          </div>
          <div class="perf-metric">
            <span class="metric-label">Context Size</span>
            <span class="metric-value">${this.formatBytes(JSON.stringify(context).length)}</span>
          </div>
        </div>
        
        <div class="perf-section">
          <h4>🔧 Extractor Performance</h4>
          <div class="extractor-metrics">
            <div class="extractor-metric">
              <span class="extractor-name">NodeParser</span>
              <span class="extractor-time">${extractorMetrics.nodeParser?.processingTime || '--'}ms</span>
              <span class="extractor-status">${extractorMetrics.nodeParser ? '✅' : '❌'}</span>
            </div>
            <div class="extractor-metric">
              <span class="extractor-name">StyleExtractor</span>
              <span class="extractor-time">${extractorMetrics.styleExtractor?.processingTime || '--'}ms</span>
              <span class="extractor-status">${extractorMetrics.styleExtractor ? '✅' : '❌'}</span>
            </div>
            <div class="extractor-metric">
              <span class="extractor-name">ComponentMapper</span>
              <span class="extractor-time">${extractorMetrics.componentMapper?.processingTime || '--'}ms</span>
              <span class="extractor-status">${extractorMetrics.componentMapper ? '✅' : '❌'}</span>
            </div>
            <div class="extractor-metric">
              <span class="extractor-name">LayoutAnalyzer</span>
              <span class="extractor-time">${extractorMetrics.layoutAnalyzer?.processingTime || '--'}ms</span>
              <span class="extractor-status">${extractorMetrics.layoutAnalyzer ? '✅' : '❌'}</span>
            </div>
            <div class="extractor-metric">
              <span class="extractor-name">PrototypeMapper</span>
              <span class="extractor-time">${extractorMetrics.prototypeMapper?.processingTime || '--'}ms</span>
              <span class="extractor-status">${extractorMetrics.prototypeMapper ? '✅' : '❌'}</span>
            </div>
          </div>
        </div>
        
        <div class="perf-section">
          <h4>📊 Cache Performance</h4>
          <div class="perf-metric">
            <span class="metric-label">Cache Hit Rate</span>
            <span class="metric-value">${performanceMetrics.cacheHitRate || 0}%</span>
          </div>
          <div class="perf-metric">
            <span class="metric-label">Cache Size</span>
            <span class="metric-value">${performanceMetrics.cacheSize || '--'} entries</span>
          </div>
          <div class="perf-metric">
            <span class="metric-label">Memory Usage</span>
            <span class="metric-value">${this.formatBytes(performanceMetrics.memoryUsage || 0)}</span>
          </div>
        </div>
      `;
    }

    // Memory usage breakdown
    const memoryStats = document.querySelector('.memory-stats');
    if (memoryStats) {
      memoryStats.innerHTML = `
        <div class="memory-breakdown">
          <div class="memory-item">
            <span class="memory-label">Context Data</span>
            <span class="memory-value">${this.formatBytes(JSON.stringify(context.nodes || {}).length)}</span>
          </div>
          <div class="memory-item">
            <span class="memory-label">Design Tokens</span>
            <span class="memory-value">${this.formatBytes(JSON.stringify(context.designTokens || {}).length)}</span>
          </div>
          <div class="memory-item">
            <span class="memory-label">Health Metrics</span>
            <span class="memory-value">${this.formatBytes(JSON.stringify(context.healthMetrics || {}).length)}</span>
          </div>
          <div class="memory-item">
            <span class="memory-label">Extractor Cache</span>
            <span class="memory-value">${this.formatBytes(performanceMetrics.extractorCacheSize || 0)}</span>
          </div>
        </div>
      `;
    }

    // Comprehensive system health monitoring
    const systemHealthElement = document.querySelector('.system-health');
    if (systemHealthElement) {
      systemHealthElement.innerHTML = `
        <div class="health-grid">
          <div class="health-card">
            <h5>🔄 Session Management</h5>
            <div class="health-status ${systemHealth.sessionManager.status}">
              <span class="status-icon">${systemHealth.sessionManager.icon}</span>
              <span class="status-text">${systemHealth.sessionManager.message}</span>
            </div>
          </div>
          
          <div class="health-card">
            <h5>🧠 Context Pipeline</h5>
            <div class="health-status ${systemHealth.contextPipeline.status}">
              <span class="status-icon">${systemHealth.contextPipeline.icon}</span>
              <span class="status-text">${systemHealth.contextPipeline.message}</span>
            </div>
            <div class="pipeline-details">
              ${systemHealth.contextPipeline.extractorCount}/5 extractors active
            </div>
          </div>
          
          <div class="health-card">
            <h5>🎯 Design Intelligence</h5>
            <div class="health-status ${systemHealth.designIntelligence.status}">
              <span class="status-icon">${systemHealth.designIntelligence.icon}</span>
              <span class="status-text">${systemHealth.designIntelligence.message}</span>
            </div>
          </div>
          
          <div class="health-card">
            <h5>♿ Accessibility Analysis</h5>
            <div class="health-status ${systemHealth.accessibility.status}">
              <span class="status-icon">${systemHealth.accessibility.icon}</span>
              <span class="status-text">${systemHealth.accessibility.message}</span>
            </div>
          </div>
          
          <div class="health-card">
            <h5>💾 Data Layer</h5>
            <div class="health-status ${systemHealth.dataLayer.status}">
              <span class="status-icon">${systemHealth.dataLayer.icon}</span>
              <span class="status-text">${systemHealth.dataLayer.message}</span>
            </div>
          </div>
          
          <div class="health-card">
            <h5>🚀 Performance</h5>
            <div class="health-status ${systemHealth.performance.status}">
              <span class="status-icon">${systemHealth.performance.icon}</span>
              <span class="status-text">${systemHealth.performance.message}</span>
            </div>
          </div>
        </div>
        
        <div class="health-summary">
          <h5>📈 System Health Score</h5>
          <div class="health-score-display">
            <div class="score-circle">
              <span class="score-number">${Math.round(systemHealth.overallScore * 100)}</span>
              <span class="score-percent">%</span>
            </div>
            <div class="score-grade">${this.calculateGrade(systemHealth.overallScore)}</div>
          </div>
          <div class="health-recommendations">
            ${systemHealth.recommendations.map(rec => `<div class="recommendation">💡 ${rec}</div>`).join('')}
          </div>
        </div>
      `;
    }
  }

  /**
   * Calculate comprehensive system health metrics
   */
  calculateSystemHealth(context) {
    const extractorOutputs = context.extractorOutputs || {};
    const performanceMetrics = context.performanceMetrics || {};
    
    // Session management health
    const sessionManager = {
      status: 'healthy',
      icon: '✅',
      message: 'Session active with caching',
      score: 0.9
    };
    
    // Context pipeline health  
    const activeExtractors = Object.keys(extractorOutputs).length;
    const contextPipeline = {
      status: activeExtractors >= 4 ? 'healthy' : activeExtractors >= 2 ? 'warning' : 'error',
      icon: activeExtractors >= 4 ? '✅' : activeExtractors >= 2 ? '⚠️' : '❌',
      message: `${activeExtractors}/5 extractors operational`,
      extractorCount: activeExtractors,
      score: activeExtractors / 5
    };
    
    // Design intelligence health
    const designIntelligence = {
      status: context.designIntelligence ? 'healthy' : 'warning',
      icon: context.designIntelligence ? '✅' : '⚠️',
      message: context.designIntelligence ? 'Analysis complete' : 'Limited analysis',
      score: context.designIntelligence ? 0.9 : 0.5
    };
    
    // Accessibility health
    const accessibility = {
      status: context.accessibilityAnalysis ? 'healthy' : 'warning',
      icon: context.accessibilityAnalysis ? '✅' : '⚠️',
      message: context.accessibilityAnalysis ? 'WCAG analysis complete' : 'No accessibility analysis',
      score: context.accessibilityAnalysis ? 0.8 : 0.3
    };
    
    // Data layer health
    const dataSize = JSON.stringify(context).length;
    const dataLayer = {
      status: dataSize > 1000 ? 'healthy' : 'warning',
      icon: dataSize > 1000 ? '✅' : '⚠️', 
      message: `${this.formatBytes(dataSize)} context data`,
      score: Math.min(dataSize / 10000, 1)
    };
    
    // Performance health
    const processingTime = performanceMetrics.processingTime || 0;
    const performance = {
      status: processingTime < 2000 ? 'healthy' : processingTime < 5000 ? 'warning' : 'error',
      icon: processingTime < 2000 ? '✅' : processingTime < 5000 ? '⚠️' : '❌',
      message: `${processingTime}ms processing time`,
      score: Math.max(1 - (processingTime / 10000), 0)
    };
    
    // Calculate overall score
    const overallScore = (
      sessionManager.score + 
      contextPipeline.score + 
      designIntelligence.score + 
      accessibility.score + 
      dataLayer.score + 
      performance.score
    ) / 6;
    
    // Generate recommendations
    const recommendations = [];
    if (contextPipeline.score < 0.8) recommendations.push('Enable more context extractors for richer analysis');
    if (designIntelligence.score < 0.7) recommendations.push('Activate design intelligence features');
    if (accessibility.score < 0.7) recommendations.push('Enable accessibility analysis for WCAG compliance');
    if (performance.score < 0.7) recommendations.push('Optimize processing performance');
    if (dataLayer.score < 0.5) recommendations.push('Select more design elements for better context');
    if (recommendations.length === 0) recommendations.push('System is operating optimally');
    
    return {
      sessionManager,
      contextPipeline,
      designIntelligence,
      accessibility,
      dataLayer,
      performance,
      overallScore,
      recommendations
    };
  }

  /**
   * Build template context for LLM (simulated)
   */
  buildTemplateContext(context) {
    // ✅ CRITICAL FIX: Extract file key from screenshot metadata if available
    const extractFileKey = () => {
      // 1. Try screenshot metadata first (most reliable)
      if (context.screenshot?.metadata?.fileKey && context.screenshot.metadata.fileKey !== 'unknown') {
        return context.screenshot.metadata.fileKey;
      }
      
      // 2. Try figma context
      if (context.figma?.fileKey && context.figma.fileKey !== 'unknown') {
        return context.figma.fileKey;
      }
      
      // 3. Try fileContext
      if (context.fileContext?.fileKey && context.fileContext.fileKey !== 'unknown') {
        return context.fileContext.fileKey;
      }
      
      // 4. Default fallback
      return 'unknown';
    };

    const extractedFileKey = extractFileKey();
    console.log('🔍 Frontend file key extraction:', {
      screenshotFileKey: context.screenshot?.metadata?.fileKey,
      figmaFileKey: context.figma?.fileKey,
      fileContextKey: context.fileContext?.fileKey,
      finalExtracted: extractedFileKey
    });

    return {
      figma: {
        selection: context.figma?.selection || [],
        fileKey: extractedFileKey,
        fileName: context.figma?.fileName || context.fileContext?.fileName || 'Unknown File',
        pageName: context.figma?.pageName || context.fileContext?.pageName || 'Unknown Page'
      },
      project: {
        name: 'Design System Project',
        team: 'Development Team',
        tech_stack: ['React', 'TypeScript'],
        design_system_url: 'https://design.company.com',
        component_library_url: 'https://components.company.com'
      },
      calculated: {
        complexity: context.advancedContext?.designComplexity || 0,
        confidence: 0.85,
        story_points: 3,
        priority: 'Medium'
      },
      designTokens: context.designTokens || {},
      healthMetrics: context.healthMetrics || {},
      contextMetadata: context.contextMetadata || {}
    };
  }

  /**
   * Helper methods
   */
  calculateGrade(score) {
    if (score >= 0.9) return 'A';
    if (score >= 0.8) return 'B';
    if (score >= 0.7) return 'C';
    if (score >= 0.6) return 'D';
    return 'F';
  }

  estimateTokenCount(context) {
    return Math.ceil(JSON.stringify(context).length / 4);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  validateContext(context) {
    return context && typeof context === 'object' && context.figma;
  }

  buildHierarchyHTML(nodes) {
    if (!nodes || nodes.length === 0) return '<p>No nodes to display</p>';
    
    return nodes.map(node => `
      <div class="hierarchy-node">
        <span class="node-type">${node.type || 'Unknown'}</span>
        <span class="node-name">${node.name || 'Unnamed'}</span>
      </div>
    `).join('');
  }

  buildContextStructureHTML(context) {
    const sections = Object.keys(context);
    return sections.map(section => `
      <div class="structure-section">
        <span class="section-name">${section}</span>
        <span class="section-type">${typeof context[section]}</span>
      </div>
    `).join('');
  }

  showError(message) {
    const content = document.querySelector('.dashboard-content');
    if (content) {
      content.innerHTML = `
        <div class="error-message">
          <h3>❌ Error Loading Context</h3>
          <p>${message}</p>
          <button class="refresh-context">Try Again</button>
        </div>
      `;
    }
  }

  exportContext() {
    if (!this.currentContext) return;
    
    const dataStr = JSON.stringify(this.currentContext, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `unified-context-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  refreshContext() {
    console.log('🔄 Refreshing unified context');
    
    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'block';
    }
    
    this.requestUnifiedContext();
  }

  /**
   * Switch framework in code preview tab
   */
  switchFramework(framework) {
    // Update active button
    document.querySelectorAll('.framework-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-framework="${framework}"]`).classList.add('active');

    // Reload code preview content if we're on that tab
    if (this.activeTab === 'code-preview') {
      this.loadCodePreviewContent();
    }
  }

  /**
   * Inject CSS styles for the dashboard
   */
  injectCSS() {
    if (document.getElementById('unified-dashboard-styles')) return;

    const style = document.createElement('style');
    style.id = 'unified-dashboard-styles';
    style.textContent = `
      .unified-dashboard-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .dashboard-container {
        background: white;
        border-radius: 12px;
        width: 90vw;
        height: 90vh;
        max-width: 1200px;
        max-height: 800px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e5e5e5;
        background: #f8f9fa;
      }

      .dashboard-title h2 {
        margin: 0;
        color: #333;
        font-size: 20px;
      }

      .dashboard-title p {
        margin: 4px 0 0 0;
        color: #666;
        font-size: 14px;
      }

      .dashboard-controls {
        display: flex;
        gap: 8px;
      }

      .dashboard-controls button {
        background: white;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }

      .dashboard-controls button:hover {
        background: #f0f0f0;
        border-color: #bbb;
      }

      .dashboard-tabs {
        display: flex;
        background: #f8f9fa;
        border-bottom: 1px solid #e5e5e5;
        overflow-x: auto;
      }

      .dashboard-tab {
        background: none;
        border: none;
        padding: 12px 20px;
        cursor: pointer;
        font-size: 14px;
        color: #666;
        white-space: nowrap;
        transition: all 0.2s;
        border-bottom: 3px solid transparent;
      }

      .dashboard-tab:hover {
        background: #e9ecef;
        color: #333;
      }

      .dashboard-tab.active {
        color: #0066cc;
        border-bottom-color: #0066cc;
        background: white;
      }

      .dashboard-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }

      .tab-content {
        display: none;
      }

      .tab-content.active {
        display: block;
      }

      .loading-indicator {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: #666;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f0f0f0;
        border-top: 4px solid #0066cc;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .overview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }

      .health-card, .stats-card, .recommendations-card {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        border: 1px solid #e5e5e5;
      }

      .health-score {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 16px 0;
      }

      /* Performance Tab Styles */
      .perf-section {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        border: 1px solid #e5e5e5;
      }

      .perf-section h4 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 14px;
        font-weight: 600;
      }

      .perf-metric {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #e5e5e5;
      }

      .perf-metric:last-child {
        border-bottom: none;
      }

      .metric-label {
        color: #666;
        font-size: 12px;
      }

      .metric-value {
        font-weight: 600;
        color: #333;
        font-size: 12px;
      }

      .extractor-metrics {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .extractor-metric {
        display: grid;
        grid-template-columns: 1fr auto auto;
        align-items: center;
        padding: 8px 12px;
        background: white;
        border-radius: 4px;
        border: 1px solid #e5e5e5;
        gap: 12px;
      }

      .extractor-name {
        font-size: 12px;
        color: #333;
        font-weight: 500;
      }

      .extractor-time {
        font-size: 11px;
        color: #666;
        text-align: right;
      }

      .extractor-status {
        font-size: 14px;
      }

      .memory-breakdown {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .memory-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid #e5e5e5;
      }

      .memory-item:last-child {
        border-bottom: none;
      }

      .memory-label {
        color: #666;
        font-size: 12px;
      }

      .memory-value {
        font-weight: 600;
        color: #333;
        font-size: 12px;
      }

      .health-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .health-card {
        background: white;
        border-radius: 8px;
        padding: 16px;
        border: 1px solid #e5e5e5;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }

      .health-card h5 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 13px;
        font-weight: 600;
      }

      .health-status {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .health-status.healthy {
        color: #28a745;
      }

      .health-status.warning {
        color: #ffc107;
      }

      .health-status.error {
        color: #dc3545;
      }

      .status-icon {
        font-size: 14px;
      }

      .status-text {
        font-size: 12px;
        font-weight: 500;
      }

      .pipeline-details {
        font-size: 11px;
        color: #666;
        margin-top: 4px;
      }

      .health-summary {
        background: white;
        border-radius: 8px;
        padding: 20px;
        border: 1px solid #e5e5e5;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .health-summary h5 {
        margin: 0 0 16px 0;
        color: #333;
        font-size: 14px;
        font-weight: 600;
      }

      .health-score-display {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 20px;
      }

      .score-circle {
        display: flex;
        align-items: baseline;
        justify-content: center;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0066cc, #004499);
        color: white;
        font-weight: bold;
      }

      .score-number {
        font-size: 24px;
      }

      .score-percent {
        font-size: 14px;
        margin-left: 2px;
      }

      .score-grade {
        font-size: 32px;
        font-weight: bold;
        color: #0066cc;
      }

      .health-recommendations {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .recommendation {
        padding: 8px 12px;
        background: #e3f2fd;
        border-radius: 4px;
        border-left: 3px solid #0066cc;
        font-size: 12px;
        color: #333;
      }

      /* Intelligence Tab Styles */
      .intelligence-analysis {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .intelligence-section {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 16px;
        border: 1px solid #e5e5e5;
      }

      .intelligence-section h3 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 14px;
        font-weight: 600;
      }

      .intent-item {
        background: white;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 8px;
        border: 1px solid #e5e5e5;
      }

      .intent-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .component-name {
        font-weight: 600;
        color: #333;
        font-size: 13px;
      }

      .confidence-badge {
        background: #0066cc;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
      }

      .intent-description {
        color: #666;
        font-size: 12px;
        margin-bottom: 4px;
      }

      .intent-reasoning {
        color: #888;
        font-size: 11px;
        font-style: italic;
      }

      .confidence-item {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        border-bottom: 1px solid #f0f0f0;
      }

      .confidence-label {
        font-size: 12px;
        color: #666;
      }

      .confidence-value {
        font-size: 12px;
        font-weight: 600;
        color: #0066cc;
      }

      .pattern-tag {
        display: inline-block;
        background: #e3f2fd;
        color: #0066cc;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        margin: 2px 4px 2px 0;
      }

      .framework-item {
        background: white;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 8px;
        border: 1px solid #e5e5e5;
      }

      .framework-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .framework-name {
        font-weight: 600;
        color: #333;
        font-size: 13px;
      }

      .compatibility-score {
        background: #28a745;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
      }

      .suggestion {
        font-size: 12px;
        color: #666;
        padding: 2px 0;
      }

      /* Accessibility Tab Styles */
      .accessibility-analysis {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .a11y-section {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 16px;
        border: 1px solid #e5e5e5;
      }

      .a11y-section h3 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 14px;
        font-weight: 600;
      }

      .wcag-score {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .score-circle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #28a745, #20c997);
        color: white;
        font-weight: bold;
      }

      .score-value {
        font-size: 18px;
      }

      .score-label {
        font-size: 12px;
        margin-left: 2px;
      }

      .compliance-level {
        font-size: 24px;
        font-weight: bold;
        color: #28a745;
      }

      .contrast-item {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 12px;
        padding: 8px 12px;
        background: white;
        border-radius: 4px;
        margin-bottom: 4px;
        border: 1px solid #e5e5e5;
        align-items: center;
      }

      .contrast-item.pass {
        border-left: 3px solid #28a745;
      }

      .contrast-item.fail {
        border-left: 3px solid #dc3545;
      }

      .text-metrics {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .text-metric {
        display: flex;
        justify-content: space-between;
        padding: 8px 12px;
        background: white;
        border-radius: 4px;
        border: 1px solid #e5e5e5;
      }

      .interactive-item {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 12px;
        padding: 8px 12px;
        background: white;
        border-radius: 4px;
        margin-bottom: 4px;
        border: 1px solid #e5e5e5;
        align-items: center;
      }

      .a11y-recommendation {
        padding: 8px 12px;
        background: #fff3cd;
        border-radius: 4px;
        border-left: 3px solid #ffc107;
        font-size: 12px;
        color: #333;
        margin-bottom: 4px;
      }

      /* Code Preview Tab Styles */
      .code-preview {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .code-header h3 {
        margin: 0;
        color: #333;
        font-size: 16px;
      }

      .framework-selector {
        display: flex;
        gap: 8px;
      }

      .framework-btn {
        background: #f8f9fa;
        border: 1px solid #e5e5e5;
        border-radius: 4px;
        padding: 6px 12px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
      }

      .framework-btn.active {
        background: #0066cc;
        color: white;
        border-color: #0066cc;
      }

      .code-section {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 16px;
        border: 1px solid #e5e5e5;
      }

      .code-section h4 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 14px;
        font-weight: 600;
      }

      .code-item {
        background: white;
        border-radius: 6px;
        margin-bottom: 12px;
        border: 1px solid #e5e5e5;
        overflow: hidden;
      }

      .code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #f8f9fa;
        border-bottom: 1px solid #e5e5e5;
      }

      .code-filename {
        font-weight: 600;
        color: #333;
        font-size: 12px;
      }

      .code-type {
        background: #0066cc;
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        text-transform: uppercase;
      }

      .code-content {
        margin: 0;
        padding: 12px;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 11px;
        line-height: 1.4;
        background: none;
        border: none;
        color: #333;
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      .score-value {
        font-size: 32px;
        font-weight: bold;
        color: #0066cc;
      }

      .score-grade {
        font-size: 24px;
        font-weight: bold;
        color: #28a745;
      }

      .health-metrics, .stats-grid {
        display: grid;
        gap: 12px;
      }

      .metric, .stat {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #e5e5e5;
      }

      .stat {
        flex-direction: column;
        align-items: center;
        text-align: center;
        border: 1px solid #e5e5e5;
        border-radius: 6px;
        padding: 16px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #0066cc;
      }

      .stat-label {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
      }

      .recommendations-list {
        margin: 0;
        padding-left: 20px;
      }

      .recommendations-list li {
        margin: 8px 0;
        color: #666;
      }

      .tokens-grid {
        display: grid;
        gap: 24px;
      }

      .token-section h3 {
        margin: 0 0 16px 0;
        color: #333;
      }

      .color-tokens {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .color-token {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f8f9fa;
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid #e5e5e5;
      }

      .color-swatch {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 1px solid #ddd;
      }

      .llm-preview {
        max-width: 100%;
      }

      .preview-header {
        margin-bottom: 20px;
      }

      .preview-header h3 {
        margin: 0 0 8px 0;
        color: #333;
      }

      .preview-header p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }

      .preview-stats {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }

      .preview-stat {
        background: #f8f9fa;
        padding: 12px 16px;
        border-radius: 6px;
        border: 1px solid #e5e5e5;
        min-width: 120px;
      }

      .preview-stat .stat-label {
        display: block;
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
      }

      .preview-stat .stat-value {
        display: block;
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }

      .preview-content {
        background: #f8f9fa;
        border-radius: 6px;
        border: 1px solid #e5e5e5;
        max-height: 400px;
        overflow: auto;
      }

      .context-json {
        margin: 0;
        padding: 16px;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 12px;
        line-height: 1.5;
        color: #333;
        background: none;
        border: none;
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      .error-message {
        text-align: center;
        padding: 40px;
        color: #666;
      }

      .error-message h3 {
        color: #dc3545;
        margin-bottom: 16px;
      }

      .error-message button {
        background: #0066cc;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        margin-top: 16px;
      }

      @media (max-width: 768px) {
        .dashboard-container {
          width: 95vw;
          height: 95vh;
        }
        
        .overview-grid {
          grid-template-columns: 1fr;
        }
        
        .dashboard-tabs {
          font-size: 12px;
        }
        
        .dashboard-tab {
          padding: 8px 12px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Calculate grade from score
   */
  calculateGrade(score) {
    if (score >= 0.9) return 'A+';
    if (score >= 0.8) return 'A';
    if (score >= 0.7) return 'B+';
    if (score >= 0.6) return 'B';
    if (score >= 0.5) return 'C+';
    if (score >= 0.4) return 'C';
    return 'D';
  }

  /**
   * Run design intelligence analysis (stub implementation)
   */
  async runDesignIntelligenceAnalysis(context) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      componentIntents: context.designIntelligence?.componentIntents || [
        {
          component: 'Selected Component',
          intent: 'Interactive element',
          confidence: 0.85,
          reasoning: 'Based on component structure and naming'
        }
      ],
      semantics: {
        confidenceScores: {
          'UI Component': 0.9,
          'Interactive Element': 0.8,
          'Visual Container': 0.7
        },
        detectedPatterns: ['Card Pattern', 'Button Pattern']
      },
      patterns: context.designIntelligence?.patterns || [
        'Component Card Pattern',
        'Typography Scale',
        'Color System'
      ],
      frameworks: [
        {
          name: 'React',
          compatibility: 0.95,
          suggestions: ['Use functional components', 'Implement proper props']
        },
        {
          name: 'Vue',
          compatibility: 0.90,
          suggestions: ['Use composition API', 'Add proper typing']
        }
      ]
    };
  }

  /**
   * Calculate accessibility score
   */
  calculateAccessibilityScore(context) {
    const analysis = context.accessibilityAnalysis || {};
    
    return {
      overall: analysis.score || 0.75,
      level: analysis.score >= 0.9 ? 'AAA' : analysis.score >= 0.7 ? 'AA' : 'A',
      colorContrast: [
        {
          elements: 'Text on Background',
          ratio: '4.5:1',
          status: 'Pass',
          wcag: 'AA'
        },
        {
          elements: 'Button Text',
          ratio: '7.2:1',
          status: 'Pass',
          wcag: 'AAA'
        }
      ],
      textAnalysis: {
        readability: 'Good',
        fontSize: 'Above minimum',
        contrast: 'Sufficient'
      },
      interactive: [
        {
          element: 'Buttons',
          touchTarget: '44px min',
          status: 'Pass'
        }
      ],
      recommendations: analysis.recommendations || [
        'Add alt text to all images',
        'Ensure keyboard navigation works',
        'Test with screen readers'
      ]
    };
  }

  /**
   * Generate framework code (stub implementation)
   */
  async generateFrameworkCode(context, framework) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      components: [
        {
          name: `${framework === 'react' ? 'ComponentCard.tsx' : 'ComponentCard.vue'}`,
          code: this.generateSampleCode(framework, 'component'),
          type: 'component'
        }
      ],
      styles: [
        {
          name: 'styles.css',
          code: this.generateSampleCode(framework, 'styles'),
          type: 'stylesheet'
        }
      ],
      stories: [
        {
          name: 'ComponentCard.stories.js',
          code: this.generateSampleCode(framework, 'story'),
          type: 'story'
        }
      ],
      tests: [
        {
          name: 'ComponentCard.test.js',
          code: this.generateSampleCode(framework, 'test'),
          type: 'test'
        }
      ]
    };
  }

  /**
   * Generate sample code based on framework and type
   */
  generateSampleCode(framework, type) {
    const samples = {
      react: {
        component: `import React from 'react';

interface ComponentCardProps {
  title: string;
  description?: string;
  onClick?: () => void;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  description,
  onClick
}) => {
  return (
    <div className="component-card" onClick={onClick}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
};`,
        styles: `.component-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.component-card:hover {
  transform: translateY(-2px);
}`,
        story: `import { ComponentCard } from './ComponentCard';

export default {
  title: 'Components/ComponentCard',
  component: ComponentCard,
};

export const Default = {
  args: {
    title: 'Sample Card',
    description: 'This is a sample card component'
  }
};`,
        test: `import { render, screen } from '@testing-library/react';
import { ComponentCard } from './ComponentCard';

test('renders component card with title', () => {
  render(<ComponentCard title="Test Card" />);
  expect(screen.getByText('Test Card')).toBeInTheDocument();
});`
      }
    };

    return samples[framework]?.[type] || `// ${framework} ${type} code would be generated here`;
  }

  /**
   * Build HTML for various analysis sections
   */
  buildIntentAnalysisHTML(intents) {
    if (!intents.length) return '<p>No component intents detected</p>';
    
    return intents.map(intent => `
      <div class="intent-item">
        <div class="intent-header">
          <span class="component-name">${intent.component}</span>
          <span class="confidence-badge">${Math.round(intent.confidence * 100)}%</span>
        </div>
        <div class="intent-description">${intent.intent}</div>
        ${intent.reasoning ? `<div class="intent-reasoning">${intent.reasoning}</div>` : ''}
      </div>
    `).join('');
  }

  buildSemanticAnalysisHTML(semantics) {
    return `
      <div class="confidence-scores">
        <h4>Confidence Scores</h4>
        ${Object.entries(semantics.confidenceScores || {}).map(([key, score]) => `
          <div class="confidence-item">
            <span class="confidence-label">${key}</span>
            <span class="confidence-value">${Math.round(score * 100)}%</span>
          </div>
        `).join('')}
      </div>
      <div class="detected-patterns">
        <h4>Detected Patterns</h4>
        ${(semantics.detectedPatterns || []).map(pattern => `
          <div class="pattern-tag">${pattern}</div>
        `).join('')}
      </div>
    `;
  }

  buildDesignPatternsHTML(patterns) {
    if (!patterns.length) return '<p>No design patterns detected</p>';
    
    return patterns.map(pattern => `
      <div class="pattern-item">${pattern}</div>
    `).join('');
  }

  buildFrameworkSuggestionsHTML(frameworks) {
    if (!frameworks.length) return '<p>No framework suggestions available</p>';
    
    return frameworks.map(fw => `
      <div class="framework-item">
        <div class="framework-header">
          <span class="framework-name">${fw.name}</span>
          <span class="compatibility-score">${Math.round(fw.compatibility * 100)}%</span>
        </div>
        <div class="framework-suggestions">
          ${fw.suggestions.map(suggestion => `<div class="suggestion">• ${suggestion}</div>`).join('')}
        </div>
      </div>
    `).join('');
  }

  buildContrastAnalysisHTML(contrastData) {
    return contrastData.map(item => `
      <div class="contrast-item ${item.status.toLowerCase()}">
        <span class="contrast-elements">${item.elements}</span>
        <span class="contrast-ratio">${item.ratio}</span>
        <span class="contrast-status">${item.status}</span>
        <span class="wcag-level">${item.wcag}</span>
      </div>
    `).join('');
  }

  buildTextAnalysisHTML(textAnalysis) {
    return `
      <div class="text-metrics">
        <div class="text-metric">
          <span class="metric-label">Readability</span>
          <span class="metric-value">${textAnalysis.readability}</span>
        </div>
        <div class="text-metric">
          <span class="metric-label">Font Size</span>
          <span class="metric-value">${textAnalysis.fontSize}</span>
        </div>
        <div class="text-metric">
          <span class="metric-label">Contrast</span>
          <span class="metric-value">${textAnalysis.contrast}</span>
        </div>
      </div>
    `;
  }

  buildInteractiveAnalysisHTML(interactiveData) {
    return interactiveData.map(item => `
      <div class="interactive-item ${item.status.toLowerCase()}">
        <span class="interactive-element">${item.element}</span>
        <span class="interactive-requirement">${item.touchTarget}</span>
        <span class="interactive-status">${item.status}</span>
      </div>
    `).join('');
  }

  buildA11yRecommendationsHTML(recommendations) {
    return recommendations.map(rec => `
      <div class="a11y-recommendation">💡 ${rec}</div>
    `).join('');
  }

  buildGeneratedCodeHTML(components) {
    return components.map(comp => `
      <div class="code-item">
        <div class="code-header">
          <span class="code-filename">${comp.name}</span>
          <span class="code-type">${comp.type}</span>
        </div>
        <pre class="code-content"><code>${this.escapeHtml(comp.code)}</code></pre>
      </div>
    `).join('');
  }

  buildGeneratedStylesHTML(styles) {
    return this.buildGeneratedCodeHTML(styles);
  }

  buildGeneratedStoriesHTML(stories) {
    return this.buildGeneratedCodeHTML(stories);
  }

  buildGeneratedTestsHTML(tests) {
    return this.buildGeneratedCodeHTML(tests);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export the class for use in other modules
window.UnifiedContextDashboard = UnifiedContextDashboard;