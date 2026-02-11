# Skill: Generate Strategic Brief

**Trigger:** `generate_strategic_brief`, "Create PRD", "Draft Brief"
**Description:** Generates a high-level "Product Requirements Document" (PRD) by synthesizing business constraints, risks, and monetization strategies before engineering work begins.

## 🛠️ Usage Specification

Leverages the `BusinessContextIntelligence` class to elevate the output from "Implementation Details" to "Product Strategy".

### Inputs
*   `fileContext`: The Figma file node or Project summary.

### 🧠 Logic Flow
1.  **Extract Data:**
    *   `identifyBusinessConstraints(context)` (Context Class)
    *   `identifyRiskFactors(context)` (Context Class)
    *   `getMonetizationStrategy(context)` (Context Class)
2.  **Synthesize:** Combine these distinct signals into a coherent narrative.
3.  **Output Format:** Standard Markdown PRD (Problem, Solution, Risks, Success Metrics).

## 💻 Implementation Snippet (Reference)
```javascript
// core/context/business-context-intelligence.js - NEW METHOD
class StrategicGenerators {
    async createBrief(details) {
        const risks = await this.identifyRiskFactors(details);
        return `# Project Brief\n## Risks\n${risks.join('\n')}`;
    }
}
```
