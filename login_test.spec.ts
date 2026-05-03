import { test, expect } from '@playwright/test';

test('Login Toast Notifications', async ({ page }) => {
  // 1. Navigate to /login
  await page.goto('http://localhost:80/login');
  
  // 2. Submit empty form
  // The form has "required" attributes on inputs, so we might need to bypass them 
  // or just click and see if the custom validation logic in handleSubmit triggers.
  // In the code, handleSubmit checks for !email.trim() || !password.
  // However, the inputs have 'required' attribute, so the browser might block it.
  // Let's remove 'required' to test the custom toast logic if needed, 
  // or just click and see if Sonner shows up.
  
  // Actually, let's try to just click first.
  const submitButton = page.locator('button[type="submit"]');
  
  // We need to bypass HTML5 validation to trigger the React state check
  await page.evaluate(() => {
    (document.getElementById('email') as HTMLInputElement).required = false;
    (document.getElementById('password') as HTMLInputElement).required = false;
  });

  await submitButton.click();
  
  // Verify toast for empty form
  const emptyToast = page.locator('ol[data-sonner-toaster] li');
  await expect(emptyToast).toBeVisible();
  await expect(emptyToast).toContainText('الرجاء إدخال');
  
  await page.screenshot({ path: 'empty_form_toast.png' });
  
  // 3. Enter credentials and click submit
  await page.fill('#email', 'nonexistent@test.com');
  await page.fill('#password', 'wrongpass1234');
  
  // Restore required just in case or just click
  await submitButton.click();
  
  // Wait for 2s as requested
  await page.waitForTimeout(2000);
  
  // Verify toast for invalid credentials
  const errorToast = page.locator('ol[data-sonner-toaster] li');
  await expect(errorToast).toBeVisible();
  // 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
  await expect(errorToast).toContainText('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  
  await page.screenshot({ path: 'invalid_credentials_toast.png' });
});
