/**
 * Usage Example: Enhanced MCP Data Layer
 * 
 * This example shows how to use the enhanced data layer to extract
 * comprehensive hierarchical frame data from Figma designs.
 */

import { enhancedExtractionExample, createEnhancedFigmaExtractor, extractHierarchicalFrameData } from './enhanced-example.js';

// Example usage
async function main() {
  const FIGMA_API_KEY = 'your-figma-api-key';
  const FILE_KEY = 'your-figma-file-key';
  const FRAME_ID = 'your-frame-id'; // Optional
  
  try {
    console.log('🚀 Starting enhanced Figma extraction...');
    
    // Method 1: Use the complete example function
    const hierarchicalData = await enhancedExtractionExample(
      FIGMA_API_KEY,
      FILE_KEY,
      FRAME_ID
    );
    
    console.log('✅ Extraction completed successfully!');
    console.log('📊 Results summary:', {
      totalFrames: hierarchicalData.metadata.totalFrames,
      totalLayers: hierarchicalData.metadata.totalLayers,
      totalComponents: hierarchicalData.metadata.totalComponents,
      hasDesignSystemLinks: Object.keys(hierarchicalData.designSystemLinks).length > 0,
      hasScreenshots: hierarchicalData.exportScreenshots.length > 0
    });
    
    // Method 2: Manual setup for more control
    console.log('\n🔧 Alternative: Manual extractor setup...');
    
    const extractor = createEnhancedFigmaExtractor(FIGMA_API_KEY, {
      caching: 'hybrid',
      validation: 'strict',
      performanceMonitoring: true
    });
    
    const customData = await extractHierarchicalFrameData(
      extractor,
      FILE_KEY,
      FRAME_ID,
      {
        includeScreenshots: true,
        includeDesignSystemLinks: true,
        maxDepth: 15,
        includeComponentInstances: true
      }
    );
    
    console.log('✅ Custom extraction completed!');
    
    // Example of the structure you'll get (similar to your JSON example)
    console.log('\n📋 Example frame structure:');
    if (customData.frames.length > 0) {
      const firstFrame = customData.frames[0];
      console.log({
        frameInfo: {
          id: firstFrame.id,
          name: firstFrame.name,
          type: firstFrame.type,
          layerCount: firstFrame.hierarchy.layers.length,
          componentCount: firstFrame.hierarchy.componentCount,
          hasChildren: firstFrame.children.length > 0
        },
        designSystemIntegration: {
          hasButtons: !!firstFrame.designSystemLinks.buttons,
          hasTypography: !!firstFrame.designSystemLinks.typography,
          hasColors: !!firstFrame.designSystemLinks.colors,
          hasSpacing: !!firstFrame.designSystemLinks.spacing
        },
        componentInstances: firstFrame.componentInstances.map(instance => ({
          name: instance.name,
          masterComponentId: instance.masterComponentId,
          hasOverrides: instance.overrides.length > 0,
          variantCount: Object.keys(instance.variantProperties).length
        })),
        exportCapabilities: {
          screenshotCount: firstFrame.exportScreenshots.length,
          formats: firstFrame.exportScreenshots.map(s => s.format)
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Extraction failed:', error);
  }
}

// Uncomment to run the example
// main();

export { main as runEnhancedExample };