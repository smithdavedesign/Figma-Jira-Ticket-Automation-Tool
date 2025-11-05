#!/usr/bin/env node

/**
 * Test Environment Setup
 * Ensures consistent environment variables across all test scenarios
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// Clear any problematic system environment variables
const problematicKeys = [
    'GEMINI_API_KEY',
    'OPENAI_API_KEY', 
    'ANTHROPIC_API_KEY'
];

console.log('🧪 Setting up test environment...');

// Set test mode environment variable
process.env.NODE_ENV = 'test';
process.env.AI_TEST_MODE = 'true';

// Clear problematic system environment variables
problematicKeys.forEach(key => {
    if (process.env[key] && process.env[key].includes('AIzaSyCWGu1CMfzSVlg_04QbWUH6TNSxS_t39Ck')) {
        console.log(`🔧 Removing invalid system ${key}...`);
        delete process.env[key];
    }
});

// Load environment from .env file
const envPath = resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// In test mode, provide mock API keys if real ones are missing
if (process.env.AI_TEST_MODE === 'true') {
    console.log('🔧 Test mode enabled - using mock AI services');
    process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'mock-gemini-key-for-testing';
    process.env.FIGMA_API_KEY = process.env.FIGMA_API_KEY || 'mock-figma-key-for-testing';
}

// Validate critical environment variables
const requiredEnvVars = [
    'GEMINI_API_KEY',
    'FIGMA_API_KEY'
];

let allValid = true;
requiredEnvVars.forEach(key => {
    if (!process.env[key]) {
        if (process.env.AI_TEST_MODE === 'true') {
            console.log(`⚠️  ${key} missing but test mode enabled - using mock value`);
        } else {
            console.error(`❌ Missing required environment variable: ${key}`);
            allValid = false;
        }
    } else {
        const keyPreview = process.env[key].includes('mock') ? 
            'mock-***' : 
            process.env[key].substring(0, 10) + '...';
        console.log(`✅ ${key}: ${keyPreview}`);
    }
});

if (!allValid && process.env.AI_TEST_MODE !== 'true') {
    console.error('❌ Environment setup failed - missing required variables');
    process.exit(1);
}

console.log('✅ Test environment setup complete');

export default {
    isValid: allValid,
    envVars: process.env
};