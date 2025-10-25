/**
 * Message Handler
 *
 * Handles all communication between the plugin and UI
 * Converted from TypeScript to JavaScript with JSDoc types
 *
 * @typedef {Object} PluginMessage
 * @property {string} type - Message type
 * @property {*} [data] - Message data
 * @property {string} [message] - Message text
 */

import { FigmaAPI } from '../utils/figma-api.js';

/**
 * Handles all communication between the plugin and UI
 */
export class MessageHandler {
  /**
   * @param {import('./design-system-handler.js').DesignSystemManager} designSystemManager
   */
  constructor(designSystemManager) {
    this.designSystemManager = designSystemManager;
  }

  /**
   * Handle incoming message from UI
   * @param {PluginMessage} msg - Plugin message
   * @returns {Promise<void>}
   */
  async handleMessage(msg) {
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
        message: 'An error occurred: ' + (error.message || 'Unknown error')
      });
    }
  }

  /**
   * Handle ticket generation request
   * @private
   * @returns {Promise<void>}
   */
  async handleGenerateTicket() {
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

  /**
   * Handle compliance calculation request
   * @private
   * @returns {Promise<void>}
   */
  async handleCalculateCompliance() {
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

  /**
   * Extract frame data from a Figma node
   * @private
   * @param {*} node - Figma node
   * @returns {Promise<Object>} Frame data
   */
  async extractFrameData(node) {
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
          const textNodes = node.findAll((n) => n.type === 'TEXT');
          frameData.textContent = textNodes.map((textNode) => ({
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
          const componentNodes = node.findAll((n) => n.type === 'INSTANCE');
          frameData.components = componentNodes.map((comp) => ({
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