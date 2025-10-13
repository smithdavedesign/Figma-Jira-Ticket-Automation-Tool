/// <reference path="./types.ts" />

// Main plugin code that runs in Figma's sandbox environment
figma.showUI(__html__, { 
  width: 500, 
  height: 600,
  themeColors: true 
});

// Listen for messages from the UI
figma.ui.onmessage = async (msg: PluginMessage) => {
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

  if (msg.type === 'close-plugin') {
    figma.closePlugin();
  }
};

// Extract comprehensive data from a Figma node
async function extractFrameData(node: SceneNode): Promise<FrameData> {
  const frameData: FrameData = {
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
    fileKey: figma.fileKey,
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
      const textNodes = node.findAll((n: any) => n.type === 'TEXT');
      frameData.textContent = textNodes.map((textNode: any) => ({
        content: textNode.characters || '',
        fontSize: typeof textNode.fontSize === 'number' ? textNode.fontSize : 'mixed',
        fontName: typeof textNode.fontName === 'object' && textNode.fontName ? textNode.fontName.family : 'mixed'
      }));

      // Extract component instances
      const componentNodes = node.findAll((n: any) => n.type === 'INSTANCE');
      frameData.components = componentNodes.map((comp: any) => ({
        name: comp.name || 'Unknown',
        masterComponent: comp.masterComponent?.name || 'Unknown'
      }));

      // Extract colors from fills
      const nodesWithFills = node.findAll((n: any) => 'fills' in n && n.fills !== figma.mixed);
      frameData.colors = extractColorsFromNodes(nodesWithFills);
    }
  }

  // Check for prototype connections
  if ('reactions' in node && Array.isArray(node.reactions) && node.reactions.length > 0) {
    frameData.hasPrototype = true;
  }

  return frameData;
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