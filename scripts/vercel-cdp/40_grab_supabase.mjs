import { chromium } from 'playwright';
import fs from 'fs';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find(p => /supabase\.com/.test(p.url())) || pages[0];
await page.bringToFront();

await page.goto('https://supabase.com/dashboard/projects', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3500);

const url = page.url();
console.log('landed:', url);

if (/sign-in|login/i.test(url)) {
  console.log('NOT LOGGED IN. Sign in to Supabase in the Chrome window. Polling...');
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(5000);
    const u = page.url();
    if (!/sign-in|login/i.test(u)) {
      console.log('login detected, continuing');
      break;
    }
  }
}

// Now on /dashboard/projects
const projects = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a[href*="/dashboard/project/"]'));
  const out = [];
  const seen = new Set();
  for (const a of links) {
    const m = a.href.match(/\/dashboard\/project\/([a-z0-9_-]{15,30})/i);
    if (!m) continue;
    const ref = m[1];
    if (seen.has(ref)) continue;
    seen.add(ref);
    const name = a.textContent?.trim().slice(0, 60) || ref;
    out.push({ ref, name });
  }
  return out;
});
console.log('projects:', JSON.stringify(projects, null, 2));

if (projects.length === 0) {
  console.error('no projects found');
  process.exit(1);
}

// If multiple, prefer one with "ifbash" / "emp" / "service" in name
let target = projects.find(p => /ifbash|emp|servicenow/i.test(p.name)) || projects[0];
console.log('using project:', target);

const apiUrl = `https://supabase.com/dashboard/project/${target.ref}/settings/api-keys`;
console.log('nav api-keys:', apiUrl);
await page.goto(apiUrl, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3500);

// Try newer URL if redirected
if (!/api-keys|api/.test(page.url())) {
  await page.goto(`https://supabase.com/dashboard/project/${target.ref}/settings/api`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
}

// Extract Project URL + anon key from page
const data = await page.evaluate(() => {
  const txt = document.body.innerText;
  const url = txt.match(/https:\/\/[a-z0-9_-]{10,40}\.supabase\.co/i)?.[0] || '';

  // anon key may be `eyJ...` JWT (200-400 chars) OR new `sb_publishable_...`
  const jwt = txt.match(/eyJ[A-Za-z0-9_-]{40,}\.[A-Za-z0-9_-]{40,}\.[A-Za-z0-9_-]{20,}/g) || [];
  const sbPub = txt.match(/sb_publishable_[A-Za-z0-9_-]{20,}/g) || [];
  const sbSec = txt.match(/sb_secret_[A-Za-z0-9_-]{20,}/g) || [];

  // also dump input + readonly fields
  const inputs = Array.from(document.querySelectorAll('input'))
    .map(i => ({ id: i.id, label: i.labels?.[0]?.textContent?.trim() || '', type: i.type, len: (i.value || '').length }));
  return { url, jwtCount: jwt.length, jwts: jwt.map(j => j.slice(0, 20) + '...len=' + j.length), sbPub, sbSec, inputs };
});
console.log('extract:', JSON.stringify(data, null, 2));

// Write found values to .supabase-creds (gitignored) + return
fs.writeFileSync('scripts/vercel-cdp/.gitignore', '.token\n.team-id\n.project-id\n.deploy-id\n.supabase-creds\n');

if (data.url && (data.jwts.length || data.sbPub.length)) {
  const anon = data.sbPub[0] || (await page.evaluate(() => {
    // Find longest JWT-looking input value
    const all = Array.from(document.querySelectorAll('input[readonly], input[type="text"]'));
    let best = '';
    for (const i of all) {
      if ((i.value || '').startsWith('eyJ') && i.value.length > best.length) best = i.value;
    }
    return best;
  }));
  if (data.url && anon) {
    fs.writeFileSync('scripts/vercel-cdp/.supabase-creds', `URL=${data.url}\nANON=${anon}\n`, { mode: 0o600 });
    console.log(`wrote .supabase-creds — URL=${data.url} ANON=${anon.slice(0,12)}...len=${anon.length}`);
  } else {
    console.error('could not extract URL+anon cleanly');
  }
}

browser.close();
