import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find(p => /vercel\.com/.test(p.url())) || pages[0];
await page.bringToFront();

await page.goto('https://vercel.com/account/tokens', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);

const dump = await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'))
    .map(b => ({ text: b.textContent?.trim().slice(0, 40), tag: b.tagName, testid: b.getAttribute('data-testid') }))
    .filter(b => b.text);
  const inputs = Array.from(document.querySelectorAll('input, textarea'))
    .map(i => ({ id: i.id, name: i.name, placeholder: i.placeholder, type: i.type, testid: i.getAttribute('data-testid') }));
  const headings = Array.from(document.querySelectorAll('h1,h2,h3'))
    .map(h => h.textContent?.trim());
  const url = location.href;
  return { url, headings, buttons: buttons.slice(0, 30), inputs };
});
console.log(JSON.stringify(dump, null, 2));

browser.close();
