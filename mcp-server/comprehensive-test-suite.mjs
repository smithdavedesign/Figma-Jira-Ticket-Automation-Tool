#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Figma AI Ticket Generator
 * 
 * Tests all aspects of the AI-enhanced MCP server including:
 * - AI service integration (Gemini 2.5 Flash)
 * - Ticket generation with various scenarios
 * - Error handling and fallbacks
 * - Performance and reliability
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

class FigmaAITestSuite {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.serverUrl = 'http://localhost:3000';
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(name, testFn) {
    console.log(`\n🧪 Running: ${name}`);
    console.log('-'.repeat(50));
    
    try {
      const startTime = Date.now();
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      console.log(`✅ PASSED: ${name} (${duration}ms)`);
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASSED', duration, result });
      
      return result;
    } catch (error) {
      console.log(`❌ FAILED: ${name}`);
      console.log(`   Error: ${error.message}`);
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAILED', error: error.message });
      
      throw error;
    }
  }

  async testDirectGeminiAPI() {
    return this.runTest('Direct Gemini API Connection', async () => {
      if (!this.apiKey) throw new Error('GEMINI_API_KEY not set');
      
      const genAI = new GoogleGenAI({ apiKey: this.apiKey });
      const result = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Say "API_TEST_SUCCESS" exactly'
      });
      
      const text = result.text;
      if (!text.includes('API_TEST_SUCCESS')) {
        throw new Error(`Unexpected response: ${text}`);
      }
      
      return { response: text, model: 'gemini-2.5-flash' };
    });
  }

  async testServerHealth() {
    return this.runTest('MCP Server Health Check', async () => {
      const response = await fetch(this.serverUrl, { method: 'GET' });
      
      if (!response.ok) {
        throw new Error(`Server not responding: ${response.status}`);
      }
      
      return { status: response.status, server: 'healthy' };
    });
  }

  async testAIServicesStatus() {
    return this.runTest('AI Services Status Detection', async () => {
      const response = await fetch(this.serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'test_ai_services', params: {} })
      });
      
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      
      const result = await response.json();
      const content = result.content[0].text;
      
      if (!content.includes('Google Gemini') || !content.includes('✅ Available')) {
        throw new Error('Gemini not detected as available');
      }
      
      return { geminiDetected: true, content: content.slice(0, 200) + '...' };
    });
  }

  async testProjectAnalysis() {
    return this.runTest('Project Analysis Tool', async () => {
      const response = await fetch(this.serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'analyze_project',
          params: { figmaUrl: 'https://figma.com/file/test123/test-project' }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }
      
      const result = await response.json();
      const content = result.content[0].text;
      
      if (!content.includes('Project Analysis Results')) {
        throw new Error('Invalid analysis response');
      }
      
      return { analysisGenerated: true, length: content.length };
    });
  }

  async testAIEnhancedTicketGeneration() {
    return this.runTest('AI-Enhanced Ticket Generation', async () => {
      const response = await fetch(this.serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'generate_ai_ticket',
          params: {
            title: 'Test Accessibility Enhancement',
            description: 'Add ARIA labels and keyboard navigation',
            category: 'Accessibility',
            priority: 'High',
            techStack: 'React, TypeScript',
            useAI: true
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Generation failed: ${response.status}`);
      }
      
      const result = await response.json();
      const content = result.content[0].text;
      
      // Check for AI enhancement indicators
      const hasAIMarkers = content.includes('AI-Enhanced') || 
                           content.includes('Generated on') ||
                           content.includes('🤖');
      
      if (!hasAIMarkers) {
        throw new Error('Response does not appear to be AI-enhanced');
      }
      
      return { 
        aiEnhanced: true, 
        length: content.length,
        hasStructure: content.includes('Acceptance Criteria')
      };
    });
  }

  async testErrorHandling() {
    return this.runTest('Error Handling & Fallbacks', async () => {
      // Test with invalid method
      const response = await fetch(this.serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'invalid_method',
          params: {}
        })
      });
      
      if (response.ok) {
        throw new Error('Server should reject invalid methods');
      }
      
      const result = await response.json();
      
      if (!result.content[0].text.includes('Unknown method')) {
        throw new Error('Unexpected error response format');
      }
      
      return { errorHandling: 'working', gracefulDegradation: true };
    });
  }

  async testPerformance() {
    return this.runTest('Performance & Reliability', async () => {
      const startTime = Date.now();
      
      // Run multiple quick requests
      const requests = Array(3).fill().map(() => 
        fetch(this.serverUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'test_ai_services',
            params: {}
          })
        })
      );
      
      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;
      
      const allSuccessful = responses.every(r => r.ok);
      if (!allSuccessful) {
        throw new Error('Some concurrent requests failed');
      }
      
      if (duration > 10000) { // 10 seconds for 3 requests
        throw new Error(`Performance too slow: ${duration}ms`);
      }
      
      return { 
        concurrentRequests: 3, 
        totalTime: duration,
        avgTime: Math.round(duration / 3)
      };
    });
  }

  async generateFinalReport() {
    const total = this.results.passed + this.results.failed;
    const successRate = Math.round((this.results.passed / total) * 100);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 FINAL TEST REPORT');
    console.log('='.repeat(60));
    console.log(`📊 Tests Run: ${total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log('');
    
    if (successRate >= 85) {
      console.log('🎉 SYSTEM STATUS: PRODUCTION READY!');
      console.log('✅ AI-Enhanced Figma Ticket Generator is fully operational');
    } else if (successRate >= 70) {
      console.log('⚠️  SYSTEM STATUS: MOSTLY WORKING');
      console.log('🔧 Some issues detected, but core functionality works');
    } else {
      console.log('❌ SYSTEM STATUS: NEEDS ATTENTION');
      console.log('🚨 Multiple critical issues detected');
    }
    
    console.log('\n📋 Test Details:');
    this.results.tests.forEach(test => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      const time = test.duration ? ` (${test.duration}ms)` : '';
      console.log(`${status} ${test.name}${time}`);
      if (test.error) {
        console.log(`    └─ ${test.error}`);
      }
    });
    
    console.log('\n' + '='.repeat(60));
    
    return {
      total,
      passed: this.results.passed,
      failed: this.results.failed,
      successRate,
      status: successRate >= 85 ? 'PRODUCTION_READY' : 
              successRate >= 70 ? 'MOSTLY_WORKING' : 'NEEDS_ATTENTION'
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Test Suite');
    console.log('🎯 Testing: Figma AI Ticket Generator MCP Server');
    console.log('📅 Date:', new Date().toISOString());
    console.log('🔑 API Key:', this.apiKey ? 'SET' : 'MISSING');
    
    try {
      // Core functionality tests
      await this.testDirectGeminiAPI();
      await this.testServerHealth();
      await this.testAIServicesStatus();
      
      // Feature tests
      await this.testProjectAnalysis();
      await this.testAIEnhancedTicketGeneration();
      
      // Reliability tests
      await this.testErrorHandling();
      await this.testPerformance();
      
    } catch (error) {
      console.log(`\n⚠️  Test execution interrupted: ${error.message}`);
    }
    
    return await this.generateFinalReport();
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new FigmaAITestSuite();
  testSuite.runAllTests().catch(console.error);
}

export { FigmaAITestSuite };