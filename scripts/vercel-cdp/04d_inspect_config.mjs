import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find(p => /vercel\.com\/new\/import/.test(p.url())) || pages[0];
await page.bringToFront();
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(1500);

// Look for branch selector / "main" clickable
const branchProbe = await page.evaluate(() => {
  // Find element containing only "main" text
  const all = Array.from(document.querySelectorAll('button, a, [role="button"], div, span'));
  const mainCandidates = all
    .filter(el => el.textContent?.trim() === 'main')
    .map(el => ({ tag: el.tagName, role: el.getAttribute('role'), clickable: el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute('role') === 'button', html: el.outerHTML.slice(0, 200) }));
  // Look for "Production Branch" label
  const prodBranchLabel = document.body.innerText.match(/Production Branch[\s\S]{0,200}/i)?.[0] || null;
  return { mainCandidates: mainCandidates.slice(0, 5), prodBranchLabel };
});
console.log('branch probe:', JSON.stringify(branchProbe, null, 2));

// Also dump all visible buttons + sectionheaders
const sections = await page.evaluate(() => {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, [role="heading"]'))
    .map(h => h.textContent?.trim())
    .filter(Boolean)
    .slice(0, 20);
  const buttons = Array.from(document.querySelectorAll('button'))
    .map(b => b.textContent?.trim())
    .filter(t => t && t.length > 0 && t.length < 40);
  return { headings, buttons: [...new Set(buttons)] };
});
console.log('page structure:', JSON.stringify(sections, null, 2));

browser.close();
