/**
 * Main Plugin Entry Point
 * 
 * Coordinates all plugin functionality and manages UI communication
 */

import { MessageHandler } from './handlers/message-handler';
import { DesignSystemManager } from './handlers/design-system-handler';
import { FigmaAPI } from './utils/figma-api';

// Global state
let messageHandler: MessageHandler;
let designSystemManager: DesignSystemManager;

// Plugin initialization function
async function initializePlugin() {
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
  figma.ui.onmessage = (msg: any) => {
    messageHandler.handleMessage(msg);
  };

  // Initialize design system detection on plugin load
  await designSystemManager.initialize();

  console.log('✅ Plugin initialized successfully');
}

// Auto-initialize when this module loads
initializePlugin().catch(error => {
  console.error('❌ Plugin initialization failed:', error);
});