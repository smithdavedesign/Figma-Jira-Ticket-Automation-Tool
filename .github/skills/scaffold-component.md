# Skill: Scaffold Component Architecture

**Trigger:** `scaffold_component`, "Create a new component", "Generate component files"
**Description:** Automates creation of component files, tests, and stories based on the target tech stack and patterns already in the repo.

## Usage Specification

### Inputs
- `componentName` (string): PascalCase name (e.g., `ProductCard`)
- `path` (string): Relative path (e.g., `src/components/features`)
- `techStack` (string): `React`, `Vue`, `AEM`, etc.
- `options`: `{ withTypes: boolean, withStory: boolean, withTest: boolean }`

### Logic Flow
1. **Analyze context:** Check `package.json` for dependency versions (React, Vitest, etc.)
2. **Determine patterns:** Look at 1-2 existing components in the same directory for naming and structure conventions
3. **Generate files:**
   - `${path}/${componentName}/${componentName}.tsx` (or `.jsx` / `.js` based on project)
   - `${path}/${componentName}/${componentName}.test.tsx` (Vitest + Testing Library)
   - `${path}/${componentName}/${componentName}.stories.tsx` (CSF 3.0, if `withStory`)
   - `${path}/${componentName}/index.ts` (barrel re-export)
4. **Return:** list of created file paths

### Constraints
- Match existing component structure — do not invent new patterns
- Use `fs/promises` for file operations; check if target path already exists before creating
- Never import from `core/design-intelligence/` — that module is removed
- Never reference `TicketGenerationService` or `ReactComponentMCPAdapter` — they do not exist

## Implementation Reference

```javascript
// Direct fs implementation — no adapter class needed
const fs = require('fs/promises');
const path = require('path');

async function scaffoldComponent(componentName, targetDir, options = {}) {
  const dir = path.join(process.cwd(), targetDir, componentName);
  
  // Guard: don't overwrite existing
  try { await fs.access(dir); return { error: `${dir} already exists` }; } catch {}
  
  await fs.mkdir(dir, { recursive: true });
  
  const files = [];
  
  // Component
  await fs.writeFile(
    path.join(dir, `${componentName}.tsx`),
    `import React from 'react';

export interface ${componentName}Props {}

export const ${componentName}: React.FC<${componentName}Props> = () => {
  return <div className="${componentName.toLowerCase()}"></div>;
};

export default ${componentName};
`
  );
  files.push(`${componentName}.tsx`);
  
  // Barrel
  await fs.writeFile(path.join(dir, 'index.ts'), `export * from './${componentName}';
`);
  files.push('index.ts');
  
  return { created: files, path: dir };
}
```
