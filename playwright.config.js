// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for smoke tests.
 * Tests live in tests/smoke/ and require the server to be running on port 3000.
 *
 * Run: npm run test:smoke
 * Server is auto-started by the webServer block below.
 */
export default defineConfig({
  testDir: './tests/smoke',
  timeout: 30_000,
  retries: 1,

  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'node app/server.js',
    port: 3000,
    reuseExistingServer: true,
    timeout: 15_000,
  },

  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
});
