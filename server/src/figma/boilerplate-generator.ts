/**
 * Tech Stack Configuration for Boilerplate Code Generation
 */

export interface TechStackConfig {
  frontend: {
    framework: 'react' | 'vue' | 'angular' | 'svelte' | 'html';
    styling: 'tailwind' | 'css-modules' | 'styled-components' | 'scss' | 'css';
    stateManagement?: 'redux' | 'zustand' | 'pinia' | 'ngrx' | 'none';
    testing?: 'jest' | 'vitest' | 'cypress' | 'playwright' | 'none';
  };
  backend?: {
    language: 'typescript' | 'javascript' | 'python' | 'java' | 'csharp';
    framework: 'express' | 'fastapi' | 'spring' | 'dotnet' | 'none';
  };
  mobile?: {
    platform: 'react-native' | 'flutter' | 'ionic' | 'swift' | 'kotlin';
  };
  deployment: {
    platform: 'vercel' | 'netlify' | 'aws' | 'azure' | 'docker' | 'none';
  };
}

export interface CodeGenerationOptions {
  includeTests: boolean;
  includeStorybook: boolean;
  includeAccessibility: boolean;
  includeResponsive: boolean;
  testing?: 'jest' | 'vitest' | 'cypress' | 'playwright' | 'none';
  componentLibrary?: string; // e.g., 'chakra-ui', 'mui', 'ant-design'
}

/**
 * Boilerplate Code Generator using Figma MCP + Tech Stack Context
 */
export class BoilerplateCodeGenerator {
  private techStack: TechStackConfig;
  private options: CodeGenerationOptions;

  constructor(techStack: TechStackConfig, options: CodeGenerationOptions) {
    this.techStack = techStack;
    this.options = options;
  }

  /**
   * Generate framework-specific code from Figma design
   */
  async generateBoilerplateCode(figmaUrl: string, figmaMCP: any): Promise<{
    component: string;
    styles: string;
    tests?: string;
    story?: string;
    types?: string;
  }> {
    // Get base code from Figma MCP
    const baseCode = await figmaMCP.getCode(figmaUrl, {
      framework: this.techStack.frontend.framework,
      styling: this.techStack.frontend.styling,
      components: this.options.componentLibrary
    });

    // Transform based on tech stack
    const result: {
      component: string;
      styles: string;
      tests?: string;
      story?: string;
      types?: string;
    } = {
      component: this.generateComponentCode(baseCode),
      styles: this.generateStyleCode(baseCode)
    };

    if (this.options.includeTests) {
      result.tests = this.generateTestCode(baseCode);
    }
    
    if (this.options.includeStorybook) {
      result.story = this.generateStoryCode(baseCode);
    }
    
    if (this.techStack.frontend.framework === 'react') {
      result.types = this.generateTypeDefinitions(baseCode);
    }

    return result;
  }

  /**
   * Generate framework-specific component code
   */
  private generateComponentCode(baseCode: any): string {
    const framework = this.techStack.frontend.framework;
    
    switch (framework) {
      case 'react':
        return this.generateReactComponent(baseCode);
      case 'vue':
        return this.generateVueComponent(baseCode);
      case 'angular':
        return this.generateAngularComponent(baseCode);
      case 'svelte':
        return this.generateSvelteComponent(baseCode);
      default:
        return this.generateHTMLComponent(baseCode);
    }
  }

  private generateReactComponent(baseCode: any): string {
    const useTypeScript = this.techStack.backend?.language === 'typescript';
    const stateManagement = this.techStack.frontend.stateManagement;
    
    let imports = [
      `import React${stateManagement === 'redux' ? ', { useSelector, useDispatch }' : ''} from 'react';`
    ];

    if (this.techStack.frontend.styling === 'styled-components') {
      imports.push(`import styled from 'styled-components';`);
    }

    if (this.options.componentLibrary) {
      imports.push(`import { ${this.getComponentImports()} } from '${this.options.componentLibrary}';`);
    }

    const componentName = this.extractComponentName(baseCode);
    const props = useTypeScript ? this.generatePropsInterface(baseCode) : '';

    return `${imports.join('\n')}

${props}

export const ${componentName}${useTypeScript ? ': React.FC<Props>' : ''} = ({ 
  ${this.generatePropsList(baseCode)}
}) => {
  ${this.generateStateLogic()}

  return (
    ${this.convertToReactJSX(baseCode)}
  );
};

export default ${componentName};`;
  }

  private generateVueComponent(baseCode: any): string {
    return `<template>
  ${this.convertToVueTemplate(baseCode)}
</template>

<script${this.techStack.backend?.language === 'typescript' ? ' lang="ts"' : ''}>
${this.generateVueScript(baseCode)}
</script>

<style${this.techStack.frontend.styling === 'scss' ? ' lang="scss"' : ''} scoped>
${this.generateVueStyles(baseCode)}
</style>`;
  }

  private generateAngularComponent(baseCode: any): string {
    const componentName = this.extractComponentName(baseCode);
    
    return `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-${componentName.toLowerCase()}',
  template: \`
    ${this.convertToAngularTemplate(baseCode)}
  \`,
  styleUrls: ['./${componentName.toLowerCase()}.component.${this.techStack.frontend.styling === 'scss' ? 'scss' : 'css'}']
})
export class ${componentName}Component {
  ${this.generateAngularInputs(baseCode)}
}`;
  }

  private generateSvelteComponent(baseCode: any): string {
    return `<script${this.techStack.backend?.language === 'typescript' ? ' lang="ts"' : ''}>
  // Component logic here
</script>

${this.convertToSvelteTemplate(baseCode)}

<style${this.techStack.frontend.styling === 'scss' ? ' lang="scss"' : ''}>
  /* Component styles */
</style>`;
  }

  private generateHTMLComponent(baseCode: any): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Component</title>
  ${this.techStack.frontend.styling === 'tailwind' ? '<script src="https://cdn.tailwindcss.com"></script>' : ''}
</head>
<body>
  ${this.convertToHTMLTemplate(baseCode)}
</body>
</html>`;
  }

  // Helper methods for code generation
  private generateStyleCode(baseCode: any): string {
    const styling = this.techStack.frontend.styling;
    
    switch (styling) {
      case 'tailwind':
        return '// Styles handled by Tailwind classes in component';
      case 'styled-components':
        return this.generateStyledComponents(baseCode);
      case 'css-modules':
        return this.generateCSSModules(baseCode);
      case 'scss':
        return this.generateSCSS(baseCode);
      default:
        return this.generateCSS(baseCode);
    }
  }

  private generateTestCode(baseCode: any): string {
    const framework = this.techStack.frontend.framework;
    const testFramework = this.options.testing || 'jest';
    const componentName = this.extractComponentName(baseCode);

    if (framework === 'react') {
      return `import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  test('renders without crashing', () => {
    render(<${componentName} />);
  });

  test('displays expected content', () => {
    render(<${componentName} />);
    // Add specific test assertions based on Figma design
  });
});`;
    }

    return `// Test code for ${framework} with ${testFramework}`;
  }

  private generateStoryCode(baseCode: any): string {
    const componentName = this.extractComponentName(baseCode);
    
    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ${this.generateStoryArgs(baseCode)}
  },
};

export const Interactive: Story = {
  args: {
    ...Default.args,
  },
};`;
  }

  // Utility methods
  private extractComponentName(_baseCode: any): string {
    // Extract component name from Figma frame name or generate one
    return 'GeneratedComponent';
  }

  private getComponentImports(): string {
    // Return component library specific imports
    return 'Box, Button, Text';
  }

  private generatePropsInterface(_baseCode: any): string {
    return `interface Props {
  className?: string;
  // Add props based on Figma design variables
}`;
  }

  // Additional helper methods
  private generatePropsList(_baseCode: any): string { return ''; }
  private generateStateLogic(): string { return ''; }
  private convertToReactJSX(_baseCode: any): string { return '<div></div>'; }
  private convertToVueTemplate(_baseCode: any): string { return '<div></div>'; }
  private convertToSvelteTemplate(_baseCode: any): string { return '<div></div>'; }
  private convertToHTMLTemplate(_baseCode: any): string { return '<div></div>'; }
  private generateVueScript(_baseCode: any): string { return ''; }
  private generateVueStyles(_baseCode: any): string { return ''; }
  private convertToAngularTemplate(_baseCode: any): string { return '<div></div>'; }
  private generateAngularInputs(_baseCode: any): string { return ''; }
  private generateStyledComponents(_baseCode: any): string { return ''; }
  private generateCSSModules(_baseCode: any): string { return ''; }
  private generateSCSS(_baseCode: any): string { return ''; }
  private generateCSS(_baseCode: any): string { return ''; }
  private generateTypeDefinitions(_baseCode: any): string { return ''; }
  private generateStoryArgs(_baseCode: any): string { return ''; }
}