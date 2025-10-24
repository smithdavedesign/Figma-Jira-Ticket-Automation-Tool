/**
 * Proper Architecture: Figma MCP as Data Layer + Gemini as Reasoning Layer
 * 
 * This service properly separates concerns:
 * - Figma MCP: Pure data extraction (design tokens, assets, structure)
 * - Gemini: Reasoning and document generation 
 * - This service: Orchestration between the two layers
 */

import { GoogleGenAI } from '@google/genai';
import { figmaMCPClient } from '../figma/figma-mcp-client.js';

export interface FigmaDataLayer {
  // Raw data from Figma MCP - no reasoning, just pure extraction
  structuredData: any;
  designTokens: any;
  assets: string[];
  metadata: any;
  screenshot: string;
  codeStructure: string;
}

export interface GeminiReasoningLayer {
  // Reasoning and generation layer using Gemini
  analysisResult: string;
  generatedContent: string;
  recommendations: string[];
  technicalSpecs: any;
}

/**
 * Service that properly separates Figma MCP (data) from Gemini (reasoning)
 */
class FigmaMCPGeminiOrchestrator {
  private geminiClient: GoogleGenAI;
  
  constructor(geminiApiKey: string) {
    this.geminiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  }

  /**
   * Generate comprehensive ticket using proper layer separation
   */
  async generateTicketWithProperSeparation(params: {
    figmaUrl: string;
    prompt: string;
    documentType: string;
    context?: any;
  }): Promise<{
    success: boolean;
    ticket: string;
    dataLayer: FigmaDataLayer;
    reasoningLayer: GeminiReasoningLayer;
    metadata: any;
  }> {
    console.log('🏗️ Starting proper layer separation workflow...');

    try {
      // LAYER 1: Figma MCP as Pure Data Source
      console.log('📊 Layer 1: Extracting data from Figma MCP...');
      const figmaData = await this.extractFigmaData(params.figmaUrl);
      
      // LAYER 2: Gemini as Reasoning Engine
      console.log('🧠 Layer 2: Processing with Gemini reasoning...');
      const reasoning = await this.processWithGeminiReasoning(figmaData, params);
      
      // LAYER 3: Orchestrate final output
      console.log('🎯 Layer 3: Orchestrating final ticket...');
      const finalTicket = this.orchestrateFinalOutput(figmaData, reasoning, params);

      return {
        success: true,
        ticket: finalTicket,
        dataLayer: figmaData,
        reasoningLayer: reasoning,
        metadata: {
          figmaDataSize: JSON.stringify(figmaData).length,
          geminiTokensUsed: reasoning.analysisResult.length,
          processingTime: Date.now()
        }
      };

    } catch (error) {
      console.error('❌ Orchestration failed:', error);
      return {
        success: false,
        ticket: this.generateErrorTicket(error),
        dataLayer: {} as FigmaDataLayer,
        reasoningLayer: {} as GeminiReasoningLayer,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * LAYER 1: Figma MCP as Pure Data Source
   * Only extracts data - no reasoning or generation
   */
  private async extractFigmaData(figmaUrl: string): Promise<FigmaDataLayer> {
    console.log('📋 Extracting pure data from Figma MCP...');
    
    // Step 1: Get structured code representation (raw data)
    const codeResponse = await figmaMCPClient.getCode(figmaUrl, {
      framework: 'react', // Just for structure, not for generation
      styling: 'css',
      components: 'false'
    });

    // Step 2: Get design tokens (raw data)
    const variablesResponse = await figmaMCPClient.getVariables(figmaUrl);

    // Step 3: Get metadata (raw data)
    const metadataResponse = await figmaMCPClient.getMetadata(figmaUrl);

    // Step 4: Get visual reference (raw data)
    const screenshotResponse = await figmaMCPClient.getScreenshot(figmaUrl);

    // Step 5: Get code connect mappings (raw data)
    const codeConnectResponse = await figmaMCPClient.getCodeConnectMap(figmaUrl);

    // Return pure data - no interpretation
    return {
      structuredData: {
        codeStructure: codeResponse.content?.[0]?.text || '',
        isComplete: !codeResponse.isError
      },
      designTokens: variablesResponse.content?.[0]?.data || {},
      assets: this.extractAssetUrls(codeResponse),
      metadata: metadataResponse.content?.[0]?.data || {},
      screenshot: screenshotResponse.content?.[0]?.data || '',
      codeStructure: codeConnectResponse.content?.[0]?.text || ''
    };
  }

  /**
   * LAYER 2: Gemini as Pure Reasoning Engine
   * Takes raw data and applies intelligence/reasoning
   */
  private async processWithGeminiReasoning(
    figmaData: FigmaDataLayer,
    params: any
  ): Promise<GeminiReasoningLayer> {
    console.log('🤖 Processing raw data with Gemini reasoning...');

    // Create reasoning prompt that focuses on interpretation, not data extraction
    const reasoningPrompt = this.buildGeminiReasoningPrompt(figmaData, params);

    // Use Gemini for pure reasoning - no data extraction
    const result = await this.geminiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: reasoningPrompt
    });

    const analysisText = result.text || '';

    // Parse Gemini's reasoning into structured format
    const structuredReasoning = this.parseGeminiReasoning(analysisText);

    return {
      analysisResult: analysisText,
      generatedContent: structuredReasoning.content,
      recommendations: structuredReasoning.recommendations,
      technicalSpecs: structuredReasoning.technicalSpecs
    };
  }

  /**
   * Build reasoning-focused prompt for Gemini
   * This prompt focuses on INTERPRETATION of data, not extraction
   */
  private buildGeminiReasoningPrompt(figmaData: FigmaDataLayer, params: any): string {
    return `# Design Analysis and Ticket Generation Task

You are a senior software architect analyzing design data to create comprehensive implementation tickets.

## Your Role
- Interpret and reason about the provided design data
- Generate actionable implementation guidance
- Create comprehensive technical specifications
- Provide strategic recommendations

## Raw Design Data Provided
### Code Structure
\`\`\`
${figmaData.structuredData.codeStructure}
\`\`\`

### Design Tokens
\`\`\`json
${JSON.stringify(figmaData.designTokens, null, 2)}
\`\`\`

### Metadata
\`\`\`json
${JSON.stringify(figmaData.metadata, null, 2)}
\`\`\`

### Available Assets
${figmaData.assets.map(asset => `- ${asset}`).join('\n')}

## Context
- **Request**: ${params.prompt}
- **Document Type**: ${params.documentType}
- **Figma URL**: ${params.figmaUrl}
- **Additional Context**: ${JSON.stringify(params.context || {}, null, 2)}

## Your Analysis Task
1. **INTERPRET** the design data (don't just repeat it)
2. **REASON** about implementation complexity and requirements
3. **GENERATE** a comprehensive ${params.documentType} with:
   - Strategic implementation approach
   - Technical architecture decisions
   - Detailed acceptance criteria
   - Risk assessment and mitigation
   - Quality assurance guidelines
   - Timeline and effort estimation

## Output Format
Provide your response in this structure:

### ANALYSIS
[Your interpretation of the design and technical requirements]

### IMPLEMENTATION_STRATEGY
[Your strategic approach to building this component]

### TECHNICAL_SPECIFICATIONS
[Detailed technical specs based on your analysis]

### RECOMMENDATIONS
[Your professional recommendations for best implementation]

### ACCEPTANCE_CRITERIA
[Specific, testable criteria for completion]

### RISK_ASSESSMENT
[Potential challenges and mitigation strategies]

Focus on REASONING and STRATEGIC THINKING, not just data presentation.`;
  }

  /**
   * Parse Gemini's reasoning into structured format
   */
  private parseGeminiReasoning(analysisText: string): any {
    // Extract structured sections from Gemini's response
    const sections = {
      analysis: this.extractSection(analysisText, 'ANALYSIS'),
      strategy: this.extractSection(analysisText, 'IMPLEMENTATION_STRATEGY'),
      technicalSpecs: this.extractSection(analysisText, 'TECHNICAL_SPECIFICATIONS'),
      recommendations: this.extractSection(analysisText, 'RECOMMENDATIONS').split('\n').filter(line => line.trim()),
      acceptanceCriteria: this.extractSection(analysisText, 'ACCEPTANCE_CRITERIA'),
      riskAssessment: this.extractSection(analysisText, 'RISK_ASSESSMENT')
    };

    return {
      content: analysisText,
      recommendations: sections.recommendations,
      technicalSpecs: sections
    };
  }

  /**
   * Extract specific section from Gemini's structured response
   */
  private extractSection(text: string, sectionName: string): string {
    const regex = new RegExp(`### ${sectionName}\\s*\\n([\\s\\S]*?)(?=\\n### |$)`, 'i');
    const match = text.match(regex);
    return (match && match[1]) ? match[1].trim() : '';
  }

  /**
   * LAYER 3: Orchestrate final output combining data + reasoning
   */
  private orchestrateFinalOutput(
    figmaData: FigmaDataLayer,
    reasoning: GeminiReasoningLayer,
    params: any
  ): string {
    const componentName = this.extractComponentName(figmaData);
    
    return `# 🎯 ${componentName} Implementation Ticket

## 📋 Overview
**Generated using proper layer separation: Figma MCP (data) + Gemini (reasoning)**

- **Figma URL**: ${params.figmaUrl}
- **Document Type**: ${params.documentType}
- **Data Layer**: ✅ Figma MCP (${figmaData.assets.length} assets, ${Object.keys(figmaData.designTokens).length} tokens)
- **Reasoning Layer**: ✅ Gemini Analysis

## 🧠 AI Analysis & Strategy
${reasoning.analysisResult}

## 📊 Raw Design Data (from Figma MCP)

### Design Tokens Available
\`\`\`json
${JSON.stringify(figmaData.designTokens, null, 2)}
\`\`\`

### Assets Required
${figmaData.assets.length > 0 ? figmaData.assets.map(asset => `- ${asset}`).join('\n') : 'No assets detected'}

### Code Structure Reference
\`\`\`typescript
${figmaData.structuredData.codeStructure.substring(0, 1000)}${figmaData.structuredData.codeStructure.length > 1000 ? '...\n// [Truncated - see full structure in Figma MCP response]' : ''}
\`\`\`

## 📐 Implementation Recommendations
${reasoning.recommendations.map(rec => `- ${rec}`).join('\n')}

## ✅ Success Criteria
- [ ] Data layer extraction successful from Figma MCP
- [ ] Reasoning layer analysis complete via Gemini
- [ ] Implementation follows AI-recommended strategy
- [ ] All design tokens properly utilized
- [ ] Assets integrated as specified
- [ ] Code structure matches Figma MCP output
- [ ] Quality assurance validates against reasoning layer

---
**Architecture**: Figma MCP (Data Source) → Gemini (Reasoning Engine) → Orchestrated Output
**Generated**: ${new Date().toISOString()}`;
  }

  /**
   * Extract component name from Figma data
   */
  private extractComponentName(figmaData: FigmaDataLayer): string {
    // Try to extract from metadata first
    if (figmaData.metadata?.name) {
      return figmaData.metadata.name;
    }
    
    // Try to extract from code structure
    const codeStructure = figmaData.structuredData.codeStructure;
    const componentMatch = codeStructure.match(/(?:function|const|class)\s+(\w+)/);
    if (componentMatch) {
      return componentMatch[1];
    }
    
    return 'Component';
  }

  /**
   * Extract asset URLs from Figma MCP response
   */
  private extractAssetUrls(response: any): string[] {
    const assets: string[] = [];
    const content = response.content?.[0]?.text || '';
    
    // Extract localhost asset URLs from MCP response
    const assetMatches = content.match(/(?:src|href)=["']([^"']*localhost[^"']*)["']/g);
    if (assetMatches) {
      assets.push(...assetMatches.map((match: string) => {
        const urlMatch = match.match(/["']([^"']*)["']/);
        return urlMatch ? urlMatch[1] : '';
      }).filter(Boolean));
    }
    
    return assets;
  }

  /**
   * Generate error ticket when orchestration fails
   */
  private generateErrorTicket(error: any): string {
    return `# ❌ Architecture Error: Layer Separation Failed

## Issue
The proper separation between Figma MCP (data layer) and Gemini (reasoning layer) encountered an error.

## Error Details
\`\`\`
${error instanceof Error ? error.message : JSON.stringify(error)}
\`\`\`

## Architecture Status
- **Figma MCP (Data Layer)**: ❓ Status unknown due to error
- **Gemini (Reasoning Layer)**: ❓ Status unknown due to error
- **Orchestration**: ❌ Failed

## Recovery Steps
1. Verify Figma MCP server availability
2. Confirm Gemini API key is valid
3. Check network connectivity
4. Retry with smaller design selection
5. Review error logs for specific failure point

## Next Actions
- Contact development team if issue persists
- Use fallback generation if urgent
- Document error for architecture improvements`;
  }
}

// Export configured orchestrator
export { FigmaMCPGeminiOrchestrator };