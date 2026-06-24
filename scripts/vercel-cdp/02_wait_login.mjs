import { chromium } from 'playwright';

const TIMEOUT_MS = 5 * 60 * 1000;
const start = Date.now();

console.log('waiting for vercel.com tab to settle (max 5 min)...');

while (Date.now() - start < TIMEOUT_MS) {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const ctx = browser.contexts()[0];
    const pages = ctx.pages();
    const vercelPage = pages.find(p => {
      const u = p.url();
      return u.startsWith('https://vercel.com') && !u.includes('login') && !u.includes('oauth');
    });
    if (vercelPage) {
      const u = vercelPage.url();
      const t = await vercelPage.title().catch(() => '');
      const hasUser = await vercelPage.evaluate(() => {
        return !!document.querySelector('[data-testid="user-menu-button"], [data-geist-user-avatar], img[alt*="avatar" i]');
      }).catch(() => false);
      console.log(JSON.stringify({ url: u, title: t, authed: hasUser }));
      if (hasUser || u.includes('/new') || u.match(/vercel\.com\/[a-z0-9-]+\/?$/i)) {
        await browser.close();
        process.exit(0);
      }
    }
    await browser.close();
  } catch (e) {
    console.log('cdp probe err:', e.message);
  }
  await new Promise(r => setTimeout(r, 4000));
}
console.log('TIMEOUT — login not completed');
process.exit(1);
