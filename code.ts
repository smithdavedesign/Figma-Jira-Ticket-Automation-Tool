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

      // Allow compliance calculation without selection (analyze whole page/file)
      console.log('📊 Calculating compliance for', selection.length > 0 ? selection.length + ' selected items' : 'current page', '...');
      
      // Initialize design system scanner if not already done
      if (!designSystemScanner) {
        designSystemScanner = new DesignSystemScanner();
        detectedDesignSystem = await designSystemScanner.scanDesignSystem();
        
        if (detectedDesignSystem) {
          complianceAnalyzer = new SimpleComplianceAnalyzer(detectedDesignSystem);
          console.log('✅ Design system initialized on-demand:', detectedDesignSystem.name);
          
          // Send design system info to UI
          figma.ui.postMessage({
            type: 'design-system-detected',
            designSystem: detectedDesignSystem
          });
        }
      }

      // Calculate compliance score (works with or without selection)
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
    fileKey: figma.fileKey || 'FIGMA_FILE_KEY_UNAVAILABLE',
    fileName: figma.root.name || 'Untitled',
    pageId: figma.currentPage.id,
    pageName: figma.currentPage.name,
    // Enhanced context for complex ticket generation
    layerStructure: [],
    interactions: [],
    spacing: {},
    semanticInfo: {}
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
        // Extract text content with enhanced styling information
      try {
        const textNodes = node.findAll((n: any) => n.type === 'TEXT');
        frameData.textContent = textNodes.map((textNode: any) => {
          let style = 'Regular';
          let fontFamily = 'Unknown';
          
          // Extract font family and style
          if (typeof textNode.fontName === 'object' && textNode.fontName) {
            fontFamily = textNode.fontName.family || 'Unknown';
            const fontStyle = textNode.fontName.style || 'Regular';
            
            // Create a readable style string
            if (fontFamily.includes('Sora')) {
              style = `Sora ${fontStyle}`;
            } else {
              style = `${fontFamily} ${fontStyle}`;
            }
          }
          
          return {
            content: textNode.characters || '',
            style: style,
            fontSize: typeof textNode.fontSize === 'number' ? textNode.fontSize : 'mixed',
            fontName: fontFamily
          };
        });
      } catch (error) {
        console.warn('Could not extract text content:', error);
        frameData.textContent = [];
      }
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

      // Extract layer structure for better understanding
      try {
        frameData.layerStructure = extractLayerStructure(node, 3); // Max 3 levels deep
      } catch (error) {
        console.warn('Could not extract layer structure:', error);
        frameData.layerStructure = [];
      }

      // Extract semantic information based on naming patterns
      try {
        frameData.semanticInfo = analyzeSemanticInfo(node);
      } catch (error) {
        console.warn('Could not analyze semantic info:', error);
        frameData.semanticInfo = {};
      }

      // Extract spacing and layout information
      try {
        frameData.spacing = extractSpacingInfo(node);
      } catch (error) {
        console.warn('Could not extract spacing info:', error);
        frameData.spacing = {};
      }
    }
  }

  // Check for prototype connections and interactions
  try {
    if ('reactions' in node && Array.isArray(node.reactions) && node.reactions.length > 0) {
      frameData.hasPrototype = true;
      frameData.interactions = node.reactions.map((reaction: any) => ({
        trigger: reaction.trigger?.type || 'unknown',
        action: reaction.actions?.[0]?.type || 'unknown',
        destination: reaction.actions?.[0]?.destinationId || null
      }));
    }
  } catch (error) {
    console.warn('Could not extract interactions:', error);
  }

// Enhanced frame data initialization with MCP-compliant rich context
  const enhancedFrameData: any = Object.assign({}, frameData);

  // Add MCP-optimized metadata following Figma best practices
  enhancedFrameData.mcpContext = {
    // Required: Clear semantic naming for MCP understanding
    semanticName: generateSemanticName(node),
    figmaUrl: `https://figma.com/file/${figma.fileKey}?node-id=${encodeURIComponent(node.id)}`,
    nodeId: node.id,
    parentId: node.parent?.id,
    
    // Component tracking for Code Connect integration
    componentInfo: {
      isComponent: node.type === 'COMPONENT' || node.type === 'COMPONENT_SET',
      isInstance: node.type === 'INSTANCE',
      componentId: node.type === 'INSTANCE' ? node.mainComponent?.id : null,
      componentName: node.type === 'INSTANCE' ? node.mainComponent?.name : null,
      variantProperties: node.variantProperties || {},
      hasCodeConnect: detectCodeConnectMapping(node)
    },
    
    // Design system compliance for MCP processing
    designTokenUsage: {
      usesVariables: extractVariableUsage(node),
      missingTokens: identifyMissingTokens(node),
      tokenCompliance: calculateTokenCompliance(node)
    },
    
    // Layout intent for better code generation
    layoutIntent: {
      hasAutoLayout: node.layoutMode !== 'NONE',
      layoutMode: node.layoutMode,
      isResponsive: checkResponsiveBehavior(node),
      breakpointHints: extractBreakpointHints(node)
    },
    
    // Size optimization following "avoid large frames" guidance
    optimizationInfo: {
      nodeCount: countChildNodes(node),
      complexity: assessComplexity(node),
      isOptimalSize: assessOptimalSize(node),
      suggestedSplitting: suggestComponentSplitting(node)
    }
  };

  // Add design system analysis if available
  if (detectedDesignSystem && complianceAnalyzer && node.type === 'FRAME') {
    try {
      console.log('🔍 Analyzing design system compliance for:', node.name);
      const complianceReport = await complianceAnalyzer.analyzeFrame(node);
      
      enhancedFrameData.designSystemContext = {
        designSystem: detectedDesignSystem,
        complianceReport,
        usedTokens: complianceReport.usedTokens,
        violations: complianceReport.violations,
        recommendations: complianceReport.recommendations
      };

      console.log('📊 Compliance analysis complete:', {
        overallScore: complianceReport.overallScore,
        violations: complianceReport.violations.length,
        recommendations: complianceReport.recommendations.length
      });
    } catch (error) {
      console.warn('Could not analyze design system compliance:', error);
    }
  }

  // 📸 Enhanced Visual Context: Capture screenshot for LLM analysis
  try {
    console.log('📸 Capturing screenshot for enhanced LLM context...');
    
    // Export the node as PNG for visual analysis
    const screenshot = await node.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: 2 }, // 2x for high quality
    });
    
    // Convert to base64 for LLM transmission
    const base64Screenshot = figma.base64Encode(screenshot);
    
    // Add visual context to enhanced frame data
    enhancedFrameData.visualContext = {
      screenshot: {
        format: 'PNG',
        scale: 2,
        base64: base64Screenshot,
        size: screenshot.byteLength,
        capturedAt: new Date().toISOString(),
        resolution: {
          width: Math.round(node.width * 2),
          height: Math.round(node.height * 2)
        }
      },
      visualAnalysis: {
        hasScreenshot: true,
        quality: 'high',
        suitable_for_llm: true,
        compression_ratio: Math.round((screenshot.byteLength / (node.width * node.height * 4)) * 100) / 100
      }
    };
    
    console.log(`✅ Screenshot captured: ${screenshot.byteLength} bytes, ${enhancedFrameData.visualContext.screenshot.resolution.width}x${enhancedFrameData.visualContext.screenshot.resolution.height}px`);
    
    // Add visual design context extraction
    enhancedFrameData.enhancedVisualContext = await extractVisualDesignContext(node);
    
  } catch (error) {
    console.warn('⚠️ Could not capture screenshot for LLM context:', error);
    
    // Fallback: Mark as no visual context available
    enhancedFrameData.visualContext = {
      screenshot: null,
      visualAnalysis: {
        hasScreenshot: false,
        quality: 'none',
        suitable_for_llm: false,
        error: error instanceof Error ? error.message : 'Screenshot capture failed'
      }
    };
  }

  return enhancedFrameData;
}

// 🎨 Extract enhanced visual design context for LLM understanding
async function extractVisualDesignContext(node: any): Promise<any> {
  const visualContext: any = {
    colorPalette: [],
    typography: {
      fonts: [],
      sizes: [],
      weights: [],
      hierarchy: []
    },
    spacing: {
      measurements: [],
      patterns: [],
      grid: null
    },
    layout: {
      structure: null,
      alignment: null,
      distribution: null
    },
    interactions: [],
    designPatterns: [],
    visualHierarchy: []
  };

  try {
    // Enhanced color extraction with RGB and semantic context
    if (node.findAll) {
      const colorNodes = node.findAll((n: any) => 'fills' in n && n.fills && Array.isArray(n.fills));
      const colorMap = new Map<string, { hex: string; rgb: any; usage: string[]; count: number }>();
      
      colorNodes.forEach((colorNode: any) => {
        colorNode.fills.forEach((fill: any) => {
          if (fill.type === 'SOLID' && fill.color && fill.visible !== false) {
            const { r, g, b } = fill.color;
            const rgb = { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            
            // Determine semantic usage based on node context
            const usage = determineColorUsage(colorNode, fill);
            
            if (colorMap.has(hex)) {
              const existing = colorMap.get(hex)!;
              existing.count++;
              if (!existing.usage.includes(usage)) {
                existing.usage.push(usage);
              }
            } else {
              colorMap.set(hex, { hex, rgb, usage: [usage], count: 1 });
            }
          }
        });
      });
      
      visualContext.colorPalette = Array.from(colorMap.values()).sort((a, b) => b.count - a.count);
    }

    // Enhanced typography analysis
    if (node.findAll) {
      const textNodes = node.findAll((n: any) => n.type === 'TEXT');
      const fontFamilies = new Set<string>();
      const fontSizes = new Set<number>();
      const fontWeights = new Set<string>();
      
      textNodes.forEach((textNode: any) => {
        if (textNode.fontName) {
          fontFamilies.add(textNode.fontName.family || 'Unknown');
          fontWeights.add(textNode.fontName.style || 'Regular');
        }
        if (typeof textNode.fontSize === 'number') {
          fontSizes.add(textNode.fontSize);
        }
      });
      
      visualContext.typography = {
        fonts: Array.from(fontFamilies),
        sizes: Array.from(fontSizes).sort((a, b) => b - a),
        weights: Array.from(fontWeights),
        hierarchy: categorizeTypographyHierarchy(Array.from(fontSizes))
      };
    }

    // Spacing and layout analysis
    visualContext.spacing = extractSpacingPatterns(node);
    visualContext.layout = analyzeLayoutStructure(node);
    
    // Design pattern recognition
    visualContext.designPatterns = identifyDesignPatterns(node);
    
    // Visual hierarchy analysis
    visualContext.visualHierarchy = analyzeVisualHierarchy(node);
    
    // Interaction states (if available)
    if (node.reactions && Array.isArray(node.reactions)) {
      visualContext.interactions = node.reactions.map((reaction: any) => ({
        trigger: reaction.trigger?.type || 'unknown',
        action: reaction.actions?.[0]?.type || 'unknown',
        target: reaction.actions?.[0]?.destinationId || null
      }));
    }

    return visualContext;
    
  } catch (error) {
    console.warn('Could not extract visual design context:', error);
    return {
      ...visualContext,
      extractionError: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Helper function to determine color usage context
function determineColorUsage(node: any, fill: any): string {
  const nodeName = node.name.toLowerCase();
  const nodeType = node.type;
  
  if (nodeType === 'TEXT') return 'text';
  if (nodeName.includes('button') || nodeName.includes('btn')) return 'button';
  if (nodeName.includes('background') || nodeName.includes('bg')) return 'background';
  if (nodeName.includes('border') || nodeName.includes('stroke')) return 'border';
  if (nodeName.includes('icon')) return 'icon';
  if (nodeType === 'FRAME' || nodeType === 'GROUP') return 'container';
  
  return 'element';
}

// Helper function to categorize typography hierarchy
function categorizeTypographyHierarchy(sizes: number[]): string[] {
  const sortedSizes = sizes.sort((a, b) => b - a);
  const hierarchy: string[] = [];
  
  sortedSizes.forEach((size, index) => {
    if (size >= 32) hierarchy.push(`h1 (${size}px)`);
    else if (size >= 24) hierarchy.push(`h2 (${size}px)`);
    else if (size >= 20) hierarchy.push(`h3 (${size}px)`);
    else if (size >= 16) hierarchy.push(`body (${size}px)`);
    else if (size >= 14) hierarchy.push(`small (${size}px)`);
    else hierarchy.push(`caption (${size}px)`);
  });
  
  return hierarchy;
}

// Helper function to extract spacing patterns
function extractSpacingPatterns(node: any): any {
  const spacing = {
    measurements: [] as number[],
    patterns: [] as string[],
    grid: null as any
  };
  
  try {
    // Extract padding values
    const paddingValues = [
      node.paddingLeft, node.paddingRight, 
      node.paddingTop, node.paddingBottom
    ].filter(p => typeof p === 'number' && p > 0);
    
    spacing.measurements.push(...paddingValues);
    
    // Extract item spacing
    if (typeof node.itemSpacing === 'number' && node.itemSpacing > 0) {
      spacing.measurements.push(node.itemSpacing);
    }
    
    // Identify common spacing patterns
    const uniqueSpacing = [...new Set(spacing.measurements)].sort((a, b) => a - b);
    if (uniqueSpacing.length > 0) {
      // Check for 8px grid
      const dividesBy8 = uniqueSpacing.every(s => s % 8 === 0);
      if (dividesBy8) spacing.patterns.push('8px-grid');
      
      // Check for 4px grid
      const dividesBy4 = uniqueSpacing.every(s => s % 4 === 0);
      if (dividesBy4) spacing.patterns.push('4px-grid');
    }
    
    return spacing;
  } catch (error) {
    return spacing;
  }
}

// Helper function to analyze layout structure
function analyzeLayoutStructure(node: any): any {
  const layout = {
    structure: null as string | null,
    alignment: null as string | null,
    distribution: null as string | null
  };
  
  try {
    if (node.layoutMode) {
      layout.structure = node.layoutMode.toLowerCase();
      layout.alignment = node.primaryAxisAlignItems || 'start';
      layout.distribution = node.counterAxisAlignItems || 'start';
    }
    
    return layout;
  } catch (error) {
    return layout;
  }
}

// Helper function to analyze visual hierarchy
function analyzeVisualHierarchy(node: any): string[] {
  const hierarchy: string[] = [];
  
  try {
    if (node.children && Array.isArray(node.children)) {
      // Analyze children by size, position, and styling
      const sortedBySize = node.children
        .filter((child: any) => child.width && child.height)
        .sort((a: any, b: any) => (b.width * b.height) - (a.width * a.height));
      
      sortedBySize.slice(0, 3).forEach((child: any, index: number) => {
        hierarchy.push(`${index + 1}. ${child.name} (${Math.round(child.width)}×${Math.round(child.height)}px)`);
      });
    }
    
    return hierarchy;
  } catch (error) {
    return hierarchy;
  }
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

// Extract hierarchical layer structure for understanding component organization
function extractLayerStructure(node: any, maxDepth: number = 3, currentDepth: number = 0): any {
  if (currentDepth >= maxDepth || !node) return null;
  
  const structure: any = {
    name: node.name,
    type: node.type,
    id: node.id,
    visible: node.visible !== false,
    children: []
  };
  
  // Add layout properties for containers
  if (node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT') {
    structure.layout = {
      layoutMode: node.layoutMode || 'NONE',
      primaryAxisAlignItems: node.primaryAxisAlignItems,
      counterAxisAlignItems: node.counterAxisAlignItems,
      itemSpacing: node.itemSpacing,
      paddingLeft: node.paddingLeft,
      paddingRight: node.paddingRight,
      paddingTop: node.paddingTop,
      paddingBottom: node.paddingBottom
    };
  }
  
  // Add basic styling info
  if (node.fills && node.fills.length > 0) {
    structure.fills = node.fills.map((fill: any) => ({
      type: fill.type,
      visible: fill.visible,
      color: fill.color ? `rgba(${Math.round(fill.color.r * 255)}, ${Math.round(fill.color.g * 255)}, ${Math.round(fill.color.b * 255)}, ${fill.color.a || 1})` : null
    }));
  }
  
  // Recursively process children
  if (node.children && Array.isArray(node.children)) {
    structure.children = node.children
      .map((child: any) => extractLayerStructure(child, maxDepth, currentDepth + 1))
      .filter((child: any) => child !== null);
  }
  
  return structure;
}

// Analyze semantic information and component patterns
function analyzeSemanticInfo(node: any): any {
  const semanticInfo: any = {
    componentType: identifyComponentType(node),
    complexity: calculateComplexity(node),
    patterns: identifyDesignPatterns(node),
    accessibility: analyzeAccessibility(node),
    interactivity: analyzeInteractivity(node)
  };
  
  return semanticInfo;
}

// Identify component type based on structure and naming
function identifyComponentType(node: any): string {
  const name = node.name.toLowerCase();
  const type = node.type;
  
  // Button patterns
  if (name.includes('button') || name.includes('btn') || 
      (type === 'FRAME' && name.includes('cta'))) {
    return 'button';
  }
  
  // Input patterns
  if (name.includes('input') || name.includes('field') || name.includes('textbox')) {
    return 'input';
  }
  
  // Navigation patterns
  if (name.includes('nav') || name.includes('menu') || name.includes('header')) {
    return 'navigation';
  }
  
  // Card patterns
  if (name.includes('card') || name.includes('tile') || name.includes('item')) {
    return 'card';
  }
  
  // Modal patterns
  if (name.includes('modal') || name.includes('dialog') || name.includes('popup')) {
    return 'modal';
  }
  
  // Layout patterns
  if (type === 'FRAME' && (name.includes('container') || name.includes('wrapper') || name.includes('layout'))) {
    return 'layout';
  }
  
  return 'generic';
}

// Calculate component complexity
function calculateComplexity(node: any): string {
  let score = 0;
  
  // Count children
  const childCount = node.children ? node.children.length : 0;
  score += Math.min(childCount * 2, 20);
  
  // Check for complex layouts
  if (node.layoutMode === 'VERTICAL' || node.layoutMode === 'HORIZONTAL') score += 5;
  if (node.constraints && Object.keys(node.constraints).length > 2) score += 3;
  
  // Check for styling complexity
  if (node.fills && node.fills.length > 1) score += 3;
  if (node.effects && node.effects.length > 0) score += node.effects.length * 2;
  
  // Check for text styling
  if (node.type === 'TEXT' && node.fontName) score += 2;
  
  if (score < 10) return 'simple';
  if (score < 25) return 'moderate';
  return 'complex';
}

// Identify design patterns
function identifyDesignPatterns(node: any): string[] {
  const patterns: string[] = [];
  
  if (node.layoutMode === 'HORIZONTAL') patterns.push('horizontal-layout');
  if (node.layoutMode === 'VERTICAL') patterns.push('vertical-layout');
  if (node.itemSpacing && node.itemSpacing > 0) patterns.push('spaced-layout');
  if (node.paddingLeft || node.paddingTop) patterns.push('padded-container');
  if (node.cornerRadius && node.cornerRadius > 0) patterns.push('rounded-corners');
  if (node.effects && node.effects.some((e: any) => e.type === 'DROP_SHADOW')) patterns.push('elevated');
  
  return patterns;
}

// Analyze accessibility features
function analyzeAccessibility(node: any): any {
  return {
    hasText: node.type === 'TEXT' || (node.children && node.children.some((child: any) => child.type === 'TEXT')),
    isInteractive: node.type === 'FRAME' && node.name.toLowerCase().includes('button'),
    hasProperContrast: true, // Would need more complex analysis
    hasSemanticStructure: node.name.toLowerCase().includes('header') || 
                         node.name.toLowerCase().includes('section') ||
                         node.name.toLowerCase().includes('nav')
  };
}

// Analyze interactivity hints
function analyzeInteractivity(node: any): any {
  const name = node.name.toLowerCase();
  return {
    clickable: name.includes('button') || name.includes('link') || name.includes('cta'),
    hoverable: name.includes('hover') || name.includes('button'),
    focusable: name.includes('input') || name.includes('button'),
    hasStates: name.includes('state') || name.includes('active') || name.includes('disabled')
  };
}

// Extract spacing and layout information
function extractSpacingInfo(node: any): any {
  const spacing: any = {
    internal: {},
    external: {},
    grid: null
  };
  
  // Internal spacing (padding)
  if (node.paddingLeft !== undefined) spacing.internal.left = node.paddingLeft;
  if (node.paddingRight !== undefined) spacing.internal.right = node.paddingRight;
  if (node.paddingTop !== undefined) spacing.internal.top = node.paddingTop;
  if (node.paddingBottom !== undefined) spacing.internal.bottom = node.paddingBottom;
  
  // Layout spacing
  if (node.itemSpacing !== undefined) spacing.internal.itemSpacing = node.itemSpacing;
  
  // External spacing (margins would need parent context)
  spacing.external.x = node.x || 0;
  spacing.external.y = node.y || 0;
  
  // Grid information
  if (node.layoutGrids && node.layoutGrids.length > 0) {
    spacing.grid = node.layoutGrids.map((grid: any) => ({
      pattern: grid.pattern,
      sectionSize: grid.sectionSize,
      gutterSize: grid.gutterSize,
      alignment: grid.alignment,
      count: grid.count
    }));
  }
  
  // Auto layout information
  if (node.layoutMode && node.layoutMode !== 'NONE') {
    spacing.autoLayout = {
      mode: node.layoutMode,
      primaryAlignment: node.primaryAxisAlignItems,
      counterAlignment: node.counterAxisAlignItems,
      sizing: {
        primaryAxis: node.primaryAxisSizingMode,
        counterAxis: node.counterAxisSizingMode
      }
    };
  }
  
  return spacing;
}

// ===== MCP-COMPLIANT HELPER FUNCTIONS =====
// Following Figma MCP server best practices for context extraction

// Generate semantic names following Figma MCP naming conventions
function generateSemanticName(node: any): string {
  const name = node.name;
  const type = node.type;
  
  // If already well-named, use it
  if (!name.match(/^(Frame|Group|Rectangle|Ellipse)\s*\d*$/)) {
    return name;
  }
  
  // Generate semantic name based on content and structure
  if (type === 'FRAME') {
    // Analyze children to determine purpose
    if (node.children) {
      const hasText = node.children.some((child: any) => child.type === 'TEXT');
      const hasButton = node.children.some((child: any) => 
        child.name.toLowerCase().includes('button') || 
        (child.type === 'FRAME' && child.cornerRadius > 0)
      );
      
      if (hasButton && hasText) return 'CallToActionSection';
      if (hasButton) return 'ButtonContainer';
      if (hasText) return 'ContentSection';
      if (node.children.length > 3) return 'ComponentGrid';
    }
    return 'Container';
  }
  
  if (type === 'TEXT') {
    const text = node.characters || '';
    if (text.length < 20) return 'Label';
    if (text.length < 100) return 'Description';
    return 'ContentText';
  }
  
  if (type === 'RECTANGLE' || type === 'FRAME') {
    if (node.cornerRadius && node.cornerRadius > 0) return 'Card';
    if (node.fills && node.fills.some((f: any) => f.type === 'IMAGE')) return 'ImageContainer';
  }
  
  return `${type}Component`;
}

// Detect Code Connect mappings following MCP guidelines
function detectCodeConnectMapping(node: any): boolean {
  // Check if component has Code Connect annotations
  // This would typically check against a registry or metadata
  
  if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
    const name = node.name.toLowerCase();
    
    // Common component patterns that likely have Code Connect
    const commonComponents = [
      'button', 'input', 'card', 'modal', 'header', 'footer', 
      'nav', 'sidebar', 'dropdown', 'tooltip', 'badge', 'avatar'
    ];
    
    return commonComponents.some(component => name.includes(component));
  }
  
  return false;
}

// Extract variable usage following Figma Variables API
function extractVariableUsage(node: any): any {
  const variables: any = {
    colors: [],
    typography: [],
    spacing: [],
    effects: []
  };
  
  // Check for bound variables on fills
  if (node.fills) {
    node.fills.forEach((fill: any) => {
      if (fill.boundVariables && fill.boundVariables.color) {
        variables.colors.push({
          variableId: fill.boundVariables.color.id,
          property: 'fill.color'
        });
      }
    });
  }
  
  // Check for bound variables on text styles
  if (node.type === 'TEXT' && node.boundVariables) {
    if (node.boundVariables.fontFamily) {
      variables.typography.push({
        variableId: node.boundVariables.fontFamily.id,
        property: 'fontFamily'
      });
    }
    if (node.boundVariables.fontSize) {
      variables.typography.push({
        variableId: node.boundVariables.fontSize.id,
        property: 'fontSize'
      });
    }
  }
  
  // Check for spacing variables
  if (node.paddingLeft && node.boundVariables?.paddingLeft) {
    variables.spacing.push({
      variableId: node.boundVariables.paddingLeft.id,
      property: 'paddingLeft'
    });
  }
  
  return variables;
}

// Identify missing design tokens for MCP optimization
function identifyMissingTokens(node: any): string[] {
  const missingTokens: string[] = [];
  
  // Check for hardcoded colors that should use variables
  if (node.fills) {
    node.fills.forEach((fill: any) => {
      if (fill.type === 'SOLID' && fill.color && !fill.boundVariables?.color) {
        missingTokens.push('color-token-missing');
      }
    });
  }
  
  // Check for hardcoded spacing
  if (node.paddingLeft && !node.boundVariables?.paddingLeft) {
    missingTokens.push('spacing-token-missing');
  }
  
  // Check for hardcoded typography
  if (node.type === 'TEXT') {
    if (node.fontSize && !node.boundVariables?.fontSize) {
      missingTokens.push('font-size-token-missing');
    }
    if (node.fontName && !node.boundVariables?.fontFamily) {
      missingTokens.push('font-family-token-missing');
    }
  }
  
  return missingTokens;
}

// Calculate token compliance score for MCP processing
function calculateTokenCompliance(node: any): number {
  let totalProperties = 0;
  let tokenizedProperties = 0;
  
  // Count color properties
  if (node.fills && node.fills.length > 0) {
    totalProperties += node.fills.length;
    tokenizedProperties += node.fills.filter((f: any) => f.boundVariables?.color).length;
  }
  
  // Count spacing properties
  const spacingProps = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'itemSpacing'];
  spacingProps.forEach(prop => {
    if (node[prop] !== undefined) {
      totalProperties++;
      if (node.boundVariables && node.boundVariables[prop]) {
        tokenizedProperties++;
      }
    }
  });
  
  // Count typography properties
  if (node.type === 'TEXT') {
    totalProperties += 2; // fontSize and fontFamily
    if (node.boundVariables?.fontSize) tokenizedProperties++;
    if (node.boundVariables?.fontFamily) tokenizedProperties++;
  }
  
  return totalProperties > 0 ? (tokenizedProperties / totalProperties) * 100 : 100;
}

// Check responsive behavior for MCP code generation
function checkResponsiveBehavior(node: any): boolean {
  // Check for auto layout which indicates responsive design
  if (node.layoutMode !== 'NONE') return true;
  
  // Check for constraints that suggest responsive behavior
  if (node.constraints) {
    const hasScaleConstraints = 
      node.constraints.horizontal === 'SCALE' || 
      node.constraints.vertical === 'SCALE';
    return hasScaleConstraints;
  }
  
  return false;
}

// Extract breakpoint hints for MCP responsive code generation
function extractBreakpointHints(node: any): any {
  const hints: any = {
    mobile: null,
    tablet: null,
    desktop: null
  };
  
  // Analyze width to suggest breakpoints
  if (node.width) {
    if (node.width <= 375) hints.mobile = 'optimized';
    else if (node.width <= 768) hints.tablet = 'optimized';
    else hints.desktop = 'optimized';
  }
  
  // Check for responsive layout properties
  if (node.layoutMode === 'HORIZONTAL') {
    hints.mobile = 'may-need-stacking';
  }
  
  return hints;
}

// Count child nodes for MCP size optimization
function countChildNodes(node: any): number {
  if (!node.children) return 0;
  
  let count = node.children.length;
  node.children.forEach((child: any) => {
    count += countChildNodes(child);
  });
  
  return count;
}

// Assess complexity following MCP performance guidelines
function assessComplexity(node: any): string {
  const nodeCount = countChildNodes(node);
  const hasEffects = node.effects && node.effects.length > 0;
  const hasBlending = node.blendMode && node.blendMode !== 'NORMAL';
  const hasClipping = node.clipsContent;
  
  let complexityScore = 0;
  
  // Node count impact
  if (nodeCount > 50) complexityScore += 3;
  else if (nodeCount > 20) complexityScore += 2;
  else if (nodeCount > 10) complexityScore += 1;
  
  // Visual effects impact
  if (hasEffects) complexityScore += 2;
  if (hasBlending) complexityScore += 1;
  if (hasClipping) complexityScore += 1;
  
  // Layout complexity
  if (node.layoutMode !== 'NONE') complexityScore += 1;
  
  if (complexityScore >= 5) return 'high';
  if (complexityScore >= 3) return 'medium';
  return 'low';
}

// Assess if frame size is optimal for MCP processing
function assessOptimalSize(node: any): boolean {
  const nodeCount = countChildNodes(node);
  const complexity = assessComplexity(node);
  
  // Following Figma MCP guidance: avoid large, heavy frames
  if (nodeCount > 100) return false;
  if (complexity === 'high' && nodeCount > 50) return false;
  
  return true;
}

// Suggest component splitting for better MCP processing
function suggestComponentSplitting(node: any): string[] {
  const suggestions: string[] = [];
  const nodeCount = countChildNodes(node);
  
  if (nodeCount > 100) {
    suggestions.push('Consider breaking into smaller components');
  }
  
  if (node.children && node.children.length > 10) {
    suggestions.push('Consider grouping related elements into sub-components');
  }
  
  // Check for repeating patterns
  if (node.children) {
    const childTypes = node.children.map((child: any) => child.type);
    const hasRepeatingPattern = childTypes.length > 3 && 
      childTypes.every((type: any) => type === childTypes[0]);
    
    if (hasRepeatingPattern) {
      suggestions.push('Repeating elements detected - consider creating a reusable component');
    }
  }
  
  return suggestions;
}

// Initialize plugin
console.log('AI Ticket Generator plugin loaded');