import { chromium } from 'playwright';

const TEAM = 'basheers-projects-7541e2a3';
const PROJECT = 'ifbash-emp';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find(p => /vercel\.com/.test(p.url())) || pages[0];
await page.bringToFront();

const candidates = [
  '/settings/environments/production',
];
for (const path of candidates) {
  const url = `https://vercel.com/${TEAM}/${PROJECT}${path}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const matches = await page.evaluate(() => {
    const txt = document.body.innerText;
    return {
      hits: ['production branch','default branch','main branch','feat/'].map(q => ({ q, hit: new RegExp(q,'i').test(txt) })),
      branchInputs: Array.from(document.querySelectorAll('input')).filter(i => /branch/i.test(i.placeholder + i.name + (i.labels?.[0]?.textContent || ''))).map(i => ({id:i.id, value:i.value, placeholder:i.placeholder})),
      bodyText: txt.slice(0, 4000),
      allInputs: Array.from(document.querySelectorAll('input')).map(i => ({ id: i.id, type: i.type, value: i.value, placeholder: i.placeholder })),
      buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(t => t && t.length < 30 && t.length > 0),
    };
  });
  console.log(`${path}:`);
  console.log(JSON.stringify(matches, null, 2).slice(0, 3500));
  if (false && matches.hits[0].hit) {
    // Find the input near it
    const dump = await page.evaluate(() => {
      const txt = document.body.innerText;
      const idx = txt.toLowerCase().indexOf('production branch');
      const around = txt.slice(Math.max(0, idx - 100), idx + 800);
      const inputs = Array.from(document.querySelectorAll('input'))
        .map(i => ({ id: i.id, value: i.value, type: i.type, placeholder: i.placeholder, name: i.name }));
      return { around, inputs };
    });
    console.log(JSON.stringify(dump, null, 2));
    break;
  }
}
browser.close();
