// Update Supabase URL + anon key on Vercel project, then trigger redeploy.
import fs from 'fs';

const TOKEN = fs.readFileSync('scripts/vercel-cdp/.token', 'utf8').trim();
const TEAM_ID = 'team_fVA2Pj0VGbjrVRTJ3t4jmqEy';
const PROJECT_ID = 'prj_GRey25OrwzyuvxHv1E2E8wBI68b6';

const URL_VAL = 'https://fkimfpvgysgqsteyggyx.supabase.co';
const ANON_VAL = process.env.ANON;
if (!ANON_VAL) { console.error('ANON env required'); process.exit(1); }

const Q = `?teamId=${TEAM_ID}`;
const H = { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

async function api(method, url, body) {
  const r = await fetch('https://api.vercel.com' + url, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  const txt = await r.text();
  let data; try { data = JSON.parse(txt); } catch { data = txt; }
  return { status: r.status, data };
}

// 1) List existing env vars to find IDs
let { data } = await api('GET', `/v10/projects/${PROJECT_ID}/env${Q}`);
const byKey = {};
for (const e of data.envs || []) byKey[e.key] = e;

// 2) Update URL
async function upsert(key, value, type='plain', target=['production','preview','development']) {
  const existing = byKey[key];
  if (existing) {
    const r = await api('PATCH', `/v9/projects/${PROJECT_ID}/env/${existing.id}${Q}`, { key, value, type, target });
    console.log(`PATCH ${key}: status=${r.status}`);
    if (r.status >= 400) console.log(' err:', r.data?.error?.message || r.data);
  } else {
    const r = await api('POST', `/v10/projects/${PROJECT_ID}/env${Q}&upsert=true`, { key, value, type, target });
    console.log(`POST ${key}: status=${r.status}`);
  }
}

await upsert('NEXT_PUBLIC_SUPABASE_URL', URL_VAL, 'plain');
await upsert('NEXT_PUBLIC_SUPABASE_ANON_KEY', ANON_VAL, 'plain');

// 3) Trigger redeploy from feat branch HEAD
const { execSync } = await import('child_process');
const sha = execSync('git rev-parse feat/servicenow-foundation', { encoding: 'utf8' }).trim();
const deploy = await api('POST', `/v13/deployments${Q}`, {
  name: 'ifbash-emp',
  project: PROJECT_ID,
  target: 'production',
  gitSource: { type: 'github', ref: 'feat/servicenow-foundation', repoId: 1127693256, sha },
});
if (deploy.status >= 400) {
  console.error('redeploy err', deploy.status, deploy.data?.error || deploy.data);
} else {
  console.log(`new deploy: ${deploy.data.id}  url: https://${deploy.data.url}`);
  fs.writeFileSync('scripts/vercel-cdp/.deploy-id', deploy.data.id);
}
