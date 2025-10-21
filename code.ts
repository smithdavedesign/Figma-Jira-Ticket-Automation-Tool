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
        let targetNode: any = selection.length > 0 ? selection[0] : figma.currentPage;
        
        // If multiple items selected, try to get their parent frame
        if (selection.length > 1) {
            const parent = selection[0].parent;
            if (parent && parent.type === 'FRAME') {
                targetNode = parent;
            }
        }
        
        const screenshot = await targetNode.exportAsync({
            format: 'PNG',
            constraint: { type: 'SCALE', value: 2 }
        });
        
        // Convert to base64
        const base64 = figma.base64Encode(screenshot);
        const dataUrl = `data:image/png;base64,${base64}`;
        
        figma.ui.postMessage({
            type: 'screenshot-captured',
            screenshot: dataUrl
        });
        
        console.log('✅ Screenshot captured successfully');
        
    } catch (error) {
        console.error('❌ Screenshot capture failed:', error);
        figma.ui.postMessage({
            type: 'screenshot-captured',
            screenshot: null,
            error: error instanceof Error ? error.message : 'Screenshot capture failed'
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
    
    // Capture screenshot for AI analysis
    let screenshot = null;
    try {
        const targetNode = selection.length > 0 ? selection[0] : figma.currentPage;
        const screenshotBytes = await targetNode.exportAsync({
            format: 'PNG',
            constraint: { type: 'SCALE', value: 2 }
        });
        const base64 = figma.base64Encode(screenshotBytes);
        screenshot = `data:image/png;base64,${base64}`;
        console.log('📸 Screenshot captured for AI analysis');
    } catch (error) {
        console.warn('⚠️ Screenshot capture failed:', error);
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

// Helper function to build hierarchy information
async function buildHierarchy(node: any): Promise<any> {
    const layers: any[] = [];
    let totalDepth = 1;
    let componentCount = 0;
    
    // Count components and analyze depth
    function analyzeNode(currentNode: any, depth: number = 1): void {
        totalDepth = Math.max(totalDepth, depth);
        
        if (currentNode.type === 'INSTANCE' || currentNode.type === 'COMPONENT') {
            componentCount++;
        }
        
        layers.push({
            id: currentNode.id,
            name: currentNode.name,
            type: currentNode.type,
            depth: depth
        });
        
        if ('children' in currentNode && currentNode.children) {
            currentNode.children.forEach((child: any) => {
                analyzeNode(child, depth + 1);
            });
        }
    }
    
    analyzeNode(node);
    
    return {
        layers: layers,
        totalDepth: totalDepth,
        componentCount: componentCount
    };
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
