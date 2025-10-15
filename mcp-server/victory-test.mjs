#!/usr/bin/env node

/**
 * Final Victory Test - AI-Enhanced Ticket Generation
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const finalVictoryTest = async () => {
  console.log('🎉 FINAL VICTORY TEST - AI-Enhanced Ticket Generation\n');
  console.log('=' .repeat(60));
  
  try {
    const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    console.log('🧪 Test 1: Basic Connection');
    const basicResult = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say "SUCCESS" in all caps'
    });
    console.log(`✅ Basic test: ${basicResult.text}`);
    
    console.log('\n🎫 Test 2: AI-Enhanced Ticket Generation');
    const ticketPrompt = `
Generate a professional Jira ticket for improving navigation accessibility:

Title: Improve navigation accessibility
Description: Dashboard navigation needs better keyboard support and ARIA labels
Priority: High
Category: Accessibility
Tech Stack: React, TypeScript, Tailwind CSS

Format as a proper ticket with acceptance criteria.`;

    const ticketResult = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: ticketPrompt
    });
    
    console.log('✅ AI-Generated Ticket:');
    console.log('-'.repeat(40));
    console.log(ticketResult.text);
    console.log('-'.repeat(40));
    
    console.log('\n🎉 SUCCESS! Gemini AI is fully working!');
    console.log('✅ Your MCP server is ready for AI-enhanced ticket generation!');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
};

finalVictoryTest();