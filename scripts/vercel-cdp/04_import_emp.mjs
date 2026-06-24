import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find(p => p.url().includes('vercel.com')) || pages[0];
await page.bringToFront();

// Force back to /new (in case prior misclick landed on configure)
await page.goto('https://vercel.com/new', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);

// Refresh repo list — sometimes EMP needs a refresh after a recent push
const refresh = page.locator('button[title*="Refresh" i], button[aria-label*="refresh" i]').first();
if (await refresh.isVisible({ timeout: 1500 }).catch(() => false)) {
  await refresh.click();
  await page.waitForTimeout(2000);
}

// Optional search for EMP to narrow
const search = page.locator('input[placeholder*="Search" i]').first();
if (await search.isVisible({ timeout: 2000 }).catch(() => false)) {
  await search.fill('EMP');
  await page.waitForTimeout(1000);
}

// Find row whose primary label is exactly "EMP" then click its Import button
const empImport = await page.evaluateHandle(() => {
  const cards = Array.from(document.querySelectorAll('a[data-testid="import-flow-layout/suggestion-card/suggestion/import-button"]'));
  for (const a of cards) {
    // Walk up to row container, find sibling with repo name
    let row = a.closest('li, div[role="listitem"], div');
    while (row && row.parentElement) {
      const label = row.querySelector('span, div')?.textContent || '';
      // Look for the repo-name strong text
      const namePieces = Array.from(row.querySelectorAll('span, div, p'))
        .map(e => e.textContent?.trim())
        .filter(t => t && t.length < 30);
      if (namePieces.some(t => t === 'EMP')) {
        a.scrollIntoView({ block: 'center' });
        return a;
      }
      row = row.parentElement;
    }
  }
  return null;
});

const found = await empImport.evaluate(el => !!el).catch(() => false);
if (!found) {
  console.error('FAIL: could not locate EMP Import button');
  // Dump current visible repo names
  const names = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[data-testid="import-flow-layout/suggestion-card/suggestion/import-button"]'))
      .map(a => {
        const row = a.closest('div');
        return row?.parentElement?.textContent?.trim().slice(0, 80);
      });
  });
  console.error('visible Import rows:', names);
  process.exit(1);
}

console.log('clicking Import on EMP...');
await empImport.asElement().click();
await page.waitForURL(/\/new\/import|configure/i, { timeout: 15000 }).catch(() => {});
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(2000);

const url = page.url();
console.log('configure URL:', url);

// Confirm we're on EMP
if (!url.includes('owner=ifbash') || !/[?&]name=EMP\b/.test(url)) {
  console.error('WARN: configure URL does not look like EMP:', url);
}

// Read project name + framework + branch
const cfg = await page.evaluate(() => {
  const projectInput = document.querySelector('input[id*="new-project-name"]');
  const presetCombo = document.querySelector('[id*="combobox-input-"][value]');
  const branchTxt = document.body.innerText.match(/main|feat\/[a-z0-9-/]+/gi)?.slice(0, 5) || [];
  return {
    projectName: projectInput?.value || '',
    framework: presetCombo?.value || '',
    branchTokens: branchTxt,
    bodyHead: document.body.innerText.slice(0, 800),
  };
});
console.log(JSON.stringify(cfg, null, 2));

browser.close();
