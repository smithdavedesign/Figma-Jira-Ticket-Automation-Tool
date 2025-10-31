// Playwright Regression Tests Configuration  
// Comprehensive workflow validation (<10 minutes)

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../regression',
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { outputFolder: '../test-results/playwright-reports/regression-report' }],
    ['json', { outputFile: '../test-results/playwright-reports/regression-results.json' }],
    ['junit', { outputFile: '../test-results/playwright-reports/regression-results.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  outputDir: '../test-results/playwright-screenshots/regression-screenshots',
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      }
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
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