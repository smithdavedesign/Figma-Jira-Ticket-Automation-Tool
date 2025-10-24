/**
 * 🤖 GPT-4 AI Adapter - Code Generation & Implementation
 * 
 * Specialized adapter for OpenAI's GPT-4 model, optimized for:
 * - React/Vue/Angular component generation
 * - TypeScript code with proper typing
 * - Test suite generation
 * - Build configuration and tooling
 */

import { DesignSpec, DesignComponent } from '../../design-intelligence/schema/design-spec.js';
import { CodeGenerationResult } from '../orchestrator.js';

export interface GPT4Config {
  apiKey: string;
  model: 'gpt-4' | 'gpt-4-turbo' | 'gpt-4-32k';
  temperature: number;
  maxTokens: number;
  organization?: string;
}

export interface CodeGenerationOptions {
  framework: 'react' | 'vue' | 'angular' | 'svelte';
  language: 'typescript' | 'javascript';
  styling: 'css-modules' | 'styled-components' | 'tailwind' | 'scss';
  includeTests: boolean;
  includeStorybook: boolean;
  includeTypes: boolean;
  accessibility: boolean;
  responsive: boolean;
}

export class GPT4Adapter {
  private config: GPT4Config;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor(config: GPT4Config) {
    this.config = config;
  }

  /**
   * Generate complete code implementation from design spec
   */
  async generateCode(
    designSpec: DesignSpec,
    options: CodeGenerationOptions
  ): Promise<CodeGenerationResult> {
    const startTime = Date.now();

    try {
      console.log(`💻 Generating ${options.framework} code with GPT-4...`);

      // Generate components in parallel for better performance
      const componentPromises = designSpec.components.map(component => 
        this.generateSingleComponent(component, designSpec, options)
      );

      const components = await Promise.all(componentPromises);

      // Generate utilities and helpers
      const utilities = await this.generateUtilities(designSpec, options);

      // Generate tests if requested
      const tests = options.includeTests 
        ? await this.generateTests(components, options)
        : [];

      // Generate build configuration
      const buildConfig = await this.generateBuildConfig(designSpec, options);

      // Extract dependencies
      const dependencies = this.extractDependencies(components, options);

      const processingTime = Date.now() - startTime;

      return {
        components,
        utilities,
        tests,
        buildConfig,
        dependencies,
        metadata: {
          model: this.config.model,
          processingTime,
          framework: options.framework,
          confidence: this.calculateConfidence(components)
        }
      };

    } catch (error) {
      console.error('❌ GPT-4 code generation failed:', error);
      throw new Error(`GPT-4 adapter failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate optimized component code with performance considerations
   */
  async generateOptimizedComponent(
    component: DesignComponent,
    designSpec: DesignSpec,
    options: CodeGenerationOptions & {
      optimizations: string[];
      targetBundle: 'minimal' | 'standard' | 'full';
    }
  ): Promise<GeneratedComponent> {
    const prompt = this.buildOptimizedComponentPrompt(component, designSpec, options);
    const response = await this.callGPT4API(prompt, {
      temperature: 0.1, // Lower temperature for more consistent code
      maxTokens: 3000
    });

    return this.parseComponentResponse(response, component, options);
  }

  /**
   * Generate comprehensive test suite
   */
  async generateTestSuite(
    components: GeneratedComponent[],
    designSpec: DesignSpec,
    options: {
      testFramework: 'jest' | 'vitest' | 'cypress';
      testTypes: ('unit' | 'integration' | 'e2e')[];
      coverage: number;
    }
  ): Promise<GeneratedTest[]> {
    const tests: GeneratedTest[] = [];

    for (const component of components) {
      const prompt = this.buildTestPrompt(component, designSpec, options);
      const response = await this.callGPT4API(prompt, { temperature: 0.2 });
      
      tests.push({
        componentName: component.name,
        testCode: response.content,
        framework: options.testFramework,
        coverage: options.coverage
      });
    }

    return tests;
  }

  /**
   * Refactor existing code with improvements
   */
  async refactorCode(
    existingCode: string,
    improvements: string[],
    options: {
      framework: string;
      focusAreas: string[];
      maintainCompatibility: boolean;
    }
  ): Promise<{
    refactoredCode: string;
    changes: CodeChange[];
    warnings: string[];
  }> {
    const prompt = this.buildRefactoringPrompt(existingCode, improvements, options);
    const response = await this.callGPT4API(prompt, { temperature: 0.3 });
    
    return this.parseRefactoringResponse(response);
  }

  // =============================================================================
  // COMPONENT GENERATION METHODS
  // =============================================================================

  private async generateSingleComponent(
    component: DesignComponent,
    designSpec: DesignSpec,
    options: CodeGenerationOptions
  ): Promise<GeneratedComponent> {
    const prompt = this.buildComponentPrompt(component, designSpec, options);
    const response = await this.callGPT4API(prompt, { temperature: 0.15 });
    
    return this.parseComponentResponse(response, component, options);
  }

  private buildComponentPrompt(
    component: DesignComponent,
    designSpec: DesignSpec,
    options: CodeGenerationOptions
  ): string {
    const designTokens = this.formatDesignTokens(designSpec.designTokens);
    const accessibilityInfo = this.formatAccessibilityInfo(component);

    return `
# ${options.framework.toUpperCase()} Component Generation

Generate a production-ready ${options.framework} component with ${options.language} based on this design specification.

## Component Specification:
\`\`\`json
${JSON.stringify({
  name: component.name,
  type: component.semantic.intent,
  role: component.semantic.role,
  dimensions: component.visual.dimensions,
  hasText: !!component.content.text,
  isInteractive: component.framework.events.length > 0,
  suggestedTag: component.framework.suggestedTag,
  events: component.framework.events,
  states: component.framework.states.map(s => s.name)
}, null, 2)}
\`\`\`

## Design Tokens Available:
${designTokens}

## Accessibility Requirements:
${accessibilityInfo}

## Technical Requirements:
- Framework: ${options.framework}
- Language: ${options.language}
- Styling: ${options.styling}
- Include TypeScript types: ${options.includeTypes}
- Responsive design: ${options.responsive}
- Accessibility compliant: ${options.accessibility}

## Component Requirements:
1. **Proper ${options.framework} patterns**: Use modern ${options.framework} best practices
2. **TypeScript support**: ${options.includeTypes ? 'Full TypeScript with proper interfaces' : 'JavaScript with JSDoc'}
3. **Styling approach**: Implement using ${options.styling}
4. **Accessibility**: ${options.accessibility ? 'WCAG 2.1 AA compliant with proper ARIA attributes' : 'Basic accessibility'}
5. **Responsive**: ${options.responsive ? 'Mobile-first responsive design' : 'Fixed desktop layout'}
6. **Events**: Implement ${component.framework.events.join(', ')} handlers
7. **States**: Support ${component.framework.states.map(s => s.name).join(', ')} states

## Expected Output:
Generate ONLY the component code with:
- Main component file
- ${options.includeTypes ? 'TypeScript interfaces/types' : 'PropTypes or equivalent'}
- ${options.styling === 'css-modules' ? 'CSS module styles' : options.styling === 'styled-components' ? 'Styled components' : 'CSS/SCSS styles'}
- Proper exports and imports

Make the code:
- Production-ready and performant
- Well-documented with comments
- Following ${options.framework} conventions
- Accessible and semantic
- Easy to maintain and extend

Generate the component now:
`;
  }

  private buildOptimizedComponentPrompt(
    component: DesignComponent,
    designSpec: DesignSpec,
    options: any
  ): string {
    return `
# Optimized ${options.framework.toUpperCase()} Component Generation

Generate a highly optimized ${options.framework} component focused on performance and bundle size.

## Component: ${component.name}
${JSON.stringify(component.semantic, null, 2)}

## Optimization Requirements:
${options.optimizations.map((opt: string) => `- ${opt}`).join('\n')}

## Target Bundle: ${options.targetBundle}

Focus on:
1. Minimal bundle size
2. Optimal runtime performance  
3. Lazy loading where appropriate
4. Tree-shakeable exports
5. Efficient re-renders

Generate optimized code with detailed comments explaining performance considerations.
`;
  }

  private buildTestPrompt(
    component: GeneratedComponent,
    designSpec: DesignSpec,
    options: any
  ): string {
    return `
# Comprehensive Test Suite Generation

Generate thorough tests for this ${component.framework} component using ${options.testFramework}.

## Component Code:
\`\`\`${component.framework}
${component.code}
\`\`\`

## Test Requirements:
- Test framework: ${options.testFramework}
- Test types: ${options.testTypes.join(', ')}
- Target coverage: ${options.coverage}%

Generate tests that cover:
1. Component rendering
2. Props handling  
3. Event interactions
4. State changes
5. Accessibility features
6. Edge cases and error handling

Include setup, teardown, and mocking as needed.
`;
  }

  private buildUtilitiesPrompt(
    designSpec: DesignSpec,
    options: CodeGenerationOptions
  ): string {
    return `
# Utility Functions Generation

Generate utility functions and helpers for this ${options.framework} project.

## Design System Context:
- Colors: ${designSpec.designTokens.colors.length} tokens
- Typography: ${designSpec.designTokens.typography.length} styles  
- Components: ${designSpec.components.length} components

## Required Utilities:
1. Design token helpers (colors, typography, spacing)
2. Responsive utilities (breakpoints, media queries)
3. Accessibility helpers (focus management, ARIA)
4. Animation/transition utilities
5. Form validation helpers
6. Common UI utilities

Generate ${options.language} utilities with proper typing and documentation.
`;
  }

  private buildBuildConfigPrompt(
    designSpec: DesignSpec,
    options: CodeGenerationOptions
  ): string {
    return `
# Build Configuration Generation

Generate build configuration for a ${options.framework} project with these components.

## Project Context:
- Framework: ${options.framework}
- Language: ${options.language}
- Styling: ${options.styling}
- Components: ${designSpec.components.length}
- Include Storybook: ${options.includeStorybook}

Generate configuration for:
1. Build tool setup (Vite/Webpack/etc)
2. TypeScript configuration (if applicable)
3. Styling setup (${options.styling})
4. Testing configuration
5. Linting and formatting
6. Development server

Provide modern, optimized configuration with good defaults.
`;
  }

  private buildRefactoringPrompt(
    existingCode: string,
    improvements: string[],
    options: any
  ): string {
    return `
# Code Refactoring

Refactor this ${options.framework} code with the following improvements:

## Current Code:
\`\`\`${options.framework}
${existingCode}
\`\`\`

## Requested Improvements:
${improvements.map(imp => `- ${imp}`).join('\n')}

## Focus Areas:
${options.focusAreas.map((area: string) => `- ${area}`).join('\n')}

## Constraints:
- Maintain compatibility: ${options.maintainCompatibility}
- Keep existing API surface when possible
- Provide clear migration notes if breaking changes

Provide the refactored code with detailed change explanations.
`;
  }

  // =============================================================================
  // API INTERACTION METHODS
  // =============================================================================

  private async callGPT4API(
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<GPT4Response> {
    // Mock implementation - would call actual OpenAI GPT-4 API
    console.log(`🤖 Calling GPT-4 API with prompt length: ${prompt.length}`);
    
    // Simulate API response time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      content: this.generateMockCode(prompt),
      usage: {
        promptTokens: Math.floor(prompt.length / 4),
        completionTokens: 1200,
        totalTokens: Math.floor(prompt.length / 4) + 1200
      },
      finishReason: 'stop'
    };
  }

  private generateMockCode(prompt: string): string {
    const framework = this.extractFramework(prompt);
    const componentName = this.extractComponentName(prompt);
    const isTypeScript = prompt.includes('typescript') || prompt.includes('TypeScript');

    if (framework === 'react') {
      return this.generateMockReactComponent(componentName, isTypeScript);
    } else if (framework === 'vue') {
      return this.generateMockVueComponent(componentName, isTypeScript);
    } else if (framework === 'angular') {
      return this.generateMockAngularComponent(componentName, isTypeScript);
    }

    return this.generateMockReactComponent(componentName, isTypeScript);
  }

  // =============================================================================
  // MOCK CODE GENERATORS
  // =============================================================================

  private generateMockReactComponent(name: string, isTypeScript: boolean): string {
    const extension = isTypeScript ? 'tsx' : 'jsx';
    const typeAnnotations = isTypeScript ? `
interface Props {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}` : '';

    return `
${typeAnnotations}

import React from 'react';
import styles from './${name}.module.css';

${isTypeScript ? `const ${name}: React.FC<Props> = ({` : `const ${name} = ({`}
  children,
  className = '',
  onClick,
  disabled = false,
  ...props
${isTypeScript ? '}) => {' : '}) => {'}
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button 
      className={\`\${styles.${name.toLowerCase()}} \${className}\`.trim()}
      onClick={handleClick}
      disabled={disabled}
      aria-label="${name} component"
      {...props}
    >
      {children}
    </button>
  );
};

export default ${name};
`;
  }

  private generateMockVueComponent(name: string, isTypeScript: boolean): string {
    const scriptLang = isTypeScript ? ' lang="ts"' : '';
    
    return `
<template>
  <button 
    :class="[\`${name.toLowerCase()}\`, className]"
    :disabled="disabled"
    @click="handleClick"
    :aria-label="\`${name} component\`"
  >
    <slot></slot>
  </button>
</template>

<script${scriptLang}>
import { defineComponent } from 'vue';

export default defineComponent({
  name: '${name}',
  props: {
    className: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  methods: {
    handleClick() {
      if (!this.disabled) {
        this.$emit('click');
      }
    }
  }
});
</script>

<style scoped>
.${name.toLowerCase()} {
  /* Component styles */
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.${name.toLowerCase()}:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
`;
  }

  private generateMockAngularComponent(name: string, isTypeScript: boolean): string {
    return `
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-${name.toLowerCase()}',
  template: \`
    <button 
      [class]="${name.toLowerCase()} + ' ' + className"
      [disabled]="disabled"
      (click)="handleClick()"
      [attr.aria-label]="${name} component"
    >
      <ng-content></ng-content>
    </button>
  \`,
  styles: [\`
    .${name.toLowerCase()} {
      padding: 0.5rem 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #fff;
      cursor: pointer;
    }
    
    .${name.toLowerCase()}:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  \`]
})
export class ${name}Component {
  @Input() className: string = '';
  @Input() disabled: boolean = false;
  @Output() clicked = new EventEmitter<void>();

  handleClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
`;
  }

  // =============================================================================
  // RESPONSE PARSING METHODS
  // =============================================================================

  private parseComponentResponse(
    response: GPT4Response,
    component: DesignComponent,
    options: CodeGenerationOptions
  ): GeneratedComponent {
    return {
      name: component.name,
      code: response.content,
      framework: options.framework,
      dependencies: this.extractCodeDependencies(response.content, options.framework),
      exports: this.extractExports(response.content)
    };
  }

  private parseRefactoringResponse(response: GPT4Response): {
    refactoredCode: string;
    changes: CodeChange[];
    warnings: string[];
  } {
    return {
      refactoredCode: response.content,
      changes: this.extractChanges(response.content),
      warnings: this.extractWarnings(response.content)
    };
  }

  private async generateUtilities(
    designSpec: DesignSpec,
    options: CodeGenerationOptions
  ): Promise<GeneratedUtility[]> {
    const prompt = this.buildUtilitiesPrompt(designSpec, options);
    const response = await this.callGPT4API(prompt, { temperature: 0.2 });
    
    return this.parseUtilitiesResponse(response);
  }

  private async generateTests(
    components: GeneratedComponent[],
    options: CodeGenerationOptions
  ): Promise<GeneratedTest[]> {
    const tests: GeneratedTest[] = [];
    
    for (const component of components) {
      const testCode = this.generateMockTestCode(component);
      tests.push({
        componentName: component.name,
        testCode,
        framework: 'jest',
        coverage: 85
      });
    }
    
    return tests;
  }

  private async generateBuildConfig(
    designSpec: DesignSpec,
    options: CodeGenerationOptions
  ): Promise<string> {
    const prompt = this.buildBuildConfigPrompt(designSpec, options);
    const response = await this.callGPT4API(prompt, { temperature: 0.1 });
    
    return response.content;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private calculateConfidence(components: GeneratedComponent[]): number {
    // Mock confidence calculation based on component complexity
    return 0.94;
  }

  private extractDependencies(
    components: GeneratedComponent[],
    options: CodeGenerationOptions
  ): string[] {
    const deps = new Set<string>();
    
    // Framework dependencies
    switch (options.framework) {
      case 'react':
        deps.add('react');
        if (options.language === 'typescript') deps.add('@types/react');
        break;
      case 'vue':
        deps.add('vue');
        break;
      case 'angular':
        deps.add('@angular/core');
        deps.add('@angular/common');
        break;
    }

    // Styling dependencies
    switch (options.styling) {
      case 'styled-components':
        deps.add('styled-components');
        break;
      case 'tailwind':
        deps.add('tailwindcss');
        break;
    }

    return Array.from(deps);
  }

  private formatDesignTokens(tokens: any): string {
    return `
Colors: ${tokens.colors.length} tokens
Typography: ${tokens.typography.length} styles
Spacing: ${tokens.spacing.length} values
`;
  }

  private formatAccessibilityInfo(component: DesignComponent): string {
    return `
Role: ${component.semantic.role}
Interactive: ${component.framework.events.length > 0}
Keyboard accessible: ${component.framework.events.includes('onKeyPress')}
`;
  }

  private extractFramework(prompt: string): string {
    if (prompt.toLowerCase().includes('react')) return 'react';
    if (prompt.toLowerCase().includes('vue')) return 'vue';
    if (prompt.toLowerCase().includes('angular')) return 'angular';
    return 'react';
  }

  private extractComponentName(prompt: string): string {
    const nameMatch = prompt.match(/"name":\s*"([^"]+)"/);
    return nameMatch ? nameMatch[1] : 'Component';
  }

  private extractCodeDependencies(code: string, framework: string): string[] {
    const deps: string[] = [];
    const importLines = code.split('\n').filter(line => line.trim().startsWith('import'));
    
    importLines.forEach(line => {
      const match = line.match(/from\s+['"]([^'"]+)['"]/);
      if (match && !match[1].startsWith('.')) {
        deps.push(match[1]);
      }
    });
    
    return deps;
  }

  private extractExports(code: string): string[] {
    const exports: string[] = [];
    const exportMatches = code.match(/export\s+(?:default\s+)?(\w+)/g);
    
    if (exportMatches) {
      exportMatches.forEach(match => {
        const name = match.replace(/export\s+(?:default\s+)?/, '');
        exports.push(name);
      });
    }
    
    return exports;
  }

  private extractChanges(content: string): CodeChange[] {
    // Mock change extraction
    return [
      {
        type: 'addition',
        description: 'Added TypeScript interfaces',
        impact: 'improved type safety'
      }
    ];
  }

  private extractWarnings(content: string): string[] {
    return ['Consider updating dependencies for better performance'];
  }

  private parseUtilitiesResponse(response: GPT4Response): GeneratedUtility[] {
    return [
      {
        name: 'designTokens',
        code: response.content,
        description: 'Design token utilities for consistent styling',
        dependencies: []
      }
    ];
  }

  private generateMockTestCode(component: GeneratedComponent): string {
    return `
import { render, screen, fireEvent } from '@testing-library/react';
import ${component.name} from './${component.name}';

describe('${component.name}', () => {
  it('renders correctly', () => {
    render(<${component.name}>Test</${component.name}>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<${component.name} onClick={handleClick}>Click me</${component.name}>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('respects disabled state', () => {
    const handleClick = jest.fn();
    render(<${component.name} disabled onClick={handleClick}>Disabled</${component.name}>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
`;
  }
}

// =============================================================================
// SUPPORTING INTERFACES
// =============================================================================

interface GPT4Response {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'content_filter';
}

interface GeneratedComponent {
  name: string;
  code: string;
  framework: string;
  dependencies: string[];
  exports: string[];
}

interface GeneratedUtility {
  name: string;
  code: string;
  description: string;
  dependencies: string[];
}

interface GeneratedTest {
  componentName: string;
  testCode: string;
  framework: string;
  coverage: number;
}

interface CodeChange {
  type: 'addition' | 'modification' | 'deletion';
  description: string;
  impact: string;
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createGPT4Adapter(config: GPT4Config): GPT4Adapter {
  return new GPT4Adapter(config);
}

export default GPT4Adapter;