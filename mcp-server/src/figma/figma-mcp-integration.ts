/**
 * Enhanced Figma MCP Integration
 * 
 * Implements best practices from Figma MCP documentation:
 * - Structured file organization
 * - Effective prompt patterns
 * - Custom rules implementation
 * - Performance optimization for large frames
 */

import { figmaMCPClient } from './figma-mcp-client.js';

export interface FigmaMCPPromptConfig {
  framework: string;
  stylingSystem: string;
  codebaseConventions: string;
  filePath?: string;
  componentLibrary?: string;
  layoutSystem?: string;
}

export interface FigmaMCPResponse {
  success: boolean;
  code?: string;
  metadata?: any;
  assets?: string[];
  designTokens?: any;
  errors?: string[];
  optimizationSuggestions?: string[];
}

/**
 * Enhanced Figma MCP Service following official best practices
 */
export class EnhancedFigmaMCPService {
  private client = figmaMCPClient;
  
  /**
   * Generate code following Figma MCP best practices workflow:
   * 1. Run get_code first for structured representation
   * 2. Run get_metadata if response is too large
   * 3. Run get_screenshot for visual reference
   * 4. Download assets and implement
   */
  async generateCodeWithBestPractices(
    figmaUrl: string, 
    config: FigmaMCPPromptConfig,
    context?: any
  ): Promise<FigmaMCPResponse> {
    try {
      console.log('🔄 Starting Figma MCP best practices workflow...');
      
      // Step 1: Get structured code representation
      console.log('📊 Step 1: Fetching structured code representation...');
      const codeResponse = await this.client.getCode(figmaUrl, {
        framework: config.framework,
        styling: config.stylingSystem,
        components: config.componentLibrary || 'false'
      });
      
      if (codeResponse.isError) {
        throw new Error(codeResponse.error || 'Code generation failed');
      }
      
      // Step 2: Check if response is too large and get metadata if needed
      const codeContent = codeResponse.content?.[0]?.text || '';
      let metadata = null;
      
      if (codeContent.length > 10000 || codeContent.includes('...truncated')) {
        console.log('⚠️ Step 2: Response too large, fetching metadata...');
        const metadataResponse = await this.client.getMetadata(figmaUrl);
        metadata = metadataResponse.content?.[0]?.data;
        
        // Re-fetch specific nodes if metadata suggests optimization
        if (metadata?.suggestedNodes) {
          console.log('🎯 Re-fetching optimized node selection...');
          // Implementation would re-fetch specific nodes
        }
      }
      
      // Step 3: Get visual reference screenshot
      console.log('📸 Step 3: Capturing visual reference...');
      await this.client.getScreenshot(figmaUrl);
      
      // Step 4: Get design variables for token mapping
      console.log('🎨 Step 4: Extracting design tokens...');
      const variablesResponse = await this.client.getVariables(figmaUrl);
      
      // Step 5: Transform code according to project conventions
      console.log('🔧 Step 5: Applying project conventions...');
      const transformedCode = this.transformCodeToProjectConventions(
        codeContent, 
        config,
        context
      );
      
      return {
        success: true,
        code: transformedCode,
        metadata: metadata,
        assets: this.extractAssetUrls(codeResponse),
        designTokens: variablesResponse.content?.[0]?.data,
        optimizationSuggestions: this.generateOptimizationSuggestions(context)
      };
      
    } catch (error) {
      console.error('❌ Figma MCP workflow failed:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        optimizationSuggestions: ['Consider using smaller frame selections for better performance']
      };
    }
  }
  
  /**
   * Transform Figma MCP output to project conventions
   * Following "Implementation rules" from Figma documentation
   */
  private transformCodeToProjectConventions(
    figmaCode: string, 
    config: FigmaMCPPromptConfig,
    context?: any
  ): string {
    let transformedCode = figmaCode;
    
    // Replace Tailwind with project's design system if specified
    if (config.stylingSystem !== 'tailwind' && transformedCode.includes('className=')) {
      transformedCode = this.replaceTailwindWithDesignSystem(transformedCode, config);
    }
    
    // Apply file path and import conventions
    if (config.filePath) {
      transformedCode = this.applyFilePathConventions(transformedCode, config.filePath);
    }
    
    // Use existing components instead of duplicating
    if (config.componentLibrary) {
      transformedCode = this.replaceWithExistingComponents(transformedCode, config.componentLibrary);
    }
    
    // Apply layout system preferences
    if (config.layoutSystem) {
      transformedCode = this.applyLayoutSystem(transformedCode, config.layoutSystem);
    }
    
    // Ensure 1:1 visual parity with design tokens
    if (context?.designTokens) {
      transformedCode = this.enforceDesignTokenUsage(transformedCode, context.designTokens);
    }
    
    return transformedCode;
  }
  
  /**
   * Generate effective prompts following Figma MCP documentation
   */
  generateEffectivePrompt(
    intent: string, 
    config: FigmaMCPPromptConfig,
    context?: any
  ): string {
    const basePrompt = `Generate ${config.framework} code from the selected Figma frame`;
    
    // Add framework-specific instructions
    let prompt = `${basePrompt} using ${config.stylingSystem} for styling`;
    
    // Add codebase convention guidance
    if (config.codebaseConventions) {
      prompt += `\n\nCodebase conventions:\n${config.codebaseConventions}`;
    }
    
    // Add component library guidance
    if (config.componentLibrary) {
      prompt += `\n\nIMPORTANT: Use components from ${config.componentLibrary} when possible`;
    }
    
    // Add file path guidance
    if (config.filePath) {
      prompt += `\n\nPlace component in ${config.filePath}`;
    }
    
    // Add layout system guidance
    if (config.layoutSystem) {
      prompt += `\n\nUse ${config.layoutSystem} layout system`;
    }
    
    // Add custom rules based on context
    prompt += this.addCustomRules(context);
    
    // Add intent-specific guidance
    prompt += `\n\nSpecific requirement: ${intent}`;
    
    return prompt;
  }
  
  /**
   * Add custom rules following Figma MCP documentation patterns
   */
  private addCustomRules(context?: any): string {
    let rules = '\n\nCustom rules that must be followed:';
    
    // General-purpose rules from Figma documentation
    rules += '\n- Prioritize Figma fidelity to match designs exactly';
    rules += '\n- Avoid hardcoded values, use design tokens from Figma where available';
    rules += '\n- Follow WCAG requirements for accessibility';
    rules += '\n- Add component documentation';
    
    // Asset-related rules
    rules += '\n- IMPORTANT: If Figma MCP returns localhost source for assets, use directly';
    rules += '\n- DO NOT import/add new icon packages, use assets from Figma payload';
    rules += '\n- DO NOT create placeholders if localhost source is provided';
    
    // Performance rules
    if (context?.mcpContext?.optimizationInfo?.nodeCount > 50) {
      rules += '\n- Frame is complex - consider breaking into smaller components';
      rules += '\n- Focus on main component structure, defer sub-components';
    }
    
    // Design system rules
    if (context?.designTokenUsage?.tokenCompliance < 80) {
      rules += '\n- Low design token usage detected - prioritize variable usage';
      rules += '\n- Replace hardcoded values with design system tokens';
    }
    
    return rules;
  }
  
  /**
   * Check if frame is optimal size following "avoid large frames" guidance
   */
  isOptimalFrameSize(context: any): { isOptimal: boolean; suggestions: string[] } {
    const suggestions: string[] = [];
    
    if (!context?.mcpContext?.optimizationInfo) {
      return { isOptimal: true, suggestions: [] };
    }
    
    const { nodeCount, complexity, isOptimalSize } = context.mcpContext.optimizationInfo;
    
    if (!isOptimalSize) {
      suggestions.push('Frame is too large for optimal MCP processing');
      
      if (nodeCount > 100) {
        suggestions.push('Consider selecting smaller sections or individual components');
      }
      
      if (complexity === 'high') {
        suggestions.push('High complexity detected - break into logical chunks');
      }
      
      suggestions.push('Generate code for smaller sections like Card, Header, or Sidebar');
    }
    
    return {
      isOptimal: isOptimalSize,
      suggestions
    };
  }
  
  // Helper methods for code transformation
  private replaceTailwindWithDesignSystem(code: string, _config: FigmaMCPPromptConfig): string {
    // Implementation would replace Tailwind classes with design system classes
    return code.replace(/className="([^"]*)"/, (match, _classes) => {
      // Transform classes based on design system
      return match; // Placeholder
    });
  }
  
  private applyFilePathConventions(code: string, _filePath: string): string {
    // Add appropriate imports and exports based on file path conventions
    return code;
  }
  
  private replaceWithExistingComponents(code: string, _componentLibrary: string): string {
    // Replace generic components with existing ones from the library
    return code;
  }
  
  private applyLayoutSystem(code: string, _layoutSystem: string): string {
    // Apply specific layout system patterns (flexbox, grid, etc.)
    return code;
  }
  
  private enforceDesignTokenUsage(code: string, _designTokens: any): string {
    // Replace hardcoded values with design tokens
    return code;
  }
  
  private extractAssetUrls(response: any): string[] {
    // Extract localhost asset URLs from MCP response
    const assets: string[] = [];
    const content = response.content?.[0]?.text || '';
    
    const assetMatches = content.match(/localhost:\d+\/[^\s"')]+/g);
    if (assetMatches) {
      assets.push(...assetMatches);
    }
    
    return assets;
  }
  
  private generateOptimizationSuggestions(context?: any): string[] {
    const suggestions: string[] = [];
    
    if (context?.mcpContext?.optimizationInfo?.suggestedSplitting?.length > 0) {
      suggestions.push(...context.mcpContext.optimizationInfo.suggestedSplitting);
    }
    
    if (context?.designTokenUsage?.missingTokens?.length > 0) {
      suggestions.push('Consider adding design tokens for better consistency');
    }
    
    if (context?.mcpContext?.componentInfo?.hasCodeConnect === false) {
      suggestions.push('Consider adding Code Connect mapping for this component');
    }
    
    return suggestions;
  }
}

// Export configured instance
export const enhancedFigmaMCPService = new EnhancedFigmaMCPService();