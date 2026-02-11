# Skill: Scaffold Component Architecture

**Trigger:** `scaffold_component`, "Create a new component", "Generate React files"
**Description:** Automates the physical creation of React component files, tests, and stories based on architectural design patterns.

## 🛠️ Usage Specification

This skill bridges the gap between `TicketGenerationService` (text) and `ReactComponentMCPAdapter` (code concepts).

### Inputs
*   `componentName` (string): PascalCase name (e.g., `ProductCard`).
*   `path` (string): Relative path (e.g., `src/components/features`).
*   `options`: `{ withTypes: boolean, withStory: boolean }`.

### 🧠 Logic Flow
1.  **Analyze Context:** Check `package.json` for dependency versions (React, Vitest).
2.  **Generate Content:** Use `ReactComponentMCPAdapter` to generate implementation strings.
3.  **File Operations:**
    *   Create `${path}/${componentName}/${componentName}.tsx`
    *   Create `${path}/${componentName}/${componentName}.test.tsx` (using Vitest)
    *   Create `${path}/${componentName}/${componentName}.stories.tsx` (using Component Story Format 3.0)
    *   Create `${path}/${componentName}/index.ts` (Barrel file)

## 💻 Implementation Snippet (Reference)
```javascript
// core/design-intelligence/adapters/react-custom-scaffold.js
const fs = require('fs/promises');
const path = require('path');

async function scaffold(componentName, targetDir) {
   const dir = path.join(process.cwd(), targetDir, componentName);
   await fs.mkdir(dir, { recursive: true });
   // ... implementation details
}
```
