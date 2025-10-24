#!/usr/bin/env node

/**
 * Simplified Visual-Enhanced Server
 * 
 * This demo server showcases our visual-enhanced ticket generation
 * without the complex dependencies that are causing TypeScript issues.
 */

import { createServer } from 'http';

class SimplifiedVisualEnhancedServer {
  constructor(port = 3001) {
    this.port = port;
  }

  async handleRequest(method, params) {
    switch (method) {
      case 'generate_visual_enhanced_ticket':
        return this.generateVisualEnhancedTicket(params);
      case 'health':
        return { status: 'healthy', tools: ['generate_visual_enhanced_ticket'] };
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  async generateVisualEnhancedTicket(params) {
    const { context, options = {} } = params;
    const { techStack = 'React TypeScript', instructions = '' } = options;
    
    // Generate the enhanced ticket using our string concatenation approach
    const ticket = this.generateVisualContextTicket(context, { techStack, instructions });
    
    return {
      content: [
        {
          type: 'text',
          text: ticket
        }
      ],
      metadata: {
        confidence: this.calculateVisualConfidence(context),
        visualDataPoints: this.countVisualDataPoints(context),
        generatedAt: new Date().toISOString()
      }
    };
  }

  generateVisualContextTicket(context, options) {
    const { techStack = 'React TypeScript', instructions = '' } = options;
    
    // Build ticket with simple string concatenation
    let ticket = '# 🎨 Visual-Enhanced ';
    ticket += (context.figmaContext.selection.name || 'Component');
    ticket += ' Implementation\n\n';
    
    ticket += '## 📋 Enhanced Context Analysis\n\n';
    
    // Visual Analysis Section
    ticket += '### 🖼️ Visual Analysis\n';
    if (context.screenshot) {
      ticket += '**Screenshot Available**: ';
      ticket += context.screenshot.resolution.width + '×' + context.screenshot.resolution.height + 'px ';
      ticket += context.screenshot.format + ' (' + Math.round(context.screenshot.size / 1024) + 'KB)\n';
      ticket += '- High-resolution visual reference for pixel-perfect implementation\n';
      ticket += '- Visual context available for AI analysis and verification\n\n';
    } else {
      ticket += '**No Screenshot**: Working with structured data only\n';
      ticket += '- Implementation based on hierarchical component data\n';
      ticket += '- Visual verification will be needed during development\n\n';
    }
    
    // Design Context
    ticket += '### 🎯 Design Context\n';
    ticket += '- **File**: ' + context.figmaContext.fileName + '\n';
    ticket += '- **Page**: ' + context.figmaContext.pageName + '\n';
    ticket += '- **Component**: ' + context.figmaContext.selection.name + '\n\n';
    
    // Color System Analysis
    ticket += '### 🎨 Color System Analysis\n';
    if (context.visualDesignContext.colorPalette.length > 0) {
      const colors = context.visualDesignContext.colorPalette.slice(0, 5);
      colors.forEach((color) => {
        ticket += '- **' + color.hex + '** - ' + color.usage.join(', ') + ' (' + color.count + ' instances)\n';
      });
    } else {
      ticket += '- No color data extracted - manual design token mapping required\n';
    }
    ticket += '\n';
    
    // Typography Analysis
    ticket += '### 📝 Typography Analysis\n';
    if (context.visualDesignContext.typography.fonts.length > 0) {
      ticket += '- **Fonts**: ' + context.visualDesignContext.typography.fonts.join(', ') + '\n';
      ticket += '- **Sizes**: ' + context.visualDesignContext.typography.sizes.join('px, ') + 'px\n';
      ticket += '- **Hierarchy**: ' + context.visualDesignContext.typography.hierarchy.join(' → ') + '\n';
    } else {
      ticket += '- No typography data extracted - manual font specification required\n';
    }
    ticket += '\n';
    
    // Layout & Spacing
    ticket += '### 📐 Layout & Spacing\n';
    if (context.visualDesignContext.spacing.patterns.length > 0) {
      ticket += '- **Grid System**: ' + context.visualDesignContext.spacing.patterns.join(', ') + '\n';
      ticket += '- **Layout**: ' + (context.visualDesignContext.layout.structure || 'Custom layout') + '\n';
      ticket += '- **Spacing**: ' + context.visualDesignContext.spacing.measurements.join('px, ') + 'px\n';
    } else {
      ticket += '- No spacing patterns detected - manual spacing implementation required\n';
    }
    ticket += '\n';
    
    // Implementation Requirements
    ticket += '## 💻 Implementation Requirements\n\n';
    
    // Technical Specifications
    ticket += '### Technical Specifications\n';
    ticket += '- **Framework**: ' + techStack + '\n';
    const hasGridSystem = context.visualDesignContext.spacing.patterns.includes('8px-grid');
    ticket += '- **Styling Approach**: ' + (hasGridSystem ? 'Design system with 8px grid' : 'Custom CSS with extracted measurements') + '\n';
    const hasColors = context.visualDesignContext.colorPalette.length > 0;
    ticket += '- **Color Management**: ' + (hasColors ? 'Use extracted color palette' : 'Define color tokens from visual reference') + '\n\n';
    
    // Component Architecture
    ticket += '### Component Architecture\n';
    if (context.hierarchicalData.components?.length > 0) {
      context.hierarchicalData.components.forEach((comp) => {
        ticket += '- **' + comp.name + '**: ' + (comp.masterComponent || 'Custom implementation') + '\n';
      });
    } else {
      ticket += '- Component structure to be determined from visual analysis\n';
    }
    ticket += '\n';
    
    // Acceptance Criteria
    ticket += '## ✅ Acceptance Criteria\n\n';
    
    ticket += '### Visual Requirements\n';
    ticket += '- [ ] Component matches design specifications exactly\n';
    ticket += '- [ ] All extracted colors are implemented correctly (' + context.visualDesignContext.colorPalette.length + ' colors)\n';
    ticket += '- [ ] Typography follows detected hierarchy (' + context.visualDesignContext.typography.hierarchy.length + ' levels)\n';
    const spacingText = context.visualDesignContext.spacing.patterns.join(', ') || 'custom spacing';
    ticket += '- [ ] Spacing conforms to detected patterns (' + spacingText + ')\n\n';
    
    ticket += '### Technical Requirements\n';
    ticket += '- [ ] Built using ' + techStack + ' with proper component structure\n';
    ticket += '- [ ] Responsive design implemented for mobile, tablet, desktop\n';
    ticket += '- [ ] Accessibility standards met (WCAG 2.1 AA)\n';
    ticket += '- [ ] Design system tokens used where applicable\n';
    ticket += '- [ ] Performance optimized (lazy loading, efficient rendering)\n\n';
    
    // Implementation Notes
    ticket += '## 🔧 Implementation Notes\n\n';
    
    ticket += '### Development Approach\n';
    ticket += '1. **Setup**: Create component structure using ' + techStack + '\n';
    if (context.visualDesignContext.colorPalette.length > 0) {
      ticket += '2. **Styling**: Implement extracted color system first\n';
    } else {
      ticket += '2. **Styling**: Define color tokens from visual reference\n';
    }
    if (context.visualDesignContext.layout.structure) {
      ticket += '3. **Layout**: Use ' + context.visualDesignContext.layout.structure + ' layout\n';
    } else {
      ticket += '3. **Layout**: Analyze visual structure for layout approach\n';
    }
    ticket += '4. **Refinement**: Match visual details and ensure responsive behavior\n';
    ticket += '5. **Testing**: Verify functionality and visual accuracy\n\n';
    
    // Additional Instructions
    ticket += '### Additional Instructions\n';
    ticket += (instructions || 'Follow standard development practices and team conventions') + '\n\n';
    
    // Footer
    ticket += '---\n\n';
    ticket += '**Generated with Visual-Enhanced Analysis**\n';
    if (context.screenshot) {
      ticket += '📸 Screenshot: ' + context.screenshot.resolution.width + '×' + context.screenshot.resolution.height + 'px\n';
    } else {
      ticket += '📊 Data-driven analysis\n';
    }
    ticket += '🎨 Color Palette: ' + context.visualDesignContext.colorPalette.length + ' colors | ';
    ticket += '📝 Typography: ' + context.visualDesignContext.typography.fonts.length + ' fonts | ';
    ticket += '📐 Spacing: ' + context.visualDesignContext.spacing.patterns.length + ' patterns\n';

    return ticket;
  }

  countVisualDataPoints(context) {
    let count = 0;
    if (context.screenshot) count += 3; // High value for screenshot
    if (context.visualDesignContext.colorPalette.length > 0) count++;
    if (context.visualDesignContext.typography.fonts.length > 0) count++;
    if (context.visualDesignContext.spacing.patterns.length > 0) count++;
    if (context.hierarchicalData.components?.length > 0) count++;
    return count;
  }

  calculateVisualConfidence(context) {
    let confidence = 60; // Base confidence
    
    if (context.screenshot) confidence += 25; // Screenshot is very valuable
    if (context.visualDesignContext.colorPalette.length > 0) confidence += 5;
    if (context.visualDesignContext.typography.fonts.length > 0) confidence += 5;
    if (context.visualDesignContext.spacing.patterns.length > 0) confidence += 5;
    if (context.hierarchicalData.components?.length > 0) confidence += 5;
    
    return Math.min(confidence, 95);
  }

  start() {
    const server = createServer(async (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200);
        res.end(JSON.stringify({
          name: 'Visual-Enhanced Figma AI Server',
          version: '1.0.0',
          status: 'running',
          tools: ['generate_visual_enhanced_ticket'],
          description: 'Demo server for visual-enhanced LLM context with Figma data'
        }));
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const { method, params } = JSON.parse(body);
            const result = await this.handleRequest(method, params);
            
            res.writeHead(200);
            res.end(JSON.stringify(result));
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.writeHead(400);
            res.end(JSON.stringify({
              content: [
                {
                  type: 'text',
                  text: errorMessage
                }
              ],
              isError: true
            }));
          }
        });
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not Found' }));
    });

    server.listen(this.port, () => {
      console.log('🎨 Visual-Enhanced Figma AI Server started');
      console.log(`📋 Server running at http://localhost:${this.port}`);
      console.log('🔗 Available tools: generate_visual_enhanced_ticket');
      console.log('');
      console.log('🎯 Demo Features:');
      console.log('  • Screenshot capture integration');
      console.log('  • Color palette extraction & analysis');
      console.log('  • Typography detection & hierarchy');
      console.log('  • Spacing pattern recognition');
      console.log('  • Visual-enhanced ticket generation');
      console.log('');
      console.log('Test with: node test-visual-enhanced.mjs');
    });
  }
}

// Start the server if this file is run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const server = new SimplifiedVisualEnhancedServer();
  server.start();
}

export { SimplifiedVisualEnhancedServer };