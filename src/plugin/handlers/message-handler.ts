/**
 * Message Handler
 * 
 * Handles all communication between the plugin and UI
 */

import { DesignSystemManager } from './design-system-handler';
import { FigmaAPI } from '../utils/figma-api';

export class MessageHandler {
  private designSystemManager: DesignSystemManager;

  constructor(designSystemManager: DesignSystemManager) {
    this.designSystemManager = designSystemManager;
  }

  async handleMessage(msg: any): Promise<void> {
    try {
      switch (msg.type) {
        case 'generate-ticket':
          await this.handleGenerateTicket();
          break;

        case 'calculate-compliance':
          await this.handleCalculateCompliance();
          break;

        case 'close-plugin':
          FigmaAPI.closePlugin();
          break;

        default:
          console.warn('Unknown message type:', msg.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      FigmaAPI.postMessage({
        type: 'error',
        message: 'An error occurred: ' + (error as Error).message
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

    // Process selected frames/components
    const frameDataList = [];
    
    for (const node of selection) {
      const frameData = await this.extractFrameData(node);
      frameDataList.push(frameData);
    }

    // Send frame data to UI for AI processing
    FigmaAPI.postMessage({
      type: 'frame-data',
      data: frameDataList,
    });
  }

  private async handleCalculateCompliance(): Promise<void> {
    const selection = FigmaAPI.selection;

    if (selection.length === 0) {
      FigmaAPI.postMessage({ 
        type: 'compliance-error', 
        message: 'Please select frames or components to analyze compliance.' 
      });
      return;
    }

    const designSystem = this.designSystemManager.getDesignSystem();
    if (!designSystem) {
      FigmaAPI.postMessage({ 
        type: 'compliance-error', 
        message: 'Design system not detected. Please ensure your file contains design system components.' 
      });
      return;
    }

    console.log('📊 Calculating compliance for', selection.length, 'selected items...');
    
    // Calculate compliance score
    const complianceScore = await this.designSystemManager.calculateCompliance(selection);
    
    // Send results to UI
    FigmaAPI.postMessage({
      type: 'compliance-results',
      compliance: complianceScore,
      selectionCount: selection.length
    });
  }

  private async extractFrameData(node: any): Promise<any> {
    // Simplified frame data extraction
    const frameData = {
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
      fileKey: FigmaAPI.fileKey,
      pageId: FigmaAPI.currentPage.id,
      pageName: FigmaAPI.currentPage.name
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
          frameData.components = componentNodes.map((comp: any) => ({
            name: comp.name || 'Unknown',
            masterComponent: 'Unknown' // Simplified for now
          }));
        } catch (error) {
          console.warn('Could not extract components:', error);
          frameData.components = [];
        }
      }
    }

    return frameData;
  }
}