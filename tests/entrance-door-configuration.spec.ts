import { test, expect } from '@playwright/test';

test.describe('Entrance Door Configuration Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test('should configure a single entrance door and verify in quote summary', async ({ page }) => {
    // Step 1: Start new quote
    await page.getByTestId('start-quote-button').click();

    // Step 2: Select Entrance Door
    await page.getByTestId('entrance-doors-option').click();

    // Step 3: Configure the door
    // Select opening type
    await page.getByTestId('opening-type-select').selectOption('Single Door');
    
    // Set dimensions
    await page.getByTestId('width-input').fill('36');
    await page.getByTestId('height-input').fill('80');
    
    // Select hand
    await page.getByTestId('hand-select').selectOption('Left Hand In');
    
    // Configure grids
    await page.getByTestId('enable-grids-checkbox').check();
    await page.getByTestId('grid-pattern-select').selectOption('Colonial');
    
    // Add to quote
    await page.getByTestId('add-to-quote-button').click();

    // Step 4: Verify in Quote Summary
    await expect(page).toHaveURL(/.*quote-summary/);
    
    // Verify the configuration preview
    const preview = page.getByTestId('configuration-preview');
    await expect(preview).toBeVisible();
    
    // Verify single door representation
    const doorPanel = page.getByTestId('single-door-panel');
    await expect(doorPanel).toBeVisible();
    
    // Verify configuration details
    await expect(page.getByTestId('dimensions-display')).toHaveText('36" × 80"');
    await expect(page.getByTestId('opening-type-display')).toHaveText('Single Door');
    await expect(page.getByTestId('hand-display')).toHaveText('Left Hand In');
    await expect(page.getByTestId('grid-pattern-display')).toHaveText('Colonial');
  });

  test('should validate required fields in entrance door configuration', async ({ page }) => {
    // Navigate through initial steps
    await page.getByTestId('start-quote-button').click();
    await page.getByTestId('entrance-doors-option').click();
    
    // Try to add without required fields
    await page.getByTestId('add-to-quote-button').click();
    
    // Verify validation messages
    await expect(page.getByTestId('width-error')).toBeVisible();
    await expect(page.getByTestId('height-error')).toBeVisible();
    await expect(page.getByTestId('opening-type-error')).toBeVisible();
  });

  test('should update entrance door configuration before adding to quote', async ({ page }) => {
    // Navigate and initial configuration
    await page.getByTestId('start-quote-button').click();
    await page.getByTestId('entrance-doors-option').click();
    
    // Initial configuration
    await page.getByTestId('opening-type-select').selectOption('Single Door');
    await page.getByTestId('width-input').fill('36');
    await page.getByTestId('height-input').fill('80');
    
    // Change configuration
    await page.getByTestId('width-input').fill('42');
    await page.getByTestId('height-input').fill('84');
    await page.getByTestId('hand-select').selectOption('Right Hand In');
    
    // Add to quote
    await page.getByTestId('add-to-quote-button').click();
    
    // Verify updated configuration
    await expect(page.getByTestId('dimensions-display')).toHaveText('42" × 84"');
    await expect(page.getByTestId('hand-display')).toHaveText('Right Hand In');
  });
}); 