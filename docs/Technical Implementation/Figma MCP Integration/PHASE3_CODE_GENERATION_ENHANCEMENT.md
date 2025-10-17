# 🚀 Phase 3: Code Generation Enhancement - Design Document

## **Branch**: `feature/phase3-code-generation-enhancement`

## **Objective**
Enhance code generation capabilities to produce framework-specific, design-aware components based on the combined insights from enhanced tech stack analysis and Figma MCP integration.

## **Prerequisites**
- ✅ Phase 1: Enhanced tech stack analysis with design patterns
- ✅ Phase 2: Figma MCP connection with design context
- ✅ MCP server generating basic React/TypeScript boilerplate

## **Code Generation Architecture**

### **1. Framework-Specific Generation**
**Objective**: Generate tailored components for detected tech stacks

**Supported Frameworks**:
```javascript
const FRAMEWORK_GENERATORS = {
  react: new ReactComponentGenerator(),
  vue: new VueComponentGenerator(), 
  angular: new AngularComponentGenerator(),
  svelte: new SvelteComponentGenerator()
};

// Framework detection and generator selection
const selectGenerator = (enhancedTechStack) => {
  const { stack, designContext, confidence } = enhancedTechStack;
  
  if (stack.includes('React') || stack.includes('Next.js')) {
    return FRAMEWORK_GENERATORS.react;
  } else if (stack.includes('Vue') || stack.includes('Nuxt.js')) {
    return FRAMEWORK_GENERATORS.vue;
  } else if (stack.includes('Angular')) {
    return FRAMEWORK_GENERATORS.angular;
  } else if (stack.includes('Svelte')) {
    return FRAMEWORK_GENERATORS.svelte;
  }
  
  // Default to React for unknown stacks
  return FRAMEWORK_GENERATORS.react;
};
```

### **2. React Component Generator (Enhanced)**
**Objective**: Generate comprehensive React components with modern patterns

```javascript
class ReactComponentGenerator {
  async generateComponent(designContext, componentSpec) {
    const { patterns, components, complexity } = designContext;
    
    return {
      component: await this.generateReactComponent(componentSpec),
      types: await this.generateTypeScriptTypes(componentSpec),
      styles: await this.generateStyledComponents(componentSpec),
      tests: await this.generateTestSuite(componentSpec),
      story: await this.generateStorybook(componentSpec),
      hooks: await this.generateCustomHooks(componentSpec)
    };
  }

  async generateReactComponent(spec) {
    const { name, type, props, designPatterns } = spec;
    
    let template = `import React from 'react';\n`;
    
    // Add imports based on detected patterns
    if (designPatterns.includes('form')) {
      template += `import { useForm } from 'react-hook-form';\n`;
      template += `import { zodResolver } from '@hookform/resolvers/zod';\n`;
    }
    
    if (designPatterns.includes('state-management')) {
      template += `import { useState, useEffect } from 'react';\n`;
    }
    
    template += `import { ${name}Props } from './${name}.types';\n`;
    template += `import { Styled${name} } from './${name}.styles';\n\n`;
    
    // Generate component based on type
    switch (type) {
      case 'form':
        return this.generateFormComponent(name, props, template);
      case 'card':
        return this.generateCardComponent(name, props, template);
      case 'navigation':
        return this.generateNavigationComponent(name, props, template);
      default:
        return this.generateGenericComponent(name, props, template);
    }
  }

  generateFormComponent(name, props, template) {
    return template + `
export const ${name}: React.FC<${name}Props> = ({
  onSubmit,
  validationSchema,
  defaultValues,
  ...props
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues
  });

  return (
    <Styled${name} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Generated form fields based on design analysis */}
        ${this.generateFormFields(props.fields)}
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </Styled${name}>
  );
};

export default ${name};`;
  }

  generateCardComponent(name, props, template) {
    return template + `
export const ${name}: React.FC<${name}Props> = ({
  title,
  content,
  actions,
  variant = 'default',
  ...props
}) => {
  return (
    <Styled${name} variant={variant} {...props}>
      {title && (
        <div className="card-header">
          <h3>{title}</h3>
        </div>
      )}
      
      <div className="card-content">
        {content}
      </div>
      
      {actions && (
        <div className="card-actions">
          {actions}
        </div>
      )}
    </Styled${name}>
  );
};

export default ${name};`;
  }
}
```

### **3. Vue Component Generator**
**Objective**: Generate Vue 3 components with Composition API

```javascript
class VueComponentGenerator {
  async generateComponent(designContext, componentSpec) {
    const { name, type, props, designPatterns } = componentSpec;
    
    return {
      component: this.generateVueComponent(componentSpec),
      types: this.generateVueTypes(componentSpec),
      styles: this.generateVueStyles(componentSpec),
      tests: this.generateVueTests(componentSpec)
    };
  }

  generateVueComponent(spec) {
    const { name, type, props } = spec;
    
    return `<template>
  <div class="${name.toLowerCase()}">
    ${this.generateVueTemplate(type, props)}
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { ${name}Props } from './${name}.types';

${this.generateVueComposition(type, props)}
</script>

<style scoped>
${this.generateVueStyles(spec)}
</style>`;
  }
}
```

### **4. Design System Integration**
**Objective**: Generate components that align with detected design systems

```javascript
class DesignSystemIntegration {
  detectDesignSystem(designContext) {
    const { patterns, components, figmaData } = designContext;
    
    // Detect popular design systems
    if (this.isMaterialDesign(figmaData)) {
      return 'material-ui';
    } else if (this.isAntDesign(figmaData)) {
      return 'ant-design';
    } else if (this.isChakraUI(figmaData)) {
      return 'chakra-ui';
    } else if (this.isTailwindCSS(figmaData)) {
      return 'tailwindcss';
    }
    
    return 'custom';
  }

  generateWithDesignSystem(componentSpec, designSystem) {
    switch (designSystem) {
      case 'material-ui':
        return this.generateMaterialUIComponent(componentSpec);
      case 'ant-design':
        return this.generateAntDesignComponent(componentSpec);
      case 'chakra-ui':
        return this.generateChakraUIComponent(componentSpec);
      case 'tailwindcss':
        return this.generateTailwindComponent(componentSpec);
      default:
        return this.generateCustomComponent(componentSpec);
    }
  }

  generateMaterialUIComponent(spec) {
    return `
import { 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Typography 
} from '@mui/material';

export const ${spec.name} = ({ title, content, actions }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2">
          {title}
        </Typography>
        <Typography variant="body2">
          {content}
        </Typography>
      </CardContent>
      {actions && (
        <CardActions>
          {actions}
        </CardActions>
      )}
    </Card>
  );
};`;
  }
}
```

### **5. Responsive Code Generation**
**Objective**: Generate responsive components based on Figma auto-layout

```javascript
class ResponsiveCodeGenerator {
  analyzeResponsivePatterns(figmaData) {
    return {
      breakpoints: this.detectBreakpoints(figmaData),
      layoutSystem: this.detectLayoutSystem(figmaData), // grid, flexbox, css-grid
      responsiveRules: this.extractResponsiveRules(figmaData)
    };
  }

  generateResponsiveStyles(componentSpec, responsiveData) {
    const { breakpoints, layoutSystem, responsiveRules } = responsiveData;
    
    if (layoutSystem === 'css-grid') {
      return this.generateGridStyles(componentSpec, responsiveRules);
    } else if (layoutSystem === 'flexbox') {
      return this.generateFlexStyles(componentSpec, responsiveRules);
    }
    
    return this.generateDefaultResponsiveStyles(componentSpec);
  }

  generateGridStyles(spec, rules) {
    return `
const StyledGrid = styled.div\`
  display: grid;
  grid-template-columns: ${rules.desktop.columns};
  gap: ${rules.desktop.gap};
  
  @media (max-width: 768px) {
    grid-template-columns: ${rules.tablet.columns};
    gap: ${rules.tablet.gap};
  }
  
  @media (max-width: 480px) {
    grid-template-columns: ${rules.mobile.columns};
    gap: ${rules.mobile.gap};
  }
\`;`;
  }
}
```

### **6. Enhanced MCP Integration**
**Objective**: Extend MCP server to handle advanced code generation

```javascript
// In server/src/tools/enhanced-code-generator.ts
export class EnhancedCodeGeneratorTool {
  async generateFrameworkCode(params) {
    const { 
      framework, 
      designContext, 
      componentSpecs, 
      designSystem 
    } = params;
    
    try {
      const generator = this.getFrameworkGenerator(framework);
      const dsIntegration = new DesignSystemIntegration();
      
      // Detect design system from context
      const detectedDS = dsIntegration.detectDesignSystem(designContext);
      const targetDS = designSystem || detectedDS;
      
      const generatedComponents = await Promise.all(
        componentSpecs.map(async (spec) => {
          const component = await generator.generateComponent(designContext, spec);
          
          // Apply design system integration
          if (targetDS !== 'custom') {
            component.enhanced = dsIntegration.generateWithDesignSystem(spec, targetDS);
          }
          
          return component;
        })
      );
      
      return {
        success: true,
        framework,
        designSystem: targetDS,
        components: generatedComponents,
        metadata: {
          generatedAt: new Date().toISOString(),
          designPatterns: designContext.patterns,
          componentCount: componentSpecs.length
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: await this.generateBasicBoilerplate(framework)
      };
    }
  }
}
```

## **UI Enhancements**

### **1. Code Generation Results Display**
```html
<div class="code-generation-results" id="codeResults" style="display: none;">
  <h3>🚀 Generated Code</h3>
  
  <div class="generation-summary">
    <div class="framework-badge" id="detectedFramework"></div>
    <div class="design-system-badge" id="detectedDesignSystem"></div>
    <div class="component-count" id="componentCount"></div>
  </div>
  
  <div class="code-tabs">
    <button class="tab-button active" data-tab="component">Component</button>
    <button class="tab-button" data-tab="types">Types</button>
    <button class="tab-button" data-tab="styles">Styles</button>
    <button class="tab-button" data-tab="tests">Tests</button>
    <button class="tab-button" data-tab="story">Storybook</button>
  </div>
  
  <div class="code-content">
    <pre><code id="generatedCode" class="language-typescript"></code></pre>
  </div>
  
  <div class="code-actions">
    <button id="copyCode" class="btn-secondary">📋 Copy Code</button>
    <button id="downloadCode" class="btn-secondary">💾 Download</button>
    <button id="openInSandbox" class="btn-primary">🏗️ Open in CodeSandbox</button>
  </div>
</div>
```

### **2. Framework Selection**
```javascript
const updateFrameworkOptions = (detectedFrameworks) => {
  const selector = document.getElementById('frameworkSelector');
  selector.innerHTML = detectedFrameworks.map(fw => 
    `<option value="${fw.name}" ${fw.confidence > 0.7 ? 'selected' : ''}>
      ${fw.name} (${Math.round(fw.confidence * 100)}%)
    </option>`
  ).join('');
};
```

## **Implementation Plan**

### **Week 1: Framework Generators**
- [ ] Implement React component generator with modern patterns
- [ ] Create Vue 3 component generator with Composition API
- [ ] Add Angular component generator with latest features
- [ ] Build Svelte component generator for performance-focused apps

### **Week 2: Design System Integration**
- [ ] Implement design system detection algorithms
- [ ] Create Material-UI component generators
- [ ] Add Ant Design component generators
- [ ] Implement Chakra UI and Tailwind CSS generators

### **Week 3: Advanced Features**
- [ ] Add responsive code generation based on Figma auto-layout
- [ ] Implement custom hooks generation for React
- [ ] Create comprehensive test suite generation
- [ ] Add Storybook story generation

### **Week 4: MCP Integration & UI**
- [ ] Extend MCP server with enhanced code generation tools
- [ ] Integrate code generation results in UI
- [ ] Add code preview, copy, and download functionality
- [ ] Implement CodeSandbox integration for live preview

## **Success Metrics**
- [ ] **Framework Accuracy**: Generate correct syntax for React, Vue, Angular (>95%)
- [ ] **Design System Integration**: Properly detect and integrate 5+ design systems
- [ ] **Code Quality**: Generated code follows best practices and is production-ready
- [ ] **Responsiveness**: Generated components handle responsive design correctly

## **Testing Strategy**

### **Component Generation Tests**
```javascript
describe('React Component Generator', () => {
  test('should generate form component with react-hook-form', async () => {
    const spec = createFormComponentSpec();
    const generator = new ReactComponentGenerator();
    const result = await generator.generateComponent(mockDesignContext, spec);
    
    expect(result.component).toContain('useForm');
    expect(result.component).toContain('react-hook-form');
    expect(result.types).toBeDefined();
  });
});

describe('Design System Integration', () => {
  test('should detect Material-UI from design context', () => {
    const integration = new DesignSystemIntegration();
    const system = integration.detectDesignSystem(mockMaterialDesignContext);
    expect(system).toBe('material-ui');
  });
});
```

## **Dependencies**
- Phase 1 & 2: Enhanced analysis and MCP connection
- Framework-specific knowledge bases
- Design system component libraries
- Code generation templates

---
**Ready for Development**: This phase transforms our design insights into production-ready, framework-specific code that developers can immediately use in their projects.