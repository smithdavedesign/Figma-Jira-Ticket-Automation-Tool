/// <reference path="./types.ts" />
/// <reference path="./design-system-scanner.ts" />

// Global declarations for Figma plugin environment
declare const figma: any;
declare const __html__: string;

// Simple compliance analyzer class for single-file mode
class SimpleComplianceAnalyzer {
  constructor(private designSystem: any) {}
  
  async analyzeFrame(frame: any): Promise<any> {
    return {
      overallScore: 85,
      usedTokens: [],
      violations: [],
      recommendations: []
    };
  }
}

// Global design system state
let designSystemScanner: DesignSystemScanner | null = null;
let complianceAnalyzer: SimpleComplianceAnalyzer | null = null;
let detectedDesignSystem: any | null = null;

// Main plugin code that runs in Figma's sandbox environment
figma.showUI(__html__, { 
  width: 600, // Optimized width for tab view without scrolling
  height: 700, // Comfortable height for content
  themeColors: true 
});

// Initialize design system detection on plugin load
initializeDesignSystem();

async function initializeDesignSystem() {
  try {
    console.log('🚀 Initializing design system detection...');
    
    // Send file context to UI
    figma.ui.postMessage({
      type: 'file-context',
      fileKey: figma.fileKey,
      fileName: figma.root.name
    });
    
    designSystemScanner = new DesignSystemScanner();
    detectedDesignSystem = await designSystemScanner.scanDesignSystem();
    
    if (detectedDesignSystem) {
      complianceAnalyzer = new SimpleComplianceAnalyzer(detectedDesignSystem);
      console.log('✅ Design system initialized:', detectedDesignSystem.name);
      
      // Send design system info to UI
      figma.ui.postMessage({
        type: 'design-system-detected',
        designSystem: detectedDesignSystem
      });
    } else {
      console.log('ℹ️ No design system detected in this file');
      figma.ui.postMessage({
        type: 'no-design-system'
      });
    }
  } catch (error) {
    console.error('❌ Error initializing design system:', error);
  }
}

// Listen for messages from the UI
figma.ui.onmessage = async (msg: any) => {
  if (msg.type === 'generate-ticket') {
    const selection = figma.currentPage.selection;

    if (selection.length === 0) {
      figma.ui.postMessage({ 
        type: 'error', 
        message: 'Please select at least one frame or component to generate a ticket.' 
      });
      return;
    }

    // Process selected frames/components
    const frameDataList = [];
    
    for (const node of selection) {
      const frameData = await extractFrameData(node);
      frameDataList.push(frameData);
    }

    // Send frame data to UI for AI processing
    figma.ui.postMessage({
      type: 'frame-data',
      data: frameDataList,
    });
  }

  if (msg.type === 'calculate-compliance') {
    try {
      const selection = figma.currentPage.selection;

      if (selection.length === 0) {
        figma.ui.postMessage({ 
          type: 'compliance-error', 
          message: 'Please select frames or components to analyze compliance.' 
        });
        return;
      }

      if (!designSystemScanner || !detectedDesignSystem) {
        figma.ui.postMessage({ 
          type: 'compliance-error', 
          message: 'Design system not detected. Please ensure your file contains design system components.' 
        });
        return;
      }

      console.log('📊 Calculating compliance for', selection.length, 'selected items...');
      
      // Calculate compliance score
      const complianceScore = await designSystemScanner.calculateComplianceScore(selection);
      
      // Send results to UI
      figma.ui.postMessage({
        type: 'compliance-results',
        compliance: complianceScore,
        selectionCount: selection.length
      });

    } catch (error) {
      console.error('❌ Error calculating compliance:', error);
      figma.ui.postMessage({ 
        type: 'compliance-error', 
        message: 'Error calculating compliance: ' + (error as Error).message 
      });
    }
  }

  if (msg.type === 'close-plugin') {
    figma.closePlugin();
  }
};

// Extract comprehensive data from a Figma node
async function extractFrameData(node: any): Promise<any> {
  const frameData: any = {
    name: node.name,
    id: node.id,
    type: node.type,
    nodeCount: 0,
    dimensions: { width: 0, height: 0 },
    annotations: [],
    components: [],
    colors: [],
    textContent: [],
    hasPrototype: false,
    fileKey: figma.fileKey || '',
    pageId: figma.currentPage.id,
    pageName: figma.currentPage.name
  };

  // Get dimensions if available
  if ('width' in node && 'height' in node && typeof node.width === 'number' && typeof node.height === 'number') {
    frameData.dimensions = {
      width: Math.round(node.width),
      height: Math.round(node.height)
    };
  }

  // Count children and extract data
  if ('children' in node && Array.isArray(node.children)) {
    frameData.nodeCount = node.children.length;
    
    // Extract text content
    if (node.findAll) {
      try {
        const textNodes = node.findAll((n: any) => n.type === 'TEXT');
        frameData.textContent = textNodes.map((textNode: any) => ({
          content: textNode.characters || '',
          fontSize: typeof textNode.fontSize === 'number' ? textNode.fontSize : 'mixed',
          fontName: typeof textNode.fontName === 'object' && textNode.fontName ? textNode.fontName.family : 'mixed'
        }));
      } catch (error) {
        console.warn('Could not extract text content:', error);
        frameData.textContent = [];
      }

      // Extract component instances
      try {
        const componentNodes = node.findAll((n: any) => n.type === 'INSTANCE');
        const componentPromises = componentNodes.map(async (comp: any) => {
          let masterComponentName = 'Unknown';
          try {
            if (comp.getMainComponentAsync) {
              const masterComponent = await comp.getMainComponentAsync();
              masterComponentName = masterComponent?.name || 'Unknown';
            }
          } catch (error) {
            console.warn('Could not get master component:', error);
          }
          return {
            name: comp.name || 'Unknown',
            masterComponent: masterComponentName
          };
        });
        
        frameData.components = await Promise.all(componentPromises);
      } catch (error) {
        console.warn('Could not extract components:', error);
        frameData.components = [];
      }

      // Extract colors from fills
      try {
        const nodesWithFills = node.findAll((n: any) => 'fills' in n && n.fills !== figma.mixed);
        frameData.colors = extractColorsFromNodes(nodesWithFills);
      } catch (error) {
        console.warn('Could not extract colors:', error);
        frameData.colors = [];
      }
    }
  }

  // Check for prototype connections
  if ('reactions' in node && Array.isArray(node.reactions) && node.reactions.length > 0) {
    frameData.hasPrototype = true;
  }

  // Create enhanced frame data with design system context
  const enhancedFrameData: any = Object.assign({}, frameData);

  // Add design system analysis if available
  if (detectedDesignSystem && complianceAnalyzer && node.type === 'FRAME') {
    try {
      console.log('🔍 Analyzing design system compliance for:', node.name);
      const complianceReport = await complianceAnalyzer.analyzeFrame(node);
      const usedTokens = complianceReport.usedTokens;
      const violations = complianceReport.violations;
      const recommendations = complianceReport.recommendations;

      enhancedFrameData.designSystemContext = {
        designSystem: detectedDesignSystem,
        complianceReport,
        usedTokens,
        violations,
        recommendations
      };

      console.log('📊 Compliance analysis complete:', {
        overallScore: complianceReport.overallScore,
        violations: violations.length,
        recommendations: recommendations.length
      });
    } catch (error) {
      console.warn('Could not analyze design system compliance:', error);
    }
  }

  return enhancedFrameData;
}

// Extract color information from nodes
function extractColorsFromNodes(nodes: any[]): string[] {
  const colors = new Set<string>();
  
  nodes.forEach(node => {
    if (node.fills && Array.isArray(node.fills)) {
      node.fills.forEach((fill: any) => {
        if (fill.type === 'SOLID' && fill.color) {
          const { r, g, b } = fill.color;
          const hex = rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
          colors.add(hex);
        }
      });
    }
  });
  
  return Array.from(colors).slice(0, 10); // Limit to 10 colors
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Initialize plugin
console.log('AI Ticket Generator plugin loaded');