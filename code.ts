/// <reference types="@figma/plugin-typings" />

// Show UI
figma.showUI(__html__, { width: 500, height: 700 });

// Screenshot API Configuration
const SCREENSHOT_CONFIG = {
  DEVELOPMENT_API: 'http://localhost:3000/api/figma/screenshot',
  PRODUCTION_API: 'https://your-production-server.com/api/figma/screenshot',
  DEFAULT_FORMAT: 'png',
  DEFAULT_SCALE: 2,
  TIMEOUT_MS: 15000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
};

// Screenshot utility functions
async function fetchScreenshot(fileKey: string, nodeId: string, options: any = {}): Promise<string> {
  const {
    format = SCREENSHOT_CONFIG.DEFAULT_FORMAT,
    scale = SCREENSHOT_CONFIG.DEFAULT_SCALE,
    timeout = SCREENSHOT_CONFIG.TIMEOUT_MS,
    retries = SCREENSHOT_CONFIG.MAX_RETRIES
  } = options;

  const baseUrl = SCREENSHOT_CONFIG.DEVELOPMENT_API; // For now, use development endpoint
  
  // Manual parameter building for Figma plugin compatibility (no URLSearchParams)
  const paramPairs = [
    `fileKey=${encodeURIComponent(fileKey)}`,
    `nodeId=${encodeURIComponent(nodeId)}`,
    `format=${encodeURIComponent(format)}`,
    `scale=${encodeURIComponent(scale.toString())}`
  ];
  
  const requestUrl = `${baseUrl}?${paramPairs.join('&')}`;
  console.log(`📸 Fetching screenshot from backend: ${nodeId} in ${fileKey}`);

  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📸 Attempt ${attempt}/${retries}: ${requestUrl}`);
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Design-Intelligence-MCP-Client/1.0.0'
        }
      });
      
      if (!response.ok) {
        let errorMessage = `Screenshot API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage += `. ${errorData.message}`;
          }
        } catch {
          // Ignore JSON parse errors for error responses
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data.imageUrl) {
        throw new Error('No image URL returned from screenshot API');
      }
      
      console.log(`✅ Screenshot fetched successfully:`, {
        nodeId,
        fileKey,
        cached: data.cached,
        imageUrl: data.imageUrl.substring(0, 50) + '...',
        requestTime: data.metadata?.requestTime
      });
      
      return data.imageUrl;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`❌ Screenshot fetch attempt ${attempt} failed:`, lastError.message);
      
      if (lastError.message.includes('400') || lastError.message.includes('404')) {
        throw lastError;
      }
      
      if (attempt < retries) {
        const delay = SCREENSHOT_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Screenshot fetch failed after all retries');
}

function getFallbackScreenshot(nodeId: string, nodeName: string = 'Unknown'): any {
  const svgContent = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0" stroke="#ddd" stroke-width="2"/>
      <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
        Screenshot Unavailable
      </text>
      <text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="12" fill="#999">
        ${nodeName}
      </text>
      <text x="50%" y="70%" text-anchor="middle" font-family="Arial" font-size="10" fill="#999">
        Backend API not available
      </text>
    </svg>
  `.trim();
  
  // For Figma plugin environment, manually encode UTF-8 (no TextEncoder available)
  function stringToUint8Array(str: string): Uint8Array {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code < 0x80) {
        bytes.push(code);
      } else if (code < 0x800) {
        bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      } else if (code < 0xd800 || code >= 0xe000) {
        bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      } else {
        // Surrogate pair
        i++;
        const hi = code;
        const lo = str.charCodeAt(i);
        const codePoint = 0x10000 + (((hi & 0x3ff) << 10) | (lo & 0x3ff));
        bytes.push(0xf0 | (codePoint >> 18), 0x80 | ((codePoint >> 12) & 0x3f), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
      }
    }
    return new Uint8Array(bytes);
  }
  
  const base64Content = figma.base64Encode(stringToUint8Array(svgContent));
  const placeholderUrl = `data:image/svg+xml;base64,${base64Content}`;
  
  return {
    imageUrl: placeholderUrl,
    metadata: {
      nodeId,
      nodeName,
      fallback: true,
      source: 'placeholder',
      fileKey: 'unknown',
      captureTime: new Date().toISOString()
    }
  };
}

// Plugin main logic
figma.ui.onmessage = async (msg: any) => {
  console.log('🔌 Plugin received message:', msg.type);

  try {
    switch (msg.type) {
      case 'get-context':
        await handleGetContext();
        break;
      case 'get-advanced-context':
        await handleGetAdvancedContext();
        break;
      case 'capture-screenshot':
        await handleCaptureScreenshot();
        break;
      case 'generate-ai-ticket':
        await handleGenerateAITicket();
        break;
      case 'debug-selection':
        await debugCurrentContext();
        break;
      case 'precise-screenshot':
        await handlePreciseScreenshot();
        break;
      case 'analyze-design-health':
        await handleAnalyzeDesignHealth(msg);
        break;
      case 'real-file-key-response':
        // This is handled by the callback system, no action needed
        console.log('File key response received');
        break;
      case 'file-key-response':
        // This is handled by the callback system, no action needed
        console.log('File key response received');
        break;
      case 'file-key-response-for-screenshot':
        // This is handled by the callback system, no action needed
        console.log('File key response for screenshot received');
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
// Handler for design health analysis
async function handleAnalyzeDesignHealth(msg: any) {
  // Analyze current selection for design health metrics
  const selection = figma.currentPage.selection;
  let componentCoverage = 0;
  let consistencyScore = 0;
  let performanceGrade = 'B';
  let colorPaletteMatch = true;
  let typographyIssues = 0;
  let spacingGridOk = true;

  if (selection.length > 0) {
    // Example metrics: count components, check for font size consistency, color token usage
    const componentCount = selection.filter(n => n.type === 'COMPONENT' || n.type === 'INSTANCE').length;
    componentCoverage = Math.round((componentCount / selection.length) * 100);

    // Consistency: check if all text nodes use the same font size
    const textNodes = selection.filter(n => n.type === 'TEXT');
    const fontSizes = Array.from(new Set(textNodes.map(n => n.fontSize)));
    typographyIssues = fontSizes.length > 1 ? fontSizes.length - 1 : 0;
    consistencyScore = 100 - typographyIssues * 3;
    if (consistencyScore < 0) consistencyScore = 0;

    // Performance: check if all frames/components are visible and not locked
    const allVisible = selection.every(n => n.visible);
    const allUnlocked = selection.every(n => !n.locked);
    performanceGrade = allVisible && allUnlocked ? 'A+' : 'B';

    // Color palette: check if fills use design tokens (simulate)
    colorPaletteMatch = selection.every(n => {
      if ('fills' in n && Array.isArray(n.fills) && n.fills.length > 0) {
        return n.fills.some((fill: any) => fill.type === 'SOLID');
      }
      return true;
    });

    // Spacing grid: check if frames have width/height multiples of 8
    spacingGridOk = selection.every(n => {
      if ('width' in n && 'height' in n) {
        return n.width % 8 === 0 && n.height % 8 === 0;
      }
      return true;
    });
  }

  // Send results to UI
  figma.ui.postMessage({
    type: 'design-health-results',
    data: {
      componentCoverage,
      consistencyScore,
      performanceGrade,
      colorPaletteMatch,
      typographyIssues,
      spacingGridOk,
      selectionCount: selection.length
    }
  });
}
};

// Get current context (selection + file info)
async function handleGetContext() {
  const selection = figma.currentPage.selection;

  // Helper to send file context and selection
  function sendContext(fileKey: string) {
    const fileInfo = {
      fileKey: fileKey,
      fileName: figma.root.name || 'Figma Design',
      pageId: figma.currentPage.id,
      pageName: figma.currentPage.name
    };

    figma.ui.postMessage({
      type: 'file-context',
      data: fileInfo
    });

    if (selection.length > 0) {
      const selectionData = selection.map((node: any) => {
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
        if ('fills' in node && Array.isArray(node.fills) && node.fills.length > 0) {
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
      });
      figma.ui.postMessage({
        type: 'selection-context',
        data: selectionData
      });
    } else {
      figma.ui.postMessage({
        type: 'selection-context',
        data: []
      });
    }
  }

  // If fileKey is missing or 'dev-file', request from UI with timeout fallback
  if (!figma.fileKey || figma.fileKey === 'dev-file') {
    console.log('🔍 Requesting real fileKey from UI...');
    const callbackId = 'fileKeyCallback_' + Date.now();
    let responded = false;
    
    // Set up response handler
    function onMessage(msg: any) {
      if (msg.type === 'real-file-key-response' && msg.callback === callbackId && !responded) {
        responded = true;
        figma.ui.off('message', onMessage);
        console.log('✅ Got fileKey from UI:', msg.fileKey);
        sendContext(msg.fileKey || 'BioUSVD6t51ZNeG0g9AcNz');
      }
    }
    figma.ui.on('message', onMessage);
    
    // Request file key from UI
    figma.ui.postMessage({ type: 'get-real-file-key', callback: callbackId });
    
    // Fallback after timeout
    setTimeout(() => {
      if (!responded) {
        responded = true;
        figma.ui.off('message', onMessage);
        console.log('⚠️ UI fileKey request timed out, using fallback');
        sendContext('BioUSVD6t51ZNeG0g9AcNz');
      }
    }, 2000);
  } else {
    sendContext(figma.fileKey);
  }
}

// Handle advanced context dashboard request
async function handleGetAdvancedContext() {
  console.log('🔍 Getting advanced context for dashboard...');
  
  const selection = figma.currentPage.selection;
  
  // Helper to send advanced context data
  async function sendAdvancedContext(fileKey: string) {
    const fileInfo = {
      fileKey: fileKey,
      fileName: figma.root.name || 'Figma Design',
      pageId: figma.currentPage.id,
      pageName: figma.currentPage.name
    };
    
    // Process selection data with proper async handling for components
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
      
      // Add fills data
      if ('fills' in node && Array.isArray(node.fills) && node.fills.length > 0) {
        nodeInfo.fills = node.fills.map((fill: any) => ({
          type: fill.type,
          color: fill.type === 'SOLID' ? fill.color : null
        }));
      }
      
      // Add text data
      if ('characters' in node) {
        nodeInfo.text = node.characters;
        nodeInfo.fontSize = node.fontSize;
        nodeInfo.fontName = node.fontName;
      }
      
      // Add component/instance data using async method
      if (node.type === 'INSTANCE') {
        try {
          const masterComponent = await node.getMainComponentAsync();
          if (masterComponent) {
            nodeInfo.componentId = masterComponent.id;
            nodeInfo.componentName = masterComponent.name;
          }
        } catch (error) {
          console.log('⚠️ Could not get master component for node:', node.name, error);
          // Set fallback values
          nodeInfo.componentId = 'unknown';
          nodeInfo.componentName = 'Unknown Component';
        }
      }
      
      return nodeInfo;
    }));
    
    // Gather comprehensive context data
    const contextData = {
      fileContext: fileInfo,
      selection: selectionData,
      pageInfo: {
        name: figma.currentPage.name,
        id: figma.currentPage.id,
        totalNodes: figma.currentPage.children.length
      },
      metrics: {
        totalComponents: selection.filter(n => n.type === 'INSTANCE').length,
        totalFrames: selection.filter(n => n.type === 'FRAME').length,
        totalTexts: selection.filter(n => n.type === 'TEXT').length,
        selectionCount: selection.length
      }
    };
    
    // Send the advanced context data
    figma.ui.postMessage({
      type: 'advanced-context-data',
      data: contextData
    });
  }
  
  // If fileKey is missing or 'dev-file', request from UI with timeout fallback
  if (!figma.fileKey || figma.fileKey === 'dev-file') {
    console.log('🔍 Requesting real fileKey from UI for advanced context...');
    const callbackId = 'advancedFileKeyCallback_' + Date.now();
    let responded = false;
    
    // Set up response handler
    async function onMessage(msg: any) {
      if (msg.type === 'real-file-key-response' && msg.callback === callbackId && !responded) {
        responded = true;
        figma.ui.off('message', onMessage);
        console.log('✅ Got fileKey from UI for advanced context:', msg.fileKey);
        await sendAdvancedContext(msg.fileKey || 'BioUSVD6t51ZNeG0g9AcNz');
      }
    }
    figma.ui.on('message', onMessage);
    
    // Request file key from UI
    figma.ui.postMessage({ type: 'get-real-file-key', callback: callbackId });
    
    // Fallback after timeout
    setTimeout(async () => {
      if (!responded) {
        responded = true;
        figma.ui.off('message', onMessage);
        console.log('⚠️ UI fileKey request timed out for advanced context, using fallback');
        await sendAdvancedContext('BioUSVD6t51ZNeG0g9AcNz');
      }
    }, 2000);
  } else {
    await sendAdvancedContext(figma.fileKey);
  }
}

// Capture screenshot using backend API proxy
async function handleCaptureScreenshot() {
  console.log('📸 Capturing screenshot via backend API...');

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
      targetNode = selection[0];
      console.log(`📸 Capturing single selection: ${targetNode.name} (${targetNode.type})`);
    } else {
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
      console.log(`📸 Multiple selections, capturing: ${targetNode.name} (${targetNode.type})`);
    }

    // Helper to continue screenshot logic after fileKey is resolved
    async function continueScreenshot(fileKey: string) {
      const nodeId = targetNode.id;
      console.log(`📸 handleCaptureScreenshot final fileKey: "${fileKey}"`);
      console.log(`📸 Fetching screenshot from backend API: ${nodeId} in ${fileKey}`);
      const screenshotUrl = await fetchScreenshot(fileKey, nodeId);
      if (!screenshotUrl) {
        throw new Error('No screenshot URL returned from backend API');
      }
      figma.ui.postMessage({
        type: 'screenshot-captured',
        screenshotUrl: screenshotUrl,
        metadata: {
          nodeName: targetNode.name,
          nodeType: targetNode.type,
          nodeId: targetNode.id,
          fileKey: fileKey,
          captureTime: new Date().toISOString(),
          source: 'backend-api'
        }
      });
      console.log(`✅ Screenshot captured successfully from backend API: ${screenshotUrl.substring(0, 50)}...`);
    }

    // If fileKey is missing or 'dev-file', request from UI with timeout fallback
    if (!figma.fileKey || figma.fileKey === 'dev-file') {
      console.log('🔍 Requesting real fileKey from UI for screenshot...');
      const callbackId = 'fileKeyScreenshot_' + Date.now();
      let responded = false;
      
      // Set up response handler
      function onMessage(msg: any) {
        if (msg.type === 'real-file-key-response' && msg.callback === callbackId && !responded) {
          responded = true;
          figma.ui.off('message', onMessage);
          console.log('✅ Got fileKey from UI for screenshot:', msg.fileKey);
          continueScreenshot(msg.fileKey || 'BioUSVD6t51ZNeG0g9AcNz');
        }
      }
      figma.ui.on('message', onMessage);
      
      // Request file key from UI
      figma.ui.postMessage({ type: 'get-real-file-key', callback: callbackId });
      
      // Fallback after timeout
      setTimeout(() => {
        if (!responded) {
          responded = true;
          figma.ui.off('message', onMessage);
          console.log('⚠️ UI fileKey request timed out for screenshot, using fallback');
          continueScreenshot('BioUSVD6t51ZNeG0g9AcNz');
        }
      }, 2000);
    } else {
      await continueScreenshot(figma.fileKey);
    }
  } catch (error) {
    console.error('❌ Screenshot capture failed:', error);
    const targetNode = figma.currentPage.selection[0] || { id: 'unknown', name: 'Unknown' };
    const fallback = getFallbackScreenshot(targetNode.id, targetNode.name);
    figma.ui.postMessage({
      type: 'screenshot-captured',
      screenshotUrl: fallback.imageUrl,
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
  
  // Use consistent file key logic
  let fileKey = 'unknown-file';
  if (figma.fileKey && figma.fileKey !== 'dev-file') {
    fileKey = figma.fileKey;
  } else {
    fileKey = 'BioUSVD6t51ZNeG0g9AcNz'; // Your actual file key
  }
  
  const fileInfo = {
    fileKey: fileKey,
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

    console.log(`📸 AI Analysis: Capturing ${targetNode.name} (${targetNode.type}) via backend API`);

    try {
      // Get file key for backend API - comprehensive approach
      console.log('🔍 figma.fileKey value:', figma.fileKey);
      console.log('🔍 figma.fileKey type:', typeof figma.fileKey);
      console.log('🔍 figma.fileKey === null:', figma.fileKey === null);
      console.log('🔍 figma.fileKey === undefined:', figma.fileKey === undefined);
      
      // Try multiple approaches to get file key
      let fileKey = 'unknown-file';
      
      // Approach 1: Direct figma.fileKey
      if (figma.fileKey && figma.fileKey !== 'dev-file') {
        fileKey = figma.fileKey;
        console.log('✅ Got file key from figma.fileKey:', fileKey);
      }
      // Approach 2: Use known fallback file key
      else {
        console.log('🔍 Figma root name:', figma.root?.name || 'Unknown');
        console.log('⚠️ Cannot determine file key from figma.fileKey, using known fallback');
        // Use the known file key from your Solidigm project
        fileKey = 'BioUSVD6t51ZNeG0g9AcNz'; // Your actual file key
        console.log('🔧 Using hardcoded known file key for testing:', fileKey);
      }
      
      const nodeId = targetNode.id;
      
      console.log(`📸 Final resolved fileKey: "${fileKey}"`);
      console.log(`📸 Fetching AI screenshot from backend: ${nodeId} in ${fileKey}`);
      
      // Use backend API for screenshot
      const screenshotUrl = await fetchScreenshot(fileKey, nodeId, {
        format: 'png',
        scale: 2
      });
      
      if (screenshotUrl) {
        screenshot = screenshotUrl;
        console.log(`📸 AI screenshot captured via backend API: ${screenshotUrl.substring(0, 50)}...`);
      } else {
        throw new Error('Backend API returned no screenshot URL');
      }
    } catch (apiError) {
      console.warn('⚠️ Backend API failed, falling back to direct export:', apiError);
      
      // Fallback to direct export if backend fails
      const screenshotBytes = await targetNode.exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: 2 },
        ...(targetNode.type === 'FRAME' && { contentsOnly: false })
      });

      if (screenshotBytes && screenshotBytes.length > 0) {
        const base64 = figma.base64Encode(screenshotBytes);
        screenshot = `data:image/png;base64,${base64}`;
        console.log(`📸 Fallback screenshot captured: ${screenshotBytes.length} bytes`);
      } else {
        console.warn('⚠️ Screenshot export returned empty data');
      }
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
    if ('fills' in node && Array.isArray(node.fills)) {
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
    if ('strokes' in node && Array.isArray(node.strokes)) {
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

/**
 * Debug function to capture and log all context data
 */
async function debugCurrentContext() {
  console.log('🔍 === DEBUG CONTEXT CAPTURE ===');
  
  const selection = figma.currentPage.selection;
  const fileKey = figma.fileKey || 'BioUSVD6t51ZNeG0g9AcNz'; // Use fallback if undefined
  const currentPage = figma.currentPage;
  
  // Log basic info
  console.log('📋 Basic Info:');
  console.log(`  File Key: "${fileKey}"`);
  console.log(`  Page: "${currentPage.name}" (${currentPage.id})`);
  console.log(`  Selection Count: ${selection.length}`);
  
  // Log detailed selection
  console.log('📋 Selection Details:');
  selection.forEach((node, index) => {
    console.log(`  ${index + 1}. "${node.name}" (${node.type})`);
    console.log(`      ID: ${node.id}`);
    console.log(`      Visible: ${node.visible}`);
    console.log(`      Locked: ${node.locked}`);
    
    // Log parent info
    if (node.parent && node.parent.type !== 'PAGE') {
      console.log(`      Parent: "${node.parent.name}" (${node.parent.type})`);
    }
  });
  
  // Test API URL construction
  if (selection.length > 0) {
    const nodeIds = selection.map(n => n.id);
    const singleNodeId = nodeIds[0];
    const multipleNodeIds = nodeIds.join(',');
    
    console.log('📋 API URLs would be:');
    console.log(`  Single: http://localhost:3000/api/figma/screenshot?fileKey=${fileKey}&nodeId=${singleNodeId}`);
    console.log(`  Multiple: http://localhost:3000/api/figma/screenshot?fileKey=${fileKey}&nodeId=${multipleNodeIds}`);
  }
  
  // Send debug data to UI
  figma.ui.postMessage({
    type: 'debug-complete',
    debug: {
      fileKey: fileKey,
      isValidFileKey: fileKey && fileKey !== 'dev-file',
      pageInfo: {
        id: currentPage.id,
        name: currentPage.name
      },
      selection: {
        count: selection.length,
        nodes: selection.map(node => ({
          id: node.id,
          name: node.name,
          type: node.type,
          visible: node.visible,
          locked: node.locked,
          hasParent: node.parent && node.parent.type !== 'PAGE'
        }))
      },
      apiUrls: selection.length > 0 ? {
        single: `http://localhost:3000/api/figma/screenshot?fileKey=${fileKey}&nodeId=${selection[0].id}`,
        multiple: `http://localhost:3000/api/figma/screenshot?fileKey=${fileKey}&nodeId=${selection.map(n => n.id).join(',')}`
      } : null,
      timestamp: new Date().toISOString()
    }
  });
  
  console.log('🔍 === DEBUG COMPLETE ===');
}

/**
 * Enhanced screenshot function that captures exactly what's selected
 */
async function handlePreciseScreenshot() {
  console.log('📸 === PRECISE SCREENSHOT CAPTURE ===');
  
  try {
    const selection = figma.currentPage.selection;
    const fileKey = figma.fileKey;
    
    // Validate inputs
    if (!fileKey || fileKey === 'dev-file') {
      throw new Error('Invalid file key - are you in a real Figma file?');
    }
    
    if (selection.length === 0) {
      figma.notify('⚠️ Please select elements to capture');
      return;
    }
    
    // Prepare node IDs - Figma API supports multiple nodes with comma separation
    const nodeIds = selection.map(node => node.id);
    const nodeIdParam = nodeIds.join(',');
    
    console.log(`📸 Capturing ${selection.length} nodes:`, 
      selection.map(n => `"${n.name}" (${n.type})`));
    console.log(`📸 File Key: ${fileKey}`);
    console.log(`📸 Node IDs: ${nodeIdParam}`);
    
    // Call backend API
    const screenshotUrl = await fetchScreenshot(fileKey, nodeIdParam);
    
    if (!screenshotUrl) {
      throw new Error('Backend API returned no screenshot URL');
    }
    
    // Success!
    console.log(`✅ Screenshot captured: ${screenshotUrl}`);
    figma.notify(`✅ Screenshot captured: ${selection.length} items`);
    
    figma.ui.postMessage({
      type: 'precise-screenshot-success',
      data: {
        screenshotUrl,
        capturedNodes: selection.map(node => ({
          id: node.id,
          name: node.name,
          type: node.type
        })),
        fileKey,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Precise screenshot failed:', error);
    figma.notify(`❌ Screenshot failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    figma.ui.postMessage({
      type: 'precise-screenshot-error',
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        fileKey: figma.fileKey,
        selectionCount: figma.currentPage.selection.length,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  console.log('📸 === PRECISE SCREENSHOT COMPLETE ===');
}

console.log('✅ Enhanced Figma Plugin with Debug Tools loaded successfully');
