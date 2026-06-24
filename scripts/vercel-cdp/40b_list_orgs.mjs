import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find(p => /supabase\.com/.test(p.url())) || pages[0];
await page.bringToFront();

await page.goto('https://supabase.com/dashboard/organizations', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);

const orgs = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a[href*="/dashboard/org/"]'));
  return [...new Map(links.map(a => {
    const m = a.href.match(/\/dashboard\/org\/([^\/?#]+)/);
    return m ? [m[1], { slug: m[1], text: a.textContent?.trim().slice(0,80) }] : [null, null];
  }).filter(([k]) => k))].map(([,v]) => v);
});
console.log('orgs:', JSON.stringify(orgs, null, 2));

const allProjects = [];
for (const org of orgs) {
  const orgUrl = `https://supabase.com/dashboard/org/${org.slug}`;
  console.log(`\n=== ${org.slug} ===`);
  await page.goto(orgUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const projects = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/dashboard/project/"]'));
    const seen = new Set();
    const out = [];
    for (const a of links) {
      const m = a.href.match(/\/dashboard\/project\/([a-z0-9_-]{15,30})/i);
      if (!m || seen.has(m[1])) continue;
      seen.add(m[1]);
      out.push({ ref: m[1], name: a.textContent?.trim().slice(0,80), href: a.href });
    }
    return out;
  });
  console.log(JSON.stringify(projects, null, 2));
  allProjects.push(...projects.map(p => ({ ...p, org: org.slug })));
}

console.log('\nallProjects:', allProjects.length);
browser.close();
