#!/usr/bin/env node

/**
 * Debug Gemini API connection
 */

import dotenv from 'dotenv';
dotenv.config();

const testGeminiDirect = async () => {
  console.log('🔍 Direct Gemini API Test\n');
  
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('API Key loaded:', apiKey ? `${apiKey.slice(0, 10)}...${apiKey.slice(-4)}` : 'NOT FOUND');
  
  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }
  
  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say hello briefly' }] }],
          generationConfig: { maxOutputTokens: 20 }
        })
      }
    );

    console.log('Response status:', response.status);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Gemini is working!');
      console.log('Response:', result.candidates?.[0]?.content?.parts?.[0]?.text || 'No text response');
    } else {
      console.log('❌ API Error:', result.error?.message || 'Unknown error');
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
};

testGeminiDirect();