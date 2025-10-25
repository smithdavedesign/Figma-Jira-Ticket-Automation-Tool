// Playwright CI Configuration
// Optimized for continuous integration environments

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../',
  testMatch: ['**/smoke/**/*.spec.js', '**/regression/**/*.spec.js'],
  timeout: 45000,
  expect: {
    timeout: 8000
  },
  fullyParallel: true,
  forbidOnly: true,
  retries: 2,
  workers: 2,
  reporter: [
    ['html', { outputFolder: '../test-results/playwright-reports/ci-report' }],
    ['json', { outputFile: '../test-results/playwright-reports/ci-results.json' }],
    ['junit', { outputFile: '../test-results/playwright-reports/ci-results.xml' }],
    ['github']
  ],
  use: {
    baseURL: 'http://localhost:8101',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  outputDir: '../test-results/playwright-screenshots/ci-screenshots',
  projects: [
    {
      name: 'chromium-ci',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      }
    }
  ],
  webServer: {
    command: 'npm run start:mvc',
    port: 3000,
    reuseExistingServer: true
  }
});