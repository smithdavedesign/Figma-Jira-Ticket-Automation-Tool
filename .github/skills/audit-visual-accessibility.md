# Skill: Audit Visual Accessibility

**Trigger:** `audit_visual_accessibility`, "Check contrast", "Visual QA"
**Description:** Performs a visual inspection of a Figma frame using computer vision + WCAG standards, catching issues that code analysis misses.

## 🛠️ Usage Specification

Enhances the standard `ComplianceChecker` by adding pixel-based validation.

### Inputs
*   `figmaUrl` (string): Deep link to the frame.
*   `standards` (array): Default `['WCAG2.1-AA']`.

### 🧠 Logic Flow
1.  **Capture:** Invoke `capture_figma_screenshot` from `MCPRoutes` to get a Buffer.
2.  **Context:** Retrieve Design Tokens via `get_figma_design_tokens`.
3.  **Analyze:** Send Image + Token JSON to AI Vision Model.
4.  **Prompt Strategy:**
    > "Analyze this UI screenshot against WCAG 2.1 AA. Specifically check if the text color '${tokens.text.primary}' contrasts sufficiently with background '${tokens.surface.main}' in the header region."

## 💻 Implementation Snippet (Reference)
```javascript
// app/controllers/ComplianceController.js
async function auditVisuals(req, res) {
   const screenshot = await this.screenshotService.capture(req.body.url);
   const report = await this.aiService.visionAudit(screenshot, 'wcag-aa');
   return res.json(report);
}
```
