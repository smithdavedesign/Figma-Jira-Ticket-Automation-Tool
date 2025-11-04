#!/usr/bin/env node

/**
 * Direct test of Gemini API to validate the API key works
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';

// Load environment variables
config();

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API directly...');
  
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('API Key exists:', !!apiKey);
  console.log('API Key length:', apiKey ? apiKey.length : 'undefined');
  
  if (!apiKey) {
    console.error('❌ No GEMINI_API_KEY found in environment');
    process.exit(1);
  }
  
  try {
    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    console.log('✅ Gemini client initialized');
    
    // Test generation
    const prompt = 'Explain how AI works in a few words';
    console.log('🤖 Testing with prompt:', prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Success! Response:');
    console.log(text);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error details:', error);
  }
}

testGeminiAPI();