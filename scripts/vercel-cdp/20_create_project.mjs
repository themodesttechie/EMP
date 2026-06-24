// Creates Vercel project ifbash-emp linked to ifbash/EMP, branch feat/servicenow-foundation.
// Pushes env vars from .env.local. Adds domain app.ifbash.com. Triggers deploy. Polls status.
// All values handled in-process; never echoed.
import fs from 'fs';
import path from 'path';

const TOKEN = fs.readFileSync(path.resolve('scripts/vercel-cdp/.token'), 'utf8').trim();
const TEAM_ID = 'team_fVA2Pj0VGbjrVRTJ3t4jmqEy';
const TEAM_SLUG = 'basheers-projects-7541e2a3';
const REPO = 'ifbash/EMP';
const PROJECT_NAME = 'ifbash-emp';
const BRANCH = 'feat/servicenow-foundation';
const DOMAIN = 'app.ifbash.com';

const Q = `?teamId=${TEAM_ID}`;
const BASE = 'https://api.vercel.com';
const H = { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

async function api(method, url, body) {
  const r = await fetch(BASE + url, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  const txt = await r.text();
  let data; try { data = JSON.parse(txt); } catch { data = txt; }
  return { status: r.status, data };
}

function parseDotEnv(p) {
  const txt = fs.readFileSync(p, 'utf8');
  const out = [];
  for (const line of txt.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let [, key, val] = m;
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    out.push({ key, value: val });
  }
  return out;
}

// 1) Find or create project
let { status, data } = await api('GET', `/v9/projects/${PROJECT_NAME}` + Q);
let project;
if (status === 200) {
  project = data;
  console.log(`project ${PROJECT_NAME} already exists: ${project.id}`);
} else {
  console.log(`creating project ${PROJECT_NAME}...`);
  ({ status, data } = await api('POST', `/v11/projects` + Q, {
    name: PROJECT_NAME,
    framework: 'nextjs',
    gitRepository: { type: 'github', repo: REPO },
  }));
  if (status >= 400) { console.error('create failed', status, data); process.exit(1); }
  project = data;
  console.log(`created: ${project.id}`);
}

// 2) Set production branch override
console.log(`setting productionBranch -> ${BRANCH}`);
({ status, data } = await api('PATCH', `/v9/projects/${project.id}` + Q, {
  gitRepository: { type: 'github', repo: REPO, productionBranch: BRANCH },
}));
if (status >= 400) {
  // Fallback: set on git-status endpoint
  ({ status, data } = await api('PATCH', `/v9/projects/${project.id}/git-status` + Q, { branch: BRANCH }));
  if (status >= 400) {
    // Fallback 2: top-level productionBranch
    ({ status, data } = await api('PATCH', `/v9/projects/${project.id}` + Q, { productionBranch: BRANCH }));
  }
}
console.log(`branch patch status: ${status}`);

// 3) Push env vars from .env.local
const envPath = path.resolve('.env.local');
if (!fs.existsSync(envPath)) {
  console.warn(`.env.local not found at ${envPath} — skipping env push`);
} else {
  const envs = parseDotEnv(envPath);
  console.log(`pushing ${envs.length} env vars (production)...`);
  for (const { key, value } of envs) {
    const target = key.startsWith('NEXT_PUBLIC_') ? ['production','preview','development'] : ['production','preview'];
    const type = key.includes('SECRET') || key.includes('SERVICE_ROLE') || key.includes('API_KEY') ? 'encrypted' : 'plain';
    const r = await api('POST', `/v10/projects/${project.id}/env` + Q + '&upsert=true', {
      key, value, type, target,
    });
    if (r.status >= 400) {
      console.warn(`  env ${key} status ${r.status}:`, r.data?.error?.message || r.data);
    } else {
      console.log(`  env ${key}: ok`);
    }
  }
}

// 4) Add domain
console.log(`adding domain ${DOMAIN}`);
({ status, data } = await api('POST', `/v10/projects/${project.id}/domains` + Q, { name: DOMAIN }));
if (status >= 400 && status !== 409) {
  console.warn(`domain add status ${status}:`, data?.error?.message || data);
} else {
  console.log(`domain status ${status}`);
  if (data?.verification) console.log('verification:', JSON.stringify(data.verification, null, 2));
}

// 5) Trigger deployment from feat branch
console.log(`triggering deployment from ${BRANCH}`);
({ status, data } = await api('POST', `/v13/deployments` + Q, {
  name: PROJECT_NAME,
  project: project.id,
  target: 'production',
  gitSource: { type: 'github', ref: BRANCH, repoId: project.link?.repoId || undefined, repo: REPO, org: 'ifbash' },
}));
if (status >= 400) {
  console.error('deploy trigger failed', status, data?.error || data);
} else {
  console.log(`deploy id: ${data.id} | url: https://${data.url}`);
  fs.writeFileSync('scripts/vercel-cdp/.project-id', project.id + '\n');
  fs.writeFileSync('scripts/vercel-cdp/.deploy-id', data.id + '\n');
}

console.log('done.');
