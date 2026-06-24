// Adds custom domain app.ifbash.com to active Vercel project.
// Reads project URL from CLI arg or current tab; navigates to /settings/domains.
import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find(p => /vercel\.com/.test(p.url())) || pages[0];
await page.bringToFront();

const url = page.url();
const m = url.match(/vercel\.com\/([^\/]+)\/([^\/?#]+)/);
if (!m) { console.error('cannot parse project from url:', url); process.exit(1); }
const team = m[1];
const project = m[2];
const domainsUrl = `https://vercel.com/${team}/${project}/settings/domains`;
console.log('nav to', domainsUrl);
await page.goto(domainsUrl, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);

const input = page.locator('input[placeholder*="domain" i], input[name*="domain" i]').first();
await input.waitFor({ timeout: 8000 });
await input.fill('app.ifbash.com');
await page.waitForTimeout(400);

const addBtn = page.locator('button:has-text("Add"), button[type="submit"]').first();
await addBtn.click();
console.log('clicked Add. Reading DNS instructions...');
await page.waitForTimeout(3500);

const dns = await page.evaluate(() => {
  const txt = document.body.innerText;
  const cname = txt.match(/CNAME[\s\S]{0,200}/i)?.[0] || '';
  const a = txt.match(/A\s+Record[\s\S]{0,200}|76\.76\.21\.21/i)?.[0] || '';
  return { cname, a, head: txt.slice(0, 1500) };
});
console.log(JSON.stringify(dns, null, 2));

browser.close();
