# UI Test Files

This directory contains HTML test files for validating UI functionality outside of the Figma environment.

## Files

- **`test-ui-functionality.html`** - UI functionality validation
- **`test-figma-integration.html`** - Figma integration testing
- **`test-ui.html`** - Basic test interface  
- **`test-interactive-suite.html`** - Interactive test suite
- **`test-figma-plugin.html`** - Built plugin copy for testing
- **`context-preview-test.html`** - Context preview testing

## Usage

Open these files directly in your browser to test specific UI components and functionality:

```bash
# Serve locally for testing
python -m http.server 8080
# Open http://localhost:8080/ui/test/test-ui-functionality.html
```

## Purpose

These test files enable:
- UI development without Figma Desktop
- Feature validation in browser environment
- Integration testing of MCP server communication
- Visual debugging of UI components