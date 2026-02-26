// Core Plugin Loading Smoke Test
import { test, expect } from '@playwright/test';

test.describe('Plugin Loading Smoke Tests', () => {
  test('Test server should be healthy', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();

    const health = await response.json();
    expect(health).toHaveProperty('status', 'healthy');
    expect(health).toHaveProperty('timestamp');
    expect(health).toHaveProperty('uptime');
    expect(health).toHaveProperty('services');
  });

  test('Plugin UI should load without errors', async ({ page }) => {
    // Capture console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/ui/index.html');

    // App root and header must be visible
    await expect(page.locator('#app')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.header')).toBeVisible();

    // Core form controls — verified against real DOM IDs in ui/index.html
    await expect(page.locator('#techStack')).toBeVisible();
    await expect(page.locator('#generateBtn')).toBeAttached(); // may be hidden until Figma selection

    // Allow MCP/network noise but fail on real JS errors
    const criticalErrors = errors.filter(e =>
      !e.includes('DevTools') &&
      !e.includes('Failed to load resource') &&
      !e.includes('MCP server connection failed') &&
      !e.includes('Failed to fetch')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('Server status indicator should be present', async ({ page }) => {
    await page.goto('/ui/index.html');
    await page.waitForTimeout(2000);

    // Real IDs: #serverStatus (container), #serverText (badge text)
    await expect(page.locator('#serverStatus')).toBeAttached();
    await expect(page.locator('#serverText')).toBeAttached();
  });

  test('Ticket generator form controls should be present', async ({ page }) => {
    await page.goto('/ui/index.html');
    await page.waitForTimeout(2000);

    // Tech stack textarea
    await expect(page.locator('#techStack')).toBeAttached();
    await page.fill('#techStack', 'React 18, TypeScript');
    await expect(page.locator('#techStack')).toHaveValue('React 18, TypeScript');

    // Generate button and results container exist in the DOM
    await expect(page.locator('#generateBtn')).toBeAttached();
    await expect(page.locator('#results')).toBeAttached();
    await expect(page.locator('#creationLinks')).toBeAttached();
  });

  test('Health check endpoint should return basic info', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();

    const health = await response.json();
    expect(health).toHaveProperty('status', 'healthy');
    expect(health).toHaveProperty('timestamp');
    expect(health).toHaveProperty('uptime');
    expect(health).toHaveProperty('services');
  });
});
