#!/usr/bin/env node

/**
 * Comprehensive Gemini API Troubleshooting Guide
 * 
 * This script tests various aspects of your Gemini API setup
 * and provides specific guidance for resolving issues.
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const troubleshootGeminiSetup = async () => {
  console.log('🔍 Comprehensive Gemini API Troubleshooting\n');
  console.log('=' .repeat(60));
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Check 1: API Key Format
  console.log('\n📋 Check 1: API Key Format');
  console.log('-'.repeat(30));
  
  if (!apiKey) {
    console.log('❌ No GEMINI_API_KEY found in environment');
    return;
  }
  
  console.log('✅ API Key found');
  console.log(`   Length: ${apiKey.length} characters`);
  console.log(`   Starts with: ${apiKey.slice(0, 10)}...`);
  console.log(`   Expected format: AIza... (should start with "AIza")`);
  
  if (!apiKey.startsWith('AIza')) {
    console.log('⚠️  WARNING: API key doesn\'t start with expected "AIza" prefix');
  }
  
  // Check 2: Test with Official SDK
  console.log('\n🧪 Check 2: Test with Official SDK');
  console.log('-'.repeat(30));
  
  try {
    const genAI = new GoogleGenAI({ apiKey });
    console.log('✅ SDK client created successfully');
    
    // Try a simple generation
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say "Hello" in exactly one word.'
    });
    
    console.log('✅ API call successful!');
    console.log(`   Response: ${result.text || 'No text response'}`);
    
    return { success: true, message: 'API working correctly!' };
    
  } catch (error) {
    console.log('❌ API call failed');
    
    if (error.status === 400) {
      if (error.message.includes('API key not valid')) {
        console.log('\n🚨 ISSUE: Invalid API Key');
        console.log('\nPossible solutions:');
        console.log('1. Check if you\'re using the correct API key from Google AI Studio');
        console.log('2. Verify the key was copied completely (no extra spaces/characters)');
        console.log('3. Check if the associated Google Cloud project has proper setup');
        console.log('4. Verify billing is enabled if required for your region');
        
      } else if (error.message.includes('FAILED_PRECONDITION')) {
        console.log('\n🚨 ISSUE: Free tier not available or billing required');
        console.log('\nPossible solutions:');
        console.log('1. Enable billing on your Google Cloud project in AI Studio');
        console.log('2. Check if Gemini API free tier is available in your country');
        console.log('3. Import your Google Cloud project into AI Studio');
      }
    } else if (error.status === 403) {
      console.log('\n🚨 ISSUE: Permission denied');
      console.log('\nPossible solutions:');
      console.log('1. Check API key permissions in Google AI Studio');
      console.log('2. Verify the Generative Language API is enabled');
      console.log('3. Check API key restrictions (if any)');
    }
    
    console.log(`\nFull error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Check 3: Test Alternative Models
const testAlternativeModels = async (apiKey) => {
  console.log('\n🔄 Check 3: Test Alternative Models');
  console.log('-'.repeat(30));
  
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash'];
  
  for (const model of models) {
    try {
      const genAI = new GoogleGenAI({ apiKey });
      const result = await genAI.models.generateContent({
        model,
        contents: 'Test'
      });
      
      console.log(`✅ ${model}: Working`);
      return model;
      
    } catch (error) {
      console.log(`❌ ${model}: ${error.message.slice(0, 50)}...`);
    }
  }
  
  return null;
};

// Check 4: Provide Setup Instructions
const provideSetupInstructions = () => {
  console.log('\n📚 Setup Instructions');
  console.log('-'.repeat(30));
  console.log('\n🔗 Complete Setup Steps:');
  console.log('\n1. Go to Google AI Studio: https://aistudio.google.com/app/apikey');
  console.log('2. Sign in with your Google account');
  console.log('3. Create or import a Google Cloud project');
  console.log('4. Generate a new API key in that project');
  console.log('5. If prompted, enable billing (may be required in some regions)');
  console.log('6. Copy the API key and update your .env file');
  
  console.log('\n🌍 Regional Considerations:');
  console.log('- Free tier may not be available in all countries');
  console.log('- Some regions require billing to be enabled');
  console.log('- Check available regions: https://ai.google.dev/gemini-api/docs/available-regions');
  
  console.log('\n🔧 Additional Resources:');
  console.log('- API Key Guide: https://ai.google.dev/gemini-api/docs/api-key');
  console.log('- Troubleshooting: https://ai.google.dev/gemini-api/docs/troubleshooting');
  console.log('- Community Forum: https://discuss.ai.google.dev/c/gemini-api/');
};

// Run all checks
const runFullDiagnostic = async () => {
  const result = await troubleshootGeminiSetup();
  
  if (!result.success) {
    await testAlternativeModels(process.env.GEMINI_API_KEY);
    provideSetupInstructions();
    
    console.log('\n💡 Next Steps:');
    console.log('1. Follow the setup instructions above');
    console.log('2. Generate a new API key if needed');
    console.log('3. Update your .env file with the new key');
    console.log('4. Run this test again');
  } else {
    console.log('\n🎉 SUCCESS! Your Gemini API is working correctly!');
  }
  
  console.log('\n' + '='.repeat(60));
};

runFullDiagnostic().catch(console.error);