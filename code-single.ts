/**
 * Figma AI Ticket Generator - Single File Version
 * 
 * This file contains all the plugin code in a single file for Figma compatibility
 */

/// <reference types="@figma/plugin-typings" />

// ==========================================
// TYPES AND INTERFACES
// ==========================================

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  children?: FigmaNode[];
}

interface FrameData {
  id: string;
  name: string;
  type: string;
  pageName: string;
  dimensions: { width: number; height: number };
  nodeCount: number;
  textContent: Array<{ content: string; style: any }>;
  components: Array<{ masterComponent: string }>;
  colors: string[];
  hasPrototype: boolean;
  fileKey?: string;
  designSystemContext?: any;
}

interface PluginMessage {
  type: string;
  data?: any;
  message?: string;
  fileKey?: string;
  fileName?: string;
  compliance?: any;
  selectionCount?: number;
  designSystem?: any;
}

// ==========================================
// FIGMA API UTILITIES
// ==========================================

class FigmaAPI {
  static get selection(): readonly SceneNode[] {
    return figma.currentPage?.selection || [];
  }

  static get currentPage(): PageNode {
    return figma.currentPage;
  }

  static get fileKey(): string {
    return figma.fileKey || '';
  }

  static get root(): DocumentNode {
    return figma.root;
  }

  static postMessage(message: PluginMessage): void {
    figma.ui.postMessage(message);
  }

  static closePlugin(): void {
    figma.closePlugin();
  }

  static showUI(html: string, options?: ShowUIOptions): void {
    figma.showUI(html, options);
  }
}

// ==========================================
// DESIGN SYSTEM MANAGER
// ==========================================

class DesignSystemManager {
  private designSystem: any = null;

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing design system detection...');
      
      // Send file context to UI
      FigmaAPI.postMessage({
        type: 'file-context',
        fileKey: FigmaAPI.fileKey,
        fileName: FigmaAPI.root.name
      });

      console.log('✅ Design system manager initialized');
    } catch (error) {
      console.error('❌ Error initializing design system:', error);
    }
  }

  getDesignSystem(): any {
    return this.designSystem;
  }

  async calculateCompliance(selection: readonly SceneNode[]): Promise<any> {
    // Simplified compliance calculation for now
    return {
      overall: 85,
      breakdown: {
        colors: { score: 90, compliantCount: 9, totalCount: 10, violations: [] },
        typography: { score: 80, compliantCount: 8, totalCount: 10, violations: [] },
        components: { score: 85, compliantCount: 17, totalCount: 20, violations: [] },
        spacing: { score: 85, compliantCount: 17, totalCount: 20, violations: [] }
      },
      lastCalculated: Date.now(),
      recommendations: [
        {
          priority: 'medium',
          category: 'Colors',
          description: '1 custom color detected',
          action: 'Consider using design system color tokens'
        }
      ]
    };
  }
}

// ==========================================
// FRAME DATA EXTRACTION
// ==========================================

function extractFrameData(node: FrameNode | ComponentNode | InstanceNode): FrameData {
  const textContent: Array<{ content: string; style: any }> = [];
  const components: Array<{ masterComponent: string }> = [];
  const colors: string[] = [];

  function traverseNode(n: SceneNode): void {
    if (n.type === 'TEXT') {
      const textNode = n as TextNode;
      textContent.push({
        content: textNode.characters,
        style: textNode.fontName
      });
    }

    if (n.type === 'INSTANCE') {
      const instance = n as InstanceNode;
      if (instance.mainComponent) {
        components.push({
          masterComponent: instance.mainComponent.name
        });
      }
    }

    if ('fills' in n && n.fills && Array.isArray(n.fills)) {
      n.fills.forEach(fill => {
        if (fill.type === 'SOLID' && fill.color) {
          const color = fill.color;
          const hex = `#${Math.round(color.r * 255).toString(16).padStart(2, '0')}${Math.round(color.g * 255).toString(16).padStart(2, '0')}${Math.round(color.b * 255).toString(16).padStart(2, '0')}`;
          if (!colors.includes(hex)) {
            colors.push(hex);
          }
        }
      });
    }

    if ('children' in n) {
      n.children.forEach(child => traverseNode(child));
    }
  }

  if ('children' in node) {
    node.children.forEach(child => traverseNode(child));
  }

  return {
    id: node.id,
    name: node.name,
    type: node.type,
    pageName: FigmaAPI.currentPage.name,
    dimensions: {
      width: Math.round(node.width),
      height: Math.round(node.height)
    },
    nodeCount: 'children' in node ? node.children.length : 0,
    textContent,
    components,
    colors,
    hasPrototype: false, // Simplified for now
    fileKey: FigmaAPI.fileKey
  };
}

// ==========================================
// MESSAGE HANDLER
// ==========================================

class MessageHandler {
  constructor(private designSystemManager: DesignSystemManager) {}

  async handleMessage(msg: PluginMessage): Promise<void> {
    console.log('📨 Received message:', msg.type);

    try {
      switch (msg.type) {
        case 'generate-ticket':
          await this.handleGenerateTicket();
          break;

        case 'calculate-compliance':
          await this.handleCalculateCompliance();
          break;

        default:
          console.log('⚠️ Unknown message type:', msg.type);
      }
    } catch (error) {
      console.error('❌ Error handling message:', error);
      FigmaAPI.postMessage({
        type: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  private async handleGenerateTicket(): Promise<void> {
    const selection = FigmaAPI.selection;
    
    if (selection.length === 0) {
      FigmaAPI.postMessage({
        type: 'error',
        message: 'Please select at least one frame or component to generate a ticket.'
      });
      return;
    }

    const frameDataList: FrameData[] = [];

    selection.forEach(node => {
      if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
        const frameData = extractFrameData(node as FrameNode);
        frameDataList.push(frameData);
      }
    });

    if (frameDataList.length === 0) {
      FigmaAPI.postMessage({
        type: 'error',
        message: 'Please select frames, components, or instances to generate tickets.'
      });
      return;
    }

    FigmaAPI.postMessage({
      type: 'frame-data',
      data: frameDataList
    });
  }

  private async handleCalculateCompliance(): Promise<void> {
    const selection = FigmaAPI.selection;
    
    if (selection.length === 0) {
      FigmaAPI.postMessage({
        type: 'compliance-results',
        compliance: await this.designSystemManager.calculateCompliance([]),
        selectionCount: 0
      });
      return;
    }

    const compliance = await this.designSystemManager.calculateCompliance(selection);
    
    FigmaAPI.postMessage({
      type: 'compliance-results',
      compliance,
      selectionCount: selection.length
    });
  }
}

// ==========================================
// PLUGIN INITIALIZATION
// ==========================================

// Global state
let messageHandler: MessageHandler;
let designSystemManager: DesignSystemManager;

// Plugin initialization function
async function initializePlugin(): Promise<void> {
  console.log('🚀 Figma AI Ticket Generator starting...');

  // Show UI
  FigmaAPI.showUI(__html__, { 
    width: 500, 
    height: 700,
    themeColors: true 
  });

  // Initialize managers
  designSystemManager = new DesignSystemManager();
  messageHandler = new MessageHandler(designSystemManager);

  // Set up message handling
  figma.ui.onmessage = (msg: PluginMessage) => {
    messageHandler.handleMessage(msg);
  };

  // Initialize design system detection on plugin load
  await designSystemManager.initialize();

  console.log('✅ Plugin initialized successfully');
}

// Auto-initialize when this script loads
initializePlugin().catch(error => {
  console.error('❌ Plugin initialization failed:', error);
});