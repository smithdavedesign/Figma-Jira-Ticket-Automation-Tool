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

    // Basic excludes - make sure to exclude Playwright tests and template tests
    exclude: [
      'node_modules',
      'dist',
      'tests/smoke/**/*',
      'tests/playwright/**/*',
      'tests/**/playwright/**/*',
      'tests/templates/**/*' // Template tests are run by test-orchestrator, not vitest
    ],

    // Basic timeouts
    testTimeout: 30000,

    // Disable threading for CI compatibility
    threads: false,

    // Use default reporter for maximum compatibility
    reporter: 'default',

    // Disable features that might cause Node.js compatibility issues
    watch: false,
    isolate: true, // Enable isolation for better test reliability

    // Simple environment
    env: {
      NODE_ENV: 'test'
    },

    // Coverage configuration - only enabled when explicitly requested
    coverage: {
      enabled: process.env.VITEST_COVERAGE === 'true',
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        'tests/**',
        'coverage/**',
        '**/*.config.js',
        '**/*.config.mjs',
        'app/plugin/**',
        'scripts/**',
        'tools/**'
      ],
      // Minimal thresholds for CI
      thresholds: {
        lines: 1,
        functions: 1,
        branches: 1,
        statements: 1
      }
    }
  }
});