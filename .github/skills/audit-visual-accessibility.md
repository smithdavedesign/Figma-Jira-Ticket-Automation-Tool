# Skill: Audit Visual Accessibility

**Trigger:** `audit_visual_accessibility`, "Check contrast", "Visual QA"
**Description:** Performs a visual inspection of a Figma frame using Gemini vision + WCAG 2.1 AA standards, catching issues that static code analysis misses.

## Usage Specification

### Inputs
- `figmaUrl` (string): Deep link to the Figma frame
- `nodeId` (string): Figma node ID (for export URL construction)
- `standards` (array): Default `['WCAG2.1-AA']`

### Logic Flow
1. **Capture frame:** Call `screenshotService.captureFromFigmaUrl(figmaUrl)` to get a PNG buffer or CDN URL via `fetchFigmaExportUrl()`
2. **Get design tokens:** Extract color + typography tokens from the frame data in `unifiedContextBuilder`
3. **Analyze with Gemini:** Pass the frame image URL + token context to `GeminiService.generateWithVision()` with the WCAG audit prompt
4. **Prompt Strategy:**
   > "Analyze this UI screenshot against WCAG 2.1 AA. Check text contrast ratios, focus indicator visibility, touch target sizes (minimum 44×44px), and color-only information encoding. Color values from design tokens: `${tokenSummary}`. Return a JSON array of violations with: element, issue, wcagCriteria, severity (critical/major/minor)."
5. **Return:** structured violation report

### Constraints
- Use `GeminiService` for vision analysis — do not add a separate AI client
- Use `screenshotService` for frame capture — it already handles Figma API auth
- `MCPRoutes` does not exist; do not reference `capture_figma_screenshot` as an MCP tool
- `get_figma_design_tokens` is not a real MCP tool; use `unifiedContextBuilder` instead

## Implementation Reference

```javascript
// Example usage via POST /api/generate with a custom audit documentType
// app/routes/generate.js would pass documentType: 'accessibility-audit'

async function auditAccessibility(frameData, exportUrl, geminiService) {
  const tokenSummary = extractTokenSummary(frameData);
  
  const result = await geminiService.generateWithVision(exportUrl, {
    task: 'wcag-audit',
    prompt: `Analyze this UI screenshot against WCAG 2.1 AA standards.
      Design tokens: ${JSON.stringify(tokenSummary)}.
      Return JSON array: [{ element, issue, wcagCriteria, severity }]`,
    responseFormat: 'json'
  });
  
  return {
    violations: result.data || [],
    passCount: result.passCount || 0,
    standard: 'WCAG2.1-AA'
  };
}

function extractTokenSummary(frameData) {
  const colors = frameData?.design?.colors || [];
  const fonts = frameData?.design?.fonts || [];
  return { colors: colors.slice(0, 10), fonts: fonts.slice(0, 5) };
}
```
