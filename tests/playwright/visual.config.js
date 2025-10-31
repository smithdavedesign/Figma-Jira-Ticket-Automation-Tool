// Playwright Visual Diff Tests Configuration
// Screenshot comparison and UI consistency (<5 minutes)

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../visual',
  timeout: 45000,
  expect: {
    timeout: 8000,
    // Visual comparison threshold
    threshold: 0.2,
    toHaveScreenshot: { threshold: 0.2, mode: 'pixel' },
    toMatchScreenshot: { threshold: 0.2, mode: 'pixel' }
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: '../test-results/playwright-reports/visual-report' }],
    ['json', { outputFile: '../test-results/playwright-reports/visual-results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  outputDir: '../test-results/playwright-screenshots/visual-screenshots',
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