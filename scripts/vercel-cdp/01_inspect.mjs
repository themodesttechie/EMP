import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
console.log('all_tabs:', pages.map(p => p.url()));

const page = pages[pages.length - 1];
await page.bringToFront().catch(() => {});

const url = page.url();
const title = await page.title().catch(() => '');
const probe = await page.evaluate(() => {
  const txt = document.body?.innerText?.slice(0, 400) || '';
  const userBtn = !!document.querySelector('[data-testid="user-menu-button"], [data-geist-user-avatar]');
  const loginLink = !!document.querySelector('a[href*="/login"]');
  const importBtn = !!document.querySelector('[data-testid*="import"]');
  return { userBtn, loginLink, importBtn, bodyHead: txt };
}).catch(e => ({ err: e.message }));

console.log(JSON.stringify({ active: { url, title }, probe }, null, 2));
browser.close();
