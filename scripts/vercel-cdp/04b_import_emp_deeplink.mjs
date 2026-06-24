import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find(p => p.url().includes('vercel.com')) || pages[0];
await page.bringToFront();

// Discover team slug from any vercel URL on the tab
const teamSlug = (page.url().match(/teamSlug=([^&]+)/) || ['', 'basheers-projects-7541e2a3'])[1];
console.log('using teamSlug:', teamSlug);

// Vercel deep-link for git import
const target = `https://vercel.com/new/git/external?repository-url=${encodeURIComponent('https://github.com/ifbash/EMP')}`;
console.log('navigate:', target);
await page.goto(target, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);

console.log('landed:', page.url());
const head = await page.evaluate(() => document.body.innerText.slice(0, 1200));
console.log(head);

browser.close();
