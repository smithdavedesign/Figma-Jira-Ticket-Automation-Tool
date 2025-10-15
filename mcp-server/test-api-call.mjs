#!/usr/bin/env node

/**
 * Test Google GenAI API call
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const testAPICall = async () => {
  console.log('🔍 Testing Google GenAI API Call\n');
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }
  
  try {
    const genAI = new GoogleGenAI({ apiKey });
    console.log('✅ Client created');
    
    // Try to generate content
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say hello briefly'
    });
    
    console.log('✅ Generation successful!');
    console.log('Response:', result);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Full error:', error);
  }
};

testAPICall();