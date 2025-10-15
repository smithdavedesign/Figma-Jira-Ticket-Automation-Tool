#!/usr/bin/env node

/**
 * Quick Test Suite - Essential AI Tests
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const runQuickTests = async () => {
  console.log('🚀 Quick AI Test Suite - Figma Ticket Generator');
  console.log('=' .repeat(50));
  
  const apiKey = process.env.GEMINI_API_KEY;
  let passed = 0, failed = 0;
  
  // Test 1: Direct Gemini API
  try {
    console.log('\n✅ Test 1: Direct Gemini API');
    const genAI = new GoogleGenAI({ apiKey });
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say "SUCCESS" in one word'
    });
    console.log(`   Response: ${result.text}`);
    passed++;
  } catch (error) {
    console.log(`❌ Test 1 Failed: ${error.message}`);
    failed++;
  }
  
  // Test 2: Server Health
  try {
    console.log('\n✅ Test 2: Server Health');
    const response = await fetch('http://localhost:3000');
    console.log(`   Status: ${response.status}`);
    passed++;
  } catch (error) {
    console.log(`❌ Test 2 Failed: ${error.message}`);
    failed++;
  }
  
  // Test 3: AI Services
  try {
    console.log('\n✅ Test 3: AI Services Status');
    const response = await fetch('http://localhost:3000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'test_ai_services' })
    });
    const result = await response.json();
    const hasGemini = result.content[0].text.includes('Google Gemini') && 
                      result.content[0].text.includes('✅ Available');
    console.log(`   Gemini Detected: ${hasGemini}`);
    passed++;
  } catch (error) {
    console.log(`❌ Test 3 Failed: ${error.message}`);
    failed++;
  }
  
  // Test 4: AI Ticket Generation
  try {
    console.log('\n✅ Test 4: AI Ticket Generation');
    const response = await fetch('http://localhost:3000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'generate_ai_ticket',
        params: {
          title: 'Test Navigation',
          description: 'Improve accessibility',
          useAI: true
        }
      })
    });
    const result = await response.json();
    const hasAI = result.content[0].text.includes('AI-Enhanced') || 
                  result.content[0].text.includes('🤖');
    console.log(`   AI Enhanced: ${hasAI}`);
    console.log(`   Length: ${result.content[0].text.length} chars`);
    passed++;
  } catch (error) {
    console.log(`❌ Test 4 Failed: ${error.message}`);
    failed++;
  }
  
  // Final Report
  console.log('\n' + '='.repeat(50));
  console.log('🎯 QUICK TEST RESULTS');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Success Rate: ${Math.round((passed/(passed+failed))*100)}%`);
  
  if (passed === 4) {
    console.log('🎉 ALL TESTS PASSED - SYSTEM READY!');
  } else if (passed >= 3) {
    console.log('⚠️ MOSTLY WORKING - MINOR ISSUES');
  } else {
    console.log('🚨 NEEDS ATTENTION - CRITICAL ISSUES');
  }
  console.log('='.repeat(50));
};

runQuickTests().catch(console.error);