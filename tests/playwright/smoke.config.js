// Playwright Smoke Tests Configuration
// Quick validation of core functionality (<2 minutes)

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../smoke',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: '../test-results/playwright-reports/smoke-report' }],
    ['json', { outputFile: '../test-results/playwright-reports/smoke-results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:8101',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  outputDir: '../test-results/playwright-screenshots/smoke-screenshots',
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      }
    }
  ],
  webServer: {
    command: 'npm run start:mvc',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});