/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Minimal configuration for maximum CI compatibility
    environment: 'node',
    
    // Test file patterns - keep simple
    include: [
      'tests/**/*.{test,spec}.{js,mjs}'
    ],

    // Basic excludes - make sure to exclude Playwright tests
    exclude: [
      'node_modules',
      'dist',
      'tests/smoke/**/*',
      'tests/playwright/**/*',
      'tests/**/playwright/**/*'
    ],

    // Basic timeouts
    testTimeout: 30000,
    
    // Disable threading for CI compatibility
    threads: false,
    
    // Simple reporter
    reporter: 'default',
    
    // Disable features that might cause Node.js compatibility issues
    watch: false,
    isolate: false,
    
    // Simple environment
    env: {
      NODE_ENV: 'test'
    }
  }
});