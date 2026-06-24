// Drives Vercel env-vars panel — opens the "Paste .env" modal then waits for user paste.
// Run this from the project Settings page, OR from the import-config page (env panel).
import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find(p => /vercel\.com/.test(p.url())) || pages[0];
await page.bringToFront();
await page.waitForLoadState('domcontentloaded');

console.log('current url:', page.url());

// On the import-config page, env-vars accordion may need expanding
const envHeader = page.locator('text=/Environment Variables/i').first();
if (await envHeader.isVisible({ timeout: 3000 }).catch(() => false)) {
  console.log('expanding env vars accordion');
  await envHeader.click().catch(() => {});
  await page.waitForTimeout(800);
}

// Look for "Paste .env" button (Vercel exposes this on import + on settings/env)
const pasteBtn = page.locator('button:has-text("Paste"), button:has-text(".env")').first();
if (await pasteBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
  console.log('clicking paste-env modal');
  await pasteBtn.click();
  await page.waitForTimeout(1000);
}

// Surface the textarea so user can paste
const ta = page.locator('textarea').first();
if (await ta.isVisible({ timeout: 5000 }).catch(() => false)) {
  await ta.focus();
  console.log('=== READY ===');
  console.log('Textarea focused. PASTE .env.local contents into Chrome window now.');
  console.log('Polling for paste completion (looking for >100 chars in textarea)...');

  for (let i = 0; i < 120; i++) { // up to 6 min
    const len = await ta.evaluate(el => (el.value || '').length).catch(() => 0);
    if (len > 100) {
      console.log(`textarea filled (${len} chars). Pause 2s then click Save/Add/Import.`);
      await page.waitForTimeout(2000);
      break;
    }
    await new Promise(r => setTimeout(r, 3000));
  }
}

browser.close();
