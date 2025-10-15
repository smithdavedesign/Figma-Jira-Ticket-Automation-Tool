#!/usr/bin/env node

/**
 * Test Visual-Enhanced Ticket Generation
 * 
 * Demo of our visual-enhanced data layer improvements for LLM context enrichment.
 * This showcases screenshot capture, color extraction, typography analysis, and
 * comprehensive ticket generation with rich visual context.
 */

import http from 'http';

// Sample visual-enhanced context data representing what comes from Figma
const sampleVisualContext = {
  screenshot: {
    base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", // 1x1 transparent PNG
    format: "png",
    resolution: { width: 800, height: 600 },
    size: 2048,
    quality: "high"
  },
  visualDesignContext: {
    colorPalette: [
      {
        hex: "#2563eb",
        rgb: { r: 37, g: 99, b: 235 },
        usage: ["primary", "cta", "link"],
        count: 8
      },
      {
        hex: "#dc2626",
        rgb: { r: 220, g: 38, b: 38 },
        usage: ["error", "warning"],
        count: 3
      },
      {
        hex: "#16a34a",
        rgb: { r: 22, g: 163, b: 74 },
        usage: ["success", "positive"],
        count: 2
      },
      {
        hex: "#f3f4f6",
        rgb: { r: 243, g: 244, b: 246 },
        usage: ["background", "neutral"],
        count: 12
      }
    ],
    typography: {
      fonts: ["Inter", "SF Pro Display"],
      sizes: [12, 14, 16, 20, 24, 32],
      weights: ["400", "500", "600", "700"],
      hierarchy: ["h1", "h2", "body", "caption"]
    },
    spacing: {
      measurements: [4, 8, 12, 16, 20, 24, 32, 48, 64],
      patterns: ["4px", "8px", "16px"],
      grid: "8px-grid"
    },
    layout: {
      structure: "flex",
      alignment: "center",
      distribution: "space-between"
    }
  },
  hierarchicalData: {
    name: "Enhanced Button Component",
    type: "COMPONENT",
    components: [
      {
        name: "Button",
        type: "COMPONENT_SET",
        masterComponent: "Primary Button",
        properties: {
          variant: "primary",
          size: "medium",
          state: "default"
        },
        children: [
          {
            name: "Button Background",
            type: "RECTANGLE",
            fill: "#2563eb"
          },
          {
            name: "Button Label",
            type: "TEXT",
            fontFamily: "Inter",
            fontSize: 16,
            fontWeight: 600,
            textColor: "#ffffff"
          }
        ]
      }
    ]
  },
  figmaContext: {
    fileName: "Design System Components",
    pageName: "Buttons & CTAs",
    selection: {
      name: "Primary Button - Enhanced"
    }
  }
};

const requestOptions = {
  method: "generate_visual_enhanced_ticket",
  params: {
    context: sampleVisualContext,
    options: {
      techStack: "React TypeScript",
      instructions: "Follow Material Design 3 principles and ensure accessibility compliance"
    }
  }
};

async function testVisualEnhancedGeneration() {
  console.log('🎨 Testing Visual-Enhanced Ticket Generation');
  console.log('=' .repeat(60));
  
  try {
    const response = await makeRequest(requestOptions);
    
    console.log('✅ Successfully generated visual-enhanced ticket!');
    console.log('\n📋 Generated Ticket Content:');
    console.log('-'.repeat(60));
    console.log(response.content[0].text);
    console.log('-'.repeat(60));
    
    // Analyze the response
    const content = response.content[0].text;
    const hasColorInfo = content.includes('Color Palette:');
    const hasTypographyInfo = content.includes('Typography:');
    const hasSpacingInfo = content.includes('Spacing:');
    const hasScreenshotRef = content.includes('Screenshot:');
    
    console.log('\n🔍 Analysis of Generated Content:');
    console.log(`📸 Screenshot Reference: ${hasScreenshotRef ? '✅' : '❌'}`);
    console.log(`🎨 Color Analysis: ${hasColorInfo ? '✅' : '❌'}`);
    console.log(`📝 Typography Details: ${hasTypographyInfo ? '✅' : '❌'}`);
    console.log(`📐 Spacing Patterns: ${hasSpacingInfo ? '✅' : '❌'}`);
    
    const contextRichness = [hasScreenshotRef, hasColorInfo, hasTypographyInfo, hasSpacingInfo].filter(Boolean).length;
    console.log(`\n📊 Context Richness Score: ${contextRichness}/4 (${Math.round(contextRichness/4*100)}%)`);
    
    if (contextRichness === 4) {
      console.log('🎉 Excellent! All visual context elements are included in the ticket.');
    } else if (contextRichness >= 3) {
      console.log('👍 Good! Most visual context elements are present.');
    } else {
      console.log('⚠️  Some visual context elements are missing.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nTrying to start MCP server first...');
    return false;
  }
  
  return true;
}

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });
    
    req.on('error', (e) => {
      reject(new Error(`Request failed: ${e.message}`));
    });
    
    req.write(postData);
    req.end();
  });
}

async function checkServerHealth() {
  try {
    const response = await makeRequest({ method: 'health' });
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Visual-Enhanced LLM Context Demo');
  console.log('=' .repeat(60));
  console.log('This demo showcases our enhanced data layer for LLM context:');
  console.log('• Screenshot capture and processing');
  console.log('• Color palette extraction (4 colors detected)');
  console.log('• Typography analysis (2 fonts, 6 sizes, 4 weights)');
  console.log('• Spacing pattern detection (9 measurements, 3 patterns)');
  console.log('• Comprehensive ticket generation with visual context');
  console.log('');
  
  // Check if server is running
  const serverRunning = await checkServerHealth();
  if (!serverRunning) {
    console.log('⚠️  MCP server not running on localhost:3001');
    console.log('Please start the server with: npm run dev');
    console.log('');
    console.log('Expected output when working:');
    console.log('• Visual-enhanced ticket with screenshot reference');
    console.log('• Detailed color analysis with usage context');
    console.log('• Typography hierarchy and font specifications');
    console.log('• Spacing patterns and grid system information');
    console.log('• Technical requirements tailored to visual context');
    process.exit(1);
  }
  
  const success = await testVisualEnhancedGeneration();
  
  if (success) {
    console.log('\n🎯 Demo Summary:');
    console.log('Our visual-enhanced data layer successfully combines:');
    console.log('1. Figma screenshot capture (base64 encoded)');
    console.log('2. Rich color analysis with usage tracking');
    console.log('3. Typography system detection and hierarchy');
    console.log('4. Spacing pattern recognition and grid systems');
    console.log('5. Comprehensive ticket generation for development');
    console.log('\nThis provides significantly richer context to Gemini and other LLMs!');
  }
}

main().catch(console.error);