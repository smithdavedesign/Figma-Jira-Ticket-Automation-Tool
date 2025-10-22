/// <reference types="@figma/plugin-typings" />

// Show UI
figma.showUI(__html__, { width: 500, height: 700 });

// Plugin main logic
figma.ui.onmessage = async (msg: any) => {
  console.log('🔌 Plugin received message:', msg.type);

  try {
    switch (msg.type) {
      case 'get-context':
        await handleGetContext();
        break;
      case 'capture-screenshot':
        await handleCaptureScreenshot();
        break;
      case 'generate-ai-ticket':
        await handleGenerateAITicket();
        break;
      case 'close':
        figma.closePlugin();
        break;
      default:
        console.log('Unhandled message type:', msg.type);
    }
  } catch (error) {
    console.error('Plugin error:', error);
    figma.ui.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get current context (selection + file info)
async function handleGetContext() {
  const selection = figma.currentPage.selection;
  const fileInfo = {
    fileKey: figma.fileKey || 'dev-file',
    fileName: figma.root.name || 'Figma Design',
    pageId: figma.currentPage.id,
    pageName: figma.currentPage.name
  };

  // Send file context
  figma.ui.postMessage({
    type: 'file-context',
    data: fileInfo
  });

  // Send selection context with enhanced data
  if (selection.length > 0) {
    const selectionData = await Promise.all(selection.map(async (node: any) => {
      const nodeInfo: any = {
        id: node.id,
        name: node.name,
        type: node.type,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        visible: node.visible,
        locked: node.locked
      };

      // Add type-specific properties
      if ('fills' in node && node.fills && node.fills.length > 0) {
        nodeInfo.fills = node.fills.map((fill: any) => ({
          type: fill.type,
          color: fill.type === 'SOLID' ? fill.color : null
        }));
      }

      if ('characters' in node) {
        nodeInfo.text = node.characters;
        nodeInfo.fontSize = node.fontSize;
        nodeInfo.fontName = node.fontName;
      }

      return nodeInfo;
    }));

    figma.ui.postMessage({
      type: 'selection-context',
      data: selectionData
    });
  } else {
    // Send empty selection
    figma.ui.postMessage({
      type: 'selection-context',
      data: []
    });
  }
}

// Capture screenshot of current selection or page
async function handleCaptureScreenshot() {
  console.log('📸 Capturing screenshot...');

  try {
    const selection = figma.currentPage.selection;
    let targetNode: any;

    // Smart node selection for better screenshots
    if (selection.length === 0) {
      const firstFrame = figma.currentPage.findOne(n => n.type === 'FRAME');
      if (!firstFrame) {
        figma.notify('⚠️ No frame found to export.');
        return;
      }
      targetNode = firstFrame;
    } else if (selection.length === 1) {
      // Single selection - capture that node
      targetNode = selection[0];
      console.log(`📸 Capturing single selection: ${targetNode.name} (${targetNode.type})`);
    } else {
      // Multiple selections - try to find best parent or capture the first selection
      const firstNode = selection[0];
      let bestParent = null;

      // Look for a common parent frame that contains all selected items
      let currentParent = firstNode.parent;
      while (currentParent && currentParent.type !== 'PAGE') {
        const containsAll = selection.every(node => {
          let ancestor = node.parent;
          while (ancestor && ancestor !== currentParent) {
            ancestor = ancestor.parent;
          }
          return ancestor === currentParent;
        });

        if (containsAll && (currentParent.type === 'FRAME' || currentParent.type === 'COMPONENT')) {
          bestParent = currentParent;
          break;
        }
        currentParent = currentParent.parent;
      }

      targetNode = bestParent || firstNode;
      console.log(`📸 Multiple selections, capturing: ${targetNode.name} (${targetNode.type})`);
    }

    // Enhanced export settings for better quality
    const exportSettings = {
      format: 'PNG' as const,
      constraint: {
        type: 'SCALE' as const,
        value: 2 // 2x scale for high-quality screenshots
      },
      // Add contentsOnly for better cropping on frames
      ...(targetNode.type === 'FRAME' && { contentsOnly: false })
    };

    console.log(`📸 Exporting ${targetNode.name} with settings:`, exportSettings);
    const screenshot = await targetNode.exportAsync(exportSettings);

    if (!screenshot || screenshot.length === 0) {
      throw new Error('Export returned empty data');
    }

    // Convert to base64
    const base64 = figma.base64Encode(screenshot);
    const dataUrl = `data:image/png;base64,${base64}`;

    // Validate the base64 data
    if (!base64 || base64.length < 100) {
      throw new Error('Generated base64 data is too small or empty');
    }

    figma.ui.postMessage({
      type: 'screenshot-captured',
      screenshot: dataUrl,
      metadata: {
        nodeName: targetNode.name,
        nodeType: targetNode.type,
        nodeId: targetNode.id,
        size: screenshot.length,
        base64Length: base64.length,
        captureTime: new Date().toISOString()
      }
    });

    console.log(`✅ Screenshot captured successfully: ${screenshot.length} bytes, base64: ${base64.length} chars`);

  } catch (error) {
    console.error('❌ Screenshot capture failed:', error);

    // Send detailed error information
    figma.ui.postMessage({
      type: 'screenshot-captured',
      screenshot: null,
      error: {
        message: error instanceof Error ? error.message : 'Screenshot capture failed',
        stack: error instanceof Error ? error.stack : undefined,
        selection: figma.currentPage.selection.map(node => ({
          id: node.id,
          name: node.name,
          type: node.type
        }))
      }
    });
  }
}

// Generate AI ticket with enhanced data
async function handleGenerateAITicket() {
  console.log('🤖 Generating AI ticket with enhanced data...');

  const selection = figma.currentPage.selection;
  const fileInfo = {
    fileKey: figma.fileKey || 'dev-file',
    fileName: figma.root.name || 'Figma Design',
    pageId: figma.currentPage.id,
    pageName: figma.currentPage.name
  };

  // Prepare enhanced frame data
  const enhancedFrameData = await Promise.all(selection.map(async (node: any) => {
    const baseData: any = {
      id: node.id,
      name: node.name,
      type: node.type,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      visible: node.visible,
      locked: node.locked
    };

    // Add dimensions (required field)
    baseData.dimensions = {
      width: node.width,
      height: node.height,
      x: node.x,
      y: node.y
    };

    // Add fills/colors
    const colors: any[] = [];
    if ('fills' in node && node.fills) {
      baseData.fills = node.fills.map((fill: any) => {
        if (fill.type === 'SOLID') {
          const color = fill.color;
          const hexColor = rgbToHex(color.r * 255, color.g * 255, color.b * 255);
          colors.push(hexColor);
          return {
            type: 'SOLID',
            color: {
              r: Math.round(color.r * 255),
              g: Math.round(color.g * 255),
              b: Math.round(color.b * 255)
            },
            hex: hexColor
          };
        }
        return { type: fill.type };
      });
    }

    // Add text properties
    if ('characters' in node) {
      baseData.text = node.characters;
      baseData.fontSize = node.fontSize;
      baseData.fontName = node.fontName;
    }

    // Add component properties
    if (node.type === 'INSTANCE') {
      try {
        const masterComponent = await node.getMainComponentAsync();
        baseData.masterComponent = {
          id: masterComponent ? masterComponent.id : undefined,
          name: masterComponent ? masterComponent.name : undefined
        };
      } catch (error) {
        console.warn('Could not access master component:', error);
        baseData.masterComponent = {
          id: undefined,
          name: undefined
        };
      }
    }

    // Build hierarchy information (required field)
    const hierarchy = await buildHierarchy(node);
    baseData.hierarchy = hierarchy;

    // Build metadata (required field)
    baseData.metadata = {
      colors: colors,
      semanticRole: determineSemanticRole(node),
      extractedAt: new Date().toISOString(),
      figmaType: node.type,
      hasText: 'characters' in node && !!node.characters,
      isComponent: node.type === 'INSTANCE' || node.type === 'COMPONENT',
      childCount: 'children' in node ? node.children?.length || 0 : 0
    };

    return baseData;
  }));

  // Capture high-quality screenshot for AI analysis
  let screenshot = null;
  try {
    let targetNode: any;

    // Use the same smart selection logic as handleCaptureScreenshot
    if (selection.length === 0) {
      const firstFrame = figma.currentPage.findOne(n => n.type === 'FRAME');
      if (!firstFrame) {
        figma.notify('⚠️ No frame found to export.');
        return;
      }
      targetNode = firstFrame;
    } else if (selection.length === 1) {
      targetNode = selection[0];
    } else {
      // For multiple selections, find the best parent frame
      const firstNode = selection[0];
      let bestParent = null;

      let currentParent = firstNode.parent;
      while (currentParent && currentParent.type !== 'PAGE') {
        const containsAll = selection.every(node => {
          let ancestor = node.parent;
          while (ancestor && ancestor !== currentParent) {
            ancestor = ancestor.parent;
          }
          return ancestor === currentParent;
        });

        if (containsAll && (currentParent.type === 'FRAME' || currentParent.type === 'COMPONENT')) {
          bestParent = currentParent;
          break;
        }
        currentParent = currentParent.parent;
      }

      targetNode = bestParent || firstNode;
    }

    console.log(`📸 AI Analysis: Capturing ${targetNode.name} (${targetNode.type})`);

    const screenshotBytes = await targetNode.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: 2 },
      ...(targetNode.type === 'FRAME' && { contentsOnly: false })
    });

    if (screenshotBytes && screenshotBytes.length > 0) {
      const base64 = figma.base64Encode(screenshotBytes);
      screenshot = `data:image/png;base64,${base64}`;
      console.log(`📸 Screenshot captured for AI analysis: ${screenshotBytes.length} bytes`);
    } else {
      console.warn('⚠️ Screenshot export returned empty data');
    }
  } catch (error) {
    console.warn('⚠️ Screenshot capture failed for AI analysis:', error);
    screenshot = null;
  }

  figma.ui.postMessage({
    type: 'ai-ticket-data',
    data: {
      enhancedFrameData,
      fileContext: fileInfo,
      screenshot: screenshot,
      metadata: {
        selectionCount: selection.length,
        pageInfo: {
          id: figma.currentPage.id,
          name: figma.currentPage.name
        }
      }
    }
  });
}

// Helper function to convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Helper function to build hierarchy information with enhanced token extraction
async function buildHierarchy(node: any): Promise<any> {
  const layers: any[] = [];
  const designTokens = {
    colors: new Set<string>(),
    typography: new Set<string>(),
    spacing: new Set<number>(),
    borderRadius: new Set<number>(),
    shadows: new Set<string>()
  };
  let totalDepth = 1;
  let componentCount = 0;
  let textLayerCount = 0;

  // Enhanced node analysis with design token extraction
  async function analyzeNode(currentNode: any, depth: number = 1): Promise<void> {
    totalDepth = Math.max(totalDepth, depth);

    if (currentNode.type === 'INSTANCE' || currentNode.type === 'COMPONENT') {
      componentCount++;
    }

    if (currentNode.type === 'TEXT') {
      textLayerCount++;
    }

    // Extract design tokens from this node
    const nodeTokens = await extractDesignTokens(currentNode);

    // Collect extracted tokens
    if (nodeTokens.colors) nodeTokens.colors.forEach((c: string) => designTokens.colors.add(c));
    if (nodeTokens.typography) nodeTokens.typography.forEach((t: string) => designTokens.typography.add(t));
    if (nodeTokens.spacing) nodeTokens.spacing.forEach((s: number) => designTokens.spacing.add(s));
    if (nodeTokens.borderRadius) nodeTokens.borderRadius.forEach((r: number) => designTokens.borderRadius.add(r));
    if (nodeTokens.shadows) nodeTokens.shadows.forEach((sh: string) => designTokens.shadows.add(sh));

    // Enhanced layer information
    const layerInfo: any = {
      id: currentNode.id,
      name: currentNode.name,
      type: currentNode.type,
      depth: depth,
      position: { x: currentNode.x, y: currentNode.y },
      size: { width: currentNode.width, height: currentNode.height },
      visible: currentNode.visible,
      semanticRole: determineSemanticRole(currentNode),
      tokens: nodeTokens
    };

    // Add component-specific information
    if (currentNode.type === 'INSTANCE') {
      try {
        const masterComponent = await currentNode.getMainComponentAsync();
        layerInfo.masterComponent = {
          id: masterComponent?.id,
          name: masterComponent?.name
        };

        // Extract component properties and variants
        if (currentNode.componentProperties) {
          layerInfo.componentProperties = currentNode.componentProperties;
        }

        // Extract variant properties if available
        if (masterComponent && 'variantProperties' in masterComponent) {
          layerInfo.variantProperties = masterComponent.variantProperties;
        }
      } catch (error) {
        console.warn('Could not access master component:', error);
      }
    }

    layers.push(layerInfo);

    // Recursively analyze children
    if ('children' in currentNode && currentNode.children) {
      for (const child of currentNode.children) {
        await analyzeNode(child, depth + 1);
      }
    }
  }

  await analyzeNode(node);

  return {
    layers: layers,
    totalDepth: totalDepth,
    componentCount: componentCount,
    textLayerCount: textLayerCount,
    designTokens: {
      colors: Array.from(designTokens.colors),
      typography: Array.from(designTokens.typography),
      spacing: Array.from(designTokens.spacing),
      borderRadius: Array.from(designTokens.borderRadius),
      shadows: Array.from(designTokens.shadows)
    }
  };
}

// Enhanced design token extraction function
async function extractDesignTokens(node: any): Promise<any> {
  const tokens: any = {
    colors: [],
    typography: [],
    spacing: [],
    borderRadius: [],
    shadows: []
  };

  try {
    // Extract color tokens
    if ('fills' in node && node.fills) {
      node.fills.forEach((fill: any) => {
        if (fill.type === 'SOLID' && fill.color) {
          const hex = rgbToHex(
            Math.round(fill.color.r * 255),
            Math.round(fill.color.g * 255),
            Math.round(fill.color.b * 255)
          );
          tokens.colors.push(hex);
        }
      });
    }

    // Extract stroke colors
    if ('strokes' in node && node.strokes) {
      node.strokes.forEach((stroke: any) => {
        if (stroke.type === 'SOLID' && stroke.color) {
          const hex = rgbToHex(
            Math.round(stroke.color.r * 255),
            Math.round(stroke.color.g * 255),
            Math.round(stroke.color.b * 255)
          );
          tokens.colors.push(hex);
        }
      });
    }

    // Extract typography tokens
    if (node.type === 'TEXT') {
      const fontSize = node.fontSize || 16;
      const fontFamily = node.fontName?.family || 'Inter';
      const fontWeight = node.fontName?.style || 'Regular';
      const lineHeight = node.lineHeight?.value || fontSize * 1.2;

      const typographyToken = `${fontFamily}-${fontSize}px-${fontWeight}`;
      tokens.typography.push(typographyToken);

      // Extract letter spacing if available
      if (node.letterSpacing && node.letterSpacing.value !== 0) {
        tokens.spacing.push(node.letterSpacing.value);
      }
    }

    // Extract spacing tokens from layout properties
    if ('paddingLeft' in node || 'paddingTop' in node) {
      [node.paddingLeft, node.paddingRight, node.paddingTop, node.paddingBottom].forEach((padding: any) => {
        if (padding && padding > 0) {
          tokens.spacing.push(padding);
        }
      });
    }

    // Extract spacing from positioning (relative to siblings)
    if ('x' in node && 'y' in node) {
      // Common spacing values: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
      const spacingValues = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
      spacingValues.forEach(value => {
        if (node.x % value === 0 || node.y % value === 0) {
          tokens.spacing.push(value);
        }
      });
    }

    // Extract border radius tokens
    if ('cornerRadius' in node && node.cornerRadius > 0) {
      tokens.borderRadius.push(node.cornerRadius);
    }

    // Extract individual corner radii
    if ('topLeftRadius' in node) {
      [node.topLeftRadius, node.topRightRadius, node.bottomLeftRadius, node.bottomRightRadius].forEach((radius: any) => {
        if (radius && radius > 0) {
          tokens.borderRadius.push(radius);
        }
      });
    }

    // Extract shadow tokens
    if ('effects' in node && node.effects) {
      node.effects.forEach((effect: any) => {
        if (effect.type === 'DROP_SHADOW') {
          const shadow = `${effect.offset?.x || 0}px ${effect.offset?.y || 0}px ${effect.radius || 0}px`;
          tokens.shadows.push(shadow);
        }
      });
    }

  } catch (error) {
    console.warn('Error extracting design tokens:', error);
  }

  // Remove duplicates and sort
  tokens.colors = [...new Set(tokens.colors)];
  tokens.typography = [...new Set(tokens.typography)];
  tokens.spacing = ([...new Set(tokens.spacing)] as number[]).sort((a, b) => a - b);
  tokens.borderRadius = ([...new Set(tokens.borderRadius)] as number[]).sort((a, b) => a - b);
  tokens.shadows = [...new Set(tokens.shadows)];

  return tokens;
}

// Helper function to determine semantic role
function determineSemanticRole(node: any): string {
  // Determine semantic role based on node type and properties
  switch (node.type) {
    case 'TEXT':
      return 'text';
    case 'RECTANGLE':
    case 'ELLIPSE':
    case 'POLYGON':
      return 'shape';
    case 'FRAME':
      return 'container';
    case 'GROUP':
      return 'group';
    case 'INSTANCE':
      return 'component-instance';
    case 'COMPONENT':
      return 'component-definition';
    case 'VECTOR':
      return 'icon';
    default:
      // Try to infer from name
      const name = node.name.toLowerCase();
      if (name.includes('button')) return 'button';
      if (name.includes('input') || name.includes('field')) return 'input';
      if (name.includes('header') || name.includes('title')) return 'header';
      if (name.includes('nav') || name.includes('menu')) return 'navigation';
      if (name.includes('card')) return 'card';
      if (name.includes('modal') || name.includes('dialog')) return 'modal';
      return 'unknown';
  }
}

console.log('✅ Enhanced Figma Plugin loaded successfully');
