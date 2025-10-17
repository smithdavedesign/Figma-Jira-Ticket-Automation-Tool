#!/usr/bin/env node

/**
 * Standalone MCP Data Layer Testing Script
 * 
 * This script tests the complete MCP data layer pipeline without requiring Figma.
 * It generates mock data, validates schemas, and tests AI integration.
 */

// Using built-in fetch (Node.js 18+)
// import { GoogleGenAI } from '@google/genai';
// import dotenv from 'dotenv';

// Simple environment loading
async function loadEnv() {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      });
    }
  } catch (error) {
    console.log('No .env file found, using system environment variables');
  }
}

await loadEnv();

const MCP_SERVER_URL = 'http://localhost:3000';

// Mock data generator matching our enhanced schema
function generateMockEnhancedFrameData() {
  return {
    enhancedFrameData: [
      {
        id: "test-button-component",
        name: "Primary Button",
        type: "COMPONENT",
        description: "Primary action button component",
        pageName: "Design System",
        dimensions: { width: 120, height: 40 },
        position: { x: 100, y: 200 },
        hierarchy: {
          layers: [
            {
              id: "button-bg",
              name: "Button Background",
              type: "RECTANGLE",
              position: { x: 0, y: 0 },
              size: { width: 120, height: 40 },
              semanticRole: "background"
            },
            {
              id: "button-text",
              name: "Button Label",
              type: "TEXT",
              position: { x: 10, y: 12 },
              size: { width: 100, height: 16 },
              semanticRole: "text"
            }
          ],
          totalDepth: 2,
          componentCount: 1,
          textLayerCount: 1
        },
        componentInstances: [],
        designSystemLinks: {
          buttons: "design-system/buttons",
          colors: "design-system/colors",
          typography: "design-system/typography",
          spacing: "design-system/spacing"
        },
        exportScreenshots: [],
        fileKey: "BioUSVD6t51ZNeG0g9AcNz",
        fileName: "Test Design System",
        metadata: {
          nodeCount: 2,
          textContent: ["Get Started"],
          colors: ["#007AFF", "#FFFFFF"],
          hasPrototype: false,
          semanticRole: "button",
          accessibility: {
            hasLabel: true,
            role: "button",
            colorContrast: "unknown",
            focusable: true,
            issues: []
          }
        }
      },
      {
        id: "test-card-component",
        name: "Feature Card",
        type: "FRAME",
        description: "Feature showcase card",
        pageName: "Components",
        dimensions: { width: 300, height: 200 },
        position: { x: 0, y: 0 },
        hierarchy: {
          layers: [
            {
              id: "card-bg",
              name: "Card Background",
              type: "RECTANGLE",
              position: { x: 0, y: 0 },
              size: { width: 300, height: 200 },
              semanticRole: "container"
            },
            {
              id: "card-title",
              name: "Card Title",
              type: "TEXT",
              position: { x: 20, y: 20 },
              size: { width: 260, height: 24 },
              semanticRole: "heading"
            },
            {
              id: "card-desc",
              name: "Card Description",
              type: "TEXT",
              position: { x: 20, y: 50 },
              size: { width: 260, height: 60 },
              semanticRole: "text"
            }
          ],
          totalDepth: 2,
          componentCount: 0,
          textLayerCount: 2
        },
        componentInstances: [],
        designSystemLinks: {
          buttons: null,
          colors: "design-system/colors",
          typography: "design-system/typography",
          spacing: "design-system/spacing"
        },
        exportScreenshots: [],
        fileKey: "BioUSVD6t51ZNeG0g9AcNz",
        fileName: "Test Design System",
        metadata: {
          nodeCount: 3,
          textContent: ["AI Features", "Intelligent automation for design workflows"],
          colors: ["#F8F9FA", "#1A202C", "#6B7280"],
          hasPrototype: false,
          semanticRole: "card",
          accessibility: {
            hasLabel: true,
            role: "article",
            colorContrast: "unknown",
            focusable: false,
            issues: []
          }
        }
      }
    ],
    screenshot: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    fileContext: {
      fileKey: "BioUSVD6t51ZNeG0g9AcNz",
      fileName: "Test Design System",
      pageName: "Components",
      selectionCount: 2
    },
    metadata: {
      extractedAt: new Date().toISOString(),
      totalFrames: 2,
      hasScreenshot: true
    }
  };
}

// Schema validation function
function validateEnhancedFrameData(data) {
  const errors = [];
  const warnings = [];
  
  if (!data.enhancedFrameData || !Array.isArray(data.enhancedFrameData)) {
    errors.push('enhancedFrameData must be an array');
    return { isValid: false, errors, warnings };
  }
  
  data.enhancedFrameData.forEach((frame, index) => {
    const prefix = `Frame ${index}: `;
    
    // Required fields
    if (!frame.id) errors.push(prefix + 'id is required');
    if (!frame.name) warnings.push(prefix + 'name is missing');
    if (!frame.type) errors.push(prefix + 'type is required');
    
    // Dimensions validation
    if (!frame.dimensions) {
      errors.push(prefix + 'dimensions is required');
    } else {
      if (typeof frame.dimensions.width !== 'number') errors.push(prefix + 'dimensions.width must be a number');
      if (typeof frame.dimensions.height !== 'number') errors.push(prefix + 'dimensions.height must be a number');
    }
    
    // Hierarchy validation
    if (!frame.hierarchy) {
      errors.push(prefix + 'hierarchy is required');
    } else {
      if (!Array.isArray(frame.hierarchy.layers)) errors.push(prefix + 'hierarchy.layers must be an array');
      if (typeof frame.hierarchy.totalDepth !== 'number') warnings.push(prefix + 'hierarchy.totalDepth should be a number');
    }
    
    // Metadata validation
    if (!frame.metadata) {
      errors.push(prefix + 'metadata is required');
    } else {
      if (!Array.isArray(frame.metadata.colors)) warnings.push(prefix + 'metadata.colors should be an array');
      if (!frame.metadata.semanticRole) warnings.push(prefix + 'metadata.semanticRole is missing');
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Test functions
async function testMCPServerHealth() {
  console.log('\n🔄 Testing MCP Server Health...');
  
  try {
    const response = await fetch(MCP_SERVER_URL, { timeout: 5000 });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    console.log('✅ MCP Server is healthy');
    console.log(`   📊 Name: ${data.name}`);
    console.log(`   📦 Version: ${data.version}`);
    console.log(`   🔧 Tools: ${data.tools?.join(', ')}`);
    return true;
  } catch (error) {
    console.log(`❌ MCP Server health check failed: ${error.message}`);
    return false;
  }
}

async function testDataValidation() {
  console.log('\n🔄 Testing Data Validation...');
  
  const mockData = generateMockEnhancedFrameData();
  console.log(`📊 Generated mock data with ${mockData.enhancedFrameData.length} frames`);
  
  const validation = validateEnhancedFrameData(mockData);
  
  if (validation.isValid) {
    console.log('✅ Data validation passed');
  } else {
    console.log('❌ Data validation failed:');
    validation.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.log('⚠️ Validation warnings:');
    validation.warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  return validation.isValid;
}

async function testMCPAIGeneration() {
  console.log('\n🔄 Testing MCP AI Generation...');
  
  const mockData = generateMockEnhancedFrameData();
  
  try {
    const response = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'generate_ai_ticket',
        params: {
          enhancedFrameData: mockData.enhancedFrameData,
          screenshot: mockData.screenshot,
          figmaUrl: `https://www.figma.com/file/${mockData.fileContext.fileKey}/${encodeURIComponent(mockData.fileContext.fileName)}`,
          techStack: 'React + TypeScript + Tailwind CSS',
          documentType: 'jira',
          projectName: mockData.fileContext.fileName,
          fileContext: mockData.fileContext,
          metadata: mockData.metadata,
          useAI: true
        }
      })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const result = await response.json();
    
    if (result.content && result.content[0] && result.content[0].text) {
      console.log('✅ AI ticket generation successful');
      console.log(`   📄 Content length: ${result.content[0].text.length} characters`);
      console.log(`   🎯 Preview: ${result.content[0].text.substring(0, 100)}...`);
      return true;
    } else {
      throw new Error('No content in response');
    }
  } catch (error) {
    console.log(`❌ AI generation failed: ${error.message}`);
    return false;
  }
}

async function testGeminiDirect() {
  console.log('\n🔄 Testing Gemini API Direct Connection...');
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('⚠️ GEMINI_API_KEY not found in environment');
    console.log('   Set GEMINI_API_KEY environment variable to test Gemini API');
    return false;
  }
  
  try {
    const prompt = `Generate a brief Jira ticket for implementing a React button component with the following specs:
    - Primary button with blue background (#007AFF)
    - White text
    - 120x40px dimensions
    - Accessible with proper ARIA labels
    
    Format as a proper ticket with title, description, and acceptance criteria.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    
    console.log('✅ Gemini API connection successful');
    console.log(`   📄 Generated content length: ${text.length} characters`);
    console.log(`   🎯 Preview: ${text.substring(0, 100)}...`);
    return true;
  } catch (error) {
    console.log(`❌ Gemini API test failed: ${error.message}`);
    return false;
  }
}

async function runCompleteTestSuite() {
  console.log('🚀 Starting Complete MCP Data Layer Test Suite');
  console.log('='.repeat(60));
  
  const tests = [
    { name: 'MCP Server Health', fn: testMCPServerHealth },
    { name: 'Data Validation', fn: testDataValidation },
    { name: 'MCP AI Generation', fn: testMCPAIGeneration },
    { name: 'Gemini Direct Connection', fn: testGeminiDirect }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} threw error: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Test Suite Complete: ${passed} passed, ${failed} failed`);
  
  if (passed === tests.length) {
    console.log('🎉 All tests passed! Your MCP data layer is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the errors above for details.');
  }
  
  return passed === tests.length;
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteTestSuite()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('💥 Test suite crashed:', error);
      process.exit(1);
    });
}

export {
  generateMockEnhancedFrameData,
  validateEnhancedFrameData,
  runCompleteTestSuite
};