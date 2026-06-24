// Pull AI/email keys from Bitwarden + push to Vercel + trigger redeploy.
// Reads BW session from env BW_SESSION. Reads Vercel token from .token.
import fs from 'fs';
import crypto from 'crypto';
import { execSync } from 'child_process';

const VTOKEN = fs.readFileSync('scripts/vercel-cdp/.token', 'utf8').trim();
const TEAM = 'team_fVA2Pj0VGbjrVRTJ3t4jmqEy';
const PID = 'prj_GRey25OrwzyuvxHv1E2E8wBI68b6';
const SESSION = process.env.BW_SESSION;
if (!SESSION) { console.error('BW_SESSION required'); process.exit(1); }

function bwGet(id) {
  const json = execSync(`bw get item ${id} --session "${SESSION}"`, { encoding: 'utf8' });
  return JSON.parse(json);
}

function extractKey(item) {
  // Try login.password first, then fields[].value
  if (item.login?.password) return item.login.password.trim();
  for (const f of item.fields || []) {
    if (/api[_ ]?key|secret|token/i.test(f.name) && f.value) return f.value.trim();
  }
  return null;
}

const ITEMS = {
  ANTHROPIC_API_KEY: '251f378e-b793-4173-a6fc-b434006281a5',
  OPENAI_API_KEY: '236a23a1-4bce-4774-9f76-b434006281a5',
  RESEND_API_KEY: 'e314d400-d1c6-4a58-b243-b44400ae19a2',
};

const envs = {};
for (const [envKey, bwId] of Object.entries(ITEMS)) {
  const item = bwGet(bwId);
  const v = extractKey(item);
  if (!v) { console.error(`MISS: ${envKey} (item: ${item.name})`); continue; }
  envs[envKey] = v;
  console.log(`got ${envKey} (len ${v.length}) from "${item.name}"`);
}

envs.CRON_SECRET = crypto.randomBytes(32).toString('hex');
envs.RESEND_INBOUND_SECRET = crypto.randomBytes(32).toString('hex');
console.log(`generated CRON_SECRET (${envs.CRON_SECRET.length}) + RESEND_INBOUND_SECRET (${envs.RESEND_INBOUND_SECRET.length})`);

// Fetch existing env list to find ids for upsert
const QT = `?teamId=${TEAM}`;
const H = { 'Authorization': `Bearer ${VTOKEN}`, 'Content-Type': 'application/json' };
const list = await (await fetch(`https://api.vercel.com/v10/projects/${PID}/env${QT}`, { headers: H })).json();
const byKey = Object.fromEntries((list.envs || []).map(e => [e.key, e]));

async function upsert(key, value) {
  const target = key.startsWith('NEXT_PUBLIC_') ? ['production','preview','development'] : ['production','preview'];
  const type = 'encrypted';
  const ex = byKey[key];
  if (ex) {
    const r = await fetch(`https://api.vercel.com/v9/projects/${PID}/env/${ex.id}${QT}`, {
      method: 'PATCH', headers: H, body: JSON.stringify({ key, value, type, target }),
    });
    console.log(` PATCH ${key}: ${r.status}`);
  } else {
    const r = await fetch(`https://api.vercel.com/v10/projects/${PID}/env${QT}&upsert=true`, {
      method: 'POST', headers: H, body: JSON.stringify({ key, value, type, target }),
    });
    console.log(` POST  ${key}: ${r.status}`);
  }
}

for (const [k, v] of Object.entries(envs)) await upsert(k, v);

// Trigger production redeploy from feat branch HEAD
const sha = execSync('git rev-parse feat/servicenow-foundation', { encoding: 'utf8' }).trim();
const dep = await fetch(`https://api.vercel.com/v13/deployments${QT}`, {
  method: 'POST', headers: H,
  body: JSON.stringify({
    name: 'ifbash-emp', project: PID, target: 'production',
    gitSource: { type: 'github', ref: 'feat/servicenow-foundation', repoId: 1127693256, sha },
  }),
});
const dd = await dep.json();
console.log(`redeploy: status=${dep.status} id=${dd.id} url=https://${dd.url}`);
fs.writeFileSync('scripts/vercel-cdp/.deploy-id', dd.id);

// Save secrets back to BW for future runs
console.log('--- secrets generated (saved to scripts/vercel-cdp/.secrets-generated for backup) ---');
fs.writeFileSync('scripts/vercel-cdp/.secrets-generated', `CRON_SECRET=${envs.CRON_SECRET}\nRESEND_INBOUND_SECRET=${envs.RESEND_INBOUND_SECRET}\n`, { mode: 0o600 });
