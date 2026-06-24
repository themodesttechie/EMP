import { chromium } from 'playwright';

const TEAM = 'basheers-projects-7541e2a3';
const PROJECT = 'ifbash-emp';
const BRANCH = 'feat/servicenow-foundation';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find(p => /vercel\.com/.test(p.url())) || pages[0];
await page.bringToFront();

await page.goto(`https://vercel.com/${TEAM}/${PROJECT}/settings/environments/production`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);

// Click branch input — value=main, placeholder=main, type=text
const branchInput = page.locator('input[type="text"][value="main"]').first();
const visible = await branchInput.isVisible({ timeout: 6000 }).catch(() => false);
if (!visible) {
  // Fallback by placeholder
  const fallback = page.locator('input[placeholder="main"]').first();
  if (await fallback.isVisible({ timeout: 3000 }).catch(() => false)) {
    await fallback.click({ clickCount: 3 });
    await fallback.fill(BRANCH);
  } else {
    console.error('FAIL: branch input not visible');
    process.exit(1);
  }
} else {
  await branchInput.click({ clickCount: 3 });
  await branchInput.fill(BRANCH);
}
console.log(`filled: ${BRANCH}`);
await page.waitForTimeout(500);

// Save button — there's one in the Branch Tracking section
const save = page.locator('button:has-text("Save")').first();
await save.scrollIntoViewIfNeeded();
await save.click();
console.log('Save clicked');
await page.waitForTimeout(3000);

// Verify
const after = await page.evaluate(() => {
  const i = document.querySelector('input[type="text"][placeholder="main"], input[type="text"][value]');
  return { value: i?.value, branchText: document.body.innerText.match(/Branch is[\s\S]{0,80}/)?.[0] || '' };
});
console.log('after:', JSON.stringify(after));

browser.close();
