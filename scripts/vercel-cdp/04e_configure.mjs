import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find(p => /vercel\.com\/new\/import/.test(p.url())) || pages[0];
await page.bringToFront();
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(1000);

// 1) Rename project to ifbash-emp
const nameInput = page.locator('input[id*="new-project-name"]').first();
await nameInput.click({ clickCount: 3 });
await nameInput.fill('ifbash-emp');
console.log('project name -> ifbash-emp');

// 2) Expand Environment Variables section (it auto-expands; click Import .env to open paste modal)
const importEnvBtn = page.locator('button:has-text("Import .env")').first();
await importEnvBtn.scrollIntoViewIfNeeded();
await importEnvBtn.click();
await page.waitForTimeout(1500);

// 3) Surface paste textarea
// The modal has a textarea for pasting .env content
const ta = page.locator('dialog textarea, [role="dialog"] textarea').first();
let visible = await ta.isVisible({ timeout: 4000 }).catch(() => false);
if (!visible) {
  // fallback: find any newly visible large textarea on page
  const ta2 = page.locator('textarea').last();
  visible = await ta2.isVisible({ timeout: 2000 }).catch(() => false);
  if (visible) {
    await ta2.focus();
    console.log('paste textarea (fallback) focused');
  }
} else {
  await ta.focus();
  console.log('paste textarea (modal) focused');
}

console.log('=== READY FOR PASTE ===');
console.log('Open the Chrome window. Paste contents of .env.local into focused textarea.');
console.log('Polling textarea length every 3s for up to 10 minutes...');

const watchTa = visible ? (page.locator('dialog textarea, [role="dialog"] textarea').first()) : page.locator('textarea').last();
let lastLen = 0;
for (let i = 0; i < 200; i++) {
  const len = await watchTa.evaluate(el => (el.value || '').length).catch(() => 0);
  if (len !== lastLen) {
    console.log(`textarea len: ${len}`);
    lastLen = len;
  }
  if (len > 100) {
    console.log('paste detected, sleeping 3s for any extra content');
    await page.waitForTimeout(3000);
    const final = await watchTa.evaluate(el => (el.value || '').length).catch(() => 0);
    console.log(`final len: ${final}`);
    break;
  }
  await new Promise(r => setTimeout(r, 3000));
}

// 4) Click "Add" button inside modal to commit env vars
const addBtn = page.locator('dialog button:has-text("Add"), [role="dialog"] button:has-text("Add"), [role="dialog"] button:has-text("Save")').first();
if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  console.log('clicking Add to commit env vars');
  await addBtn.click();
  await page.waitForTimeout(1500);
} else {
  console.log('NOTE: Could not auto-click Add. Click manually in browser.');
}

console.log('Env vars staged. Ready for Deploy click — run script 04f_deploy.mjs to fire it.');
browser.close();
