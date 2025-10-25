/**
 * Main Plugin Entry Point
 *
 * Coordinates all plugin functionality and manages UI communication
 */

import { MessageHandler } from './handlers/message-handler.js';
import { DesignSystemManager } from './handlers/design-system-handler.js';
import { FigmaAPI } from './utils/figma-api.js';

// Global state
let messageHandler;
let designSystemManager;

/**
 * Plugin initialization function
 * @returns {Promise<void>}
 */
async function initializePlugin() {
  console.log('🚀 Figma AI Ticket Generator starting...');

  try {
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
    if (typeof figma !== 'undefined' && figma.ui) {
      figma.ui.onmessage = (msg) => {
        messageHandler.handleMessage(msg);
      };
    }

    // Initialize design system detection on plugin load
    await designSystemManager.initialize();

    console.log('✅ Plugin initialized successfully');
  } catch (error) {
    console.error('❌ Plugin initialization failed:', error);

    // Show error in UI if possible
    if (typeof figma !== 'undefined' && figma.ui) {
      figma.ui.postMessage({
        type: 'error',
        message: `Plugin initialization failed: ${error.message}`
      });
    }
  }
}

/**
 * Plugin cleanup function
 */
function cleanupPlugin() {
  console.log('🧹 Cleaning up plugin...');

  // Clear handlers
  messageHandler = null;
  designSystemManager = null;

  // Clear UI message handler
  if (typeof figma !== 'undefined' && figma.ui) {
    figma.ui.onmessage = null;
  }
}

// Export for testing
export { initializePlugin, cleanupPlugin };

// Auto-initialize when this module loads
if (typeof figma !== 'undefined') {
  initializePlugin().catch(error => {
    console.error('❌ Plugin initialization failed:', error);
  });
}