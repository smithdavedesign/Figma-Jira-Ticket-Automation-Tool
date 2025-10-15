# Production LLM Integration & Prompt Templates

> **Structured prompts and context preparation for optimal LLM reasoning**

## 🎯 LLM Integration Philosophy

The Design Intelligence Layer feeds LLMs with **structured, semantic context** rather than raw visual descriptions. This enables reasoning about design intent, not just appearance.

## 📋 Core Prompt Template for Design Intelligence

### System Prompt Template

```
SYSTEM: Design-to-Development Architect v1.0

You are an expert system that receives canonical designSpec.v1.json describing design components with extracted semantic intelligence. Your role is to generate structured development artifacts based on this intelligence.

CAPABILITIES:
- Generate component scaffolds from semantic analysis
- Create Jira-style issues with proper estimation
- Produce technical documentation 
- Generate agent blueprints for automated implementation

CONSTRAINTS:
- Follow the specified tech stack exactly
- Use design tokens when referenced
- Maintain semantic intent from design intelligence
- Keep code scaffolds concise (≤200 tokens per file)
- Output structured JSON only

INPUT FORMAT: designSpec.v1.json with semantic intelligence
OUTPUT FORMAT: Structured JSON with components[], issues[], docs[], agentBlueprint

QUALITY STANDARDS:
- Accessibility: WCAG 2.1 AA compliance
- Performance: Consider bundle size and loading
- Maintainability: Follow framework best practices
- Design System: Use matched components when available
```

### User Prompt Template

```typescript
function buildPromptTemplate(designSpec: DesignSpec, requirements: UserRequirements): string {
  return `
# Design Intelligence Analysis

## Project Context
- **Tech Stack**: ${designSpec.projectContext.techStack.join(', ')}
- **Page Type**: ${designSpec.projectContext.pageType}
- **Target Devices**: ${designSpec.projectContext.targetDevices.join(', ')}
- **Design System**: ${designSpec.projectContext.designSystem || 'Custom'}

## Extracted Design Intelligence

### Components (${designSpec.components.length} total)
${designSpec.components.map(comp => `
#### ${comp.name} (${comp.semanticType})
- **Role**: ${comp.intent?.purpose} (${comp.intent?.priority} priority)
- **User Action**: ${comp.intent?.userAction || 'none'}
- **Layout**: ${comp.layout?.type} ${comp.layout?.direction || ''}
- **Design System Match**: ${comp.designSystemMatch?.matchedComponentId || 'None'} (${Math.round((comp.designSystemMatch?.matchConfidence || 0) * 100)}% confidence)
- **Behaviors**: ${comp.interactions?.map(i => `${i.trigger} → ${i.intent}`).join(', ') || 'Static'}
- **Accessibility**: ${comp.accessibility?.map(a => a.role).join(', ') || 'Standard'}
- **Tokens Used**: ${comp.tokens?.join(', ') || 'None identified'}
${comp.contentSummary?.texts?.length ? `- **Content**: "${comp.contentSummary.texts[0].text}"` : ''}
${comp.notes ? `- **Notes**: ${comp.notes}` : ''}
`).join('\n')}</div>

### Design Tokens Available
${Object.entries(designSpec.tokens || {}).map(([category, tokens]) => `
**${category}**: ${Object.entries(tokens as Record<string, string>).map(([name, value]) => `${name}="${value}"`).join(', ')}
`).join('')}

### Interaction Flow
${designSpec.interactionGraph?.edges?.map(edge => `
- ${edge.from} → ${edge.to} (${edge.type})
`).join('') || 'No interactions defined'}

### Page Intent Analysis
- **Primary Goal**: ${designSpec.inferredIntent?.primaryGoal}
- **Priority Level**: ${designSpec.inferredIntent?.priority}
- **A11y Risk Score**: ${designSpec.inferredIntent?.a11yRiskScore}

## Requirements
${requirements.taskType === 'scaffold' ? '- Generate component scaffolds and file structure' : ''}
${requirements.taskType === 'issues' ? '- Create Jira-style development issues' : ''}
${requirements.taskType === 'docs' ? '- Generate technical documentation' : ''}
${requirements.taskType === 'agent' ? '- Create agent blueprint for automated implementation' : ''}

## Output Requirements

Generate a JSON response with:

\`\`\`json
{
  "components": [
    {
      "componentName": "string",
      "suggestedFilePath": "string", 
      "codeScaffold": {
        "files": [
          {
            "path": "string",
            "content": "string (brief scaffold)",
            "template": "string"
          }
        ]
      },
      "acceptanceCriteria": ["string"],
      "testsToAdd": ["string"],
      "designSystemMapping": "string"
    }
  ],
  "issues": [
    {
      "title": "string",
      "description": "string",
      "labels": ["string"],
      "estimate": "1 | 2 | 3 | 5 | 8 | 13",
      "acceptanceCriteria": ["string"],
      "technicalNotes": "string"
    }
  ],
  "docs": [
    {
      "title": "string",
      "content": "markdown string",
      "type": "component-spec | technical-guide | api-reference"
    }
  ],
  "agentBlueprint": {
    "agentId": "string",
    "objective": "string",
    "tasks": [
      {
        "id": "string",
        "title": "string", 
        "actions": [
          {
            "type": "createFile | updateFile | runCommand",
            "path": "string",
            "template": "string",
            "content": "string"
          }
        ],
        "outputChecks": ["string"]
      }
    ],
    "onComplete": [
      {
        "type": "createPR | createIssue | notify",
        "details": {}
      }
    ]
  }
}
\`\`\`

Focus on implementing the **semantic intent** of each component, not just visual appearance. Use the design intelligence to inform state management, accessibility, and behavioral patterns.
`;
}
```

## 🔄 Context Preparation Pipeline

### Enhanced Context Builder

```typescript
class EnhancedLLMContextBuilder {
  async buildContext(
    designSpec: DesignSpec,
    userRequirements: UserRequirements,
    options: ContextOptions = {}
  ): Promise<LLMContext> {
    
    // Phase 1: Validate and enrich design spec
    const validatedSpec = await this.validateDesignSpec(designSpec);
    const enrichedSpec = await this.enrichWithAdditionalContext(validatedSpec, options);
    
    // Phase 2: Build semantic summary
    const semanticSummary = this.buildSemanticSummary(enrichedSpec);
    
    // Phase 3: Generate framework-specific hints
    const frameworkHints = this.generateFrameworkHints(
      enrichedSpec,
      userRequirements.techStack
    );
    
    // Phase 4: Create prompt
    const prompt = buildPromptTemplate(enrichedSpec, userRequirements);
    
    // Phase 5: Calculate token usage
    const tokenUsage = this.calculateTokenUsage(prompt);
    
    return {
      systemPrompt: this.getSystemPrompt(),
      userPrompt: prompt,
      designSpec: enrichedSpec,
      semanticSummary,
      frameworkHints,
      metadata: {
        tokenCount: tokenUsage,
        confidence: enrichedSpec.meta.confidence,
        processingTime: Date.now(),
        version: '1.0'
      }
    };
  }

  private buildSemanticSummary(spec: DesignSpec): SemanticSummary {
    return {
      totalComponents: spec.components.length,
      componentBreakdown: this.analyzeComponentTypes(spec.components),
      interactionComplexity: this.calculateInteractionComplexity(spec.interactionGraph),
      designSystemCoverage: this.calculateDSCoverage(spec.components),
      accessibilityRisk: spec.inferredIntent?.a11yRiskScore || 0,
      implementationComplexity: this.calculateImplementationComplexity(spec),
      suggestedApproach: this.suggestImplementationApproach(spec)
    };
  }

  private generateFrameworkHints(spec: DesignSpec, techStack: string[]): FrameworkHints {
    const framework = techStack.find(t => ['react', 'vue', 'angular'].includes(t.toLowerCase()));
    
    switch (framework?.toLowerCase()) {
      case 'react':
        return this.generateReactHints(spec);
      case 'vue':
        return this.generateVueHints(spec);
      case 'angular':
        return this.generateAngularHints(spec);
      default:
        return this.generateGenericHints(spec);
    }
  }

  private generateReactHints(spec: DesignSpec): ReactHints {
    const components = spec.components;
    
    return {
      suggestedHooks: this.inferRequiredHooks(components),
      stateManagement: this.inferStateManagement(components),
      dataFetching: this.inferDataFetching(components),
      styling: this.inferStylingApproach(spec),
      testing: this.suggestTestingStrategy(components),
      performance: this.suggestPerformanceOptimizations(components)
    };
  }
}
```

## 🎨 Specialized Prompt Variations

### Component Scaffold Generation

```typescript
const scaffoldPrompt = `
TASK: Generate React component scaffolds from design intelligence

FOCUS:
- Component structure based on semantic type
- Props derived from design tokens and content
- State management based on identified behaviors
- Accessibility implementation from a11y analysis
- Styling approach using identified tokens

OUTPUT: Component files with:
- TypeScript interfaces
- React functional components
- Props with proper types
- Event handlers for behaviors
- Accessibility attributes
- CSS/Tailwind classes using tokens

CONSTRAINTS:
- Keep scaffolds under 50 lines per component
- Use semantic HTML elements
- Include loading and error states where relevant
- Follow React best practices
`;
```

### Jira Issue Generation

```typescript
const issuePrompt = `
TASK: Generate Jira-style development issues from design intelligence

FOCUS:
- Issue titles that reflect component purpose
- Descriptions with implementation context
- Story points based on complexity analysis
- Acceptance criteria from design intent
- Technical requirements from framework hints

OUTPUT: Issues with:
- Clear user story format
- Technical implementation notes
- Design system integration requirements
- Accessibility compliance checklist
- Testing requirements

ESTIMATION GUIDE:
- 1 point: Simple static component (button, text)
- 2 points: Interactive component with state
- 3 points: Complex component with multiple behaviors
- 5 points: Component with data fetching/submission
- 8 points: Complex interactive component with validation
- 13 points: Multi-step flow or complex state management
`;
```

### Technical Documentation

```typescript
const docsPrompt = `
TASK: Generate technical documentation from design intelligence

FOCUS:
- Component specifications based on semantic analysis
- API documentation from inferred props and behaviors
- Usage guidelines from design system matches
- Accessibility documentation from a11y analysis
- Implementation notes from complexity analysis

OUTPUT: Markdown documentation with:
- Component overview and purpose
- Props API with types and descriptions
- Usage examples with code snippets
- Accessibility guidelines
- Design token mappings
- Testing recommendations

STRUCTURE:
- Overview section with component purpose
- API reference with props and methods
- Examples section with common use cases
- Accessibility section with WCAG compliance
- Design system integration notes
`;
```

### Agent Blueprint Generation

```typescript
const agentPrompt = `
TASK: Generate agent blueprint for automated implementation

FOCUS:
- File creation tasks based on component structure
- Template selection from component type
- Validation steps for quality assurance
- Integration tasks for design system compliance
- Testing setup based on component complexity

OUTPUT: Agent blueprint with:
- Task breakdown for component implementation
- File templates with proper structure
- Validation commands for quality checks
- Integration steps for design system
- PR creation with appropriate reviewers

AUTOMATION LEVEL:
- High: Static components with clear design system matches
- Medium: Interactive components with standard patterns
- Low: Complex components requiring human oversight
`;
```

## 📊 Response Processing & Validation

### LLM Response Parser

```typescript
class LLMResponseParser {
  async parseResponse(
    response: string,
    expectedFormat: 'components' | 'issues' | 'docs' | 'agent'
  ): Promise<ParsedResponse> {
    
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[1]);
      
      // Validate against expected schema
      const validation = await this.validateResponse(parsed, expectedFormat);
      
      if (!validation.isValid) {
        throw new Error(`Invalid response: ${validation.errors.join(', ')}`);
      }
      
      return {
        data: parsed,
        metadata: {
          extractedAt: new Date().toISOString(),
          format: expectedFormat,
          confidence: this.calculateConfidence(parsed),
          warnings: validation.warnings
        }
      };
      
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      return this.generateFallbackResponse(expectedFormat);
    }
  }

  private async validateResponse(data: any, format: string): Promise<ValidationResult> {
    const schemas = {
      components: this.componentSchema,
      issues: this.issueSchema,
      docs: this.docsSchema,
      agent: this.agentSchema
    };
    
    const schema = schemas[format as keyof typeof schemas];
    if (!schema) {
      return { isValid: false, errors: ['Unknown format'], warnings: [] };
    }
    
    return this.validator.validate(data, schema);
  }
}
```

### Quality Assessment

```typescript
class ResponseQualityAssessor {
  assessQuality(response: ParsedResponse, designSpec: DesignSpec): QualityScore {
    const scores = {
      completeness: this.assessCompleteness(response, designSpec),
      accuracy: this.assessAccuracy(response, designSpec),
      usability: this.assessUsability(response),
      consistency: this.assessConsistency(response, designSpec)
    };
    
    const overall = Object.values(scores).reduce((sum, score) => sum + score, 0) / 4;
    
    return {
      overall,
      breakdown: scores,
      recommendation: this.generateRecommendation(overall),
      improvements: this.suggestImprovements(scores, response)
    };
  }

  private assessCompleteness(response: ParsedResponse, spec: DesignSpec): number {
    // Check if all components from spec are addressed
    const specComponents = spec.components.length;
    const responseComponents = response.data.components?.length || 0;
    
    return Math.min(responseComponents / specComponents, 1.0);
  }

  private assessAccuracy(response: ParsedResponse, spec: DesignSpec): number {
    // Check if semantic types match generated components
    let matches = 0;
    let total = 0;
    
    response.data.components?.forEach((comp: any) => {
      const specComponent = spec.components.find(s => 
        s.name.toLowerCase().includes(comp.componentName.toLowerCase())
      );
      
      if (specComponent) {
        total++;
        if (this.semanticTypeMatches(specComponent.semanticType, comp.codeScaffold)) {
          matches++;
        }
      }
    });
    
    return total > 0 ? matches / total : 0;
  }
}
```

This LLM integration layer transforms design intelligence into actionable development artifacts through structured prompts and intelligent response processing — bridging the gap between design semantics and code generation.