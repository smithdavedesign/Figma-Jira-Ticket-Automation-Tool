# 📋 Phase 3: Code Generation Enhancement - Line Item Implementation Plan

## **Branch**: `feature/phase3-code-generation-enhancement`

## **Prerequisites:** Phase 1 & 2 completed and merged to main integration branch

---

## **Line Item 3.1: Framework Generator Architecture**

### **Implementation Steps:**
1. [ ] **3.1.1** - Create abstract `BaseComponentGenerator` class
2. [ ] **3.1.2** - Implement `ReactComponentGenerator` class
3. [ ] **3.1.3** - Implement `VueComponentGenerator` class
4. [ ] **3.1.4** - Implement `AngularComponentGenerator` class
5. [ ] **3.1.5** - Create framework selection logic

### **Test Cases:**
```javascript
// Test file: tests/phase3/framework-generators.test.js
describe('Framework Generator Architecture', () => {
  test('should select correct generator based on tech stack', () => {
    const reactStack = { stack: ['React', 'TypeScript'], designContext: {} };
    const generator = selectGenerator(reactStack);
    expect(generator).toBeInstanceOf(ReactComponentGenerator);
  });

  test('should default to React generator for unknown frameworks', () => {
    const unknownStack = { stack: ['UnknownFramework'], designContext: {} };
    const generator = selectGenerator(unknownStack);
    expect(generator).toBeInstanceOf(ReactComponentGenerator);
  });

  describe('ReactComponentGenerator', () => {
    test('should generate basic React component structure', async () => {
      const generator = new ReactComponentGenerator();
      const spec = createBasicComponentSpec();
      
      const result = await generator.generateComponent({}, spec);
      
      expect(result.component).toContain('import React from \'react\'');
      expect(result.component).toContain(`export const ${spec.name}`);
      expect(result.types).toBeDefined();
      expect(result.styles).toBeDefined();
    });
  });

  describe('VueComponentGenerator', () => {
    test('should generate Vue 3 component with Composition API', async () => {
      const generator = new VueComponentGenerator();
      const spec = createBasicComponentSpec();
      
      const result = await generator.generateComponent({}, spec);
      
      expect(result.component).toContain('<script setup lang="ts">');
      expect(result.component).toContain('import { ref, computed }');
      expect(result.types).toBeDefined();
    });
  });
});
```

### **Acceptance Criteria:**
- [ ] Framework-specific generators implemented for React, Vue, Angular
- [ ] Correct generator selection based on detected tech stack
- [ ] Consistent API across all generators
- [ ] Generated code follows framework best practices
- [ ] 100% test coverage for generator selection and basic generation

---

## **Line Item 3.2: React Component Generation Enhancement**

### **Implementation Steps:**
1. [ ] **3.2.1** - Implement form component generation with react-hook-form
2. [ ] **3.2.2** - Implement card component generation
3. [ ] **3.2.3** - Implement navigation component generation
4. [ ] **3.2.4** - Add custom hooks generation
5. [ ] **3.2.5** - Implement TypeScript interface generation

### **Test Cases:**
```javascript
// Test file: tests/phase3/react-component-generation.test.js
describe('React Component Generation', () => {
  describe('Form Component Generation', () => {
    test('should generate form component with react-hook-form integration', async () => {
      const generator = new ReactComponentGenerator();
      const formSpec = {
        name: 'ContactForm',
        type: 'form',
        props: { fields: ['name', 'email', 'message'] },
        designPatterns: ['form']
      };
      
      const result = await generator.generateComponent({}, formSpec);
      
      expect(result.component).toContain('useForm');
      expect(result.component).toContain('zodResolver');
      expect(result.component).toContain('handleSubmit');
      expect(result.component).toContain('register');
    });

    test('should generate form fields based on design analysis', async () => {
      const generator = new ReactComponentGenerator();
      const formSpec = createFormSpecWithFields();
      
      const result = await generator.generateComponent({}, formSpec);
      
      expect(result.component).toContain('input[name="email"]');
      expect(result.component).toContain('type="email"');
      expect(result.component).toContain('required');
    });
  });

  describe('Card Component Generation', () => {
    test('should generate card component with proper structure', async () => {
      const generator = new ReactComponentGenerator();
      const cardSpec = {
        name: 'ProductCard',
        type: 'card',
        props: { title: 'string', content: 'ReactNode', actions: 'ReactNode' }
      };
      
      const result = await generator.generateComponent({}, cardSpec);
      
      expect(result.component).toContain('card-header');
      expect(result.component).toContain('card-content');
      expect(result.component).toContain('card-actions');
      expect(result.component).toContain('variant={variant}');
    });
  });

  describe('TypeScript Integration', () => {
    test('should generate proper TypeScript interfaces', async () => {
      const generator = new ReactComponentGenerator();
      const spec = createComponentSpecWithProps();
      
      const result = await generator.generateComponent({}, spec);
      
      expect(result.types).toContain('interface');
      expect(result.types).toContain(spec.name + 'Props');
      expect(result.component).toContain(': React.FC<');
    });
  });
});
```

### **Acceptance Criteria:**
- [ ] Form components with react-hook-form integration
- [ ] Card components with configurable variants
- [ ] Navigation components with routing support
- [ ] Custom hooks for complex state management
- [ ] TypeScript interfaces for all props
- [ ] 100% test coverage for React component generation

---

## **Line Item 3.3: Design System Integration**

### **Implementation Steps:**
1. [ ] **3.3.1** - Create `DesignSystemIntegration` class
2. [ ] **3.3.2** - Implement Material-UI component generation
3. [ ] **3.3.3** - Implement Ant Design component generation
4. [ ] **3.3.4** - Implement Chakra UI component generation
5. [ ] **3.3.5** - Implement Tailwind CSS component generation
6. [ ] **3.3.6** - Add design system detection algorithms

### **Test Cases:**
```javascript
// Test file: tests/phase3/design-system-integration.test.js
describe('Design System Integration', () => {
  describe('Design System Detection', () => {
    test('should detect Material-UI from design patterns', () => {
      const integration = new DesignSystemIntegration();
      const materialDesignContext = createMaterialDesignContext();
      
      const detected = integration.detectDesignSystem(materialDesignContext);
      expect(detected).toBe('material-ui');
    });

    test('should detect Tailwind CSS from utility-based styles', () => {
      const integration = new DesignSystemIntegration();
      const tailwindContext = createTailwindDesignContext();
      
      const detected = integration.detectDesignSystem(tailwindContext);
      expect(detected).toBe('tailwindcss');
    });
  });

  describe('Material-UI Generation', () => {
    test('should generate Material-UI components with proper imports', () => {
      const integration = new DesignSystemIntegration();
      const cardSpec = createCardComponentSpec();
      
      const result = integration.generateMaterialUIComponent(cardSpec);
      
      expect(result).toContain('import { Card, CardContent }');
      expect(result).toContain('from \'@mui/material\'');
      expect(result).toContain('<Card>');
    });
  });

  describe('Ant Design Generation', () => {
    test('should generate Ant Design components with proper structure', () => {
      const integration = new DesignSystemIntegration();
      const formSpec = createFormComponentSpec();
      
      const result = integration.generateAntDesignComponent(formSpec);
      
      expect(result).toContain('import { Form, Input, Button }');
      expect(result).toContain('from \'antd\'');
      expect(result).toContain('<Form.Item>');
    });
  });

  describe('Tailwind CSS Generation', () => {
    test('should generate components with Tailwind utility classes', () => {
      const integration = new DesignSystemIntegration();
      const componentSpec = createGenericComponentSpec();
      
      const result = integration.generateTailwindComponent(componentSpec);
      
      expect(result).toContain('className="');
      expect(result).toContain('bg-white shadow-md rounded-lg');
    });
  });
});
```

### **Acceptance Criteria:**
- [ ] Accurate design system detection (>90% accuracy)
- [ ] Material-UI components with proper MUI patterns
- [ ] Ant Design components following Ant design principles
- [ ] Chakra UI components with theme integration
- [ ] Tailwind CSS components with utility classes
- [ ] 100% test coverage for design system integration

---

## **Line Item 3.4: Responsive Code Generation**

### **Implementation Steps:**
1. [ ] **3.4.1** - Create `ResponsiveCodeGenerator` class
2. [ ] **3.4.2** - Implement breakpoint analysis from Figma data
3. [ ] **3.4.3** - Implement CSS Grid generation
4. [ ] **3.4.4** - Implement Flexbox layout generation
5. [ ] **3.4.5** - Add responsive utilities and helper functions

### **Test Cases:**
```javascript
// Test file: tests/phase3/responsive-code-generation.test.js
describe('Responsive Code Generation', () => {
  describe('Breakpoint Analysis', () => {
    test('should analyze responsive patterns from Figma data', () => {
      const generator = new ResponsiveCodeGenerator();
      const figmaData = createResponsiveFigmaData();
      
      const patterns = generator.analyzeResponsivePatterns(figmaData);
      
      expect(patterns.breakpoints).toEqual(['mobile', 'tablet', 'desktop']);
      expect(patterns.layoutSystem).toBe('css-grid');
      expect(patterns.responsiveRules).toBeDefined();
    });
  });

  describe('CSS Grid Generation', () => {
    test('should generate CSS Grid styles with responsive breakpoints', () => {
      const generator = new ResponsiveCodeGenerator();
      const componentSpec = createGridComponentSpec();
      const responsiveData = createResponsiveRules();
      
      const styles = generator.generateGridStyles(componentSpec, responsiveData);
      
      expect(styles).toContain('display: grid');
      expect(styles).toContain('grid-template-columns:');
      expect(styles).toContain('@media (max-width: 768px)');
      expect(styles).toContain('@media (max-width: 480px)');
    });
  });

  describe('Flexbox Generation', () => {
    test('should generate Flexbox layouts with responsive behavior', () => {
      const generator = new ResponsiveCodeGenerator();
      const componentSpec = createFlexComponentSpec();
      const responsiveData = createFlexResponsiveRules();
      
      const styles = generator.generateFlexStyles(componentSpec, responsiveData);
      
      expect(styles).toContain('display: flex');
      expect(styles).toContain('flex-direction:');
      expect(styles).toContain('flex-wrap:');
    });
  });
});
```

### **Acceptance Criteria:**
- [ ] Accurate responsive pattern analysis from Figma
- [ ] CSS Grid generation with proper breakpoints
- [ ] Flexbox layouts with responsive behavior
- [ ] Mobile-first responsive design approach
- [ ] 100% test coverage for responsive code generation

---

## **Line Item 3.5: Enhanced MCP Server Integration**

### **Implementation Steps:**
1. [ ] **3.5.1** - Add `EnhancedCodeGeneratorTool` to MCP server
2. [ ] **3.5.2** - Implement framework-specific code generation endpoint
3. [ ] **3.5.3** - Add design system integration to MCP server
4. [ ] **3.5.4** - Implement component specification processing
5. [ ] **3.5.5** - Add comprehensive error handling and fallbacks

### **Test Cases:**
```javascript
// Test file: tests/phase3/server-integration.test.js
describe('Enhanced MCP Server Integration', () => {
  test('should generate framework-specific code via MCP server', async () => {
    const payload = {
      method: 'generate_framework_code',
      params: {
        framework: 'react',
        designContext: createMockDesignContext(),
        componentSpecs: [createComponentSpec()],
        designSystem: 'material-ui'
      }
    };

    const response = await fetch('http://localhost:3000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.framework).toBe('react');
    expect(result.components).toHaveLength(1);
    expect(result.components[0].component).toContain('import React');
  });

  test('should detect and apply design system automatically', async () => {
    const payload = {
      method: 'generate_framework_code',
      params: {
        framework: 'react',
        designContext: createMaterialDesignContext(),
        componentSpecs: [createCardSpec()]
      }
    };

    const response = await fetch('http://localhost:3000', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    expect(result.designSystem).toBe('material-ui');
    expect(result.components[0].enhanced).toContain('@mui/material');
  });

  test('should handle generation errors gracefully', async () => {
    const payload = {
      method: 'generate_framework_code',
      params: {
        framework: 'invalid-framework',
        designContext: {},
        componentSpecs: []
      }
    };

    const response = await fetch('http://localhost:3000', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    expect(result.success).toBe(false);
    expect(result.fallback).toBeDefined();
  });
});
```

### **Acceptance Criteria:**
- [ ] MCP server generates framework-specific code
- [ ] Automatic design system detection and application
- [ ] Component specification processing
- [ ] Comprehensive error handling and fallbacks
- [ ] 100% test coverage for MCP server code generation

---

## **Line Item 3.6: UI Integration for Code Results**

### **Implementation Steps:**
1. [ ] **3.6.1** - Create code generation results display UI
2. [ ] **3.6.2** - Implement code tabs (component, types, styles, tests)
3. [ ] **3.6.3** - Add code preview with syntax highlighting
4. [ ] **3.6.4** - Implement copy, download, and CodeSandbox integration
5. [ ] **3.6.5** - Add framework and design system badges

### **Test Cases:**
```javascript
// Test file: tests/phase3/ui-code-integration.test.js
describe('UI Code Integration', () => {
  test('should display generated code results in tabbed interface', () => {
    const mockResults = createMockCodeGenerationResults();
    displayCodeResults(mockResults);

    const tabContainer = document.querySelector('.code-tabs');
    expect(tabContainer).toBeTruthy();
    expect(tabContainer.querySelectorAll('.tab-button')).toHaveLength(5);
  });

  test('should show framework and design system badges', () => {
    const mockResults = {
      framework: 'react',
      designSystem: 'material-ui',
      components: []
    };
    updateGenerationSummary(mockResults);

    const frameworkBadge = document.getElementById('detectedFramework');
    const designSystemBadge = document.getElementById('detectedDesignSystem');
    
    expect(frameworkBadge.textContent).toContain('React');
    expect(designSystemBadge.textContent).toContain('Material-UI');
  });

  test('should highlight code with proper syntax highlighting', () => {
    const codeContent = 'const Component = () => { return <div />; };';
    displayCodeInTab('component', codeContent);

    const codeElement = document.getElementById('generatedCode');
    expect(codeElement.className).toContain('language-typescript');
    expect(codeElement.textContent).toBe(codeContent);
  });

  test('should enable copy functionality for generated code', () => {
    const mockCode = 'export const TestComponent = () => <div />;';
    displayCodeInTab('component', mockCode);
    
    const copyButton = document.getElementById('copyCode');
    copyButton.click();
    
    // Verify copy functionality (mock clipboard API)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockCode);
  });

  test('should integrate with CodeSandbox for live preview', () => {
    const mockResults = createCompleteCodeResults();
    setupCodeSandboxIntegration(mockResults);
    
    const sandboxButton = document.getElementById('openInSandbox');
    expect(sandboxButton.href).toContain('codesandbox.io');
  });
});
```

### **Acceptance Criteria:**
- [ ] Clean tabbed interface for code results
- [ ] Syntax highlighting for all code types
- [ ] Copy to clipboard functionality
- [ ] Download as files functionality
- [ ] CodeSandbox integration for live preview
- [ ] Framework and design system badges
- [ ] 100% test coverage for UI code integration

---

## **Phase 3 Integration Testing**

### **Integration Test Cases:**
```javascript
// Test file: tests/phase3/integration.test.js
describe('Phase 3 Integration Tests', () => {
  test('should complete full code generation workflow', async () => {
    const input = 'React, TypeScript, Material-UI';
    const figmaUrl = 'https://www.figma.com/file/test123/design';
    
    // Trigger full workflow from UI input to code generation
    const result = await completeCodeGenerationWorkflow(input, figmaUrl);
    
    expect(result.success).toBe(true);
    expect(result.framework).toBe('react');
    expect(result.designSystem).toBe('material-ui');
    expect(result.components).toHaveLength(1);
    expect(result.components[0].component).toContain('import React');
    expect(result.components[0].component).toContain('@mui/material');
  });

  test('should handle multiple component generation', async () => {
    const complexDesignContext = createComplexDesignContext();
    
    const result = await generateMultipleComponents(complexDesignContext);
    
    expect(result.components.length).toBeGreaterThan(1);
    expect(result.components.every(c => c.component && c.types && c.styles)).toBe(true);
  });

  test('should maintain backward compatibility with Phases 1 & 2', async () => {
    // Ensure Phase 1 & 2 functionality still works
    const phase1Result = await enhancedParseTechStack('Vue, JavaScript');
    expect(phase1Result.designContext).toBeDefined();

    const phase2Result = await enhancedParseWithMCP('Angular, TypeScript');
    expect(phase2Result.mcpAnalysis).toBeDefined();
  });
});
```

---

## **Phase 3 Completion Checklist**

### **Before Commit:**
- [ ] All line items implemented and tested
- [ ] Unit test coverage > 95%
- [ ] Integration tests passing
- [ ] Framework generators working for React, Vue, Angular
- [ ] Design system integration functional
- [ ] Responsive code generation working
- [ ] MCP server code generation endpoint operational
- [ ] UI integration complete and responsive
- [ ] Performance acceptable (< 5s generation time)
- [ ] Security validation passed
- [ ] Phases 1 & 2 functionality preserved

### **Commit Protocol:**
```bash
# 1. Ensure all services running
cd server && npm start &
cd .. && npm run build

# 2. Run comprehensive test suite
npm test -- --coverage --testPathPattern=phase3

# 3. Test code generation manually with different frameworks
# 4. Run security check
./security-check.sh

# 5. Update context documentation
# 6. Commit with detailed message
git commit -m "feat(phase3): complete code generation enhancement with framework-specific generators

🚀 PHASE 3 IMPLEMENTATION COMPLETE:

📋 Line Items Completed:
✅ 3.1: Framework generator architecture (React, Vue, Angular)
✅ 3.2: Enhanced React component generation with hooks
✅ 3.3: Design system integration (Material-UI, Ant Design, Chakra UI, Tailwind)
✅ 3.4: Responsive code generation with CSS Grid/Flexbox
✅ 3.5: Enhanced MCP server integration for code generation
✅ 3.6: UI integration with code preview, copy, and CodeSandbox

🧪 Testing Results:
✅ Unit Tests: XXX/XXX passing (XX% coverage)
✅ Integration Tests: XX/XX passing
✅ Framework Generation Tests: XX/XX passing
✅ Design System Tests: XX/XX passing
✅ UI Integration Tests: XX/XX passing

🎯 Key Features:
- Framework-specific code generation (React, Vue, Angular)
- Design system detection and integration (4 major systems)
- Responsive code generation from Figma auto-layout
- Comprehensive TypeScript interface generation
- Live preview integration with CodeSandbox
- Professional UI with syntax highlighting

Ready for Phase 4: Workflow Automation"

# 7. Push and create PR
git push origin feature/phase3-code-generation-enhancement
```

---

**Phase 3 transforms our design insights into production-ready, framework-specific code that developers can immediately integrate into their projects, complete with responsive behavior and design system integration.**