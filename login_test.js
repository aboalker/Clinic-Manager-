const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:80/login');
    await page.goto('http://localhost:80/login');
    
    console.log('Testing empty form submission...');
    await page.evaluate(() => {
      document.getElementById('email').required = false;
      document.getElementById('password').required = false;
    });
    
    await page.click('button[type="submit"]');
    
    const emptyToast = page.locator('ol[data-sonner-toaster] li');
    await emptyToast.waitFor({ state: 'visible', timeout: 10000 });
    const emptyText = await emptyToast.innerText();
    console.log('Empty form toast text:', emptyText);
    
    await page.screenshot({ path: 'empty_form_toast.png' });
    
    console.log('Testing invalid credentials...');
    await page.fill('#email', 'nonexistent@test.com');
    await page.fill('#password', 'wrongpass1234');
    await page.click('button[type="submit"]');
    
    console.log('Waiting 2 seconds...');
    await page.waitForTimeout(2000);
    
    const errorToast = page.locator('ol[data-sonner-toaster] li');
    await errorToast.waitFor({ state: 'visible', timeout: 10000 });
    const errorText = await errorToast.innerText();
    console.log('Invalid credentials toast text:', errorText);
    
    await page.screenshot({ path: 'invalid_credentials_toast.png' });
    
  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'error_screenshot.png' });
  } finally {
    await browser.close();
  }
})();
