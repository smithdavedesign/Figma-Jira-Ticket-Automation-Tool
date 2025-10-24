/**
 * Simple Demo Test for MCP Data Layer - JavaScript Version
 * 
 * This demonstrates our enhanced extraction capabilities
 * showcasing hierarchical structure, component instances, and design system links.
 */

/**
 * Simplified demo extractor that showcases our enhanced capabilities
 */
class SimpleDemoExtractor {
  
  /**
   * Demo extraction that shows hierarchical structure like user's JSON example
   */
  async extractDemo(figmaFileKey, nodeIds = []) {
    console.log(`🚀 Starting demo extraction for file: ${figmaFileKey}`);
    
    if (nodeIds && nodeIds.length > 0) {
      console.log(`📍 Targeting specific nodes: ${nodeIds.join(', ')}`);
    }
    
    // Simulate enhanced extraction with our hierarchical approach
    const demoFrames = this.generateDemoFrames();
    const designSystemLinks = this.generateDemoDesignSystemLinks();
    const componentInstances = this.generateDemoComponentInstances();
    
    const result = {
      frames: demoFrames,
      designSystemLinks,
      componentInstances,
      metadata: {
        extractedAt: new Date().toISOString(),
        version: '1.0.0',
        totalFrames: demoFrames.length,
        totalLayers: this.countTotalLayers(demoFrames),
        totalComponents: componentInstances.length,
        fileKey: figmaFileKey,
        nodeIds: nodeIds || [],
        features: [
          'hierarchical-extraction',
          'component-instance-tracking', 
          'design-system-links',
          'layer-token-mapping'
        ]
      }
    };
    
    console.log('✅ Demo extraction completed:', {
      frames: result.frames.length,
      components: result.componentInstances.length,
      hasDesignSystemLinks: Object.keys(result.designSystemLinks).length > 0
    });
    
    return result;
  }
  
  /**
   * Generate demo frames with hierarchical structure
   */
  generateDemoFrames() {
    return [
      {
        id: 'frame-1',
        name: 'Main Dashboard Frame',
        type: 'FRAME',
        description: 'Primary dashboard container with navigation and content areas',
        hierarchy: {
          layers: [
            {
              id: 'nav-layer',
              name: 'Navigation Header',
              type: 'COMPONENT_INSTANCE',
              position: { x: 0, y: 0 },
              size: { width: 1200, height: 64 },
              components: ['DS/Navigation/Header'],
              tokens: {
                colors: ['#1976D2', '#FFFFFF'],
                spacing: { top: 0, right: 16, bottom: 0, left: 16 },
                typography: 'Inter-16-Medium'
              },
              children: [
                {
                  id: 'logo-area',
                  name: 'Logo Area',
                  type: 'FRAME',
                  position: { x: 16, y: 16 },
                  size: { width: 120, height: 32 },
                  components: ['DS/Logo'],
                  tokens: { colors: ['#1976D2'] }
                },
                {
                  id: 'nav-menu',
                  name: 'Navigation Menu',
                  type: 'FRAME',
                  position: { x: 200, y: 16 },
                  size: { width: 600, height: 32 },
                  components: ['DS/Navigation/Menu'],
                  tokens: { 
                    spacing: { left: 24, right: 24 },
                    typography: 'Inter-14-Regular'
                  }
                }
              ]
            },
            {
              id: 'content-layer',
              name: 'Main Content Area',
              type: 'FRAME',
              position: { x: 0, y: 64 },
              size: { width: 1200, height: 600 },
              components: [],
              tokens: {
                spacing: { top: 24, right: 24, bottom: 24, left: 24 },
                colors: ['#FAFAFA']
              },
              children: [
                {
                  id: 'card-grid',
                  name: 'Dashboard Cards',
                  type: 'FRAME',
                  position: { x: 24, y: 88 },
                  size: { width: 1152, height: 400 },
                  components: ['DS/Card/Dashboard'],
                  tokens: {
                    spacing: { gap: 16 },
                    shadows: 'elevation-1'
                  }
                }
              ]
            }
          ],
          totalDepth: 3,
          componentCount: 4,
          textLayerCount: 0
        },
        componentInstances: [
          {
            id: 'nav-instance',
            name: 'Header Navigation',
            masterComponentId: 'nav-component-master',
            props: { variant: 'primary', showLogo: true },
            overrides: [],
            variantProperties: { State: 'Default', Theme: 'Light' },
            parentFrameId: 'frame-1',
            parentFrameName: 'Main Dashboard Frame'
          }
        ],
        designSystemLinks: {
          buttons: 'design-system/buttons',
          navigation: 'design-system/navigation',
          colors: 'design-system/colors',
          typography: 'design-system/typography',
          spacing: 'design-system/spacing'
        },
        exportScreenshots: [
          {
            nodeId: 'frame-1',
            url: `https://figma.com/screenshots/frame-1.png`,
            format: 'PNG',
            scale: 2,
            resolution: 'high',
            timestamp: new Date().toISOString()
          }
        ],
        children: []
      },
      {
        id: 'frame-2',
        name: 'Modal Dialog Frame',
        type: 'FRAME',
        description: 'Reusable modal dialog with form components',
        hierarchy: {
          layers: [
            {
              id: 'modal-backdrop',
              name: 'Modal Backdrop',
              type: 'RECTANGLE',
              position: { x: 0, y: 0 },
              size: { width: 400, height: 300 },
              components: [],
              tokens: {
                colors: ['rgba(0,0,0,0.5)'],
                effects: ['backdrop-blur']
              }
            },
            {
              id: 'modal-content',
              name: 'Modal Content',
              type: 'FRAME',
              position: { x: 50, y: 50 },
              size: { width: 300, height: 200 },
              components: ['DS/Modal/Content'],
              tokens: {
                colors: ['#FFFFFF'],
                spacing: { padding: 24 },
                shadows: 'elevation-3',
                borders: 'radius-8'
              }
            }
          ],
          totalDepth: 2,
          componentCount: 1,
          textLayerCount: 2
        },
        componentInstances: [
          {
            id: 'modal-instance',
            name: 'Settings Modal',
            masterComponentId: 'modal-component-master',
            props: { title: 'Settings', size: 'medium' },
            overrides: [
              {
                nodeId: 'modal-title',
                propertyName: 'text',
                value: 'User Settings',
                type: 'TEXT'
              }
            ],
            variantProperties: { Size: 'Medium', Type: 'Form' },
            parentFrameId: 'frame-2',
            parentFrameName: 'Modal Dialog Frame'
          }
        ],
        designSystemLinks: {
          modals: 'design-system/modals',
          forms: 'design-system/forms',
          buttons: 'design-system/buttons'
        },
        exportScreenshots: [
          {
            nodeId: 'frame-2',
            url: `https://figma.com/screenshots/frame-2.png`,
            format: 'PNG',
            scale: 2,
            resolution: 'high',
            timestamp: new Date().toISOString()
          }
        ],
        children: []
      }
    ];
  }
  
  /**
   * Generate demo design system links
   */
  generateDemoDesignSystemLinks() {
    return {
      buttons: 'design-system/buttons',
      typography: 'design-system/typography',
      colors: 'design-system/colors',
      spacing: 'design-system/spacing',
      components: 'design-system/components',
      navigation: 'design-system/navigation',
      modals: 'design-system/modals',
      forms: 'design-system/forms',
      cards: 'design-system/cards',
      styles: {
        elevation: 'design-system/elevation',
        borders: 'design-system/borders',
        effects: 'design-system/effects'
      }
    };
  }
  
  /**
   * Generate demo component instances
   */
  generateDemoComponentInstances() {
    return [
      {
        id: 'nav-header-instance',
        name: 'Primary Navigation',
        masterComponentId: 'navigation-component-id',
        componentSetId: 'navigation-set-id',
        props: {
          variant: 'primary',
          showLogo: true,
          showSearch: true,
          theme: 'light'
        },
        overrides: [
          {
            nodeId: 'nav-logo',
            propertyName: 'visible',
            value: true,
            type: 'VISIBILITY'
          },
          {
            nodeId: 'nav-title',
            propertyName: 'text',
            value: 'Dashboard',
            type: 'TEXT'
          }
        ],
        variantProperties: {
          State: 'Default',
          Theme: 'Light',
          Size: 'Large'
        },
        parentFrameId: 'frame-1',
        parentFrameName: 'Main Dashboard Frame'
      },
      {
        id: 'card-dashboard-instance',
        name: 'Dashboard Card',
        masterComponentId: 'card-component-id',
        componentSetId: 'card-set-id',
        props: {
          variant: 'elevated',
          padding: 'large',
          shadow: 'medium'
        },
        overrides: [
          {
            nodeId: 'card-title',
            propertyName: 'text',
            value: 'Analytics Overview',
            type: 'TEXT'
          },
          {
            nodeId: 'card-icon',
            propertyName: 'fill',
            value: '#1976D2',
            type: 'FILL'
          }
        ],
        variantProperties: {
          Type: 'Dashboard',
          Size: 'Large',
          HasIcon: 'true'
        },
        parentFrameId: 'frame-1',
        parentFrameName: 'Main Dashboard Frame'
      },
      {
        id: 'modal-settings-instance',
        name: 'Settings Modal',
        masterComponentId: 'modal-component-id',
        componentSetId: 'modal-set-id',
        props: {
          type: 'form',
          size: 'medium',
          hasBackdrop: true
        },
        overrides: [
          {
            nodeId: 'modal-header',
            propertyName: 'text',
            value: 'User Settings',
            type: 'TEXT'
          }
        ],
        variantProperties: {
          Type: 'Form',
          Size: 'Medium',
          Theme: 'Light'
        },
        parentFrameId: 'frame-2',
        parentFrameName: 'Modal Dialog Frame'
      }
    ];
  }
  
  /**
   * Count total layers across all frames
   */
  countTotalLayers(frames) {
    let count = 0;
    
    for (const frame of frames) {
      count += frame.hierarchy.layers.length;
      
      // Count nested layers recursively
      for (const layer of frame.hierarchy.layers) {
        count += this.countLayersInLayer(layer);
      }
    }
    
    return count;
  }
  
  /**
   * Count layers in a specific layer recursively
   */
  countLayersInLayer(layer) {
    let count = 0;
    
    if (layer.children && layer.children.length > 0) {
      count += layer.children.length;
      
      for (const child of layer.children) {
        count += this.countLayersInLayer(child);
      }
    }
    
    return count;
  }
}

/**
 * Demo runner function
 */
async function runMCPDemo(figmaFileKey, nodeIds = []) {
  console.log('🎬 Starting MCP Data Layer Demo...');
  console.log('==================================');
  
  const extractor = new SimpleDemoExtractor();
  const result = await extractor.extractDemo(figmaFileKey, nodeIds);
  
  console.log('\n📊 Demo Results Summary:');
  console.log('-------------------------');
  console.log(`📄 Total Frames: ${result.frames.length}`);
  console.log(`🏗️  Total Layers: ${result.metadata.totalLayers}`);
  console.log(`🧩 Component Instances: ${result.componentInstances.length}`);
  console.log(`🎨 Design System Links: ${Object.keys(result.designSystemLinks).length}`);
  console.log(`⚡ Features: ${result.metadata.features.join(', ')}`);
  
  console.log('\n🔍 Frame Details:');
  console.log('------------------');
  result.frames.forEach((frame, index) => {
    console.log(`${index + 1}. ${frame.name}`);
    console.log(`   └─ Layers: ${frame.hierarchy.layers.length}`);
    console.log(`   └─ Components: ${frame.hierarchy.componentCount}`);
    console.log(`   └─ Depth: ${frame.hierarchy.totalDepth}`);
    console.log(`   └─ Screenshots: ${frame.exportScreenshots.length}`);
  });
  
  console.log('\n🧩 Component Instance Details:');
  console.log('-------------------------------');
  result.componentInstances.forEach((instance, index) => {
    console.log(`${index + 1}. ${instance.name}`);
    console.log(`   └─ Master: ${instance.masterComponentId}`);
    console.log(`   └─ Props: ${Object.keys(instance.props).length}`);
    console.log(`   └─ Overrides: ${instance.overrides.length}`);
    console.log(`   └─ Variants: ${Object.keys(instance.variantProperties).length}`);
  });
  
  console.log('\n✅ Demo completed successfully!');
  console.log('===============================\n');
  
  return result;
}

/**
 * Example usage function
 */
async function exampleUsage() {
  try {
    // Example 1: Extract entire file
    console.log('Example 1: Extract entire Figma file');
    await runMCPDemo('your-figma-file-key');
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Example 2: Extract specific nodes
    console.log('Example 2: Extract specific nodes');
    await runMCPDemo('your-figma-file-key', ['node-1', 'node-2']);
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Export the main functions
export { SimpleDemoExtractor, runMCPDemo, exampleUsage };

console.log('📦 MCP Data Layer Demo Module Loaded');
console.log('💡 Usage: runMCPDemo("your-figma-file-key", ["optional-node-ids"])');