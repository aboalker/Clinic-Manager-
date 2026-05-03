import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:80/login');
    await page.goto('http://localhost:80/login');
    
    console.log('Testing empty form submission...');
    // Bypass HTML5 validation
    await page.evaluate(() => {
      document.getElementById('email').required = false;
      document.getElementById('password').required = false;
    });
    
    await page.click('button[type="submit"]');
    
    // Wait for toast
    const emptyToast = page.locator('ol[data-sonner-toaster] li');
    await emptyToast.waitFor({ state: 'visible', timeout: 5000 });
    const emptyText = await emptyToast.innerText();
    console.log('Empty form toast text:', emptyText);
    
    if (emptyText.includes('الرجاء إدخال')) {
      console.log('Empty form toast verification: SUCCESS');
    } else {
      console.log('Empty form toast verification: FAILED');
    }
    
    await page.screenshot({ path: 'empty_form_toast.png' });
    
    console.log('Testing invalid credentials...');
    await page.fill('#email', 'nonexistent@test.com');
    await page.fill('#password', 'wrongpass1234');
    await page.click('button[type="submit"]');
    
    console.log('Waiting 2 seconds...');
    await page.waitForTimeout(2000);
    
    const errorToast = page.locator('ol[data-sonner-toaster] li');
    await errorToast.waitFor({ state: 'visible', timeout: 5000 });
    const errorText = await errorToast.innerText();
    console.log('Invalid credentials toast text:', errorText);
    
    const expectedText = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
    if (errorText.includes(expectedText)) {
      console.log('Invalid credentials toast verification: SUCCESS');
    } else {
      console.log('Invalid credentials toast verification: FAILED');
    }
    
    await page.screenshot({ path: 'invalid_credentials_toast.png' });
    
  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'error_screenshot.png' });
  } finally {
    await browser.close();
  }
})();
