#!/usr/bin/env node

/**
 * Test Google GenAI SDK structure
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const testSDKStructure = async () => {
  console.log('🔍 Testing Google GenAI SDK Structure\n');
  
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('API Key loaded:', apiKey ? `${apiKey.slice(0, 10)}...` : 'NOT FOUND');
  
  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }
  
  try {
    console.log('GoogleGenAI constructor:', typeof GoogleGenAI);
    const genAI = new GoogleGenAI({ apiKey });
    console.log('genAI instance:', typeof genAI);
    console.log('genAI methods:', Object.getOwnPropertyNames(genAI));
    console.log('genAI.__proto__:', Object.getOwnPropertyNames(Object.getPrototypeOf(genAI)));
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

testSDKStructure();