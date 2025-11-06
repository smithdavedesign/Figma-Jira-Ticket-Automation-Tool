// Core Plugin Loading Smoke Test
import { test, expect } from '@playwright/test';

test.describe('Plugin Loading Smoke Tests', () => {
  test('Test server should be healthy', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();
    
    const health = await response.json();
    expect(health).toHaveProperty('status', 'healthy');
    expect(health).toHaveProperty('timestamp');
    // Note: Production server returns comprehensive health data, not just 'test-server'
  });

  test('Plugin UI should load without errors', async ({ page }) => {
    // Monitor console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/ui/index.html');
    
    // Wait for main elements to load
    await expect(page.locator('#app')).toBeVisible({ timeout: 10000 });
    
    // Check for key UI elements
    await expect(page.locator('#generate')).toBeVisible();
    await expect(page.locator('.header')).toBeVisible();
    
    // Check for critical UI components
    await expect(page.locator('#techStackInput')).toBeVisible();
    await expect(page.locator('#platform')).toBeVisible();
    
    // Should have no critical JavaScript errors (allow MCP server connection issues in CI)
    const criticalErrors = errors.filter(error => 
      !error.includes('DevTools') && 
      !error.includes('Failed to load resource') && // Allow network timeouts
      !error.includes('MCP server connection failed') && // Allow MCP server issues in CI
      !error.includes('Failed to fetch') // Allow fetch failures in test environment
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('Health metrics should initialize correctly', async ({ page }) => {
    await page.goto('/ui/index.html');
    
    // Wait for UI to initialize
    await page.waitForTimeout(2000);
    
    // Check that MCP server status section is visible
    await expect(page.locator('#server-status-section')).toBeVisible();
    await expect(page.locator('#server-status-badge')).toBeVisible();
    
    // Check server connection status elements
    await expect(page.locator('#server-connection-status')).toBeVisible();
    await expect(page.locator('#server-connection-content')).toBeVisible();
    
    // Verify context preview wrapper exists (even if hidden initially)
    await expect(page.locator('#context-preview-wrapper')).toBeAttached();
  });

  test('Ticket generator UI should be functional', async ({ page }) => {
    await page.goto('/ui/index.html');
    
    // Wait for plugin to be ready
    await page.waitForTimeout(2000);
    
    // Check ticket generator elements are present
    await expect(page.locator('#platform')).toBeVisible();
    await expect(page.locator('#documentType')).toBeVisible();
    await expect(page.locator('#generate')).toBeVisible();
    await expect(page.locator('#techStackInput')).toBeVisible();
    
    // Check form controls work
    await page.selectOption('#platform', 'jira');
    await page.selectOption('#documentType', 'component');
    
    // Verify generate button is not disabled
    const generateBtn = page.locator('#generate');
    await expect(generateBtn).not.toBeDisabled();
    
    // Check tech stack input is functional
    await page.fill('#techStackInput', 'React 18, TypeScript');
    await expect(page.locator('#techStackInput')).toHaveValue('React 18, TypeScript');
    
    // Check AI generate button is present and functional
    await expect(page.locator('#generateAI')).toBeVisible();
  });

  test('Health check endpoint should return basic info', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();
    
    const health = await response.json();
    
    // Check basic health fields for production server
    expect(health).toHaveProperty('status', 'healthy');
    expect(health).toHaveProperty('timestamp');
    expect(health).toHaveProperty('version');
    expect(health).toHaveProperty('uptime');
  });
});