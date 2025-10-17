/// <reference types="@figma/plugin-typings" />

// Figma Plugin Entry Point
figma.showUI(__html__, { width: 500, height: 700 });

figma.ui.onmessage = async (msg: any) => {
  if (msg.type === 'get-selection') {
    const selection = figma.currentPage.selection;
    figma.ui.postMessage({
      type: 'selection', 
      data: selection.map((node: any) => ({ id: node.id, name: node.name, type: node.type }))
    });
  }
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

console.log('Plugin loaded');
