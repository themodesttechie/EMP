// Creates first OWNER user via Supabase Admin API.
// Reads service_role from .env.local. Generates random password.
// Writes email+password to .creds (gitignored). Does NOT echo password to stdout.
import fs from 'fs';
import crypto from 'crypto';

const URL = process.env.SUPABASE_URL || 'https://fkimfpvgysgqsteyggyx.supabase.co';
const SR = process.env.SR;
const EMAIL = 'ifbashapp@gmail.com';

if (!URL || URL.includes('placeholder') || !SR) {
  console.error('FAIL: SUPABASE URL/service_role missing or placeholder in .env.local');
  console.error('URL:', URL);
  process.exit(1);
}

const password = crypto.randomBytes(18).toString('base64').replace(/[^A-Za-z0-9]/g, '').slice(0, 24);

const r = await fetch(`${URL}/auth/v1/admin/users`, {
  method: 'POST',
  headers: { 'apikey': SR, 'Authorization': `Bearer ${SR}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: EMAIL,
    password,
    email_confirm: true,
    user_metadata: { tenant_slug: 'ifbash', role: 'owner' },
  }),
});
const txt = await r.text();
let data; try { data = JSON.parse(txt); } catch { data = txt; }

if (r.status >= 400) {
  console.error(`status=${r.status} err=${data?.msg || data?.error_description || data?.message || JSON.stringify(data)}`);
  // If user exists, try fetching to see if confirmed + offer reset
  if (r.status === 422 || /already/i.test(data?.msg || '')) {
    console.error('user already exists — try password reset path instead.');
  }
  process.exit(1);
}

fs.writeFileSync('scripts/vercel-cdp/.creds', `EMAIL=${EMAIL}\nPASSWORD=${password}\nUSER_ID=${data.id}\nCREATED=${new Date().toISOString()}\n`, { mode: 0o600 });
console.log(`OK status=${r.status} user_id=${data.id} email=${EMAIL}`);
console.log(`creds written: scripts/vercel-cdp/.creds`);
console.log(`password length: ${password.length} (NOT printed). open .creds to read.`);
