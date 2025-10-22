# Tech Stack Detection System - Complete Implementation

## Overview
The system handles tech stack input in two ways:
1. **Button Selection**: Users click predefined tech stack buttons 
2. **Manual Input**: Users type their tech stack in the textarea field

## 1. Button Selection (Predefined Options)
Located in `/ui/index.html` around line 883:

```html
<div class="suggestion-pill" data-type="react" onclick="selectTechStack(this)">
  ⚛️ React + TypeScript + Material-UI
</div>
<div class="suggestion-pill" data-type="vue" onclick="selectTechStack(this)">
  💚 Vue 3 + Composition API + Pinia
</div>
<div class="suggestion-pill" data-type="angular" onclick="selectTechStack(this)">
  🅰️ Angular 15 + NgRx + Material
</div>
<div class="suggestion-pill" data-type="next" onclick="selectTechStack(this)">
  ⚡ Next.js + TailwindCSS + Prisma
</div>
<div class="suggestion-pill" data-type="aem" onclick="selectTechStack(this)">
  🏢 AEM 6.5 + HTL + Sling + OSGi
</div>
<div class="suggestion-pill" data-type="design" onclick="selectTechStack(this)">
  🎨 Figma + Design System + Tokens
</div>
```

### Button Handling
The `selectTechStack(element)` function fills the textarea with predefined templates:

```javascript
function selectTechStack(element) {
  const type = element.dataset.type;
  const techStackTemplates = {
    'react': 'React 18 with TypeScript, Material-UI v5, React Query for state management, Jest + RTL for testing',
    'vue': 'Vue 3 with Composition API, Pinia for state management, Vite build tool, Vitest for testing',
    'angular': 'Angular 15 with NgRx for state management, Angular Material UI, RxJS patterns, Jasmine + Karma for testing',
    'next': 'Next.js 13 with App Router, TailwindCSS for styling, Prisma ORM, PostgreSQL database, TypeScript',
    'aem': 'AEM 6.5 with HTL (HTML Template Language), Apache Sling framework, OSGi bundles, JCR repository, Touch UI components',
    'design': 'Figma with Design System tokens, Component libraries, Style guide standards, Accessibility compliance (WCAG 2.1)'
  };
  
  const template = techStackTemplates[type] || '';
  if (template) {
    techStackInput.value = template;
  }
}
```

## 2. Manual Input (Free Text)
Users can type anything in the `techStackInput` textarea (line 866):

```html
<textarea 
  id="techStackInput" 
  placeholder="Describe your tech stack, frameworks, libraries, and architecture. Be specific about versions, patterns, and tools you're using.

Examples:
• React 18 with TypeScript, Material-UI v5, React Query for state management
• Vue 3 with Composition API, Pinia for state, Vite build tool
• Next.js 13 with App Router, TailwindCSS, Prisma ORM, PostgreSQL
• Angular 15 with NgRx, Angular Material, RxJS patterns"></textarea>
```

### Manual Input Processing
1. **Parse Button**: Users click "🔍 Parse Tech Stack" button
2. **Parsing Function**: `parseTechStackManually()` calls `parseTechStack(description)`
3. **Analysis**: Detects frameworks, languages, and tools from free text
4. **Confidence**: Calculates confidence score based on specificity

## 3. Server-Side Detection
Both button selections and manual input are sent to the server in `teamStandards.tech_stack`.

### Data Structure Sent to Server
```javascript
teamStandards: {
  tech_stack: techStackDesc ? techStackDesc.split(',').map(s => s.trim()) : ['React', 'TypeScript'],
  testing_framework: 'jest-rtl',
  accessibility_level: 'wcag-aa',
  documentation_format: 'markdown',
  code_style: 'prettier'
}
```

### Server Detection Logic
The `detectTechStackPlatform` method in `TicketGenerator` class:

```typescript
private detectTechStackPlatform(techStack: string[] | string | undefined, defaultPlatform: string): string {
  if (!techStack) return defaultPlatform;
  
  const techStackString = Array.isArray(techStack) 
    ? techStack.join(' ').toLowerCase()
    : techStack.toLowerCase();
  
  console.log(`🔍 Analyzing tech stack: ${techStackString}`);
  
  // AEM detection patterns
  if (techStackString.includes('aem') || 
      techStackString.includes('htl') ||
      techStackString.includes('sling') ||
      techStackString.includes('osgi') ||
      techStackString.includes('jcr')) {
    console.log('✅ AEM tech stack detected!');
    return 'AEM';
  }
  
  // React/Next.js detection
  if (techStackString.includes('react') || techStackString.includes('next')) {
    console.log('⚛️ React/Next.js tech stack detected!');
    return 'jira';
  }
  
  // Vue detection
  if (techStackString.includes('vue')) {
    console.log('💚 Vue tech stack detected!');
    return 'jira';
  }
  
  // Angular detection
  if (techStackString.includes('angular')) {
    console.log('🅰️ Angular tech stack detected!');
    return 'jira';
  }
  
  console.log(`🔄 Using default platform: ${defaultPlatform}`);
  return defaultPlatform;
}
```

## 4. Platform-Specific Template Selection

### AEM Platform Detection
When AEM is detected, the system:
- Uses `AEM` platform instead of `jira`
- Loads AEM-specific templates from `/server/src/ai/templates/AEM/`
- Generates HTL components, Sling Models, Touch UI dialogs

### Other Platforms
- React, Vue, Angular, Next.js → `jira` platform
- Uses standard templates from `/server/src/ai/templates/jira/`
- Generates standard component implementations

## 5. Default Behavior

### When No Tech Stack Provided
- **Default Array**: `['React', 'TypeScript']` (line 1721)
- **Platform**: `jira` 
- **Templates**: Standard component templates

### Manual Input Without Parse
- Manual text is still sent to server as comma-separated array
- Server detection still works on the raw text
- No client-side parsing needed for server detection

## 6. Testing Results ✅

All detection scenarios work correctly:
- ✅ AEM button → AEM platform detection
- ✅ Manual AEM input → AEM platform detection  
- ✅ React/Vue/Angular buttons → jira platform
- ✅ Manual React/Vue/Angular input → jira platform
- ✅ Empty input → default jira platform
- ✅ Case-insensitive detection
- ✅ Array and string input handling

## Summary

The system provides a comprehensive tech stack detection system that:
1. **Supports both predefined buttons and manual input**
2. **Intelligently detects AEM for specialized templates**
3. **Handles various input formats (arrays, strings, empty)**
4. **Provides appropriate defaults when no input is given**
5. **Uses the detected platform to select appropriate templates**

The `detectTechStackPlatform` method has been successfully added to the `TicketGenerator` class and is working as expected!