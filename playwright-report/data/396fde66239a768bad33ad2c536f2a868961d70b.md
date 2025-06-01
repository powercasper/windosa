# Test info

- Name: Configuration Integration Tests >> should generate PDF quote through API integration
- Location: /Users/sdiachenko/Desktop/window-pricing-final/tests/integration/configuration.test.ts:73:7

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('combobox', { name: 'Model' })

    at /Users/sdiachenko/Desktop/window-pricing-final/tests/integration/configuration.test.ts:81:23
```

# Page snapshot

```yaml
- banner:
  - text: Window & Door Pricing System
  - button "New Quote"
  - button "Saved Quotes"
- button "Select Brand"
- button "Choose System Type"
- button "Configure System Current step"
- button "Glass Options" [disabled]
- button "Review & Price" [disabled]
- heading "Configure Entrance Doors" [level=5]
- heading "Item Details" [level=6]
- heading "Item Number" [level=6]
- heading "-" [level=5]
- text: Location (Optional)
- textbox "Location (Optional)"
- paragraph: 0/100 characters
- separator
- heading "System Details" [level=6]
- text: Model
- combobox
- heading "System Dimensions" [level=6]
- heading "System Details" [level=6]
- heading "Overall System Dimensions" [level=6]
- heading "Total Width" [level=6]
- heading "36\"" [level=5]
- text: Total system width including all components
- heading "Total Height" [level=6]
- heading "80\"" [level=5]
- text: Total system height including transom
- heading "Area Calculations" [level=6]
- heading "Total System Area" [level=6]
- heading "20.00 sq ft" [level=5]
- text: Total system area including all components
- heading "Door Panel Dimensions" [level=6]
- heading "Door Width" [level=6]
- heading "36\"" [level=5]
- text: Single panel width
- heading "Door Height" [level=6]
- heading "80\"" [level=5]
- text: Door panel height (excluding transom)
- heading "Door Panel Area" [level=6]
- heading "20.00 sq ft" [level=5]
- text: Area of door panel(s) only
- separator
- heading "Configuration Details" [level=6]
- heading "Door Dimensions" [level=6]
- text: Width (inches)
- spinbutton "Width (inches)": "36"
- text: Height (inches)
- spinbutton "Height (inches)": "80"
- heading "Door Configuration" [level=6]
- text: Opening Type
- combobox: Single Door
- text: Door Type
- combobox: Glass Door
- text: Opening Direction
- combobox: Opening Inside
- heading "Grid Configuration" [level=6]
- checkbox "Add Divided Lights"
- paragraph: Add Divided Lights
- heading "Hardware Configuration" [level=6]
- heading "Handle Settings" [level=6]
- text: Handle Location
- combobox: Right Side
- text: Handle Type
- combobox: Lever Handle
- heading "Security & Operation" [level=6]
- text: Lock Type
- combobox: Multi-Point Lock
- text: Hinge Type
- combobox: Standard
- heading "Threshold" [level=6]
- text: Threshold Type
- combobox: Standard
- heading "Additional Glass Panels" [level=6]
- paragraph: Configure sidelights and transom for your entrance door
- checkbox
- heading "Configuration Preview" [level=6]
- text: Scale Preview (Not Actual Size) Single Door 36" × 80" Glass Door • Opening Inside
- 'heading "Total Width: 36\"" [level=6]'
- 'heading "Total Height: 80\"" [level=6]'
- text: "Door Panel: 36\" × 80\""
- separator
- heading "Finish Options" [level=6]
- text: Finish Type
- combobox: Powder Coated
- text: Finish Style
- combobox: Standard
- text: RAL Color
- paragraph: RAL
- textbox "RAL Color": "9016"
- separator
- heading "Notes (Optional)" [level=6]
- text: Additional Notes
- textbox "Additional Notes"
- paragraph: 0/1000 characters
- button "Next" [disabled]
- button "Back"
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Configuration Integration Tests', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     await page.goto('http://localhost:3000');
   6 |     await page.waitForSelector('[data-testid="stepper-container"]', { timeout: 10000 });
   7 |   });
   8 |
   9 |   test('should fetch metadata from API and populate UI', async ({ page, request }) => {
   10 |     // Check if metadata is fetched and populated in UI
   11 |     const metadataResponse = await request.get('http://localhost:5001/api/metadata');
   12 |     expect(metadataResponse.ok()).toBeTruthy();
   13 |     const metadata = await metadataResponse.json();
   14 |
   15 |     // Wait for and verify brand options are visible
   16 |     await expect(page.getByRole('button', { name: /Alumil/i })).toBeVisible();
   17 |     
   18 |     // Verify system types are available after selecting a brand
   19 |     await page.getByRole('button', { name: /Alumil/i }).click();
   20 |     await expect(page.getByRole('button', { name: 'Entrance Doors', exact: true })).toBeVisible();
   21 |     await expect(page.getByRole('button', { name: 'Sliding Doors', exact: true })).toBeVisible();
   22 |   });
   23 |
   24 |   test('should calculate price through API integration', async ({ page, request }) => {
   25 |     // Complete configuration steps
   26 |     await page.getByRole('button', { name: 'Alumil', exact: true }).click();
   27 |     await page.getByRole('button', { name: 'Entrance Doors', exact: true }).click();
   28 |
   29 |     // Fill configuration
   30 |     await page.getByLabel('Width (inches)').fill('36');
   31 |     await page.getByLabel('Height (inches)').fill('80');
   32 |     
   33 |     const modelSelect = page.getByRole('combobox', { name: 'Model' });
   34 |     await modelSelect.click();
   35 |     await page.getByRole('option', { name: 'SD77' }).click();
   36 |
   37 |     const glassSelect = page.getByRole('combobox', { name: 'Glass Type' });
   38 |     await glassSelect.click();
   39 |     await page.getByRole('option', { name: 'Double Pane' }).click();
   40 |
   41 |     // Wait for price calculation
   42 |     await page.waitForResponse(response => 
   43 |       response.url().includes('/api/calculate-price') && 
   44 |       response.status() === 200
   45 |     );
   46 |
   47 |     // Verify price components are displayed
   48 |     await expect(page.getByText('System Cost:')).toBeVisible();
   49 |     await expect(page.getByText('Glass Cost:')).toBeVisible();
   50 |     await expect(page.getByText('Labor Cost:')).toBeVisible();
   51 |     await expect(page.getByText('Total:')).toBeVisible();
   52 |   });
   53 |
   54 |   test('should handle API errors gracefully', async ({ page, request }) => {
   55 |     // Force an error by sending invalid configuration
   56 |     const errorResponse = await request.post('http://localhost:5001/api/calculate-price', {
   57 |       data: {
   58 |         brand: 'InvalidBrand',
   59 |         systemType: 'InvalidType'
   60 |       }
   61 |     });
   62 |     expect(errorResponse.status()).toBe(400);
   63 |     
   64 |     // Verify error handling in UI
   65 |     await page.getByRole('button', { name: 'Alumil' }).click();
   66 |     await page.getByRole('button', { name: 'Entrance Doors' }).click();
   67 |     await page.getByLabel('Width (inches)').fill('-1'); // Invalid input
   68 |
   69 |     // Should show error message
   70 |     await expect(page.getByText(/invalid/i)).toBeVisible();
   71 |   });
   72 |
   73 |   test('should generate PDF quote through API integration', async ({ page, request }) => {
   74 |     // Complete configuration
   75 |     await page.getByRole('button', { name: 'Alumil' }).click();
   76 |     await page.getByRole('button', { name: 'Entrance Doors' }).click();
   77 |     await page.getByLabel('Width (inches)').fill('36');
   78 |     await page.getByLabel('Height (inches)').fill('80');
   79 |     
   80 |     const modelSelect = page.getByRole('combobox', { name: 'Model' });
>  81 |     await modelSelect.click();
      |                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
   82 |     await page.getByRole('option', { name: 'SD77' }).click();
   83 |
   84 |     const glassSelect = page.getByRole('combobox', { name: 'Glass Type' });
   85 |     await glassSelect.click();
   86 |     await page.getByRole('option', { name: 'Double Pane' }).click();
   87 |
   88 |     // Fill customer information
   89 |     await page.getByLabel('Name').fill('Test Customer');
   90 |     await page.getByLabel('Email').fill('test@example.com');
   91 |     await page.getByLabel('Phone').fill('123-456-7890');
   92 |
   93 |     // Generate quote
   94 |     const downloadPromise = page.waitForEvent('download');
   95 |     await page.getByRole('button', { name: /generate quote/i }).click();
   96 |     const download = await downloadPromise;
   97 |     
   98 |     // Verify PDF is downloaded
   99 |     expect(download.suggestedFilename()).toContain('.pdf');
  100 |   });
  101 |
  102 |   test('should maintain state during navigation', async ({ page }) => {
  103 |     // Complete initial configuration
  104 |     await page.getByRole('button', { name: 'Alumil' }).click();
  105 |     await page.getByRole('button', { name: 'Entrance Doors' }).click();
  106 |     await page.getByLabel('Width (inches)').fill('36');
  107 |     await page.getByLabel('Height (inches)').fill('80');
  108 |
  109 |     // Navigate back
  110 |     await page.getByRole('button', { name: /previous/i }).click();
  111 |
  112 |     // Verify state is maintained
  113 |     await expect(page.getByRole('button', { name: 'Entrance Doors' }))
  114 |       .toHaveAttribute('aria-pressed', 'true');
  115 |     
  116 |     // Navigate forward
  117 |     await page.getByRole('button', { name: /next/i }).click();
  118 |
  119 |     // Verify dimensions are maintained
  120 |     await expect(page.getByLabel('Width (inches)')).toHaveValue('36');
  121 |     await expect(page.getByLabel('Height (inches)')).toHaveValue('80');
  122 |   });
  123 | }); 
```