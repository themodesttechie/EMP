// Drives /account/tokens UI to create a fresh API token + writes it to .token (gitignored).
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find(p => /vercel\.com/.test(p.url())) || pages[0];
await page.bringToFront();

await page.goto('https://vercel.com/account/tokens', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);

// Click "Create Token"
const createBtn = page.locator('button:has-text("Create Token"), button:has-text("Create"), a:has-text("Create Token")').first();
await createBtn.waitFor({ timeout: 8000 });
await createBtn.click();
await page.waitForTimeout(1200);

// Fill name
const nameInput = page.locator('input[name="name"], input[placeholder*="Token" i], input[placeholder*="Name" i]').first();
await nameInput.waitFor({ timeout: 5000 });
await nameInput.fill('ifbash-cdp-' + new Date().toISOString().slice(0, 10));

// Scope: pick ifBash team (NOT personal). Some Vercel UIs auto-pick first team.
const scopePicker = page.locator('button:has-text("Full Account"), button:has-text("Scope"), [data-testid*="scope"]').first();
if (await scopePicker.isVisible({ timeout: 1500 }).catch(() => false)) {
  console.log('scope picker visible — opening');
  await scopePicker.click();
  await page.waitForTimeout(500);
  const ifbashOpt = page.locator('text=/ifBash/i').first();
  if (await ifbashOpt.isVisible({ timeout: 1500 }).catch(() => false)) {
    await ifbashOpt.click();
    await page.waitForTimeout(400);
  }
}

// Expiration — pick "No Expiration" or longest. Default may be 1 day.
const expBtn = page.locator('button:has-text("Expiration"), button:has-text("No Expiration"), button:has-text("1 day"), select').first();
if (await expBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
  console.log('expiration control visible');
  await expBtn.click();
  await page.waitForTimeout(400);
  const noExp = page.locator('text=/No Expiration|never/i').first();
  if (await noExp.isVisible({ timeout: 1500 }).catch(() => false)) {
    await noExp.click();
  }
}

// Submit
const submit = page.locator('button[type="submit"], button:has-text("Create")').last();
await submit.click();
await page.waitForTimeout(2500);

// Reveal/copy token from displayed input
const tokenField = page.locator('input[readonly], code, [data-testid*="token"]').first();
let token = '';
for (let i = 0; i < 5 && !token; i++) {
  token = await tokenField.evaluate(el => el.value || el.textContent || '').catch(() => '');
  if (!token) await page.waitForTimeout(800);
}

if (!token || token.length < 20) {
  // Fallback: scan body for hex-like string
  const body = await page.evaluate(() => document.body.innerText);
  const m = body.match(/\b[A-Za-z0-9]{24,}\b/);
  token = m ? m[0] : '';
}

if (!token) {
  console.error('FAIL: token not found. Inspect /account/tokens manually.');
  process.exit(1);
}

const outPath = path.resolve(process.cwd(), 'scripts/vercel-cdp/.token');
fs.writeFileSync(outPath, token + '\n', { mode: 0o600 });
console.log(`token written to ${outPath} (length: ${token.length})`);
console.log('value not echoed.');

browser.close();
