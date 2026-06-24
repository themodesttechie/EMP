// Flips Vercel project Settings -> Git -> Production Branch via CDP.
import { chromium } from 'playwright';

const TEAM = 'basheers-projects-7541e2a3';
const PROJECT = 'ifbash-emp';
const BRANCH = 'feat/servicenow-foundation';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find(p => /vercel\.com/.test(p.url())) || pages[0];
await page.bringToFront();

await page.goto(`https://vercel.com/${TEAM}/${PROJECT}/settings/git`, { waitUntil: 'domcontentloaded' });
await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
await page.waitForTimeout(1500);

// Scroll to Production Branch section
const heading = page.locator('text=/Production Branch/i').first();
await heading.scrollIntoViewIfNeeded({ timeout: 8000 });
await page.waitForTimeout(800);

// Input is sibling/descendant of section containing the heading
const branchInput = page.locator('section, form, div').filter({ has: page.locator('text=/Production Branch/i') }).locator('input[type="text"], input:not([type])').first();
const visible = await branchInput.isVisible({ timeout: 3000 }).catch(() => false);
if (!visible) {
  // Fallback: any input with current value "main" near the heading
  const fallback = page.locator('input[value="main"]').first();
  if (await fallback.isVisible({ timeout: 2000 }).catch(() => false)) {
    await fallback.click({ clickCount: 3 });
    await fallback.fill(BRANCH);
    console.log(`fallback fill: ${BRANCH}`);
  } else {
    console.error('FAIL: branch input not found');
    process.exit(1);
  }
} else {
  await branchInput.click({ clickCount: 3 });
  await branchInput.fill(BRANCH);
  console.log(`filled branch: ${BRANCH}`);
}

await page.waitForTimeout(600);
const save = page.locator('button:has-text("Save")').first();
if (await save.isVisible({ timeout: 3000 }).catch(() => false)) {
  await save.click();
  console.log('Save clicked');
  await page.waitForTimeout(2500);
  const toast = await page.evaluate(() => document.body.innerText.match(/saved|updated|error/i)?.[0] || '');
  console.log('toast:', toast);
} else {
  console.log('NOTE: Save not visible');
}

// Verify via API
const TOKEN = (await import('fs')).then(fs => fs.readFileSync('scripts/vercel-cdp/.token', 'utf8').trim());
browser.close();
