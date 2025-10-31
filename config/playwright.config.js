// Main Playwright Configuration
// Default configuration that delegates to specific test configs
// This enables standard Playwright CLI commands to work properly

import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Default to smoke tests for quick validation
  testDir: './tests/smoke',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'tests/test-results/playwright-reports/default-report' }],
    ['json', { outputFile: 'tests/test-results/playwright-reports/default-results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:8101',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  outputDir: 'tests/test-results/playwright-screenshots/default-screenshots',
  projects: [
    {
      name: 'chromium',
      use: {
        viewport: { width: 1280, height: 720 }
      }
    }
  ],
  webServer: {
    command: 'npm run start:test-server',
    port: 8101,
    reuseExistingServer: !process.env.CI
  }
});