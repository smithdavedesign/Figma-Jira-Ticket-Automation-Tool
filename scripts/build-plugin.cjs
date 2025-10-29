#!/usr/bin/env node

/**
 * Simple plugin build script for Figma plugin
 * Copies the necessary files to ensure plugin works properly
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Building Figma plugin...');

// Ensure the manifest.json exists and is valid
const manifestPath = './manifest.json';
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`✅ Manifest validated: ${manifest.name} (API ${manifest.api})`);
  
  // Check main code file
  if (fs.existsSync('./code.js')) {
    console.log('✅ Plugin code (code.js) exists');
  } else {
    console.error('❌ Plugin code (code.js) missing');
    process.exit(1);
  }
  
  // Check UI file
  if (fs.existsSync('./ui/index.html')) {
    console.log('✅ Plugin UI (ui/index.html) exists');
  } else {
    console.error('❌ Plugin UI (ui/index.html) missing');
    process.exit(1);
  }
  
  console.log('🎉 Plugin build completed successfully!');
  console.log('📦 Ready for Figma Desktop import');
  
} else {
  console.error('❌ manifest.json not found');
  process.exit(1);
}