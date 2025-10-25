/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node', // or 'jsdom' for browser-like environment

    // Test file patterns
    include: [
      'tests/**/*.{test,spec}.{js,mjs,ts}',
      'src/**/*.{test,spec}.{js,mjs,ts}',
      'core/**/*.{test,spec}.{js,mjs,ts}',
      'app/**/*.{test,spec}.{js,mjs,ts}'
    ],

    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      'tests/archive',
      'tests/integration/*.html',
      'tests/playwright-browser-tests/**/*',
      'tests/smoke/**/*', // Exclude Playwright smoke tests
      'tests/regression/**/*', // Exclude Playwright regression tests
      'tests/visual/**/*', // Exclude Playwright visual tests
      'tests/playwright/**/*', // Exclude Playwright configs
      'ui/test/*.html',
      'archive/**/*',
      'app/legacy/archive/**/*',
      '**/node_modules/**/*'
    ],

    // Simplified setup for CI compatibility - disable setup files that may not exist
    // globalSetup: './tests/config/globalSetup.js',
    // setupFiles: ['./tests/config/setupTests.js'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './tests/coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        'coverage/',
        '**/*.config.{js,ts}',
        '**/*.test.{js,ts}',
        '**/*.spec.{js,ts}'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },

    // Test execution
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,

    // Concurrent testing
    threads: true,
    maxConcurrency: 5,

    // Reporter configuration
    reporter: ['default', 'json', 'html'],
    outputFile: {
      json: './tests/test-results/vitest-results.json',
      html: './tests/test-results/vitest-report.html'
    },

    // Watch mode
    watch: false,

    // Mock configuration
    clearMocks: true,
    restoreMocks: true,

    // Test isolation
    isolate: true,

    // Environment variables
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'ERROR', // Reduce logging noise during tests
      LOG_TO_FILE: 'false'
    }
  },

  // Simplified workspace for CI compatibility
  // workspace: [
  //   // Node.js environment for server/API tests
  //   {
  //     test: {
  //       name: 'node',
  //       environment: 'node',
  //       include: [
  //         'tests/unit/**/*.{test,spec}.{js,mjs}',
  //         'tests/integration/**/*.{test,spec}.{js,mjs}',
  //         'tests/system/**/*.{test,spec}.{js,mjs}',
  //         'core/**/*.{test,spec}.{js,mjs}',
  //         'app/**/*.{test,spec}.{js,mjs}'
  //       ]
  //     }
  //   },

  //   // JSDOM environment for UI/DOM tests
  //   {
  //     test: {
  //       name: 'jsdom',
  //       environment: 'jsdom',
  //       include: [
  //         'ui/**/*.{test,spec}.{js,mjs}',
  //         'tests/ui/**/*.{test,spec}.{js,mjs}'
  //       ],
  //       setupFiles: ['./tests/config/jsdomSetup.js']
  //     }
  //   },

  //   // Happy DOM environment for faster DOM tests
  //   {
  //     test: {
  //       name: 'happy-dom',
  //       environment: 'happy-dom',
  //       include: [
  //         'tests/performance/**/*.{test,spec}.{js,mjs}'
  //       ]
  //     }
  //   }
  // ]
});