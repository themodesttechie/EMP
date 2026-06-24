import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find(p => p.url().includes('vercel.com')) || pages[0];
await page.bringToFront();
await page.goto('https://vercel.com/new', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);

// Confirm scope = ifBash team. If picker shows Hobby instead, switch.
// Open scope picker
const scopeBtn = page.locator('button[aria-haspopup="menu"]').first();
// Skip — assume current scope is fine; rely on URL params

// Find the row whose visible repo name is exactly "EMP"
// Strategy: each row has a strong/heading element with the repo name. The Import anchor is in the same row.
const rows = page.locator('a[data-testid="import-flow-layout/suggestion-card/suggestion/import-button"]');
const count = await rows.count();
console.log('total Import buttons on page:', count);

let clicked = false;
for (let i = 0; i < count; i++) {
  const row = rows.nth(i);
  // Walk up via JSHandle — get parent textContent and check if it has "EMP" as a standalone word with the right format
  const parentText = await row.evaluate(el => {
    let p = el;
    for (let k = 0; k < 6; k++) { p = p.parentElement; if (!p) break; }
    return p?.innerText || '';
  });
  const head = parentText.split('\n').slice(0, 6).join(' | ');
  console.log(`row ${i}: ${head.slice(0, 100)}`);
  // Match a name token of "EMP" with a date marker (·) following
  if (/\bEMP\b\s*[·\-]/.test(parentText) || parentText.startsWith('EMP\n') || /\nEMP\n/.test(parentText)) {
    console.log(`-> match row ${i}, clicking`);
    await row.scrollIntoViewIfNeeded();
    await row.click();
    clicked = true;
    break;
  }
}

if (!clicked) {
  console.error('no EMP row matched');
  process.exit(1);
}

await page.waitForURL(/\/new\/import|configure/i, { timeout: 15000 }).catch(() => {});
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(2500);
console.log('configure URL:', page.url());

browser.close();
