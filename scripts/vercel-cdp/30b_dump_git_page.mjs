import { chromium } from 'playwright';

const TEAM = 'basheers-projects-7541e2a3';
const PROJECT = 'ifbash-emp';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find(p => /vercel\.com/.test(p.url())) || pages[0];
await page.bringToFront();

await page.goto(`https://vercel.com/${TEAM}/${PROJECT}/settings/git`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);

const dump = await page.evaluate(() => {
  return {
    url: location.href,
    headings: Array.from(document.querySelectorAll('h1,h2,h3,h4')).map(h => h.textContent?.trim()).filter(Boolean),
    bodyText: document.body.innerText.slice(0, 4000),
  };
});
console.log(JSON.stringify(dump, null, 2));
browser.close();
