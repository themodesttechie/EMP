import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find(p => p.url().includes('vercel.com')) || pages[0];
await page.bringToFront();
await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});

const data = await page.evaluate(() => {
  // active scope (team selector)
  const scopeEl = document.querySelector('[data-testid="scope-switcher"], [aria-label*="scope" i], button[aria-haspopup="menu"]');
  const scopeTxt = scopeEl?.textContent?.trim() || '';

  // Repo list under "Import Git Repository"
  const repoBtns = Array.from(document.querySelectorAll('button, a'))
    .filter(el => /import/i.test(el.textContent || ''))
    .slice(0, 20)
    .map(el => ({ tag: el.tagName, text: el.textContent?.trim().slice(0, 80), testid: el.getAttribute('data-testid') }));

  const repoLinks = Array.from(document.querySelectorAll('a, div, li'))
    .map(el => el.textContent?.trim() || '')
    .filter(t => /\/EMP\b|ifbash|themodesttechie/i.test(t))
    .slice(0, 20);

  const search = document.querySelector('input[placeholder*="Search" i], input[type="search"]');
  const searchPlaceholder = search?.getAttribute('placeholder');

  const ghInstallLink = document.querySelector('a[href*="github.com/apps/vercel"], a[href*="github.com/settings/installations"]')?.href;

  return {
    scopeTxt,
    importButtons: repoBtns,
    repoMatches: repoLinks,
    searchPlaceholder,
    ghInstallLink,
    bodySnippet: document.body.innerText.slice(0, 1500),
  };
});

console.log(JSON.stringify(data, null, 2));
browser.close();
